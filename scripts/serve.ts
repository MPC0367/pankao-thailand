/**
 * Local server for the built site. Mirrors Cloudflare Pages behaviour that matters here:
 * `_redirects` (301, query kept), `_headers`, directory indexes, trailing-slash redirect and
 * the nearest locale 404.html with a real 404 status.
 *
 * It also hosts the NON-PRODUCTION enquiry test adapter (brief 11.6): POST /api/enquiries
 * validates, rate-limits, honours Idempotency-Key, writes once to .local/enquiries.jsonl and
 * returns 201 only after that write. It never sends anything to anyone. Logs carry no
 * personal data. Tests drive failure modes with POST /__mock/scenario or the
 * X-Mock-Scenario header.
 */
import { appendFileSync, existsSync, mkdirSync, readFileSync, statSync } from 'node:fs';
import { createServer, type IncomingMessage, type Server, type ServerResponse } from 'node:http';
import { extname, join, normalize, resolve } from 'node:path';
import { randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const TYPES: Record<string, string> = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8', '.woff2': 'font/woff2', '.jpg': 'image/jpeg', '.png': 'image/png',
  '.webp': 'image/webp', '.svg': 'image/svg+xml', '.txt': 'text/plain; charset=utf-8', '.xml': 'application/xml; charset=utf-8',
};

type Scenario = 'ok' | 'fail' | 'slow' | 'rate' | 'unavailable' | 'hang';
type Options = { dir: string; port: number; quiet?: boolean; dataDir?: string };

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const LIMITS: Record<string, number> = { company: 120, name: 120, role: 120, email: 160, phone: 40, country: 120, application: 300, packaging: 300, documents: 300, message: 4000 };

