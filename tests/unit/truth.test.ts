/** Truth model, identity guard, claims, certificates, media and locale rules (Part IV / Part V). */
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { canShow, copy, tx, t } from '../../src/build/context.ts';
import * as P from '../../src/build/pages.ts';
import { guardOutput, validateContent } from '../../src/build/validate.ts';
import { assets as ledger } from '../../src/content/assets.ts';
import { claims } from '../../src/content/claims.ts';
import { brandName, location } from '../../src/content/facts.ts';
import { productById } from '../../src/content/products.ts';
import { rejectedEntities } from '../../src/content/sources.ts';
import type { Certificate, Claim } from '../../src/content/types.ts';
import { ctx, fakeAssets, publicText } from './helpers.ts';

const A = fakeAssets();

test('GOV-05: unapproved facts show (marked) in preview and never in production', () => {
  assert.equal(canShow(location, ctx('preview')), true);
  assert.equal(canShow(location, ctx('production')), false);
  assert.equal(canShow({ ...location, ownerApproved: true, ownerApprovalRef: 'x' }, ctx('production')), true);
  assert.equal(canShow({ ...location, visibility: 'review' }, ctx('preview')), false);
  assert.equal(canShow({ ...location, status: 'conflicted' }, ctx('preview')), false);
  const marked = tx(ctx('preview'), 'home.h1')!.html;
  assert.match(marked, /class="fact"/);
  assert.equal(tx(ctx('production'), 'home.h1'), null);
});

test('LOC-01/02, AC-IA-03: every copy key exists in th, en and vi; a missing one fails validation', () => {
  assert.deepEqual(validateContent(), []);
  const saved = copy['home.h1']!.vi;
  copy['home.h1']!.vi = '';
  try {
    assert.ok(validateContent().some((e) => e.includes('home.h1') && e.includes('vi')));
  } finally {
    copy['home.h1']!.vi = saved;
  }
});

test('AC-ID-02 / GOV-02: rejected restaurant strings, unknown registrations and markers fail the guard', () => {
  const g = { mode: 'preview' as const, allowedMedia: new Set<string>() };
  const r = rejectedEntities[0]!;
  assert.ok(r.forbiddenStrings.includes('[removed]'));
  assert.ok(guardOutput('x.html', '<p>Reg [removed]</p>', g).length > 0);
  assert.ok(guardOutput('x.html', '<p>[removed]</p>', g).length > 0);
  assert.ok(guardOutput('x.html', '<p>[removed] CO., LTD.</p>', g).length > 0);
  assert.ok(guardOutput('x.html', '<script type="application/ld+json">{"@type":"Restaurant"}</script>', g).length > 0);
  assert.ok(guardOutput('x.html', '<p>TODO check</p>', g).length > 0);
  assert.ok(guardOutput('x.html', '<p>[VERIFY WITH PANKAO]</p>', g).length > 0);
  // The manufacturer's own brand stem is not forbidden.
  assert.deepEqual(guardOutput('x.html', '<p>ปั้นข้าวไทย · สหปั้นข้าว · Pankao</p>', g), []);
});

test('AC-ID-01: only the manufacturer registration may render, and only after owner approval in production', () => {
  assert.deepEqual(guardOutput('x.html', '0125550039493', { mode: 'preview', allowedMedia: new Set() }), []);
  assert.ok(guardOutput('x.html', '0125550039493', { mode: 'production', allowedMedia: new Set() }).length > 0);
  assert.ok(guardOutput('x.html', '0999999999999', { mode: 'preview', allowedMedia: new Set() }).length > 0);
});

test('production guard rejects preview markup and unapproved assets', () => {
  const g = { mode: 'production' as const, allowedMedia: new Set<string>() };
  assert.ok(guardOutput('a.html', '<span class="fact">x</span>', g).length > 0);
  assert.ok(guardOutput('a.html', '<aside class="review-note"></aside>', g).length > 0);
  assert.ok(guardOutput('a.html', '<img data-asset="legacy.logo">', g).length > 0);
});

test('AC-EV-01 / QLT-01/02: an expired certificate never shows as current; a current one shows every field', () => {
  const base: Certificate = {
    id: 'fx', standard: 'BRCGS Food Safety Issue 9', scope: { th: 'เส้นหมี่อบแห้ง', en: 'Dried rice vermicelli', vi: 'Bún gạo khô' },
    operator: 'Fixture Co.', facility: 'Fixture site', issuer: 'Fixture CB', number: 'FX-123', issuedOn: '2026-01-01', expiresOn: '2027-01-01',
    status: 'current', markUseApproved: false, sourceIds: ['O2'], ownerApproved: true, group: 'food-safety', verificationUrl: 'https://example.org/verify',
  };
  const ok = P.certCard(ctx('production'), base, '2026-11-19')!.html;
  for (const s of ['BRCGS Food Safety Issue 9', 'Dried rice vermicelli', 'Fixture Co.', 'Fixture CB', 'FX-123', 'Current']) assert.ok(ok.includes(s), s);
  assert.equal(P.certCard(ctx('production'), { ...base, expiresOn: '2026-11-18' }, '2026-11-19'), null);
  assert.equal(P.certCard(ctx('production'), { ...base, status: 'superseded' }, '2026-11-19'), null);
  assert.equal(P.certCard(ctx('production'), { ...base, ownerApproved: false }, '2026-11-19'), null);
});

