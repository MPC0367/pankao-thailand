/** WCAG contrast of every token pair the design uses (14.5: "contrast measurement of every token pair"). */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

const css = readFileSync(new URL('../../src/styles/site.css', import.meta.url), 'utf8');
const root = css.slice(css.indexOf(':root {'), css.indexOf('}', css.indexOf(':root {')));
const token = (name: string): string => {
  const m = root.match(new RegExp(`--${name}:\\s*(#[0-9a-fA-F]{6})`));
  if (!m) throw new Error(`token ${name} not found`);
  return m[1]!;
};
const lum = (hex: string) => {
  const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * c[0]! + 0.7152 * c[1]! + 0.0722 * c[2]!;
};
export const ratio = (a: string, b: string) => {
  const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
  return (x! + 0.05) / (y! + 0.05);
};

const TEXT: [string, string][] = [
  ['ink', 'rice'], ['ink', 'rice-2'], ['ink', 'rice-3'], ['ink-2', 'rice'], ['ink-2', 'rice-2'], ['ink-2', 'rice-3'],
  ['leaf', 'rice'], ['on-deep', 'leaf-deep'], ['on-deep-2', 'leaf-deep'], ['alert', 'rice'], ['alert', 'alert-bg'],
  ['ink', 'ok-bg'], ['pk', 'rice'],
];
const LITERAL: [string, string][] = [
  ['#ffffff', token('pk')], ['#ffffff', token('pk-press')], [token('leaf-deep'), token('on-deep')],
  ['#e9dfcc', token('ink')], ['#cbbfa6', token('ink')], ['#f4ecdb', token('ink')], ['#ffffff', token('alert')],
  [token('ink'), '#fff6df'], ['#7a5a1e', '#fff6df'], [token('rice'), token('ink')], ['#f0d79b', token('leaf-deep')],
];
const UI: [string, string][] = [['husk-deep', 'rice'], ['husk-deep', 'rice-2'], ['focus', 'rice'], ['ink', 'rice']];

test('text pairs meet 4.5:1', () => {
  for (const [f, b] of TEXT) assert.ok(ratio(token(f), token(b)) >= 4.5, `${f} on ${b}: ${ratio(token(f), token(b)).toFixed(2)}`);
  for (const [f, b] of LITERAL) assert.ok(ratio(f, b) >= 4.5, `${f} on ${b}: ${ratio(f, b).toFixed(2)}`);
});

test('control borders and focus meet 3:1', () => {
  for (const [f, b] of UI) assert.ok(ratio(token(f), token(b)) >= 3, `${f} on ${b}: ${ratio(token(f), token(b)).toFixed(2)}`);
});