export function startServer(opts: Options): Promise<{ server: Server; url: string; close: () => Promise<void> }> {
  const dir = resolve(opts.dir);
  const redirects = new Map<string, string>();
  const rf = join(dir, '_redirects');
  if (existsSync(rf)) for (const line of readFileSync(rf, 'utf8').split('\n')) {
    const [from, to] = line.trim().split(/\s+/);
    if (from && to && !from.startsWith('#')) redirects.set(from, to);
  }
  const headerRules: { pattern: RegExp; headers: [string, string][] }[] = [];
  const hf = join(dir, '_headers');
  if (existsSync(hf)) {
    let cur: { pattern: RegExp; headers: [string, string][] } | null = null;
    for (const line of readFileSync(hf, 'utf8').split('\n')) {
      if (!line.trim()) continue;
      if (!line.startsWith(' ')) { cur = { pattern: new RegExp('^' + line.trim().replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*') + '$'), headers: [] }; headerRules.push(cur); }
      else if (cur) { const i = line.indexOf(':'); cur.headers.push([line.slice(0, i).trim(), line.slice(i + 1).trim()]); }
    }
  }

  const dataDir = opts.dataDir ?? join(dir, '..', '.local');
  mkdirSync(dataDir, { recursive: true });
  const store = join(dataDir, 'enquiries.jsonl');
  const seen = new Map<string, { enquiryId: string; receivedAt: string }>();
  const hits = new Map<string, number[]>();
  let next: { scenario: Scenario; count: number } | null = null;

  // Local http only: `upgrade-insecure-requests` would send WebKit to https://localhost (Chromium exempts
  // localhost). The deployed _headers keep it; nothing else in the policy changes.
  const applyHeaders = (path: string, res: ServerResponse) => {
    for (const r of headerRules) if (r.pattern.test(path)) for (const [k, v] of r.headers) res.setHeader(k, k === 'Content-Security-Policy' ? v.replace(/;\s*upgrade-insecure-requests/, '') : v);
  };
  const log = (msg: string) => { if (!opts.quiet) console.log(msg); };

  const body = (req: IncomingMessage): Promise<string> => new Promise((res, rej) => {
    let size = 0;
    const chunks: Buffer[] = [];
    req.on('data', (c: Buffer) => { size += c.length; if (size > 64 * 1024) { rej(new Error('too_large')); req.destroy(); } else chunks.push(c); });
    req.on('end', () => res(Buffer.concat(chunks).toString('utf8')));
    req.on('error', rej);
  });

  const json = (res: ServerResponse, status: number, obj: unknown, extra: Record<string, string> = {}) => {
    res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...extra });
    res.end(JSON.stringify(obj));
  };

  async function enquiries(req: IncomingMessage, res: ServerResponse) {
    const ip = req.socket.remoteAddress ?? 'local';
    const isForm = (req.headers['content-type'] ?? '').includes('application/x-www-form-urlencoded');
    let raw: string;
    try { raw = await body(req); } catch { return json(res, 413, { error: 'upload_too_large' }); }
    let data: Record<string, unknown>;
    try { data = isForm ? Object.fromEntries(new URLSearchParams(raw)) : JSON.parse(raw); } catch { return json(res, 400, { error: 'validation_error' }); }

    let scenario: Scenario = 'ok';
    const hdr = req.headers['x-mock-scenario'];
    if (typeof hdr === 'string' && ['ok', 'fail', 'slow', 'rate', 'unavailable', 'hang'].includes(hdr)) scenario = hdr as Scenario;
    else if (next) { scenario = next.scenario; if (--next.count <= 0) next = null; }
    if (scenario === 'hang') return; // never answers: client timeout path
    if (scenario === 'slow') await new Promise((r) => setTimeout(r, 5200));
    if (scenario === 'fail') return json(res, 500, { error: 'temporarily_unavailable' });
    if (scenario === 'unavailable') return json(res, 503, { error: 'temporarily_unavailable' }, { 'Retry-After': '120' });

    // Rate limit: 5 accepted-or-attempted enquiries per 10 minutes per address.
    const now = Date.now();
    const recent = (hits.get(ip) ?? []).filter((t) => now - t < 10 * 60_000);
    if (scenario === 'rate' || recent.length >= 5) return json(res, 429, { error: 'rate_limited' }, { 'Retry-After': '600' });
    recent.push(now);
    hits.set(ip, recent);

    // Spam controls: honeypot and implausibly fast submissions get a generic refusal.
    if (String(data.website ?? '').trim() !== '' || (typeof data.elapsedMs === 'number' && data.elapsedMs < 1500)) return json(res, 400, { error: 'validation_error' });

    const kind = data.kind === 'oem' ? 'oem' : 'general';
    const required = kind === 'oem' ? ['company', 'name', 'email', 'country', 'buyerType', 'message', 'consent'] : ['name', 'email', 'subject', 'message', 'consent'];
    const fields: Record<string, string> = {};
    for (const k of required) if (!String(data[k] ?? '').trim()) fields[k] = 'required';
    if (data.email && !EMAIL.test(String(data.email))) fields.email = 'invalid';
    for (const [k, max] of Object.entries(LIMITS)) if (String(data[k] ?? '').length > max) fields[k] = 'too_long';
    if (Object.keys(fields).length) return json(res, 400, { error: 'validation_error', fields });

    const key = String(req.headers['idempotency-key'] ?? '').slice(0, 100);
    if (key && seen.has(key)) return json(res, 409, { error: 'duplicate', ...seen.get(key) });

    const record = { enquiryId: `PK-${randomUUID().slice(0, 8).toUpperCase()}`, receivedAt: new Date().toISOString() };
    const allowed = ['kind', 'locale', 'company', 'name', 'role', 'email', 'phone', 'country', 'buyerType', 'subject', 'formats', 'application', 'need', 'packaging', 'volume', 'timeline', 'documents', 'message', 'consent'];
    const clean = Object.fromEntries(allowed.filter((k) => k in data).map((k) => [k, data[k]]));
    appendFileSync(store, JSON.stringify({ ...record, adapter: 'LOCAL TEST — NOT PRODUCTION', idempotencyKey: key || null, data: clean }) + '\n'); // durable first
    if (key) seen.set(key, record);
    log(`enquiry ${record.enquiryId} (${kind}, ${String(data.locale ?? '')}) stored by local test adapter`); // no personal data in logs

    if (isForm) {
      res.writeHead(201, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(`<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${record.enquiryId}</title><p>Enquiry received by the local test adapter (not production). Reference ${record.enquiryId}.</p><p><a href="/${String(data.locale ?? 'th')}/">Back</a></p>`);
    }
    return json(res, 201, record);
  }

  const server = createServer(async (req, res) => {
    const url = new URL(req.url ?? '/', 'http://localhost');
    const path = decodeURIComponent(url.pathname);

    if (path === '/api/enquiries') {
      if (req.method !== 'POST') return json(res, 405, { error: 'method_not_allowed' }, { Allow: 'POST' });
      return enquiries(req, res);
    }
    if (path === '/__mock/scenario' && req.method === 'POST') {
      try { const b = JSON.parse(await body(req)); next = b.scenario ? { scenario: b.scenario, count: b.count ?? 1 } : null; } catch { next = null; }
      if (next === null) { hits.clear(); seen.clear(); }
      return json(res, 200, { next });
    }

    const to = redirects.get(path);
    if (to) {
      res.writeHead(301, { Location: to + url.search });
      return res.end();
    }

    let file = normalize(join(dir, path));
    if (!file.startsWith(dir)) { res.writeHead(400); return res.end(); }
    if (existsSync(file) && statSync(file).isDirectory()) {
      if (!path.endsWith('/')) { res.writeHead(308, { Location: `${path}/${url.search}` }); return res.end(); }
      file = join(file, 'index.html');
    }
    if (!existsSync(file) && existsSync(`${file}.html`)) file = `${file}.html`;
    if (existsSync(file) && statSync(file).isFile() && !/(^|\/)(_redirects|_headers|release-manifest\.json)$/.test(path)) {
      applyHeaders(path, res);
      res.writeHead(200, { 'Content-Type': TYPES[extname(file)] ?? 'application/octet-stream' });
      return res.end(req.method === 'HEAD' ? undefined : readFileSync(file));
    }
    const m = path.match(/^\/(th|en|vi)\//);
    const nf = m ? join(dir, m[1]!, '404.html') : join(dir, '404.html');
    applyHeaders(path, res);
    res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(existsSync(nf) ? readFileSync(nf) : 'Not found');
  });

  return new Promise((ok) => {
    server.listen(opts.port, '127.0.0.1', () => {
      const addr = server.address();
      const port = typeof addr === 'object' && addr ? addr.port : opts.port;
      const url = `http://localhost:${port}`;
      ok({ server, url, close: () => new Promise((r) => server.close(() => r())) });
    });
  });
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  const arg = (k: string, d: string) => process.argv.find((a) => a.startsWith(`--${k}=`))?.split('=')[1] ?? d;
  const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
  startServer({ dir: join(root, arg('dir', 'dist')), port: Number(process.env.PORT ?? arg('port', '4530')) }).then(({ url }) => {
    console.log(`Pankao ${arg('dir', 'dist')} on ${url} — enquiry test adapter is local only; nothing is sent.`);
  });
}
