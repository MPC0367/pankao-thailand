/** Writes qa-output/logo-preview.html: the mark large on cream, for checking the lettering's layout by eye. */
import { mkdirSync, writeFileSync } from 'node:fs';
import { pkMark } from '../../src/build/mark.ts';

mkdirSync('qa-output', { recursive: true });
writeFileSync('qa-output/logo-preview.html', `<!doctype html><meta charset="utf-8"><body style="margin:0;background:#f8f2e6;display:grid;place-items:center;min-height:100vh">
<style>.m{width:900px;height:auto}.mk-stem{fill:none;stroke-width:1.4;stroke-linecap:round}.mk-grain{stroke:none}.mk-l,.mk-m{stroke:none}</style>
${pkMark('pv', 'm').html}<div style="width:120px">${pkMark('sm', 'm').html.replace('class="m"', 'class="s" style="width:120px"')}</div></body>`);
console.log('qa-output/logo-preview.html');
