/**
 * Route crawl (14.2) over HTTP against the local server: every built page, every internal
 * link and image, all 30 legacy redirects (one hop, locale-correct), 404 behaviour and headers.
 *   node scripts/crawl.ts            → dist/ and dist-production/ (whichever exist)
 * Writes qa-output/crawl-<mode>.json and exits 1 on any failure.
 */
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { legacyRedirects } from '../src/build/build.ts';
import { startServer } from './serve.ts';

const ROOT = resolve(fileURLToPath(new URL('..', import.meta.url)));

async function crawl(dirName: string, mode: 'preview' | 'production' | 'pages') {
  const dir = join(ROOT, dirName);
  const { url, close } = await startServer({ dir, port: 0, quiet: true, dataDir: join(ROOT, '.local', 'crawl') });
  const fails: string[] = [];
  const checked = { pages: 0, links: 0, images: 0, redirects: 0 };
  const pages: string[] = [];
  const walk = (d: string) => { for (const f of readdirSync(d)) { const p = join(d, f); if (statSync(p).isDirectory()) walk(p); else if (f === 'index.html') pages.push('/' + relative(dir, d).split('\\').join('/') + (relative(dir, d) ? '/' : '')); } };
  walk(dir);
  const seen = new Set<string>();
  const get = (p: string, redirect: RequestRedirect = 'follow') => fetch(url + p, { redirect });

  for (const p of pages.map((x) => x.replace(/^\/\//, '/'))) {
    const r = await get(p);
    checked.pages++;
    if (r.status !== 200) { fails.push(`${p}: status ${r.status}`); continue; }
    const html = await r.text();
    if (p !== '/') {
      if (!/<h1[\s>]/.test(html)) fails.push(`${p}: no h1`);
      if (!/<title>[^<]{5,}<\/title>/.test(html)) fails.push(`${p}: empty title`);
      const robots = html.match(/<meta name="robots" content="([^"]+)"/)?.[1];
      if (mode !== 'production' && !robots?.startsWith('noindex')) fails.push(`${p}: preview must be noindex (${robots})`);
      if (mode === 'production' && robots !== 'index, follow' && !p.endsWith('/pankao-thailand/')) fails.push(`${p}: production must be indexable (${robots})`);
      const xr = r.headers.get('x-robots-tag');
      if (mode === 'preview' && xr !== 'noindex, nofollow') fails.push(`${p}: X-Robots-Tag missing in preview`);
      if (mode === 'pages') { if (!html.includes('http-equiv="Content-Security-Policy"')) fails.push(`${p}: no meta CSP on Pages`); if (/review-note|class="fact"|data-review-toggle/.test(html)) fails.push(`${p}: review markup on the public preview`); if (/"@type":"(Organization|Product)"|PostalAddress|ContactPoint/.test(html)) fails.push(`${p}: unapproved business/product facts in structured data (Codex F16.1)`); if (!/<title>[^<]*·/.test(html)) fails.push(`${p}: title lacks the Preview prefix`); }
      else if (!r.headers.get('content-security-policy')) fails.push(`${p}: no CSP header`);
    }
    // A srcset holds "url width, url width" (Codex F17.5): check every candidate's address.
    const urls = [...html.matchAll(/(?:href|src)="(\/[^"#?]*)/g)].map((m) => m[1]!)
      .concat([...html.matchAll(/srcset="([^"]*)"/g)].flatMap((m) => m[1]!.split(',').map((c) => c.trim().split(/\s+/)[0]!).filter((u) => u.startsWith('/'))));
    for (const link of urls) {
      if (link.startsWith('/api/') || seen.has(link)) continue;
      seen.add(link);
      const lr = await get(link);
      if (/\.(jpg|png|webp)$/.test(link)) checked.images++; else checked.links++;
      if (lr.status !== 200) fails.push(`${p}: broken ${link} (${lr.status})`);
      await lr.arrayBuffer();
    }
    for (const m of html.matchAll(/<img\s[^>]*>/g)) {
      const tag = m[0];
      if (!/\swidth="\d+"/.test(tag) || !/\sheight="\d+"/.test(tag) || !/\salt="/.test(tag)) fails.push(`${p}: img without width/height/alt: ${tag.slice(0, 80)}`);
    }
  }

  for (const rd of mode === 'pages' ? [] : legacyRedirects(mode)) {
    const r = await get(rd.from + '?ref=crawl', 'manual');
    checked.redirects++;
    const loc = r.headers.get('location');
    if (r.status !== 301) fails.push(`${rd.from}: expected 301, got ${r.status}`);
    else if (loc !== `${rd.to}?ref=crawl`) fails.push(`${rd.from}: → ${loc}, expected ${rd.to}?ref=crawl`);
    else {
      const f = await get(rd.to, 'manual');
      if (f.status !== 200) fails.push(`${rd.from}: destination ${rd.to} returned ${f.status} (chain or missing)`);
    }
  }

  if (mode === 'pages') {
    const r404 = await get('/pankao-thailand/404.html');
    if (r404.status !== 200 || !(await r404.text()).includes('/pankao-thailand/th/products/')) fails.push('Pages 404.html missing or without base-path recovery links');
    // Unknown paths under every locale get the root 404 (as GitHub Pages serves it) with the matching language inside.
    for (const l of ['th', 'en', 'vi']) {
      const r = await get(`/pankao-thailand/${l}/no-such-page/`);
      const h = await r.text();
      if (r.status !== 404) fails.push(`/${l}/ unknown: expected 404, got ${r.status}`);
      if (l !== 'th' && !h.includes(`<template data-404="${l}" data-lang="${l}"`)) fails.push(`/${l}/ unknown: root 404 lacks the ${l} page`);
      if (!h.includes('/assets/notfound.')) fails.push(`/${l}/ unknown: root 404 lacks notfound.js`);
    }
    const lone = pages.filter(() => false);
    void lone;
    await close();
    const report = { mode, url, checked, fails, at: new Date().toISOString() };
    mkdirSync(join(ROOT, 'qa-output'), { recursive: true });
    writeFileSync(join(ROOT, 'qa-output', 'crawl-pages.json'), JSON.stringify(report, null, 2));
    console.log(`crawl pages: ${checked.pages} pages, ${checked.links} links, ${checked.images} images — ${fails.length ? `${fails.length} FAIL` : 'all passed'}`);
    for (const f of fails.slice(0, 30)) console.log(`  ✘ ${f}`);
    return fails.length;
  }
  const nf = await get('/th/this-does-not-exist/');
  const nfHtml = await nf.text();
  if (nf.status !== 404 || !nfHtml.includes('<html lang="th"') || !nfHtml.includes('/th/products/') || !nfHtml.includes('/th/contact/')) fails.push('/th/ unknown: expected Thai 404 with product and contact recovery');
  const nfVi = await get('/vi/khong-co/');
  if (nfVi.status !== 404 || !(await nfVi.text()).includes('<html lang="vi"')) fails.push('/vi/ unknown: expected Vietnamese 404');
  const slash = await get('/en/about', 'manual');
  if (slash.status !== 308 || slash.headers.get('location') !== '/en/about/') fails.push('/en/about: expected 308 → /en/about/');

  await close();
  const report = { mode, url, checked, fails, at: new Date().toISOString() };
  mkdirSync(join(ROOT, 'qa-output'), { recursive: true });
  writeFileSync(join(ROOT, 'qa-output', `crawl-${mode}.json`), JSON.stringify(report, null, 2));
  console.log(`crawl ${mode}: ${checked.pages} pages, ${checked.links} links, ${checked.images} images, ${checked.redirects} redirects — ${fails.length ? `${fails.length} FAIL` : 'all passed'}`);
  for (const f of fails.slice(0, 30)) console.log(`  ✘ ${f}`);
  return fails.length;
}

let failed = 0;
if (process.argv.includes('--pages')) { process.exit((await crawl('dist-pages', 'pages')) ? 1 : 0); }
if (existsSync(join(ROOT, 'dist'))) failed += await crawl('dist', 'preview');
if (existsSync(join(ROOT, 'dist-production'))) failed += await crawl('dist-production', 'production');
if (!existsSync(join(ROOT, 'dist')) && !existsSync(join(ROOT, 'dist-production'))) { console.error('crawl: build first'); failed = 1; }
void readFileSync;
process.exit(failed ? 1 : 0);
