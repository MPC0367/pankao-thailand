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
// Every generated page (Codex F05.2): the templates plus every product page, read from the products index itself.
const BASE_PAGES = ['', 'products/', 'oem/', 'process/', 'quality/', 'about/', 'contact/', 'privacy/', 'accessibility/'];
const PRODUCT_PAGES = [...new Set([...(await (await fetch(`${SITE}/en/products/`)).text()).matchAll(/href="[^"]*\/en\/(products\/[a-z0-9-]+\/)"/g)].map((m) => m[1]))];
const PAGES = [...BASE_PAGES, ...PRODUCT_PAGES];
const LANG = { th: 'th', en: 'en', vi: 'vi' };

for (const [engine, type] of [['webkit', webkit], ['chromium', chromium]]) {
  const browser = await type.launch();
  await check(`${engine}: every page in 3 languages loads with no errors, one h1, noindex, no review markup`, async () => {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
    await ctx.addInitScript(() => { try { sessionStorage.setItem('pk-noloader', '1'); } catch {} });
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
  await check(`${engine}: unknown pages answer 404 in the address's language with recovery links (Codex F17.4)`, async () => {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
    await ctx.addInitScript(() => { try { sessionStorage.setItem('pk-noloader', '1'); } catch {} });
    const page = await ctx.newPage();
    const seen = [];
    for (const l of ['th', 'en', 'vi']) {
      const r = await page.goto(`${SITE}/${l}/no-such-page-${Date.now()}/`);
      assert(r.status() === 404, `${l}: status ${r.status()}`);
      await page.waitForFunction((want) => document.documentElement.lang === want, LANG[l], { timeout: 4000 }).catch(() => {});
      const info = await page.evaluate(() => ({ lang: document.documentElement.lang, h1: document.querySelectorAll('h1').length, title: document.title, links: [...document.querySelectorAll('.recovery a')].map((a) => new URL(a.href).pathname) }));
      assert(info.lang === LANG[l], `${l}: lang ${info.lang}`);
      assert(info.h1 === 1 && info.links.length >= 4 && info.links.every((h) => h.includes(`/${l}/`)), `${l}: ${JSON.stringify(info)}`);
      seen.push(`${l}:${info.lang}`);
    }
    await ctx.close();
    return seen.join(' ');
  });
  await check(`${engine}: OEM phone brief link — after the proof in reading order, never over the form, terms or footer (Codex F13.4)`, async () => {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
    await ctx.addInitScript(() => { try { sessionStorage.setItem('pk-noloader', '1'); } catch {} });
    const page = await ctx.newPage();
    await page.goto(`${SITE}/en/oem/`);
    const order = await page.evaluate(() => {
      const fab = document.querySelector('[data-brief-fab]'), proof = document.querySelector('.proof-next'), brief = document.querySelector('#brief');
      return !!fab && !!(proof.compareDocumentPosition(fab) & Node.DOCUMENT_POSITION_FOLLOWING) && !!(fab.compareDocumentPosition(brief) & Node.DOCUMENT_POSITION_FOLLOWING);
    });
    assert(order, 'the link is not between the proof and the brief in reading order');
    const height = await page.evaluate(() => document.documentElement.scrollHeight);
    let shown = 0, positions = 0;
    for (let y = 0; y < height; y += 160) {
      await page.evaluate((v) => window.scrollTo(0, v), y);
      await page.waitForTimeout(120);
      const r = await page.evaluate(() => {
        const fab = document.querySelector('[data-brief-fab]');
        if (!fab || fab.hidden || getComputedStyle(fab).display === 'none') return { visible: false };
        const a = fab.getBoundingClientRect();
        const brief = document.querySelector('#brief').getBoundingClientRect();
        const hit = [...document.querySelectorAll('#brief input, #brief select, #brief textarea, #brief button, summary, .site-footer a')].find((el) => {
          const b = el.getBoundingClientRect();
          return b.width && b.height && a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom;
        });
        return { visible: true, briefPassedOrIn: brief.top < innerHeight * 0.7, hit: hit ? `${hit.tagName.toLowerCase()}${hit.id ? '#' + hit.id : ''}` : null };
      });
      positions++;
      if (!r.visible) continue;
      shown++;
      assert(!r.hit, `at ${y}px the link covers ${r.hit}`);
      assert(!r.briefPassedOrIn, `at ${y}px the link shows after the brief was reached`);
    }
    await ctx.close();
    assert(shown > 0, 'the link never appeared');
    return `visible at ${shown} of ${positions} scroll positions, never over a control`;
  });
  await check(`${engine}: loader appears through the root link and lifts; glass header mounts`, async () => {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 }, locale: 'en-GB' });
    const page = await ctx.newPage();
    await page.goto(`${SITE}/`, { waitUntil: 'commit' });
    await page.waitForURL(/\/pankao-thailand\/(th|en|vi)\/$/, { timeout: 8000 });
    // It must actually appear (arriving through the root link), not merely be absent.
    await page.waitForSelector('div.loader', { state: 'visible', timeout: 4000 });
    await page.waitForFunction(() => !document.documentElement.classList.contains('loading'), null, { timeout: 7000 });
    await page.waitForSelector('[data-glass] .lg-glass', { timeout: 8000 });
    const url = page.url();
    await ctx.close();
    return url.replace(SITE, '');
  });
  await check(`${engine}: enquiry form sends nothing and offers copy, download, email and phone`, async () => {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    await ctx.addInitScript(() => { try { sessionStorage.setItem('pk-noloader', '1'); } catch {} });
    const page = await ctx.newPage();
    const posts = [];
    page.on('request', (r) => { if (r.method() === 'POST') posts.push(r.url()); });
    await page.goto(`${SITE}/en/oem/`);
    await page.fill('#oem-company', 'Test'); await page.fill('#oem-name', 'Test'); await page.fill('#oem-email', 'test@example.com');
    await page.fill('#oem-country', 'TH'); await page.selectOption('#oem-format', 'unsure'); await page.fill('#oem-message', 'Smoke test, not sent.'); await page.check('#oem-consent');
    await page.click('[data-submit]');
    await page.waitForSelector('[data-form-status][data-tone="bad"]');
    const btns = await page.locator('[data-form-status] .btn').allInnerTexts();
    await ctx.close();
    assert(posts.length === 0, `no POST (${posts.length})`);
    for (const b of ['Copy brief', 'Download brief (.txt)', 'Email it instead']) assert(btns.includes(b), `${b} (${btns.join(', ')})`);
  });
  await browser.close();
}

await check(`chromium: axe-core — no critical or serious issues (5 templates and every product page × 3 languages)`, async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ bypassCSP: true, reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  const found = [];
  for (const l of ['th', 'en', 'vi']) for (const p of ['', 'products/', 'oem/', 'contact/', 'about/', ...PRODUCT_PAGES]) {
    await page.goto(`${SITE}/${l}/${p}`);
    await page.addScriptTag({ content: AXE });
    const v = await page.evaluate(async () => (await window.axe.run(document, { runOnly: ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'] })).violations.filter((x) => x.impact === 'critical' || x.impact === 'serious').map((x) => x.id));
    for (const id of v) found.push(`${l}/${p} ${id}`);
  }
  await b.close();
  assert(!found.length, found.join('; '));
});

await check('chromium: product pages — every jump lands on its section (Codex F05.2)', async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
  await ctx.addInitScript(() => { try { sessionStorage.setItem('pk-noloader', '1'); } catch {} });
  const page = await ctx.newPage();
  let n = 0;
  for (const l of ['th', 'en', 'vi']) for (const p of PRODUCT_PAGES) {
    await page.goto(`${SITE}/${l}/${p}`);
    const ids = await page.$$eval('.jumps a', (as) => as.map((a) => a.getAttribute('href')));
    assert(ids.length >= 3, `${l}/${p}: ${ids.length} jumps`);
    for (const id of ids) assert(await page.$(id), `${l}/${p}: ${id} missing`);
    n += ids.length;
  }
  await b.close();
  return `${n} jumps on ${PRODUCT_PAGES.length * 3} pages`;
});

await check('caching and first-screen weight (recorded, not enforced: GitHub Pages sets its own cache)', async () => {
  const head = async (path) => { const r = await fetch(`${SITE}/${path}`, { method: 'HEAD' }); return { cc: r.headers.get('cache-control') ?? '—', len: Number(r.headers.get('content-length') ?? 0) }; };
  const html = await (await fetch(`${SITE}/en/`)).text();
  const hero = html.match(/<source type="image\/webp" srcset="[^"]*?\/(media\/legacy-hero-pack[^" ]+\.webp)"/)?.[1];
  const css = html.match(/href="[^"]*\/(assets\/site\.[^"]+\.css)"/)?.[1];
  const h = await head('en/'), c = await head(css), i = hero ? await head(hero) : { cc: '—', len: 0 };
  return `HTML ${h.cc}; CSS ${c.cc}; hero WebP ${Math.round(i.len / 1024)} KB, ${i.cc}`;
});

await close();
const failed = results.filter((r) => !r.ok).length;
console.log(`\n${results.length - failed}/${results.length} checks passed (${live ? 'live' : 'local'})`);
process.exit(failed ? 1 : 0);
