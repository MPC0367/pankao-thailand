/**
 * Measures the premium audit's acceptance criteria (20 Nov 2026) on a build:
 *   node tests/e2e/audit-metrics.mjs                 → local public-preview build (dist-pages/)
 *   node tests/e2e/audit-metrics.mjs --url=<live>    → a deployed preview
 * Prints the numbers and exits 1 if one misses its target. Read-only.
 */
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import { startServer } from '../../scripts/serve.ts';

const ROOT = resolve(fileURLToPath(new URL('../..', import.meta.url)));
const live = process.argv.find((a) => a.startsWith('--url='))?.split('=')[1];
let SITE, close = async () => {};
if (live) SITE = live.replace(/\/$/, '');
else { const s = await startServer({ dir: join(ROOT, 'dist-pages'), port: 0, quiet: true, dataDir: join(ROOT, '.local', 'pages') }); SITE = `${s.url}/pankao-thailand`; close = s.close; }

const b = await chromium.launch();
const fails = [];
const row = (label, value, target, ok) => { console.log(`${ok ? '✔' : '✘'} ${label}: ${value} (target ${target})`); if (!ok) fails.push(label); };

// Mobile chrome: preview strip + header ≤ 112 px, one row, at four widths in three languages.
let worst = 0, rows = 1;
for (const w of [320, 375, 390, 430]) for (const l of ['th', 'en', 'vi']) {
  const c = await b.newContext({ viewport: { width: w, height: 844 } });
  await c.addInitScript(() => { try { sessionStorage.setItem('pk-noloader', '1'); } catch {} });
  const p = await c.newPage();
  await p.goto(`${SITE}/${l}/`);
  const m = await p.evaluate(() => {
    const bar = document.querySelector('[data-preview-bar]')?.getBoundingClientRect().height ?? 0;
    const head = document.querySelector('[data-header]').getBoundingClientRect().height;
    const inner = document.querySelector('.header-bar__inner');
    const tops = new Set([...inner.children].filter((e) => e.getBoundingClientRect().width > 0).map((e) => Math.round(e.getBoundingClientRect().top / 8)));
    return { total: Math.round(bar + head), rows: tops.size, overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth };
  });
  worst = Math.max(worst, m.total); rows = Math.max(rows, m.rows);
  if (m.overflow > 0) fails.push(`sideways scroll ${w} ${l}`);
  await c.close();
}
row('preview strip + header at 320–430 px, th/en/vi (worst)', `${worst} px`, '≤ 112 px', worst <= 112);
row('header rows on phones (worst)', rows, '1', rows === 1);

// Homepage length at 390 × 844.
for (const l of ['en', 'th']) {
  const c = await b.newContext({ viewport: { width: 390, height: 844 } });
  await c.addInitScript(() => { try { sessionStorage.setItem('pk-noloader', '1'); } catch {} });
  const p = await c.newPage();
  await p.goto(`${SITE}/${l}/`);
  const screens = await p.evaluate(() => document.documentElement.scrollHeight / 844);
  row(`home length at 390 × 844 (${l})`, `${screens.toFixed(1)} screens`, '≤ 9.5 (audit: 8.5–9.5)', screens <= 9.5);
  await c.close();
}

// OEM first step: required inputs.
{
  const c = await b.newContext({ viewport: { width: 1280, height: 900 } });
  await c.addInitScript(() => { try { sessionStorage.setItem('pk-noloader', '1'); } catch {} });
  const p = await c.newPage();
  await p.goto(`${SITE}/en/oem/`);
  const m = await p.evaluate(() => {
    const f = document.querySelector('form[data-form="oem"], #brief form');
    const visible = [...f.querySelectorAll('input, select, textarea')].filter((e) => e.type !== 'hidden' && e.offsetParent !== null && !e.closest('details:not([open])') && !e.closest('[hidden]'));
    return { required: visible.filter((e) => e.required).length, visible: visible.length, photos: document.querySelectorAll('main figure img').length, action: f.querySelector('[data-submit]')?.textContent.trim() };
  });
  row('OEM first-step required inputs', m.required, '6–7', m.required >= 6 && m.required <= 7);
  row('OEM proof photographs', m.photos, '3–5', m.photos >= 3 && m.photos <= 5);
  row('OEM preview action wording', `"${m.action}"`, 'prepare / copy / download', /prepare|copy|download/i.test(m.action ?? ''));
  await c.close();
}

