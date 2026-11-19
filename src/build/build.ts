/**
 * Build: validate content → fingerprint assets → render 3 locales → root, 404, redirects,
 * headers, robots, sitemap → guard every output file → write a release manifest.
 *
 *   node src/build/build.ts --mode=preview      → dist/            (private review, noindex)
 *   node src/build/build.ts --mode=production   → dist-production/ (only owner-approved facts and assets)
 *
 * A production build is a rehearsal artefact; publishing it is a separate, owner-authorised step.
 */
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { dirname, extname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildSync } from 'esbuild';
import { assets as ledger } from '../content/assets.ts';
import { openDecisions } from '../content/decisions.ts';
import { products } from '../content/products.ts';
import { LOCALES, type Locale, type Mode } from '../content/types.ts';
import type { Assets, MediaOut } from './assets-out.ts';
import { canShow, href, productPath, ROUTES, t, type Ctx } from './context.ts';
import { BASE, PUBLIC_PREVIEW } from '../content/presentation.ts';
import { O2_CREDIT, SITE_ORIGIN } from './layout.ts';
import { assetAllowed } from './media.ts';
import * as P from './pages.ts';
import { BuildError, factApprovalSummary, guardOutput, validateContent } from './validate.ts';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');

export const LEGACY: { stem: string; target: string; productId?: string }[] = [
  { stem: 'index', target: ROUTES.home },
  { stem: 'history', target: ROUTES.about },
  { stem: 'process', target: ROUTES.process },
  { stem: 'product', target: ROUTES.products },
  { stem: 'mrnoodles', target: productPath('mr-noodles'), productId: 'mr-noodles' },
  { stem: 'rice_vermicelli', target: productPath('rice-vermicelli'), productId: 'rice-vermicelli' },
  { stem: 'rice_stick', target: productPath('rice-stick-pad-thai'), productId: 'rice-stick-pad-thai' },
  { stem: 'rice_flake', target: productPath('rice-flake-guay-jub'), productId: 'rice-flake-guay-jub' },
  { stem: 'rice_brown', target: productPath('brown-rice-noodles'), productId: 'brown-rice-noodles' },
  { stem: 'contact', target: ROUTES.contact },
];
export const LEGACY_SUFFIX: Record<Locale, string> = { th: '', en: '_en', vi: '_vn' };

export function legacyRedirects(mode: Mode): { from: string; to: string }[] {
  const out: { from: string; to: string }[] = [];
  for (const l of LOCALES) {
    for (const r of LEGACY) {
      const p = r.productId ? products.find((x) => x.id === r.productId) : null;
      const target = p && !canShow(p.name, { mode }) ? ROUTES.products : r.target;
      out.push({ from: `/${r.stem}${LEGACY_SUFFIX[l]}.html`, to: href(l, target) });
    }
  }
  return out;
}

function hash(buf: Buffer | string): string {
  return createHash('sha256').update(buf).digest('hex').slice(0, 10);
}

function minifyCss(s: string): string {
  return s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ').replace(/\s*([{};,>])\s*/g, '$1').replace(/;}/g, '}').trim();
}

function write(outDir: string, rel: string, data: string | Buffer): void {
  const p = join(outDir, rel);
  mkdirSync(dirname(p), { recursive: true });
  writeFileSync(p, data);
}

