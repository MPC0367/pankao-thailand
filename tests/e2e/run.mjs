/**
 * Browser verification (Part 14.3–14.7): core journeys in WebKit (primary) and Chromium,
 * every form state against the local test adapter, keyboard/drawer, language switch with a
 * draft, filters with back/forward, pack↔dish on pointer/keyboard/touch, consented map,
 * opening sequence, reduced motion, no-JavaScript, overflow at every required width,
 * 200% text, target sizes, axe-core scans and the screenshot matrix.
 *
 *   node tests/e2e/run.mjs [--only=name] [--no-shots]
 * Needs a preview build (npm run build). Writes qa-output/e2e.json.
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium, webkit } from 'playwright';
import { startServer } from '../../scripts/serve.ts';

const ROOT = resolve(fileURLToPath(new URL('../..', import.meta.url)));
const SHOTS = resolve(ROOT, '../documents/screenshots/build-2026-11-19');
const require = createRequire(import.meta.url);
const AXE = readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');
const only = process.argv.find((a) => a.startsWith('--only='))?.split('=')[1];
const noShots = process.argv.includes('--no-shots');

const { url: BASE, close } = await startServer({ dir: join(ROOT, 'dist'), port: 0, quiet: true, dataDir: join(ROOT, '.local', 'e2e') });
const results = [];
const LOCALES = ['th', 'en', 'vi'];
const TEMPLATES = { home: '', products: 'products/', product: 'products/rice-vermicelli/', brand: 'products/mr-noodles/', oem: 'oem/', process: 'process/', quality: 'quality/', about: 'about/', contact: 'contact/', privacy: 'privacy/', accessibility: 'accessibility/', notfound: 'no-such-page/' };

async function check(name, fn) {
  if (only && !name.includes(only)) return;
  const t0 = Date.now();
  try {
    const note = await fn();
    results.push({ name, ok: true, ms: Date.now() - t0, note: note ?? '' });
    console.log(`✔ ${name}${note ? ` — ${note}` : ''}`);
  } catch (e) {
    results.push({ name, ok: false, ms: Date.now() - t0, error: String(e?.message ?? e).slice(0, 600) });
    console.log(`✘ ${name}\n    ${String(e?.message ?? e).split('\n').slice(0, 4).join('\n    ')}`);
  }
}
const assert = (c, m) => { if (!c) throw new Error(m); };
const reset = () => fetch(`${BASE}/__mock/scenario`, { method: 'POST', body: '{}' });
const setNext = (scenario, count = 1) => fetch(`${BASE}/__mock/scenario`, { method: 'POST', body: JSON.stringify({ scenario, count }) });

const browsers = { webkit: await webkit.launch(), chromium: await chromium.launch() };
// Contexts behave like a tab that has already seen the loader, unless a check asks for it ({ withLoader: true }).
for (const b of Object.values(browsers)) {
  const open = b.newContext.bind(b);
  b.newContext = async (o = {}) => {
    const { withLoader, ...rest } = o;
    const c = await open(rest);
    if (!withLoader) await c.addInitScript(() => { try { sessionStorage.setItem('pk-loaded', '1'); } catch {} });
    return c;
  };
}
const ctxOpts = (o = {}) => ({ viewport: { width: 1280, height: 860 }, locale: 'en-GB', ...o });

async function fillOem(page, { locale = 'en' } = {}) {
  await page.fill('#oem-company', 'Fixture Imports Ltd');
  await page.fill('#oem-name', 'Test Buyer');
  await page.fill('#oem-email', 'buyer@example.com');
  await page.fill('#oem-country', 'Vietnam');
  await page.selectOption('#oem-buyerType', 'importer');
  await page.check('input[name="formats"][value="rice-vermicelli"]');
  await page.fill('#oem-message', 'We need 400 g retail bags of rice vermicelli for a private label. (automated local test)');
  await page.check('#oem-consent');
  void locale;
}

/* ---------------- journeys, both engines ---------------- */
for (const [engine, browser] of Object.entries(browsers)) {
  for (const locale of LOCALES) {
    await check(`${engine} ${locale}: home → product family → product detail → OEM brief → simulated success`, async () => {
      await reset();
      const ctx = await browser.newContext(ctxOpts());
      const page = await ctx.newPage();
      await page.goto(`${BASE}/${locale}/`);
      await page.click('#home-rice-vermicelli h3 a');
      await page.waitForURL(`**/${locale}/products/rice-vermicelli/`);
      assert((await page.locator('h1').innerText()).length > 2, 'product h1');
      await page.click('.product-hero .btn--primary');
      await page.waitForURL(`**/${locale}/oem/#brief`);
      await fillOem(page, { locale });
      await page.waitForTimeout(1600);
      await page.click('[data-submit]');
      const status = page.locator('[data-form-status]');
      await status.waitFor({ state: 'visible' });
      await page.waitForFunction(() => document.querySelector('[data-form-status]')?.getAttribute('data-tone') === 'ok', null, { timeout: 8000 });
      const text = await status.innerText();
      assert(/PK-[0-9A-F]{8}/.test(text), `reference shown: ${text}`);
      assert((await page.inputValue('#oem-company')) === '', 'form cleared after verified success');
      await ctx.close();
      return text.split('\n')[0];
    });
  }

  await check(`${engine}: invalid form → error summary → correction → success (AC-UX-06)`, async () => {
    await reset();
    const ctx = await browser.newContext(ctxOpts());
    const page = await ctx.newPage();
    await page.goto(`${BASE}/en/oem/`);
    await page.fill('#oem-email', 'not-an-email');
    await page.fill('#oem-name', 'Kept Value');
    await page.click('[data-submit]');
    const summary = page.locator('[data-error-summary]');
    await summary.waitFor({ state: 'visible' });
    const focused = await page.evaluate(() => document.activeElement?.hasAttribute('data-error-summary'));
    assert(focused, 'focus moves to the error summary');
    const items = await summary.locator('li a').count();
    assert(items >= 5, `summary lists errors (${items})`);
    assert((await page.getAttribute('#oem-email', 'aria-invalid')) === 'true', 'email aria-invalid');
    const desc = await page.getAttribute('#oem-email', 'aria-describedby');
    assert(desc?.includes('oem-email-error'), 'error associated with the field');
    assert((await page.inputValue('#oem-name')) === 'Kept Value', 'valid input kept');
    await summary.locator('li a').first().click();
    await fillOem(page);
    await page.waitForTimeout(1600);
    await page.click('[data-submit]');
    await page.waitForFunction(() => document.querySelector('[data-form-status]')?.getAttribute('data-tone') === 'ok', null, { timeout: 8000 });
    await ctx.close();
    return `${items} errors summarised`;
  });

  await check(`${engine}: backend failure keeps the draft, says not sent, offers retry + copy/download (AC-OEM-02)`, async () => {
    await reset();
    await setNext('fail', 1);
    const ctx = await browser.newContext(ctxOpts());
    const page = await ctx.newPage();
    await page.goto(`${BASE}/en/oem/`);
    await fillOem(page);
    await page.waitForTimeout(1600);
    await page.click('[data-submit]');
    await page.waitForFunction(() => document.querySelector('[data-form-status]')?.getAttribute('data-tone') === 'bad', null, { timeout: 8000 });
    const text = await page.locator('[data-form-status]').innerText();
    assert(/not sent/i.test(text), 'says not sent');
    assert((await page.inputValue('#oem-company')) === 'Fixture Imports Ltd', 'draft preserved');
    const btns = await page.locator('[data-form-status] .btn').allInnerTexts();
    for (const b of ['Try again', 'Copy brief', 'Download brief (.txt)', 'Email it instead']) assert(btns.includes(b), `button ${b} (${btns.join(', ')})`);
    await page.click('[data-form-status] button:has-text("Try again")');
    await page.waitForFunction(() => document.querySelector('[data-form-status]')?.getAttribute('data-tone') === 'ok', null, { timeout: 8000 });
    await ctx.close();
  });

  await check(`${engine}: repeated taps send one request; retry reuses the idempotency key (AC-OEM-03)`, async () => {
    await reset();
    await setNext('slow', 1);
    const ctx = await browser.newContext(ctxOpts());
    const page = await ctx.newPage();
    const posts = [];
    page.on('request', (r) => { if (r.url().endsWith('/api/enquiries') && r.method() === 'POST') posts.push(r.headers()['idempotency-key']); });
    await page.goto(`${BASE}/en/oem/`);
    await fillOem(page);
    await page.waitForTimeout(1600);
    await page.click('[data-submit]');
    await page.click('[data-submit]', { force: true, timeout: 1000 }).catch(() => {});
    await page.click('[data-submit]', { force: true, timeout: 1000 }).catch(() => {});
    assert((await page.getAttribute('[data-submit]', 'aria-disabled')) === 'true', 'button shows pending');
    await page.waitForSelector('text=Still sending', { timeout: 6000 });
    await page.waitForFunction(() => document.querySelector('[data-form-status]')?.getAttribute('data-tone') === 'ok', null, { timeout: 12000 });
    assert(posts.length === 1, `one request (${posts.length})`);
    await ctx.close();
    return 'slow state shown, one POST';
  });

  await check(`${engine}: rate limit and offline never show success (AC-OEM-04, AC-TEC-07)`, async () => {
    await reset();
    const ctx = await browser.newContext(ctxOpts());
    const page = await ctx.newPage();
    await page.goto(`${BASE}/en/oem/`);
    await fillOem(page);
    await page.waitForTimeout(1600);
    await setNext('rate', 1);
    await page.click('[data-submit]');
    await page.waitForSelector('[data-form-status] >> text=Too many attempts');
    assert((await page.inputValue('#oem-message')).length > 10, 'draft kept after 429');
    await ctx.setOffline(true);
    await page.click('[data-submit]');
    await page.waitForSelector('[data-form-status] >> text=You appear to be offline');
    const tools = await page.locator('[data-form-status] .btn').allInnerTexts();
    assert(tools.includes('Download brief (.txt)'), 'download fallback offline');
    await ctx.setOffline(false);
    await ctx.close();
  });

  await check(`${engine}: language switch keeps the product and the form draft (AC-IA-02, 14.4 #9)`, async () => {
    await reset();
    const ctx = await browser.newContext(ctxOpts());
    const page = await ctx.newPage();
    await page.goto(`${BASE}/vi/products/rice-stick-pad-thai/`);
    await page.click('.site-header [data-lang-switch="en"]');
    await page.waitForURL('**/en/products/rice-stick-pad-thai/');
    await page.goto(`${BASE}/en/oem/`);
    await page.fill('#oem-company', 'Draft Co');
    await page.fill('#oem-message', 'Half-written brief');
    await page.click('.site-header [data-lang-switch="th"]');
    await page.waitForURL('**/th/oem/**');
    assert((await page.inputValue('#oem-company')) === 'Draft Co', 'company restored');
    assert((await page.inputValue('#oem-message')) === 'Half-written brief', 'message restored');
    assert(await page.locator('[data-restored]').isVisible(), 'restored notice');
    assert((await page.getAttribute('html', 'lang')) === 'th', 'no mixed locale');
    await ctx.close();
  });

  await check(`${engine}: product filter → deep link → back/forward restores (AC-PRD-01, 14.4 #5)`, async () => {
    const ctx = await browser.newContext(ctxOpts());
    const page = await ctx.newPage();
    await page.goto(`${BASE}/en/products/`);
    const visible = () => page.locator('[data-product-list] [data-product]:visible').count();
    const all = await visible();
    await page.click('[data-filter-format="flake"]');
    assert(page.url().includes('format=flake'), 'URL stores filter');
    assert((await visible()) === 1, 'one flake format');
    await page.fill('[data-filter-search]', 'zzzz');
    await page.waitForTimeout(300);
    assert(await page.locator('[data-filter-empty]').isVisible(), 'empty state');
    await page.fill('[data-filter-search]', '');
    await page.waitForTimeout(300);
    await page.goBack();
    await page.waitForTimeout(200);
    assert((await visible()) === all, `back restores all (${await visible()}/${all})`);
    await page.goForward();
    await page.waitForTimeout(200);
    assert((await visible()) === 1, 'forward restores filter');
    await page.goto(`${BASE}/en/products/?q=pad%20thai`);
    assert((await visible()) === 1, 'deep link search (Pad Thai → rice stick)');
    await page.goto(`${BASE}/en/products/?q=${encodeURIComponent('เส้นหมี่')}`);
    assert((await visible()) >= 1, 'Thai name search on English page');
    await page.goto(`${BASE}/en/products/?q=b%C3%BAn`);
    assert((await visible()) >= 1, 'Vietnamese name search');
    await page.goto(`${BASE}/en/products/?format=flake`);
    await page.click('.result-line [data-filter-reset]');
    assert((await visible()) === all, 'reset restores all');
    const count = await page.locator('[data-result-count]').innerText();
    assert(count.includes(String(all)), `count announces ${all}: ${count}`);
    await ctx.close();
    return `${all} formats`;
  });

  await check(`${engine}: pack ↔ cooked by keyboard and touch (AC-PRD-02, PRD-05)`, async () => {
    const ctx = await browser.newContext(ctxOpts({ hasTouch: true, isMobile: engine === 'chromium', viewport: { width: 390, height: 844 } }));
    const page = await ctx.newPage();
    await page.goto(`${BASE}/en/`);
    const btn = page.locator('#home-rice-stick-pad-thai .view-toggle');
    await btn.tap();
    assert((await btn.getAttribute('aria-pressed')) === 'true', 'tap toggles');
    assert((await page.getAttribute('#media-rice-stick-pad-thai-home', 'data-view')) === 'dish', 'dish shown');
    assert(await page.locator('#media-rice-stick-pad-thai-home .view-dry').isVisible(), 'pack stays in place');
    await btn.focus();
    await page.keyboard.press('Space');
    assert((await btn.getAttribute('aria-pressed')) === 'false', 'keyboard toggles back');
    await ctx.close();
  });

  await check(`${engine}: drawer — focus in, contained, Escape closes, focus returns (AC-UX-01)`, async () => {
    const ctx = await browser.newContext(ctxOpts({ viewport: { width: 390, height: 844 } }));
    const page = await ctx.newPage();
    await page.goto(`${BASE}/th/`);
    const open = page.locator('.site-header [data-menu-open]');
    await open.focus();
    await page.keyboard.press('Enter');
    await page.waitForSelector('[data-drawer][open]');
    const inside = () => page.evaluate(() => !!document.activeElement?.closest('[data-drawer]'));
    assert(await inside(), 'focus inside drawer');
    for (let i = 0; i < 14; i++) { await page.keyboard.press('Tab'); assert(await inside(), `focus stays inside after ${i + 1} tabs`); }
    await page.keyboard.press('Escape');
    await page.waitForFunction(() => !document.querySelector('[data-drawer]').open);
    assert(await page.evaluate(() => document.activeElement?.hasAttribute('data-menu-open')), 'focus returns to the menu button');
    await ctx.close();
  });

  await check(`${engine}: legacy URLs land on the right locale page (14.4 #10)`, async () => {
    const ctx = await browser.newContext(ctxOpts());
    const page = await ctx.newPage();
    for (const [from, to] of [['/rice_flake_vn.html', '/vi/products/rice-flake-guay-jub/'], ['/history_en.html', '/en/about/'], ['/contact.html', '/th/contact/']]) {
      const r = await page.goto(`${BASE}${from}`);
      assert(new URL(page.url()).pathname === to && r.status() === 200, `${from} → ${page.url()}`);
    }
    await ctx.close();
  });
}

