/**
 * Screenshots of the PUBLIC preview build, labelled as such (Codex audit F15.4: QA screenshots of the private
 * build show a "Send" action and a test adapter that the public preview does not have).
 *   node tests/e2e/public-screens.mjs                 → the local public build (dist-pages/)
 *   node tests/e2e/public-screens.mjs --url=<live>    → a deployed preview
 * Writes ../documents/screenshots/public-preview-<date>/ with an INDEX.md naming the build mode and address.
 */
import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium, webkit } from 'playwright';
import { startServer } from '../../scripts/serve.ts';

const ROOT = resolve(fileURLToPath(new URL('../..', import.meta.url)));
const live = process.argv.find((a) => a.startsWith('--url='))?.split('=')[1];
let SITE, close = async () => {};
if (live) SITE = live.replace(/\/$/, '');
else { const s = await startServer({ dir: join(ROOT, 'dist-pages'), port: 0, quiet: true, dataDir: join(ROOT, '.local', 'pages') }); SITE = `${s.url}/pankao-thailand`; close = s.close; }
const date = new Date().toLocaleDateString('sv-SE', { timeZone: 'Asia/Bangkok' }); // the studio's date
const OUT = resolve(ROOT, `../documents/screenshots/public-preview-${date}`);
mkdirSync(OUT, { recursive: true });
const commit = execFileSync('git', ['rev-parse', '--short', 'HEAD'], { cwd: ROOT, encoding: 'utf8' }).trim();

const routes = ['', 'products/', 'products/rice-stick-pad-thai/', 'oem/', 'process/', 'quality/', 'about/', 'contact/'];
const rows = [];
for (const [engine, type] of [['webkit', webkit], ['chromium', chromium]]) {
  const b = await type.launch();
  for (const [label, vp] of [['desktop', { width: 1440, height: 900 }], ['phone', { width: 390, height: 844 }]]) {
    if (engine === 'chromium' && label === 'desktop') continue; // one engine per size keeps the set small
    const c = await b.newContext({ viewport: vp, reducedMotion: 'reduce' });
    await c.addInitScript(() => { try { sessionStorage.setItem('pk-noloader', '1'); } catch {} });
    const p = await c.newPage();
    for (const l of ['th', 'en', 'vi']) for (const r of routes) {
      await p.goto(`${SITE}/${l}/${r}`);
      await p.evaluate(() => Promise.all([...document.images].map((i) => { i.loading = 'eager'; return i.complete ? 0 : new Promise((res) => { i.onload = i.onerror = res; }); })));
      const name = `${engine}-${label}-${l}-${(r || 'home').replace(/\/$/, '').replace(/\//g, '_')}.png`;
      await p.screenshot({ path: join(OUT, name), fullPage: true });
      rows.push(`| ${name} | ${engine} | ${vp.width}×${vp.height} | /${l}/${r} |`);
    }
    await c.close();
  }
  await b.close();
}
await close();
writeFileSync(join(OUT, 'INDEX.md'), `# Public-preview screenshots (${date})

**Build mode: PUBLIC PREVIEW.** The same build GitHub Pages serves:
- \`noindex\` on every page, with the preview strip and the Sample and "From the current website" tags.
- No review notes.
- The forms send nothing. Their action reads "Prepare my brief" or "Prepare my message".

This is not the private review build. That build shows a test adapter and a "Send" action, and its screenshots live in \`build-*\` folders.

- **Address:** ${live ? SITE : `local public build (dist-pages/) served at ${SITE}`}
- **Source commit:** \`${commit}\`
- **Taken:** ${new Date().toISOString()}, with reduced motion and no opening animation.

| File | Engine | Viewport | Route |
|---|---|---|---|
${rows.join('\n')}
`);
console.log(`public-screens: ${rows.length} screenshots → ${OUT}`);
