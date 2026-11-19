/**
 * Lab performance (14.6): Home, Products, a product, OEM and Contact, Thai locale, on a
 * throttled phone profile (Chromium, 390×844, 4× CPU slowdown, 1.6 Mbps down / 750 kbps up,
 * 150 ms RTT). Three cold-cache runs + one warm run per page; median and range reported.
 * Measures LCP, CLS, long tasks, transfer by type, JS bytes and third-party requests.
 *   node tests/e2e/perf.mjs  → qa-output/perf.json
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import { startServer } from '../../scripts/serve.ts';

const ROOT = resolve(fileURLToPath(new URL('../..', import.meta.url)));
const { url: BASE, close } = await startServer({ dir: join(ROOT, process.argv.includes('--production') ? 'dist-production' : 'dist'), port: 0, quiet: true, dataDir: join(ROOT, '.local', 'perf') });
const PAGES = { home: '/th/', products: '/th/products/', product: '/th/products/rice-stick-pad-thai/', oem: '/th/oem/', contact: '/th/contact/' };
const browser = await chromium.launch();

async function run(path, warmCtx) {
  const ctx = warmCtx ?? (await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true }));
  const page = await ctx.newPage();
  const cdp = await ctx.newCDPSession(page);
  await cdp.send('Network.enable');
  await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 150, downloadThroughput: (1.6 * 1024 * 1024) / 8, uploadThroughput: (750 * 1024) / 8 });
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
  const bytes = { document: 0, stylesheet: 0, script: 0, font: 0, image: 0, other: 0 };
  const third = [];
  cdp.on('Network.loadingFinished', () => {});
  const typeById = new Map();
  cdp.on('Network.responseReceived', (e) => { typeById.set(e.requestId, e.type); if (!e.response.url.startsWith(BASE) && !/^(data|blob):/.test(e.response.url)) third.push(e.response.url); });
  cdp.on('Network.loadingFinished', (e) => {
    const t = (typeById.get(e.requestId) ?? 'Other').toLowerCase();
    const k = t in bytes ? t : 'other';
    bytes[k] += e.encodedDataLength;
  });
  await page.addInitScript(() => {
    window.__lcp = 0; window.__cls = 0; window.__long = 0;
    new PerformanceObserver((l) => { for (const e of l.getEntries()) window.__lcp = e.startTime; }).observe({ type: 'largest-contentful-paint', buffered: true });
    new PerformanceObserver((l) => { for (const e of l.getEntries()) if (!e.hadRecentInput) window.__cls += e.value; }).observe({ type: 'layout-shift', buffered: true });
    new PerformanceObserver((l) => { for (const e of l.getEntries()) window.__long += Math.max(0, e.duration - 50); }).observe({ type: 'longtask', buffered: true });
  });
  await page.goto(BASE + path, { waitUntil: 'load' });
  await page.waitForTimeout(1500);
  // Interaction: open the menu and measure input-to-paint
  const inp = await page.evaluate(async () => {
    const b = document.querySelector('.site-header [data-menu-open]');
    if (!b) return null;
    const t0 = performance.now();
    b.click();
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    const t = performance.now() - t0;
    document.querySelector('[data-drawer]')?.close();
    return t;
  });
  const m = await page.evaluate(() => ({ lcp: window.__lcp, cls: window.__cls, tbt: window.__long, lcpEl: performance.getEntriesByType('largest-contentful-paint').at(-1)?.element?.tagName ?? '' }));
  await page.close();
  if (!warmCtx) await ctx.close();
  return { ...m, input: inp, bytes, total: Object.values(bytes).reduce((a, b) => a + b, 0), third };
}

const med = (a) => { const s = [...a].sort((x, y) => x - y); return s[Math.floor(s.length / 2)]; };
const report = { profile: 'Chromium, 390×844 @3x, CPU 4×, 1.6 Mbps/750 kbps, 150 ms RTT, local server (no CDN); 3 cold runs + 1 warm', pages: {} };
for (const [name, path] of Object.entries(PAGES)) {
  const cold = [];
  for (let i = 0; i < 3; i++) cold.push(await run(path));
  const warmCtx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true });
  await run(path, warmCtx);
  const warm = await run(path, warmCtx);
  await warmCtx.close();
  const r = {
    lcpMs: { median: Math.round(med(cold.map((c) => c.lcp))), min: Math.round(Math.min(...cold.map((c) => c.lcp))), max: Math.round(Math.max(...cold.map((c) => c.lcp))), element: cold[0].lcpEl },
    cls: { median: +med(cold.map((c) => c.cls)).toFixed(4), max: +Math.max(...cold.map((c) => c.cls)).toFixed(4) },
    blockingMs: Math.round(med(cold.map((c) => c.tbt))),
    menuInputToPaintMs: Math.round(med(cold.map((c) => c.input ?? 0))),
    transferKB: Object.fromEntries(Object.entries(cold[0].bytes).map(([k, v]) => [k, +(v / 1024).toFixed(1)])),
    totalKB: +(cold[0].total / 1024).toFixed(1),
    warmLcpMs: Math.round(warm.lcp),
    warmTransferKB: +(warm.total / 1024).toFixed(1),
    thirdParty: [...new Set(cold.flatMap((c) => c.third))],
  };
  report.pages[name] = r;
  console.log(`${name.padEnd(9)} LCP ${r.lcpMs.median} ms (${r.lcpMs.min}–${r.lcpMs.max}, ${r.lcpMs.element}) · CLS ${r.cls.median} · blocking ${r.blockingMs} ms · menu ${r.menuInputToPaintMs} ms · ${r.totalKB} KB (JS ${r.transferKB.script} KB) · warm LCP ${r.warmLcpMs} ms / ${r.warmTransferKB} KB · 3rd-party ${r.thirdParty.length}`);
}
await browser.close();
await close();
mkdirSync(join(ROOT, 'qa-output'), { recursive: true });
writeFileSync(join(ROOT, 'qa-output', 'perf.json'), JSON.stringify(report, null, 2));