test('QLT-04 / AC-EV-02: a product claim stays on its own product and never becomes a company claim', () => {
  const fixture: Claim = {
    id: 'c.fx.gf', level: 'product', productId: 'rice-vermicelli', kind: 'dietary', text: { th: 'ไม่มีกลูเตน (ทดสอบ)', en: 'Gluten-free (fixture)', vi: 'Không gluten (thử)' },
    status: 'owner-confirmed', sourceIds: ['O2'], certificateIds: [], ownerApproved: true, evidenceNeeded: '',
  };
  claims.push(fixture);
  try {
    const own = P.productDetail(ctx('production', 'en', 'products/rice-vermicelli/'), A, productById.get('rice-vermicelli')!).html;
    const other = P.productDetail(ctx('production', 'en', 'products/rice-stick-pad-thai/'), A, productById.get('rice-stick-pad-thai')!).html;
    assert.ok(own.includes('Gluten-free (fixture)'));
    assert.ok(!other.includes('Gluten-free (fixture)'));
    const quality = P.qualityPage(ctx('production', 'en', 'quality/'), A).html;
    assert.ok(!publicText(quality).includes('Gluten-free (fixture)'));
  } finally {
    claims.pop();
  }
});

test('legacy claims (gluten-free, organic, no MSG…) never reach public text', () => {
  for (const mode of ['preview', 'production'] as const) {
    for (const p of [...productById.values()]) {
      const html = P.productDetail(ctx(mode, 'en', `products/${p.slug}/`), A, p).html;
      const pub = publicText(html);
      for (const bad of ['100% natural', 'Organic', 'No MSG', 'No cholesterol', 'trans fat', 'more vitamins']) assert.ok(!pub.toLowerCase().includes(bad.toLowerCase()), `${p.id} ${mode}: ${bad}`);
    }
  }
});

test('PRD-07 / AC-PRD-04: unknown SKU fields say "Not yet published", never zero, N/A or a borrowed value', () => {
  const html = P.productDetail(ctx('preview', 'en', 'products/rice-flake-guay-jub/'), A, productById.get('rice-flake-guay-jub')!).html;
  const spec = html.slice(html.indexOf('<dl class="spec">'), html.indexOf('</dl>'));
  assert.ok((spec.match(/Not yet published/g) ?? []).length >= 9);
  assert.doesNotMatch(spec, />\s*(0|N\/A|No|None|-)\s*</);
});

test('AC-EV-03: About never states 30 years, eight decades, a founder or "first in Thailand" publicly', () => {
  for (const locale of ['th', 'en', 'vi'] as const) {
    const pub = publicText(P.aboutPage(ctx('preview', locale, 'about/'), A).html);
    for (const bad of ['30 ปี', 'more than 30', '30 years', 'กว่า 8 ทศวรรษ', 'eight decades', '80 years', 'first rice', 'โรงงานแห่งแรก', 'hơn 30 năm', 'founder']) assert.ok(!pub.toLowerCase().includes(bad.toLowerCase()), `${locale}: ${bad}`);
  }
});

test('AC-ID-03: the working brand label is marked in preview and blocks production', () => {
  assert.equal(brandName.ownerApproved, false);
  const html = P.home(ctx('preview', 'en'), A).html;
  assert.match(html, /data-fact="brand.name"/);
});

test('MED-01/02/03, AC-MED-02/03: media truth rules are enforced by validation', () => {
  const a = ledger[1]!;
  const saved = { ...a };
  try {
    a.maxDisplayWidth = a.width + 100;
    assert.ok(validateContent().some((e) => e.includes(a.id) && e.includes('wider')));
    a.maxDisplayWidth = saved.maxDisplayWidth;
    a.rightsBasis = 'generated';
    a.actualPankaoOrGeneric = 'actual-pankao';
    assert.ok(validateContent().some((e) => e.includes('media-truth')));
    a.rightsBasis = saved.rightsBasis;
    a.productionApproved = true;
    assert.ok(validateContent().some((e) => e.includes('permission reference')));
  } finally {
    Object.assign(a, saved);
  }
  // No image renders in production while none is approved.
  const html = P.home(ctx('production', 'en'), A).html;
  assert.doesNotMatch(html, /data-asset=/);
});

test('PRD-08 / AC-PRD-03: an approved specification shows title, language, version, date, type and size before download', async () => {
  const { documents } = await import('../../src/content/claims.ts');
  documents.push({
    id: 'doc.fx', title: { th: 'ข้อมูลจำเพาะ (ทดสอบ)', en: 'Specification sheet (fixture)', vi: 'Bảng thông số (thử)' }, locale: 'en', version: '2.1', date: '2026-10-01',
    fileType: 'PDF', bytes: 182_000, file: 'fixture.pdf', scope: { th: 'เส้นหมี่', en: 'Rice vermicelli 400 g', vi: 'Bún gạo' }, productIds: ['rice-vermicelli'], ownerApproved: true, status: 'current',
  });
  try {
    const html = P.productDetail(ctx('production', 'en', 'products/rice-vermicelli/'), A, productById.get('rice-vermicelli')!).html;
    for (const s of ['Specification sheet (fixture)', 'Rice vermicelli 400 g', 'English', 'v2.1', '1 October 2026', 'PDF, 178 KB', 'href="/documents/fixture.pdf" download']) assert.ok(html.includes(s), s);
    const other = P.productDetail(ctx('production', 'en', 'products/rice-stick-pad-thai/'), A, productById.get('rice-stick-pad-thai')!).html;
    assert.ok(!other.includes('fixture.pdf'), 'document stays on its product');
  } finally {
    documents.pop();
  }
});

test('heading copy and form strings exist for every locale', () => {
  for (const l of ['th', 'en', 'vi'] as const) {
    assert.ok(t({ locale: l }, 'cta.oem').length > 3);
    assert.ok(t({ locale: l }, 'state.fail.body').length > 10);
  }
});