function buildAssets(outDir: string, mode: Mode): Assets {
  const css = minifyCss(readFileSync(join(ROOT, 'src/fonts/fonts.css'), 'utf8').replaceAll('url("/fonts/', `url("${BASE}/fonts/`) + '\n' + readFileSync(join(ROOT, 'src/styles/site.css'), 'utf8'));
  const cssName = `assets/site.${hash(css)}.css`;
  write(outDir, cssName, css);
  const head = readFileSync(join(ROOT, 'src/client/head.js'), 'utf8');
  const headName = `assets/head.${hash(head)}.js`;
  write(outDir, headName, head);
  const site = readFileSync(join(ROOT, 'src/client/site.js'), 'utf8');
  const siteName = `assets/site.${hash(site)}.js`;
  write(outDir, siteName, site);
  // Glisse liquid-glass island (React) + its stylesheet as a file, so the strict CSP needs no inline style.
  const glass = buildSync({
    entryPoints: [join(ROOT, 'src/client/glass.js')], bundle: true, minify: true, format: 'esm', write: false,
    target: ['es2020', 'safari15'], define: { 'process.env.NODE_ENV': '"production"' }, legalComments: 'none', logLevel: 'silent',
    // Preact's React-compatible core runs Glisse at ~19 KB gzip instead of React's ~80 KB.
    alias: { react: 'preact/compat', 'react-dom/client': 'preact/compat/client', 'react-dom': 'preact/compat', 'react/jsx-runtime': 'preact/jsx-runtime' },
  }).outputFiles[0]!.text;
  const glassName = `assets/glass.${hash(glass)}.js`;
  write(outDir, glassName, glass);
  const glisseCss = readFileSync(join(ROOT, 'node_modules/glisse/dist/styles.css'), 'utf8');
  const glisseName = `assets/glisse.${hash(glisseCss)}.css`;
  write(outDir, glisseName, glisseCss);
  const root = readFileSync(join(ROOT, 'src/client/root.js'), 'utf8');
  write(outDir, `assets/root.${hash(root)}.js`, root);

  mkdirSync(join(outDir, 'fonts'), { recursive: true });
  for (const f of readdirSync(join(ROOT, 'src/fonts'))) if (f.endsWith('.woff2')) copyFileSync(join(ROOT, 'src/fonts', f), join(outDir, 'fonts', f));

  const media = new Map<string, MediaOut>();
  for (const a of ledger) {
    if (!assetAllowed({ mode }, a.id)) continue;
    const src = join(ROOT, 'media-source', a.file);
    if (!existsSync(src)) throw new BuildError(`asset ${a.id}: ${a.file} missing in media-source/ (run npm run media)`);
    const buf = readFileSync(src);
    const ext = extname(a.file);
    const base = a.file.replace(/\//g, '-').replace(ext, '');
    const h = hash(buf);
    const name = `media/${base}.${h}${ext}`;
    write(outDir, name, buf);
    const webpName = `media/${base}.${h}.webp`;
    execFileSync('cwebp', ['-quiet', ...(ext === '.png' ? ['-lossless'] : ['-q', '82']), src, '-o', join(outDir, webpName)]);
    const webpSmaller = statSync(join(outDir, webpName)).size < buf.length;
    if (!webpSmaller) rmSync(join(outDir, webpName));
    media.set(a.id, { src: `${BASE}/${name}`, webp: webpSmaller ? `${BASE}/${webpName}` : undefined, width: a.width, height: a.height });
  }
  return { css: `${BASE}/${cssName}`, headJs: `${BASE}/${headName}`, siteJs: `${BASE}/${siteName}`, glassJs: `${BASE}/${glassName}`, glisseCss: `${BASE}/${glisseName}`, media };
}

function rootPage(mode: Mode, assets: Assets, rootJs: string): string {
  const links = LOCALES.map((l) => `<li><a href="${BASE}/${l}/" hreflang="${l}" lang="${l}">${t({ locale: l }, `lang.${l}`)}</a></li>`).join('');
  return `<!doctype html>
<html lang="th" class="no-js" data-mode="${mode}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${t({ locale: 'th' }, 'root.title')} · ${t({ locale: 'en' }, 'root.title')} · ${t({ locale: 'vi' }, 'root.title')}</title>
<meta name="robots" content="noindex, follow">
${PUBLIC_PREVIEW ? `<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self'; object-src 'none'; base-uri 'self'">` : ''}
<link rel="canonical" href="${SITE_ORIGIN}${BASE}/th/">
${LOCALES.map((l) => `<link rel="alternate" hreflang="${l}" href="${SITE_ORIGIN}${BASE}/${l}/">`).join('\n')}
<link rel="alternate" hreflang="x-default" href="${SITE_ORIGIN}${BASE}/th/">
<noscript><meta http-equiv="refresh" content="0; url=${BASE}/th/"></noscript>
<link rel="stylesheet" href="${assets.css}">
<script src="${rootJs}"></script>
</head>
<body class="page-root">
<main id="main" class="section"><div class="wrap">
<h1 class="h2">${t({ locale: 'th' }, 'root.title')} <span lang="en">· ${t({ locale: 'en' }, 'root.title')}</span> <span lang="vi">· ${t({ locale: 'vi' }, 'root.title')}</span></h1>
<ul class="root-langs" role="list">${links}</ul>
</div></main>
<footer class="root-foot"><div class="wrap">${O2_CREDIT}</div></footer>
</body>
</html>
`;
}

function headersFile(mode: Mode): string {
  const csp = [
    "default-src 'self'", "script-src 'self'", "style-src 'self'", "img-src 'self' data:", "font-src 'self'",
    "connect-src 'self'", 'frame-src https://www.google.com', "form-action 'self'", "base-uri 'self'", "object-src 'none'",
    "frame-ancestors 'none'", 'upgrade-insecure-requests',
  ].join('; ');
  return `/*
  Content-Security-Policy: ${csp}
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()
  Cross-Origin-Opener-Policy: same-origin
${mode === 'preview' ? '  X-Robots-Tag: noindex, nofollow\n' : ''}
/assets/*
  Cache-Control: public, max-age=31536000, immutable
/fonts/*
  Cache-Control: public, max-age=31536000, immutable
/media/*
  Cache-Control: public, max-age=31536000, immutable
`;
}

export type BuildResult = { outDir: string; files: string[]; pages: string[]; problems: string[]; blockers: string[] };

export function build(mode: Mode, opts: { outDir?: string; buildDate?: string; quiet?: boolean } = {}): BuildResult {
  const errs = validateContent();
  if (errs.length) throw new BuildError(`content validation failed:\n  ${errs.join('\n  ')}`);

  const outDir = opts.outDir ?? join(ROOT, mode === 'preview' ? 'dist' : 'dist-production');
  rmSync(outDir, { recursive: true, force: true });
  mkdirSync(outDir, { recursive: true });
  const buildDate = opts.buildDate ?? new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Bangkok' }).format(new Date());

  const assets = buildAssets(outDir, mode);
  const rootJs = `${BASE}/assets/${readdirSync(join(outDir, 'assets')).find((f) => f.startsWith('root.'))!}`;
  const built: P.Built[] = [];
  const pagesList: string[] = [];

  for (const locale of LOCALES) {
    const mk = (path: string): Ctx => ({ mode, locale, path, buildDate });
    built.push(P.home(mk(''), assets));
    built.push(P.productsIndex(mk(ROUTES.products), assets));
    for (const p of products) if (canShow(p.name, { mode })) built.push(P.productDetail(mk(productPath(p.slug)), assets, p));
    built.push(P.oemPage(mk(ROUTES.oem), assets));
    built.push(P.processPage(mk(ROUTES.process), assets));
    built.push(P.qualityPage(mk(ROUTES.quality), assets));
    built.push(P.aboutPage(mk(ROUTES.about), assets));
    built.push(P.contactPage(mk(ROUTES.contact), assets));
    built.push(P.privacyPage(mk(ROUTES.privacy), assets));
    built.push(P.accessibilityPage(mk(ROUTES.accessibility), assets, buildDate));
    built.push(P.notFound(mk(''), assets));
  }
  for (const b of built) {
    const rel = b.path.endsWith('.html') ? b.path : `${b.path}index.html`;
    write(outDir, rel, b.html);
    if (!b.status) pagesList.push(`/${b.path}`);
  }
  write(outDir, 'index.html', rootPage(mode, assets, rootJs));
  write(outDir, '404.html', built.find((b) => b.path === 'th/404.html')!.html);

  // Redirects: legacy pages → modern locale routes (one hop, 301). Host/protocol variants are zone rules (docs/RUNBOOK.md).
  if (PUBLIC_PREVIEW) {
    // GitHub Pages: no _redirects/_headers (a meta CSP and meta noindex stand in); no Jekyll processing.
    write(outDir, '.nojekyll', '');
  } else {
    const redirects = legacyRedirects(mode);
    write(outDir, '_redirects', redirects.map((r) => `${r.from} ${r.to} 301`).join('\n') + '\n');
    write(outDir, '_headers', headersFile(mode));
  }
  if (mode === 'production') {
    write(outDir, 'robots.txt', `User-agent: *\nAllow: /\n\nSitemap: ${SITE_ORIGIN}/sitemap.xml\n`);
    const urls = pagesList.map((p) => {
      const path = p.replace(/^\/(th|en|vi)\//, '');
      const alts = LOCALES.map((l) => `    <xhtml:link rel="alternate" hreflang="${l}" href="${SITE_ORIGIN}/${l}/${path}"/>`).join('\n');
      return `  <url>\n    <loc>${SITE_ORIGIN}${p}</loc>\n    <lastmod>${buildDate}</lastmod>\n${alts}\n    <xhtml:link rel="alternate" hreflang="x-default" href="${SITE_ORIGIN}/th/${path}"/>\n  </url>`;
    });
    write(outDir, 'sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urls.join('\n')}\n</urlset>\n`);
  } else if (!PUBLIC_PREVIEW) {
    write(outDir, 'robots.txt', 'User-agent: *\nDisallow: /\n');
  }

  // Guards over every generated text file.
  const files: string[] = [];
  const walk = (dir: string) => { for (const f of readdirSync(dir)) { const p = join(dir, f); statSync(p).isDirectory() ? walk(p) : files.push(p); } };
  walk(outDir);
  const allowedMedia = new Set(ledger.filter((a) => assetAllowed({ mode }, a.id)).map((a) => a.id));
  const problems: string[] = [];
  for (const f of files) {
    if (!/\.(html|xml|txt|json)$|_redirects$|_headers$/.test(f)) continue;
    problems.push(...guardOutput(relative(outDir, f), readFileSync(f, 'utf8'), { mode, allowedMedia, publicPreview: PUBLIC_PREVIEW }));
  }
  if (problems.length) throw new BuildError(`output guards failed:\n  ${problems.join('\n  ')}`);

  // Release manifest: what this artefact is and what still blocks release.
  const facts = factApprovalSummary();
  const blockers = [
    ...openDecisions().map((d) => `${d.id} (Gate ${d.gate}): ${d.decision}`),
    ...(facts.unapproved.length ? [`${facts.unapproved.length} of ${facts.total} public facts not owner-approved`] : []),
    ...(ledger.some((a) => !a.productionApproved) ? [`${ledger.filter((a) => !a.productionApproved).length} of ${ledger.length} images without production approval`] : []),
  ];
  const manifest = {
    project: 'Pankao Thailand manufacturer website',
    mode,
    buildDate,
    status: mode === 'preview' ? 'PRIVATE PREVIEW — not for publication' : blockers.length ? 'BLOCKED — owner decisions open' : 'READY FOR OWNER RELEASE DECISION',
    releaseToken: 'APPROVE_PANKAO_PRODUCTION_DEPLOY (not given)',
    pages: pagesList.length,
    files: files.map((f) => ({ path: relative(outDir, f), sha256: createHash('sha256').update(readFileSync(f)).digest('hex') })),
    blockers,
  };
  // The manifest is O2's release record; a public preview keeps it beside the site, not in it.
  writeFileSync(PUBLIC_PREVIEW ? join(outDir, '..', 'release-manifest.json') : join(outDir, 'release-manifest.json'), JSON.stringify(manifest, null, 2));
  if (!opts.quiet) {
    console.log(`build (${mode}): ${pagesList.length} pages, ${files.length} files → ${relative(ROOT, outDir) || outDir}`);
    console.log(`  guards: passed · facts owner-approved: ${facts.approved}/${facts.total} · release blockers: ${blockers.length}`);
  }
  return { outDir, files, pages: pagesList, problems, blockers };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  const mode = (process.argv.find((a) => a.startsWith('--mode='))?.split('=')[1] ?? 'preview') as Mode;
  const out = process.argv.find((a) => a.startsWith('--out='))?.split('=')[1];
  try {
    build(mode, out ? { outDir: resolve(ROOT, out) } : {});
  } catch (e) {
    console.error(e instanceof BuildError ? `BUILD FAILED\n${e.message}` : e);
    process.exit(1);
  }
}