// Codex audit, third edition (20 Nov 2026): route lengths, preview semantics and navigation.
{
  const len = async (vp, path) => {
    const c = await b.newContext({ viewport: vp });
    await c.addInitScript(() => { try { sessionStorage.setItem('pk-noloader', '1'); } catch {} });
    const p = await c.newPage();
    await p.goto(`${SITE}${path}`);
    const v = await p.evaluate((h) => document.documentElement.scrollHeight / h, vp.height);
    await c.close();
    return v;
  };
  const M = { width: 390, height: 844 }, D = { width: 1440, height: 900 };
  for (const [label, vp, path, max] of [
    ['OEM, phone', M, '/en/oem/', 8.2], ['Quality, phone', M, '/en/quality/', 6.2], ['About, phone', M, '/en/about/', 5.2],
    ['Home, desktop', D, '/en/', 6.5], ['Products, desktop', D, '/en/products/', 4.7], ['Process, desktop', D, '/en/process/', 4.2],
  ]) { const v = await len(vp, path); row(`${label} length`, `${v.toFixed(1)} screens`, `≤ ${max}`, v <= max); }
  const c = await b.newContext({ viewport: { width: 390, height: 844 } });
  await c.addInitScript(() => { try { sessionStorage.setItem('pk-noloader', '1'); } catch {} });
  const p = await c.newPage();
  let leaks = 0, titled = 0, pages = 0;
  for (const l of ['th', 'en', 'vi']) for (const path of ['', 'products/', 'products/rice-vermicelli/', 'oem/', 'contact/']) {
    await p.goto(`${SITE}/${l}/${path}`);
    const m = await p.evaluate(() => ({ ld: [...document.querySelectorAll('script[type="application/ld+json"]')].map((s) => s.textContent).join(' '), title: document.title }));
    pages++; if (/"@type":"(Organization|Product)"|PostalAddress|ContactPoint/.test(m.ld)) leaks++; if (/·/.test(m.title.split('|')[0])) titled++;
  }
  row('preview structured data free of unapproved business/product facts', `${pages - leaks}/${pages} pages`, `${pages}/${pages}`, leaks === 0);
  row('preview titles start with "Preview"', `${titled}/${pages} pages`, `${pages}/${pages}`, titled === pages);
  await p.goto(`${SITE}/en/oem/`);
  await p.evaluate(() => window.scrollTo(0, 1400));
  await p.waitForTimeout(400);
  const fab = await p.evaluate(() => { const f = document.querySelector('[data-brief-fab]'); return f && !f.hidden ? Math.round(f.getBoundingClientRect().height) : 0; });
  row('OEM: brief one action away after scrolling (phone)', fab ? `visible, ${fab} px tall` : 'not shown', 'visible, ≥ 44 px', fab >= 44);
  await p.goto(`${SITE}/en/products/rice-stick-pad-thai/`);
  const jumps = await p.evaluate(() => [...document.querySelectorAll('.jumps a')].map((a) => a.getAttribute('href')).filter((h) => document.querySelector(h)).length);
  row('product page jump row (targets that exist)', jumps, '≥ 3', jumps >= 3);
  await c.close();
}

// Opening: first open plays; a reload shows the page at once.
{
  const c = await b.newContext({ viewport: { width: 1280, height: 800 } });
  const p = await c.newPage();
  await p.goto(`${SITE}/en/`, { waitUntil: 'commit' });
  const played = await p.waitForSelector('div.loader', { state: 'visible', timeout: 4000 }).then(() => true, () => false);
  await p.waitForFunction(() => !document.documentElement.classList.contains('loading'), null, { timeout: 7000 });
  await p.reload({ waitUntil: 'domcontentloaded' });
  const again = await p.evaluate(() => document.documentElement.classList.contains('loading'));
  row('opening: first open plays the logo; reload shows the page at once', `${played ? 'plays' : 'missing'} / ${again ? 'replays' : 'instant'}`, 'plays / instant', played && !again);
  await c.close();
}

await b.close();
await close();
console.log(fails.length ? `\n${fails.length} below target` : '\nall audit targets met');
process.exit(fails.length ? 1 : 0);