/* ---------------- Chromium-only instrumented checks ---------------- */
const C = browsers.chromium;

await check('chromium: map loads only after "Show map"; address copy works (AC-CT-02, AC-TEC-06)', async () => {
  const ctx = await C.newContext(ctxOpts());
  await ctx.grantPermissions(['clipboard-read', 'clipboard-write'], { origin: BASE });
  const page = await ctx.newPage();
  const third = [];
  page.on('request', (r) => { if (!r.url().startsWith(BASE)) third.push(r.url()); });
  await page.route(/google\.com/, (r) => r.fulfill({ status: 200, contentType: 'text/html', body: '<p>map stand-in</p>' }));
  await page.goto(`${BASE}/en/contact/`);
  await page.waitForTimeout(500);
  assert(third.length === 0, `no third-party request before consent (${third.join(', ')})`);
  await page.click('[data-copy-address]');
  const clip = await page.evaluate(() => navigator.clipboard.readText());
  assert(clip.includes('Sai Noi') && clip.includes('11150'), `clipboard: ${clip}`);
  const dir = await page.getAttribute('a[href*="google.com/maps/dir"]', 'href');
  assert(dir && dir.includes('destination='), 'directions link');
  await page.click('[data-map-show]');
  await page.waitForSelector('[data-map] iframe');
  assert(third.some((u) => u.includes('google.com/maps')), 'map requested after the click');
  await ctx.close();
});

