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
  ['ink', 'cream'], ['ink', 'cream-2'], ['ink', 'cream-3'], ['ink', 'white'], ['ink-2', 'cream'], ['ink-2', 'cream-2'], ['ink-2', 'cream-3'],
  ['gold-deep', 'cream'], ['gold-deep', 'cream-2'], ['gold-deep', 'white'], ['on-accent', 'accent'], ['on-accent', 'accent-press'],
  ['on-deep', 'deep'], ['on-deep', 'deep-2'], ['on-deep-2', 'deep'], ['on-deep-2', 'deep-2'], ['gold-on-deep', 'deep'], ['gold-on-deep', 'deep-2'],
  ['alert', 'cream'], ['alert', 'alert-bg'], ['ink', 'ok-bg'], ['accent', 'cream'],
];
const LITERAL: [string, string][] = [
  ['#e9dfcc', token('deep')], ['#cbbfa6', token('deep')], ['#f4ecdb', token('deep')], ['#ffffff', token('alert')],
  [token('ink'), '#fff6df'], ['#7a5a1e', '#fff6df'], [token('cream'), token('ink')], ['#f0d79b', token('deep')], ['#3a2414', '#f7efdf'],
  // Header text over its glass: worst case is the glass's most transparent tint over the darkest strip it can cross (the brown footer is never under it).
  [token('ink'), '#e7d9bf'], [token('ink-2'), '#e7d9bf'],
];
const UI: [string, string][] = [['husk-deep', 'cream'], ['husk-deep', 'white'], ['focus', 'cream'], ['ink', 'cream'], ['gold-deep', 'cream']];

test('text pairs meet 4.5:1', () => {
  for (const [f, b] of TEXT) assert.ok(ratio(token(f), token(b)) >= 4.5, `${f} on ${b}: ${ratio(token(f), token(b)).toFixed(2)}`);
  for (const [f, b] of LITERAL) assert.ok(ratio(f, b) >= 4.5, `${f} on ${b}: ${ratio(f, b).toFixed(2)}`);
});

test('control borders and focus meet 3:1', () => {
  for (const [f, b] of UI) assert.ok(ratio(token(f), token(b)) >= 3, `${f} on ${b}: ${ratio(token(f), token(b)).toFixed(2)}`);
});
