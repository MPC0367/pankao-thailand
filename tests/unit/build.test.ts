/** Whole-build checks on real output: routes, head, credit, redirects, preview vs production. */
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { before, test } from 'node:test';
import { build, legacyRedirects, type BuildResult } from '../../src/build/build.ts';
import { rejectedEntities } from '../../src/content/sources.ts';

let pre: BuildResult;
let prod: BuildResult;
const read = (r: BuildResult, p: string) => readFileSync(join(r.outDir, p), 'utf8');

before(() => {
  pre = build('preview', { outDir: mkdtempSync(join(tmpdir(), 'pk-pre-')), buildDate: '2026-11-19', quiet: true });
  prod = build('production', { outDir: mkdtempSync(join(tmpdir(), 'pk-prod-')), buildDate: '2026-11-19', quiet: true });
});

test('IA-01: every locale has Home, Products, OEM, Process, Quality, About, Contact (+ privacy, accessibility, 404)', () => {
  for (const l of ['th', 'en', 'vi']) {
    for (const p of ['', 'products/', 'oem/', 'process/', 'quality/', 'about/', 'contact/', 'privacy/', 'accessibility/']) assert.ok(existsSync(join(pre.outDir, l, p, 'index.html')), `${l}/${p}`);
    assert.ok(existsSync(join(pre.outDir, l, '404.html')));
    for (const s of ['mr-noodles', 'rice-vermicelli', 'rice-stick-pad-thai', 'rice-flake-guay-jub', 'brown-rice-noodles']) assert.ok(existsSync(join(pre.outDir, l, 'products', s, 'index.html')), `${l} ${s}`);
  }
  assert.equal(pre.pages.length, 42);
});

test('TEC-01 / LOC-05: lang, one h1, canonical, reciprocal hreflang + x-default on every page', () => {
  for (const page of pre.pages) {
    const html = read(pre, `${page.slice(1)}index.html`);
    const l = page.split('/')[1]!;
    assert.match(html, new RegExp(`<html lang="${l}"`), page);
    assert.equal((html.match(/<h1[\s>]/g) ?? []).length, 1, `${page}: one h1`);
    assert.ok(html.includes(`<link rel="canonical" href="https://www.pankaothai.com${page}">`), `${page}: canonical`);
    const rest = page.replace(/^\/(th|en|vi)\//, '');
    for (const a of ['th', 'en', 'vi']) assert.ok(html.includes(`hreflang="${a}" href="https://www.pankaothai.com/${a}/${rest}"`), `${page}: hreflang ${a}`);
    assert.ok(html.includes(`hreflang="x-default" href="https://www.pankaothai.com/th/${rest}"`), `${page}: x-default`);
    assert.match(html, /<title>[^<]{5,}<\/title>/);
    assert.match(html, /<meta name="description" content="[^"]{20,}">/);
  }
});

test('REL-06 / IA-07: the O2 credit is the last link on every page and opens in a new tab with its accessible name', () => {
  for (const r of [pre, prod]) {
    for (const page of r.pages) {
      const html = read(r, `${page.slice(1)}index.html`);
      const links = [...html.matchAll(/<a\s[^>]*>/g)].map((m) => m[0]);
      const last = links[links.length - 1]!;
      assert.match(last, /class="o2-credit"/, page);
      assert.match(last, /aria-label="Website by O2 Design Studio \(opens in a new tab\)"/);
      assert.match(last, /lang="en"/);
      assert.match(last, /rel="noopener"/);
    }
  }
});

test('IA-02/03 / AC-IA-01: 30 legacy URLs map once, locale-correctly, to modern routes', () => {
  const map = legacyRedirects('preview');
  assert.equal(map.length, 30);
  assert.equal(new Set(map.map((m) => m.from)).size, 30);
  const get = (f: string) => map.find((m) => m.from === f)!.to;
  assert.equal(get('/index.html'), '/th/');
  assert.equal(get('/history_en.html'), '/en/about/');
  assert.equal(get('/rice_stick_vn.html'), '/vi/products/rice-stick-pad-thai/');
  assert.equal(get('/mrnoodles.html'), '/th/products/mr-noodles/');
  assert.equal(get('/contact_vn.html'), '/vi/contact/');
  for (const m of map) {
    const loc = m.from.includes('_en.') ? 'en' : m.from.includes('_vn.') ? 'vi' : 'th';
    assert.ok(m.to.startsWith(`/${loc}/`), `${m.from} → ${m.to}`);
  }
  assert.equal(read(pre, '_redirects').trim().split('\n').length, 30);
  // Production: a product page that does not exist yet redirects to the index, never to a 404.
  for (const m of legacyRedirects('production')) assert.ok(!m.to.includes('/products/rice'), m.to);
});

test('preview is private: noindex everywhere, robots disallow, review layer present, no sitemap', () => {
  assert.equal(read(pre, 'robots.txt'), 'User-agent: *\nDisallow: /\n');
  assert.ok(!existsSync(join(pre.outDir, 'sitemap.xml')));
  assert.match(read(pre, '_headers'), /X-Robots-Tag: noindex, nofollow/);
  for (const page of pre.pages) assert.match(read(pre, `${page.slice(1)}index.html`), /<meta name="robots" content="noindex, nofollow">/);
  assert.match(read(pre, 'en/index.html'), /class="preview-bar"/);
});

test('production rehearsal: index, follow; sitemap of canonical pages only; no preview markup; release blocked', () => {
  assert.match(read(prod, 'robots.txt'), /Sitemap: https:\/\/www\.pankaothai\.com\/sitemap\.xml/);
  const sm = read(prod, 'sitemap.xml');
  assert.equal((sm.match(/<loc>/g) ?? []).length, prod.pages.length);
  assert.doesNotMatch(sm, /404|preview/);
  for (const s of rejectedEntities[0]!.forbiddenStrings) assert.ok(!sm.includes(s));
  for (const page of prod.pages) {
    const html = read(prod, `${page.slice(1)}index.html`);
    assert.match(html, /<meta name="robots" content="index, follow">/, page);
    assert.doesNotMatch(html, /class="fact"|review-note|preview-bar|data-asset=/, page);
  }
  const manifest = JSON.parse(read(prod, 'release-manifest.json'));
  assert.match(manifest.status, /^BLOCKED/);
  assert.ok(manifest.blockers.some((b: string) => b.startsWith('D01')));
});

test('TEC-02: structured data parses, has no Restaurant type and no ratings, offers or nutrition', () => {
  for (const page of pre.pages) {
    const html = read(pre, `${page.slice(1)}index.html`);
    for (const m of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
      const o = JSON.parse(m[1]!);
      const s = JSON.stringify(o);
      assert.doesNotMatch(s, /"Restaurant"|aggregateRating|"offers"|nutrition|"review"/, page);
    }
  }
});

test('TEC-09 / AC-CT-02: no third-party URL is requested by markup before a click (map iframe absent)', () => {
  for (const page of pre.pages) {
    const html = read(pre, `${page.slice(1)}index.html`);
    assert.doesNotMatch(html, /<iframe|<script[^>]+src="https?:|<link[^>]+href="https?:\/\/(?!www\.pankaothai\.com)[^"]+"[^>]*rel="stylesheet"/, page);
  }
});

test('security headers are declared for every path', () => {
  const h = read(pre, '_headers');
  for (const s of ["Content-Security-Policy: default-src 'self'; script-src 'self'", 'X-Content-Type-Options: nosniff', 'Referrer-Policy: strict-origin-when-cross-origin', 'Permissions-Policy:', "frame-ancestors 'none'"]) assert.ok(h.includes(s), s);
});