await check('chromium: loader plays on a fresh tab, ends by ~2.4 s, skips within the session and on click (owner request)', async () => {
  const ctx = await C.newContext(ctxOpts({ withLoader: true }));
  const page = await ctx.newPage();
  await page.goto(`${BASE}/en/`, { waitUntil: 'commit' });
  await page.waitForSelector('div.loader', { state: 'visible', timeout: 3000 });
  const t0 = Date.now();
  await page.waitForFunction(() => !document.documentElement.classList.contains('loading'), null, { timeout: 4000 });
  const took = Date.now() - t0;
  const h1 = await page.locator('h1').isVisible();
  await page.goto(`${BASE}/th/`);
  const again = await page.evaluate(() => document.documentElement.classList.contains('loading'));
  await ctx.close();
  const ctx2 = await C.newContext(ctxOpts({ withLoader: true }));
  const p2 = await ctx2.newPage();
  await p2.goto(`${BASE}/vi/`, { waitUntil: 'commit' });
  await p2.waitForSelector('div.loader', { state: 'visible', timeout: 3000 });
  await p2.mouse.click(400, 300);
  await p2.waitForFunction(() => !document.documentElement.classList.contains('loading'), null, { timeout: 1500 });
  await ctx2.close();
  assert(took <= 2600, `loader gone in ${took} ms`);
  assert(h1, 'page underneath is rendered');
  assert(!again, 'second page in the same tab: no loader');
  return `cleared ${took} ms after it appeared; click skips`;
});

