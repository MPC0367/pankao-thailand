/**
 * Smoke test for the public GitHub Pages preview, locally (dist-pages/) or live (--url).
 *   node tests/e2e/pages-smoke.mjs                         → local build in dist-pages/
 *   node tests/e2e/pages-smoke.mjs --url=https://mpc0367.github.io/pankao-thailand
 * Read-only: GET requests only; the form is checked to NOT send anything.
 */
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium, webkit } from 'playwright';
import { startServer } from '../../scripts/serve.ts';

const ROOT = resolve(fileURLToPath(new URL('../..', import.meta.url)));
const AXE = readFileSync(createRequire(import.meta.url).resolve('axe-core/axe.min.js'), 'utf8');
const live = process.argv.find((a) => a.startsWith('--url='))?.split('=')[1];
let SITE, close = async () => {};
if (live) SITE = live.replace(/\/$/, '');
else { const s = await startServer({ dir: join(ROOT, 'dist-pages'), port: 0, quiet: true, dataDir: join(ROOT, '.local', 'pages') }); SITE = `${s.url}/pankao-thailand`; close = s.close; }

const results = [];
const check = async (name, fn) => { try { const n = await fn(); results.push({ name, ok: true }); console.log(`✔ ${name}${n ? ` — ${n}` : ''}`); } catch (e) { results.push({ name, ok: false }); console.log(`✘ ${name}\n    ${String(e.message).split('\n')[0]}`); } };
const assert = (c, m) => { if (!c) throw new Error(m); };
const PAGES = ['', 'products/', 'products/rice-stick-pad-thai/', 'oem/', 'process/', 'quality/', 'about/', 'contact/', 'privacy/', 'accessibility/'];

for (const [engine, type] of [['webkit', webkit], ['chromium', chromium]]) {
  const browser = await type.launch();
  await check(`${engine}: every page in 3 languages loads with no errors, one h1, noindex, no review markup`, async () => {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
    await ctx.addInitScript(() => { try { sessionStorage.setItem('pk-loaded', '1'); } catch {} });
    const page = await ctx.newPage();
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
    // A lazy image still loading when the test moves to the next page is cancelled, not broken.
    page.on('requestfailed', (r) => { const why = r.failure()?.errorText ?? ''; if (!/cancel|abort/i.test(why)) errors.push(`failed ${r.url()} (${why})`); });
    let n = 0;
    for (const l of ['th', 'en', 'vi']) for (const p of PAGES) {
      const r = await page.goto(`${SITE}/${l}/${p}`);
      assert(r.status() === 200, `${l}/${p} ${r.status()}`);
      const info = await page.evaluate(() => ({ h1: document.querySelectorAll('h1').length, robots: document.querySelector('meta[name=robots]')?.content, review: !!document.querySelector('.review-note, .fact, [data-review-toggle]'), ow: document.documentElement.scrollWidth - document.documentElement.clientWidth }));
      assert(info.h1 === 1 && info.robots?.startsWith('noindex') && !info.review && info.ow <= 0, `${l}/${p}: ${JSON.stringify(info)}`);
      n++;
    }
    await ctx.close();
    assert(!errors.length, errors.slice(0, 3).join(' | '));
    return `${n} pages`;
  });
  await check(`${engine}: loader plays and lifts; root redirects into a language; glass header mounts`, async () => {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 }, locale: 'en-GB' });
    const page = await ctx.newPage();
    await page.goto(`${SITE}/`, { waitUntil: 'commit' });
    await page.waitForURL(/\/pankao-thailand\/(th|en|vi)\/$/, { timeout: 8000 });
    await page.waitForFunction(() => !document.documentElement.classList.contains('loading'), null, { timeout: 7000 });
    await page.waitForSelector('[data-glass] .lg-glass', { timeout: 8000 });
    const url = page.url();
    await ctx.close();
    return url.replace(SITE, '');
  });
  await check(`${engine}: enquiry form sends nothing and offers copy, download, email and phone`, async () => {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    await ctx.addInitScript(() => { try { sessionStorage.setItem('pk-loaded', '1'); } catch {} });
    const page = await ctx.newPage();
    const posts = [];
    page.on('request', (r) => { if (r.method() === 'POST') posts.push(r.url()); });
    await page.goto(`${SITE}/en/oem/`);
    await page.fill('#oem-company', 'Test'); await page.fill('#oem-name', 'Test'); await page.fill('#oem-email', 'test@example.com');
    await page.fill('#oem-country', 'TH'); await page.selectOption('#oem-buyerType', 'other'); await page.fill('#oem-message', 'Smoke test, not sent.'); await page.check('#oem-consent');
    await page.click('[data-submit]');
    await page.waitForSelector('[data-form-status][data-tone="bad"]');
    const btns = await page.locator('[data-form-status] .btn').allInnerTexts();
    await ctx.close();
    assert(posts.length === 0, `no POST (${posts.length})`);
    for (const b of ['Copy brief', 'Download brief (.txt)', 'Email it instead']) assert(btns.includes(b), `${b} (${btns.join(', ')})`);
  });
  await browser.close();
}

await check('chromium: axe-core — no critical or serious issues (5 templates × 3 languages)', async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ bypassCSP: true, reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  const found = [];
  for (const l of ['th', 'en', 'vi']) for (const p of ['', 'products/', 'products/mr-noodles/', 'oem/', 'contact/']) {
    await page.goto(`${SITE}/${l}/${p}`);
    await page.addScriptTag({ content: AXE });
    const v = await page.evaluate(async () => (await window.axe.run(document, { runOnly: ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'] })).violations.filter((x) => x.impact === 'critical' || x.impact === 'serious').map((x) => x.id));
    for (const id of v) found.push(`${l}/${p} ${id}`);
  }
  await b.close();
  assert(!found.length, found.join('; '));
});

await close();
const failed = results.filter((r) => !r.ok).length;
console.log(`\n${results.length - failed}/${results.length} checks passed (${live ? 'live' : 'local'})`);
process.exit(failed ? 1 : 0);