await check('chromium + webkit: liquid glass header — Glisse mounts (refraction in Chromium), frosted fallback everywhere', async () => {
  const notes = [];
  for (const [engine, b] of Object.entries(browsers)) {
    const ua = engine === 'chromium' ? { userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36' } : {};
    const ctx = await b.newContext(ctxOpts(ua));
    const page = await ctx.newPage();
    await page.goto(`${BASE}/en/products/`);
    await page.waitForSelector('[data-glass] .lg-glass', { timeout: 5000 });
    if (engine === 'chromium') await page.waitForFunction(() => getComputedStyle(document.querySelector('[data-glass] .lg-glass')).backdropFilter.includes('url('), null, { timeout: 5000 }).catch(() => {});
    const r = await page.evaluate(() => {
      const lens = document.querySelector('[data-glass] .lg-glass');
      const cs = getComputedStyle(lens);
      return { filter: cs.backdropFilter || cs.webkitBackdropFilter || '', css: !!document.getElementById('glisse-styles') };
    });
    await ctx.close();
    assert(r.css, `${engine}: Glisse stylesheet linked`);
    assert(/blur/.test(r.filter), `${engine}: glass blur (${r.filter})`);
    if (engine === 'chromium') assert(/url\(/.test(r.filter), `chromium refracts (${r.filter})`);
    notes.push(`${engine}: ${r.filter.slice(0, 40)}`);
  }
  const ctx = await C.newContext(ctxOpts({ reducedMotion: 'reduce', javaScriptEnabled: false }));
  const page = await ctx.newPage();
  await page.goto(`${BASE}/en/`);
  const fallback = await page.evaluate(() => getComputedStyle(document.querySelector('[data-glass]')).backdropFilter);
  await ctx.close();
  assert(/blur/.test(fallback), `no-JS frosted fallback (${fallback})`);
  return notes.join(' · ');
});

await check('chromium: reduced motion — no loader, content visible, process static (AC-UX-02)', async () => {
  const ctx = await C.newContext(ctxOpts({ reducedMotion: 'reduce', withLoader: true }));
  const page = await ctx.newPage();
  await page.goto(`${BASE}/en/`);
  assert(!(await page.evaluate(() => document.documentElement.classList.contains('loading'))), 'no loader');
  const hidden = await page.evaluate(() => [...document.querySelectorAll('.arrive')].filter((e) => getComputedStyle(e).opacity !== '1').length);
  assert(hidden === 0, `${hidden} hidden blocks`);
  await page.goto(`${BASE}/en/process/`);
  const p = await page.evaluate(() => getComputedStyle(document.querySelector('[data-process-thread]')).getPropertyValue('--p'));
  assert(p.trim() === '1', `thread static (${p})`);
  await ctx.close();
});

await check('chromium: no JavaScript — core pages, product links, contacts and privacy stay usable (AC-UX-04)', async () => {
  const ctx = await C.newContext(ctxOpts({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } }));
  const page = await ctx.newPage();
  for (const l of LOCALES) for (const p of ['', 'products/', 'products/rice-vermicelli/', 'oem/', 'contact/']) {
    await page.goto(`${BASE}/${l}/${p}`);
    assert(await page.locator('h1').isVisible(), `${l}/${p} h1`);
    assert((await page.locator('.nav a').count()) >= 6, `${l}/${p} nav visible`);
    assert((await page.locator('a[href^="tel:"]').count()) >= 1, `${l}/${p} phone`);
    assert((await page.locator(`a[href="/${l}/privacy/"]`).count()) >= 1, `${l}/${p} privacy link`);
    const hidden = await page.evaluate(() => [...document.querySelectorAll('main *')].some((e) => getComputedStyle(e).opacity === '0' && e.textContent.trim().length > 20));
    assert(!hidden, `${l}/${p}: content hidden without JS`);
  }
  await page.goto(`${BASE}/en/products/`);
  assert((await page.locator('[data-product]').count()) === 5, 'all products listed');
  await ctx.close();
});

await check('chromium: no sideways scroll at 320–1920 px in all locales (UX-01, 12.1)', async () => {
  const widths = [320, 360, 375, 390, 430, 768, 1024, 1366, 1440, 1920];
  const ctx = await C.newContext(ctxOpts());
  const page = await ctx.newPage();
  const bad = [];
  for (const w of widths) {
    await page.setViewportSize({ width: w, height: 900 });
    for (const l of LOCALES) for (const p of Object.values(TEMPLATES)) {
      await page.goto(`${BASE}/${l}/${p}`);
      const o = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      if (o > 0) bad.push(`${w} ${l}/${p} +${o}px`);
    }
  }
  await ctx.close();
  assert(!bad.length, bad.join('; '));
  return `${widths.length} widths × ${LOCALES.length} locales × ${Object.keys(TEMPLATES).length} templates`;
});

await check('chromium: no image renders wider or taller than its native pixels (MED-04, AC-MED-03)', async () => {
  const ctx = await C.newContext(ctxOpts());
  const page = await ctx.newPage();
  const bad = [];
  let n = 0;
  for (const w of [320, 390, 768, 1440, 1920]) {
    await page.setViewportSize({ width: w, height: 900 });
    for (const p of ['', 'products/', 'products/rice-stick-pad-thai/', 'products/mr-noodles/', 'process/', 'about/']) {
      await page.goto(`${BASE}/en/${p}`);
      await page.evaluate(async () => { document.querySelectorAll('img').forEach((i) => { i.loading = 'eager'; }); await Promise.all([...document.images].map((i) => (i.complete ? 0 : new Promise((r) => { i.onload = i.onerror = r; })))); });
      const r = await page.evaluate(() => [...document.images].filter((i) => i.offsetParent !== null && i.naturalWidth).map((i) => { const b = i.getBoundingClientRect(); return [i.dataset.asset, Math.round(b.width), Math.round(b.height), i.naturalWidth, i.naturalHeight]; }));
      for (const [id, rw, rh, nw, nh] of r) { n++; if (rw > nw + 1 || rh > nh + 1) bad.push(`${w} /${p} ${id} ${rw}×${rh} > ${nw}×${nh}`); }
    }
  }
  await ctx.close();
  assert(!bad.length, bad.slice(0, 8).join('; '));
  return `${n} image renders checked`;
});

await check('chromium: 200% text size reflows without sideways scroll (AC-UX-05)', async () => {
  const ctx = await C.newContext(ctxOpts({ viewport: { width: 640, height: 900 }, bypassCSP: true }));
  const page = await ctx.newPage();
  const bad = [];
  for (const l of LOCALES) for (const p of ['', 'products/', 'products/rice-stick-pad-thai/', 'oem/', 'contact/', 'quality/']) {
    await page.goto(`${BASE}/${l}/${p}`);
    await page.addStyleTag({ content: 'html{font-size:200% !important}' });
    await page.waitForTimeout(50);
    const o = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    if (o > 0) bad.push(`${l}/${p} +${o}px`);
  }
  await ctx.close();
  assert(!bad.length, bad.join('; '));
});

await check('chromium: targets ≥ 44×44 px and header ≤ 20% of an 844 px phone (8.2, UX-09)', async () => {
  const ctx = await C.newContext(ctxOpts({ viewport: { width: 390, height: 844 } }));
  const page = await ctx.newPage();
  const small = [];
  for (const p of ['', 'products/', 'oem/', 'contact/']) {
    await page.goto(`${BASE}/en/${p}`);
    const r = await page.evaluate(() => [...document.querySelectorAll('.btn, .chip, .view-toggle, .menu-button, .lang a, .nav a, .crumbs a, .site-footer li a, .o2-credit, .link-arrow, [data-review-toggle]')]
      .filter((e) => e.offsetParent !== null).map((e) => { const b = e.getBoundingClientRect(); return [e.className || e.tagName, Math.round(b.width), Math.round(b.height)]; })
      .filter(([, w, h]) => h < 44 || w < 44));
    small.push(...r.map((x) => `${p}: ${x.join(' ')}`));
  }
  const header = await page.evaluate(() => document.querySelector('[data-header]').getBoundingClientRect().height);
  await ctx.close();
  assert(header <= 0.2 * 844, `header ${header}px`);
  assert(!small.length, small.slice(0, 8).join('; '));
  return `header ${Math.round(header)} px`;
});

await check('chromium: axe-core — no critical or serious issues on every template, locale and open state (TEC-05, 14.5)', async () => {
  const ctx = await C.newContext(ctxOpts({ bypassCSP: true, reducedMotion: 'reduce' }));
  const page = await ctx.newPage();
  const found = [];
  let scans = 0;
  const scan = async (label) => {
    await page.addScriptTag({ content: AXE });
    const r = await page.evaluate(async () => (await window.axe.run(document, { runOnly: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'] })).violations.map((v) => ({ id: v.id, impact: v.impact, n: v.nodes.length, t: v.nodes[0]?.target?.join(' ') })));
    scans++;
    for (const v of r) if (v.impact === 'critical' || v.impact === 'serious') found.push(`${label}: ${v.id} (${v.impact}, ${v.n}) ${v.t}`);
  };
  for (const l of LOCALES) for (const [k, p] of Object.entries(TEMPLATES)) { await page.goto(`${BASE}/${l}/${p}`); await scan(`${l}/${k}`); }
  await page.goto(`${BASE}/en/oem/`);
  await page.click('[data-submit]');
  await scan('en/oem error state');
  await page.goto(`${BASE}/en/`);
  await page.evaluate(() => document.documentElement.classList.add('review'));
  await scan('en/home review notes on');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${BASE}/th/`);
  await page.click('.site-header [data-menu-open]');
  await scan('th/home drawer open');
  await ctx.close();
  assert(!found.length, found.join('\n'));
  return `${scans} scans, 0 critical/serious`;
});

/* ---------------- screenshot matrix (14.7) ---------------- */
if (!noShots) await check('screenshots: templates at 1440/768/390 in 3 locales; home and product at 1920/430/375/320; states', async () => {
  mkdirSync(SHOTS, { recursive: true });
  const ctx = await browsers.webkit.newContext(ctxOpts({ reducedMotion: 'reduce' }));
  const page = await ctx.newPage();
  let n = 0;
  const shot = async (name, full = true) => { await page.evaluate(() => document.querySelectorAll('img[loading=lazy]').forEach((i) => { i.loading = 'eager'; })); await page.waitForTimeout(150); await page.screenshot({ path: join(SHOTS, `${name}.png`), fullPage: full }); n++; };
  for (const w of [1440, 768, 390]) {
    await page.setViewportSize({ width: w, height: w > 800 ? 900 : 844 });
    for (const l of LOCALES) for (const [k, p] of Object.entries(TEMPLATES)) { await page.goto(`${BASE}/${l}/${p}`); await shot(`${k}-${l}-${w}`); }
  }
  for (const w of [1920, 430, 375, 320]) {
    await page.setViewportSize({ width: w, height: 900 });
    for (const [k, p] of [['home', ''], ['product', 'products/rice-stick-pad-thai/']]) { await page.goto(`${BASE}/th/${p}`); await shot(`${k}-th-${w}`); }
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${BASE}/th/`); await page.click('.site-header [data-menu-open]'); await page.waitForTimeout(300); await shot('state-drawer-th-390', false);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(`${BASE}/en/products/?format=zzz`); await shot('state-filter-empty-en-1440', false);
  await page.goto(`${BASE}/en/contact/`); await page.locator('[data-map]').scrollIntoViewIfNeeded(); await shot('state-map-before-consent-en-1440', false);
  await page.goto(`${BASE}/en/oem/#brief`); await page.click('[data-submit]'); await shot('state-form-errors-en-1440', false);
  await reset(); await setNext('fail', 1);
  await page.goto(`${BASE}/en/oem/#brief`); await fillOem(page); await page.waitForTimeout(1600); await page.click('[data-submit]');
  await page.waitForSelector('[data-form-status][data-tone="bad"]'); await page.locator('[data-form-status]').scrollIntoViewIfNeeded(); await shot('state-form-failure-en-1440', false);
  await reset(); await page.click('[data-form-status] button:has-text("Try again")'); await page.waitForSelector('[data-form-status][data-tone="ok"]'); await shot('state-form-success-en-1440', false);
  await page.goto(`${BASE}/en/`); await page.evaluate(() => { document.documentElement.classList.add('review'); }); await shot('state-review-notes-en-1440');
  await ctx.close();
  return `${n} screenshots → ${SHOTS}`;
});

for (const b of Object.values(browsers)) await b.close();
await close();
mkdirSync(join(ROOT, 'qa-output'), { recursive: true });
writeFileSync(join(ROOT, 'qa-output', 'e2e.json'), JSON.stringify({ at: new Date().toISOString(), results }, null, 2));
const failed = results.filter((r) => !r.ok).length;
console.log(`\n${results.length - failed}/${results.length} checks passed`);
process.exit(failed ? 1 : 0);
