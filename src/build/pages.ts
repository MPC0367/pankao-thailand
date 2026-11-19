/** Page templates. Every business fact arrives through context.ts (fact/tx), never as a literal. */
import { certificates, claims, documents, observedMarks, QUALITY_REGISTER_REVIEWED } from '../content/claims.ts';
import { decisions } from '../content/decisions.ts';
import {
  address, brandName, diprom2024, email, heritageCandidates, hours, legalFacts, legalNameEn, legalNameTh, location, mapQuery,
  marketsRegions, phone, processSteps, registration,
} from '../content/facts.ts';
import { formatProducts, productById, products, productSlots } from '../content/products.ts';
import { sourceById } from '../content/sources.ts';
import type { Certificate, Fact, Locale, Product } from '../content/types.ts';
import type { Assets } from './assets-out.ts';
import { canShow, fact, formatDate, href, loc, marked, phrases, productPath, ROUTES, t, tx, txPlain, val, type Ctx } from './context.ts';
import { enquiryForm } from './forms.ts';
import { esc, html, join, raw, type Raw } from './html.ts';
import { ARROW, contactLines, document, PIN, type PageMeta } from './layout.ts';
import { assetImg, credit, packDish, strandPlate } from './media.ts';
import { breadcrumbs, organization, productLd } from './seo.ts';
import { BASE, PUBLIC_PREVIEW, SHOW_SAMPLES, SHOW_SAMPLE_TAGS } from '../content/presentation.ts';
import { sampleCertificates, sampleDocuments, sampleHours, sampleOemTerms, sampleTimeline } from '../content/samples.ts';

export type Built = { path: string; html: string; status?: 404 };

/* ---------- small components ---------- */

/** Sample values (preview only): a small tag and a one-line note, both behind SHOW_SAMPLE_TAGS. */
const samplesOn = (ctx: Ctx) => ctx.mode === 'preview' && SHOW_SAMPLES;
const sampleTag = (ctx: Ctx): Raw => (samplesOn(ctx) && SHOW_SAMPLE_TAGS ? html`<span class="sample-tag">${t(ctx, 'sample.tag')}</span>` : raw(''));
const sampleNote = (ctx: Ctx, key: string): Raw => (samplesOn(ctx) && SHOW_SAMPLE_TAGS ? html`<p class="sample-note">${sampleTag(ctx)}<span>${t(ctx, key)}</span></p>` : raw(''));

/** Heading copy: Thai breaks only between phrases. */
const hd = (ctx: Ctx, key: string): Raw | string => (ctx.locale === 'th' ? raw(phrases(esc(t(ctx, key)))) : t(ctx, key));

const linkArrow = (url: string, label: string, extra = '') => html`<a class="link-arrow" href="${url}"${raw(extra)}><span>${label}</span>${ARROW}</a>`;

function reviewNote(ctx: Ctx, title: string, items: (string | Raw)[]): Raw {
  if (ctx.mode !== 'preview' || PUBLIC_PREVIEW) return raw('');
  return html`<aside class="review-note" lang="en" aria-label="O2 review note"><strong>Review note — ${title}</strong>${items.length ? html`<ul>${items.map((i) => html`<li>${i}</li>`)}</ul>` : ''}</aside>`;
}

function factNote(f: Fact<unknown>): string {
  const src = f.sourceIds.map((id) => sourceById.get(id)?.title.split(' - ')[0] ?? id).join('; ');
  return `${f.id}: ${f.status}${f.ownerApproved ? ', owner-approved' : ', not owner-approved'}. Sources: ${src}.${f.note ? ` ${f.note}` : ''}`;
}

function sectionHead(eyebrow: string | Raw | null, h: Raw | string | null, lede: Raw | string | null, level: 'h1' | 'h2' = 'h2'): Raw {
  return html`<div class="chapter-head">
    <div>${eyebrow ? html`<p class="eyebrow">${eyebrow}</p>` : ''}${h ? (level === 'h1' ? html`<h1>${h}</h1>` : html`<h2>${h}</h2>`) : ''}</div>
    ${lede ? html`<p class="lede">${lede}</p>` : html`<span></span>`}
  </div>`;
}

function crumbs(ctx: Ctx, items: { label: string | Raw; path?: string }[]): Raw {
  return html`<nav class="crumbs wrap" aria-label="${t(ctx, 'nav.breadcrumb')}"><ol>${items.map((it) =>
    it.path !== undefined ? html`<li><a href="${href(ctx.locale, it.path)}">${it.label}</a></li>` : html`<li><span aria-current="page">${it.label}</span></li>`,
  )}</ol></nav>`;
}

function namesForSearch(p: Product): string {
  const n = p.name.value as Record<Locale, string>;
  return [n.th, n.en, n.vi, ...p.altNames.th, ...p.altNames.en, ...p.altNames.vi].join(' | ').toLowerCase();
}

function formatCard(ctx: Ctx, assets: Assets, p: Product, idSuffix: string, level: 'h2' | 'h3' = 'h3'): Raw {
  const name = fact(ctx, p.name)!;
  const plain = String(val(p.name, ctx.locale));
  const alt = loc(p.altNames, ctx.locale);
  const summary = fact(ctx, p.summary);
  const heading = level === 'h2' ? html`<h2 class="h3"><a href="${href(ctx.locale, productPath(p.slug))}">${name}</a></h2>` : html`<h3><a href="${href(ctx.locale, productPath(p.slug))}">${name}</a></h3>`;
  return html`<article class="format-card tone-${p.tone} arrive" id="${idSuffix}-${p.id}" data-product data-format="${p.format}" data-names="${namesForSearch(p)}">
    ${packDish(ctx, assets, p, plain, idSuffix)}
    ${heading}
    ${alt.length ? html`<p class="format-card__alt">${alt.join(' · ')}</p>` : ''}
    ${summary ? html`<p class="format-card__meta">${summary}</p>` : ''}
  </article>`;
}

function ctaBand(ctx: Ctx, h: string | Raw, body: Raw | string | null): Raw {
  return html`<section class="section band" aria-labelledby="cta-band-h">
    <div class="wrap grid">
      <div class="cta-band__text">
        <h2 id="cta-band-h" class="h3">${h}</h2>
        ${body ? html`<p class="lede">${body}</p>` : ''}
      </div>
      <div class="btn-row cta-band__actions">
        <a class="btn btn--primary" href="${href(ctx.locale, ROUTES.oem)}#brief">${t(ctx, 'cta.oem')}</a>
        <a class="btn btn--line" href="${href(ctx.locale, ROUTES.contact)}">${t(ctx, 'cta.contact')}</a>
      </div>
    </div>
  </section>`;
}

function dipromQuote(ctx: Ctx): Raw {
  if (!canShow(diprom2024, ctx)) return raw('');
  const src = sourceById.get('S03')!;
  return html`<blockquote class="evidence-quote">
    <p>${fact(ctx, diprom2024)}</p>
    <footer>${t(ctx, 'home.ways.proof')} · <a href="${src.url}" rel="noopener" target="_blank">ddi.dip.go.th <span class="sr-only">${t(ctx, 'contact.newTab')}</span></a></footer>
  </blockquote>`;
}

function page(ctx: Ctx, assets: Assets, meta: PageMeta, main: Raw): Built {
  return { path: `${ctx.locale}/${meta.path}`, html: document(ctx, assets, meta, main), status: meta.status };
}

function meta(ctx: Ctx, key: string, path: string, extra: Partial<PageMeta> = {}): PageMeta {
  const fallback: Record<string, string> = { home: 'cta.products', products: 'products.h1', oem: 'oem.eyebrow', process: 'process.h1', quality: 'quality.h1', about: 'about.eyebrow', contact: 'contact.h1', privacy: 'privacy.h1', a11y: 'a11y.h1' };
  const title = txPlain(ctx, `${key}.meta.title`) ?? t(ctx, fallback[key] ?? 'nav.home');
  const description = txPlain(ctx, `${key}.meta.description`) ?? title;
  return { title, description, path, ...extra };
}

/* ---------- home ---------- */

function homeQuality(ctx: Ctx): Raw {
  const shown = [...certificates, ...sampleCertificates].filter((c) => certCard(ctx, c, ctx.buildDate));
  if (!shown.length) return raw('');
  return html`<section class="section quality-band" aria-labelledby="hq-h"><div class="wrap">
    ${sectionHead(t(ctx, 'home.quality.eyebrow'), html`<span id="hq-h">${hd(ctx, 'home.quality.h2')}</span>`, t(ctx, 'home.quality.lede'))}
    <ul class="standards" role="list">${shown.map((c) => html`<li class="arrive"><span class="standards__name">${c.standard}</span>${c.status === 'sample' ? sampleTag(ctx) : ''}</li>`)}</ul>
    <p class="section-link">${linkArrow(href(ctx.locale, ROUTES.quality), t(ctx, 'cta.quality'))}</p>
  </div></section>`;
}

function homeHeritage(ctx: Ctx): Raw {
  const first = sampleTimeline.find((f) => canShow(f, ctx));
  if (!first) return raw('');
  const v = val(first, ctx.locale) as { what: Record<Locale, string> };
  return html`<section class="section section--pause heritage" aria-labelledby="hh-h"><div class="wrap">
    <p class="eyebrow">${t(ctx, 'home.heritage.eyebrow')} ${sampleTag(ctx)}</p>
    <p class="heritage__line display" id="hh-h">${marked(v.what[ctx.locale], [first], ctx)}</p>
    ${linkArrow(href(ctx.locale, ROUTES.about), t(ctx, 'home.heritage.cta'))}
  </div></section>`;
}

export function home(ctx: Ctx, assets: Assets): Built {
  const h1 = tx(ctx, 'home.h1', {}, { phrases: true }) ?? html`${t(ctx, 'nav.products')}`;
  const heroImg = assetImg(ctx, assets, 'legacy.hero.pack', { eager: true, extra: { fetchpriority: 'high', 'data-hero-img': '' } });
  const formats = formatProducts.filter((p) => canShow(p.name, ctx));
  const steps = processSteps.filter((s) => canShow(s, ctx));
  const own = tx(ctx, 'home.ways.own.body');
  const oem = tx(ctx, 'home.ways.oem.body');
  const loc_ = fact(ctx, location);

  const main = html`
<section class="hero" aria-labelledby="hero-h">
  <div class="wrap grid">
    <div class="hero__text">
      ${tx(ctx, 'home.eyebrow') ? html`<p class="eyebrow">${tx(ctx, 'home.eyebrow')}</p>` : ''}
      <h1 id="hero-h">${h1}</h1>
      ${tx(ctx, 'home.lede') ? html`<p class="lede">${tx(ctx, 'home.lede')}</p>` : ''}
      <div class="btn-row">
        <a class="btn btn--primary" href="${href(ctx.locale, ROUTES.oem)}#brief">${t(ctx, 'cta.oem')}</a>
        <a class="btn btn--line" href="${href(ctx.locale, ROUTES.products)}">${t(ctx, 'cta.products')}</a>
      </div>
      ${loc_ ? html`<p class="hero__place">${PIN}<span>${loc_}</span></p>` : ''}
    </div>
    <div class="hero__visual">
      <figure class="grain-panel" data-grain>
        <div class="aperture" data-aperture>${heroImg ?? strandPlate({ strand: 'hair' }, '')}</div>
      </figure>
      ${heroImg ? html`<p class="hero__credit small muted">${credit(ctx, 'legacy.hero.pack')}</p>` : ''}
    </div>
  </div>
</section>

${formats.length ? html`<section class="section section--tight" aria-labelledby="formats-h">
  <div class="wrap">
    ${sectionHead(t(ctx, 'home.formats.eyebrow'), html`<span id="formats-h">${hd(ctx, 'home.formats.h2')}</span>`, t(ctx, 'home.formats.lede'))}
    <div class="formats formats--four">${formats.map((p) => formatCard(ctx, assets, p, 'home'))}</div>
    <p class="section-link">${linkArrow(href(ctx.locale, ROUTES.products), t(ctx, 'cta.products'))}</p>
  </div>
</section>` : ''}

<section class="section on-deep" aria-labelledby="oem-h">
  <div class="wrap">
    ${sectionHead(t(ctx, 'home.ways.eyebrow'), html`<span id="oem-h">${hd(ctx, 'home.ways.h2')}</span>`, tx(ctx, 'home.ways.body'))}
    <div class="ways grid">
      ${own ? html`<div class="way arrive"><h3>${t(ctx, 'home.ways.own.h')}</h3><p>${own}</p>${linkArrow(href(ctx.locale, productPath('mr-noodles')), t(ctx, 'products.details'))}</div>` : ''}
      ${oem ? html`<div class="way arrive"><h3>${t(ctx, 'home.ways.oem.h')}</h3><p>${oem}</p>${linkArrow(href(ctx.locale, ROUTES.oem), t(ctx, 'cta.oem'))}</div>` : ''}
      <div class="way way--proof arrive">${dipromQuote(ctx)}${linkArrow(href(ctx.locale, ROUTES.quality), t(ctx, 'home.ways.quality'))}</div>
    </div>
  </div>
</section>

${steps.length ? html`<section class="section" aria-labelledby="process-h">
  <div class="wrap">
    ${sectionHead(t(ctx, 'home.process.eyebrow'), html`<span id="process-h">${hd(ctx, 'home.process.h2')}</span>`, tx(ctx, 'home.process.lede'))}
    <ol class="steps steps--row" role="list">${steps.map((s) => {
      const v = val(s, ctx.locale) as { title: Record<Locale, string>; body: Record<Locale, string> };
      return html`<li class="arrive"><div><h3>${v.title[ctx.locale]}</h3><p>${marked(v.body[ctx.locale], [s], ctx)}</p></div></li>`;
    })}</ol>
    <p class="section-link">${linkArrow(href(ctx.locale, ROUTES.process), t(ctx, 'cta.process'))}</p>
  </div>
</section>` : ''}

${homeQuality(ctx)}
${homeHeritage(ctx)}

<section class="section section--tight">
  <div class="wrap review-grid">
    ${reviewNote(ctx, 'quality module', ['Omitted on purpose: no certificate has been checked, and “documents are being prepared” wording needs the owner’s approval (brief 7.1 §5). The Quality link above is the route.'])}
    ${reviewNote(ctx, 'heritage pause', heritageCandidates.map((f) => `${String(val(f, 'en'))} — ${f.status}. ${f.note ?? ''}`))}
    ${reviewNote(ctx, 'markets', [factNote(marketsRegions)])}
  </div>
</section>

<section class="section band close" aria-labelledby="close-h">
  <div class="wrap">
    <h2 id="close-h">${hd(ctx, 'home.close.h2')}</h2>
    <div class="close-grid">
      <div class="close-item"><p class="lede">${t(ctx, 'home.close.oem')}</p><a class="btn btn--primary" href="${href(ctx.locale, ROUTES.oem)}#brief">${t(ctx, 'cta.oem')}</a></div>
      <div class="close-item"><p class="lede">${t(ctx, 'home.close.contact')}</p><a class="btn btn--line" href="${href(ctx.locale, ROUTES.contact)}">${t(ctx, 'cta.contact')}</a></div>
    </div>
  </div>
</section>`;

  return page(ctx, assets, { ...meta(ctx, 'home', ''), jsonLd: organization(ctx), bodyClass: 'page-home' }, main);
}

/* ---------- products index ---------- */

export function productsIndex(ctx: Ctx, assets: Assets): Built {
  const list = products.filter((p) => canShow(p.name, ctx));
  const formatsPresent = [...new Set(list.map((p) => p.format))];
  const main = html`
<section class="section section--tight page-head">
  <div class="wrap">
    ${sectionHead(t(ctx, 'nav.products'), hd(ctx, 'products.h1'), tx(ctx, 'products.lede'), 'h1')}
    ${list.length ? html`
    <div class="tools" data-filter-tools>
      <div class="field-search">
        <label for="product-search">${t(ctx, 'products.search')}</label>
        <input id="product-search" type="search" placeholder="${t(ctx, 'products.search.placeholder')}" aria-describedby="product-search-hint" autocomplete="off" data-filter-search>
        <p class="hint small muted" id="product-search-hint">${t(ctx, 'products.search.hint')}</p>
      </div>
      <div role="group" aria-label="${t(ctx, 'products.filter')}" class="chips">
        <button class="chip" type="button" aria-pressed="true" data-filter-format="">${t(ctx, 'products.filter.all')}</button>
        ${formatsPresent.map((f) => {
          const p = list.find((x) => x.format === f)!;
          return html`<button class="chip tone-${p.tone}" type="button" aria-pressed="false" data-filter-format="${f}"><i aria-hidden="true"></i>${t(ctx, `format.${f}`)}</button>`;
        })}
      </div>
    </div>
    <div class="result-line js-only">
      <p data-result-count aria-live="polite" data-one="${t(ctx, 'products.count.one')}" data-other="${t(ctx, 'products.count.other')}">${t(ctx, 'products.count.other', { n: list.length })}</p>
      <button type="button" data-filter-reset hidden>${t(ctx, 'products.reset')}</button>
    </div>
    <div class="formats formats--index" data-product-list>${list.map((p) => formatCard(ctx, assets, p, 'list', 'h2'))}</div>
    <div class="empty" data-filter-empty hidden>
      <h2 class="h3">${hd(ctx, 'products.empty.h')}</h2>
      <p>${t(ctx, 'products.empty.body')}</p>
      <div class="btn-row"><button class="btn btn--line" type="button" data-filter-reset>${t(ctx, 'products.reset')}</button><a class="btn btn--primary" href="${href(ctx.locale, ROUTES.oem)}#brief">${t(ctx, 'cta.oem')}</a></div>
    </div>` : html`<p class="register-empty">${t(ctx, 'products.none')}</p>`}
    <div class="review-grid section--tight">
      ${reviewNote(ctx, 'formats awaiting confirmation (not public)', productSlots.map((s) => `${s.name.en} / ${s.name.th}: ${s.note}`))}
    </div>
  </div>
</section>
${ctaBand(ctx, hd(ctx, 'products.cta.h'), tx(ctx, 'products.cta.body'))}`;
  return page(ctx, assets, {
    ...meta(ctx, 'products', ROUTES.products),
    jsonLd: [breadcrumbs(ctx, [{ name: t(ctx, 'nav.home'), path: '' }, { name: t(ctx, 'nav.products'), path: ROUTES.products }])],
  }, main);
}

/* ---------- product detail ---------- */

const SPEC_FIELDS = ['ingredients', 'allergen', 'packWeights', 'shelfLife', 'storage', 'cooking', 'origin', 'widthMm', 'caseConfiguration'] as const;

export function productDetail(ctx: Ctx, assets: Assets, p: Product): Built {
  const name = fact(ctx, p.name)!;
  const plain = String(val(p.name, ctx.locale));
  const summary = fact(ctx, p.summary);
  const uses = canShow(p.uses, ctx) ? (val(p.uses, ctx.locale) as string[]) : [];
  const alt = loc(p.altNames, ctx.locale);
  const isBrand = p.format === 'brand';
  const dry = p.media.pack ? assetImg(ctx, assets, isBrand ? 'legacy.mrnoodles.pack' : p.media.pack, {}) : null;
  const dish = p.media.dish ? assetImg(ctx, assets, p.media.dish, {}) : null;
  const relatedList = p.related.map((id) => productById.get(id)!).filter((r) => canShow(r.name, ctx));
  const brandFormats = isBrand ? formatProducts.filter((x) => x.brand && String(val(x.brand, 'en')).includes('Mr. Noodles') && canShow(x.name, ctx)) : [];
  const productClaims = claims.filter((c) => c.level === 'product' && c.productId === p.id);
  const approvedClaims = productClaims.filter((c) => c.ownerApproved);

  const specRow = (key: string, value: Raw | null) =>
    html`<div><dt>${t(ctx, `spec.${key}`)}</dt><dd>${value ?? html`<span class="unknown">${t(ctx, 'spec.unknown')}</span>`}</dd></div>`;

  const main = html`
${crumbs(ctx, [{ label: t(ctx, 'nav.home'), path: '' }, { label: t(ctx, 'nav.products'), path: ROUTES.products }, { label: plain }])}
<section class="section section--tight product-hero">
  <div class="wrap grid">
    <div class="product-hero__text">
      <p class="eyebrow">${t(ctx, `format.${p.format}`)}</p>
      <h1>${name}</h1>
      ${alt.length ? html`<p class="product-alt"><span class="muted">${t(ctx, 'product.alt')}:</span> ${alt.join(' · ')}</p>` : ''}
      ${summary ? html`<h2 class="h3 product-sub">${t(ctx, 'product.what')}</h2><p class="lede">${summary}</p>` : ''}
      ${uses.length ? html`<h2 class="h3 product-sub">${t(ctx, 'product.uses')}</h2><ul class="uses" role="list">${uses.map((u) => html`<li>${marked(u, [p.uses], ctx)}</li>`)}</ul>` : ''}
      <div class="btn-row"><a class="btn btn--primary" href="${href(ctx.locale, ROUTES.oem)}#brief">${t(ctx, 'cta.oem')}</a><a class="btn btn--line" href="${href(ctx.locale, ROUTES.contact)}#contact-form">${t(ctx, 'cta.requestSpec')}</a></div>
    </div>
    <div class="product-hero__media tone-${p.tone}">
      ${dry
        ? html`<div class="pair${isBrand ? ' pair--wide' : ''}">
            <figure><div class="frame">${dry}</div><figcaption>${t(ctx, isBrand ? 'nav.products' : 'product.dry')} · ${credit(ctx, isBrand ? 'legacy.mrnoodles.pack' : p.media.pack!)}</figcaption></figure>
            ${dish ? html`<figure><div class="frame">${dish}</div><figcaption>${t(ctx, 'product.cooked')}</figcaption></figure>` : ''}
          </div>`
        : html`<div class="format-card__media plate-large">${strandPlate(p, plain)}</div>`}
    </div>
  </div>
</section>

${isBrand && brandFormats.length ? html`<section class="section section--tight band"><div class="wrap">
  <h2 class="h3">${t(ctx, 'product.brandFormats')}</h2>
  <div class="formats">${brandFormats.map((x) => formatCard(ctx, assets, x, 'brand'))}</div>
</div></section>` : ''}

<section class="section section--tight" aria-labelledby="spec-h">
  <div class="wrap grid">
    <div class="spec-intro"><h2 id="spec-h">${t(ctx, 'product.spec.h')}</h2>${SPEC_FIELDS.some((k) => p.technical[k]?.status === 'sample' && canShow(p.technical[k] as Fact<unknown>, ctx)) ? sampleNote(ctx, 'sample.spec') : html`<p class="muted">${t(ctx, 'product.spec.lede')}</p>`}</div>
    <div class="spec-body">
      <dl class="spec">
        ${specRow('format', html`${t(ctx, `format.${p.format}`)}`)}
        ${p.brand ? specRow('brand', fact(ctx, p.brand)) : ''}
        ${p.brandedOrOem ? specRow('channel', fact(ctx, p.brandedOrOem)) : ''}
        ${SPEC_FIELDS.map((k) => {
          const f = p.technical[k] as Fact<unknown> | null;
          const raw_ = f && canShow(f, ctx) ? val(f, ctx.locale) : null;
          const v = f && raw_ !== null ? marked(Array.isArray(raw_) ? raw_.join(', ') : String(raw_), [f], ctx) : null;
          return specRow(k, v);
        })}
      </dl>
      <h2 class="h3 product-sub">${t(ctx, 'product.claims.h')}</h2>
      ${approvedClaims.length ? html`<ul>${approvedClaims.map((c) => html`<li>${loc(c.text, ctx.locale)}</li>`)}</ul>` : html`<p>${t(ctx, 'product.claims.none')}</p>`}
      <h2 class="h3 product-sub">${t(ctx, 'product.docs.h')}</h2>
      ${docList(ctx, [...documents, ...sampleDocuments].filter((d) => d.productIds.includes(p.id))) ?? html`<p>${t(ctx, 'product.docs.none')} ${linkArrow(`${href(ctx.locale, ROUTES.contact)}#contact-form`, t(ctx, 'cta.requestSpec'))}</p>`}
      ${reviewNote(ctx, 'claims found on the 2014 site for this product (not shown)', [
        ...productClaims.map((c) => `${c.text.en} — needs: ${c.evidenceNeeded}`),
        ...claims.filter((c) => c.level === 'company').map((c) => `Company-level (not inherited): ${c.text.en}`),
      ])}
      ${reviewNote(ctx, 'fact status', [factNote(p.name as Fact<unknown>), factNote(p.summary as Fact<unknown>)])}
    </div>
  </div>
</section>

${relatedList.length ? html`<section class="section section--tight band" aria-labelledby="related-h"><div class="wrap">
  <h2 id="related-h" class="h3">${t(ctx, 'product.related')}</h2>
  <div class="formats">${relatedList.map((x) => formatCard(ctx, assets, x, 'related'))}</div>
</div></section>` : ''}

${ctaBand(ctx, hd(ctx, 'product.cta.h'), tx(ctx, 'products.cta.body'))}`;

  const ld: object[] = [breadcrumbs(ctx, [
    { name: t(ctx, 'nav.home'), path: '' }, { name: t(ctx, 'nav.products'), path: ROUTES.products }, { name: plain, path: productPath(p.slug) },
  ])];
  const pl = productLd(ctx, p, ctx.locale);
  if (pl) ld.push(pl);
  const desc = canShow(p.summary, ctx) ? String(val(p.summary, ctx.locale)) : plain;
  return page(ctx, assets, { title: plain, description: desc, path: productPath(p.slug), jsonLd: ld }, main);
}

function docList(ctx: Ctx, docs: typeof documents): Raw | null {
  const pub = docs.filter((d) => (d.status === 'current' && (ctx.mode === 'preview' || d.ownerApproved)) || (d.status === 'sample' && samplesOn(ctx)));
  if (!pub.length) return null;
  const size = (b: number) => (b >= 1_000_000 ? `${(b / 1_048_576).toFixed(1)} MB` : `${Math.round(b / 1024)} KB`);
  return html`${pub.some((d) => d.status === 'sample') ? sampleNote(ctx, 'sample.docs') : ''}<ul class="doc-list" role="list">${pub.map((d) => html`<li${d.status === 'sample' ? raw(' data-sample') : ''}><div><strong>${loc(d.title, ctx.locale)}</strong><p class="small muted">${loc(d.scope, ctx.locale)} · ${d.locale === 'multi' ? 'ไทย / English / Tiếng Việt' : t(ctx, `lang.${d.locale}`)} · v${d.version} · ${formatDate(d.date, ctx.locale)} · ${d.fileType}, ${size(d.bytes)}</p></div>${d.status === 'sample'
    ? html`<a class="btn btn--line" href="${href(ctx.locale, ROUTES.contact)}?subject=documents#contact-form">${t(ctx, 'doc.request')}</a>`
    : html`<a class="btn btn--line" href="${BASE}/documents/${d.file}" download>${t(ctx, 'doc.download')}</a>`}</li>`)}</ul>`;
}

/* ---------- OEM ---------- */

export function oemPage(ctx: Ctx, assets: Assets): Built {
  const formats = formatProducts.filter((p) => canShow(p.name, ctx));
  const pathSteps = [1, 2, 3, 4, 5].map((n) => ({ h: tx(ctx, `oem.path.${n}.h`), b: tx(ctx, `oem.path.${n}.b`) })).filter((s) => s.h && s.b);
  const main = html`
<section class="hero hero--page" aria-labelledby="oem-h1">
  <div class="wrap grid">
    <div class="hero__text">
      <p class="eyebrow">${t(ctx, 'oem.eyebrow')}</p>
      <h1 id="oem-h1">${tx(ctx, 'oem.h1', {}, { phrases: true }) ?? hd(ctx, 'oem.form.h')}</h1>
      ${tx(ctx, 'oem.lede') ? html`<p class="lede">${tx(ctx, 'oem.lede')}</p>` : ''}
      <div class="btn-row"><a class="btn btn--primary" href="#brief">${t(ctx, 'cta.brief')}</a><a class="btn btn--line" href="${href(ctx.locale, ROUTES.products)}">${t(ctx, 'cta.products')}</a></div>
    </div>
    <div class="hero__visual oem-evidence">${dipromQuote(ctx)}</div>
  </div>
</section>

${formats.length ? html`<section class="section section--tight band" aria-labelledby="oem-formats-h"><div class="wrap">
  ${sectionHead(null, html`<span id="oem-formats-h">${hd(ctx, 'oem.formats.h')}</span>`, t(ctx, 'oem.formats.lede'))}
  <ul class="format-strip" role="list">
    ${formats.map((p) => html`<li class="tone-${p.tone}"><span class="strands" data-strand="${p.strand}" aria-hidden="true"></span><a href="${href(ctx.locale, productPath(p.slug))}">${fact(ctx, p.name)}</a></li>`)}
    ${tx(ctx, 'oem.formats.pasta') ? html`<li class="tone-cream"><span class="strands" data-strand="fine" aria-hidden="true"></span><span>${tx(ctx, 'oem.formats.pasta')}</span></li>` : ''}
  </ul>
</div></section>` : ''}

${sampleOemTerms.some((f) => canShow(f, ctx)) ? html`<section class="section section--tight" aria-labelledby="oem-glance-h"><div class="wrap grid">
  <div class="spec-intro"><h2 id="oem-glance-h">${hd(ctx, 'oem.glance.h')}</h2>${sampleNote(ctx, 'sample.oem')}</div>
  <dl class="spec spec-body glance">${sampleOemTerms.filter((f) => canShow(f, ctx)).map((f) => {
    const v = val(f, ctx.locale) as { label: Record<Locale, string>; value: Record<Locale, string> };
    return html`<div><dt>${v.label[ctx.locale]}</dt><dd>${marked(v.value[ctx.locale], [f], ctx)}</dd></div>`;
  })}</dl>
</div></section>` : ''}

<section class="section" aria-labelledby="oem-path-h"><div class="wrap">
  ${sectionHead(null, html`<span id="oem-path-h">${hd(ctx, 'oem.path.h')}</span>`, null)}
  ${pathSteps.length ? html`<ol class="steps steps--row" role="list">${pathSteps.map((s) => html`<li class="arrive"><div><h3>${s.h}</h3><p>${s.b}</p></div></li>`)}</ol>` : ''}
  <p class="path-note">${t(ctx, 'oem.path.note')}</p>
  ${reviewNote(ctx, 'engagement path', ['O2’s proposed sequence (brief 7.4). Pankao to confirm its real steps, and whether MOQ, lead time, samples or export documents may be stated (D09).'])}
</div></section>

<section class="section band" aria-labelledby="oem-brief-h"><div class="wrap grid">
  <div class="oem-guide">
    <h2 id="oem-brief-h" class="h3">${hd(ctx, 'oem.brief.h')}</h2>
    <ul class="checklist" role="list">${[1, 2, 3, 4, 5].map((n) => html`<li>${t(ctx, `oem.brief.${n}`)}</li>`)}</ul>
  </div>
  <div class="oem-side">
    <h2 class="h3">${t(ctx, 'oem.quality.h')}</h2>
    <p>${t(ctx, 'oem.quality.body')}</p>
    ${linkArrow(href(ctx.locale, ROUTES.quality), t(ctx, 'cta.quality'))}
    ${tx(ctx, 'oem.privacy.body') ? html`<h2 class="h3">${t(ctx, 'oem.privacy.h')}</h2><p>${tx(ctx, 'oem.privacy.body')} <a href="${href(ctx.locale, ROUTES.privacy)}">${t(ctx, 'footer.privacy')}</a></p>` : ''}
  </div>
</div></section>

<section class="section" id="brief" aria-labelledby="oem-form-h" tabindex="-1"><div class="wrap grid">
  <div class="form-intro"><h2 id="oem-form-h">${hd(ctx, 'oem.form.h')}</h2><ul class="contact-mini" role="list">${join(contactLines(ctx))}</ul></div>
  <div class="form-col">${enquiryForm(ctx, 'oem')}</div>
</div></section>`;
  return page(ctx, assets, {
    ...meta(ctx, 'oem', ROUTES.oem),
    jsonLd: [breadcrumbs(ctx, [{ name: t(ctx, 'nav.home'), path: '' }, { name: t(ctx, 'nav.oem'), path: ROUTES.oem }])],
  }, main);
}

/* ---------- process ---------- */

const STEP_IMAGES: Record<string, string> = {
  'process.select': 'legacy.process.rice',
  'process.form': 'legacy.process.factory',
  'process.dry': 'legacy.process.drying',
  'process.check': 'legacy.process.lab',
  'process.pack': 'legacy.process.noodle',
};

export function processPage(ctx: Ctx, assets: Assets): Built {
  const steps = processSteps.filter((s) => canShow(s, ctx));
  const main = html`
<section class="section section--tight page-head"><div class="wrap">
  ${sectionHead(t(ctx, 'process.eyebrow'), hd(ctx, 'process.h1'), tx(ctx, 'process.lede') ?? tx(ctx, 'home.process.lede'), 'h1')}
</div></section>
<section class="section section--tight" aria-label="${hd(ctx, 'process.h1')}"><div class="wrap">
  ${steps.length ? html`<ol class="process" role="list" data-process>
    <span class="process__thread" aria-hidden="true"><i data-process-thread></i></span>
    ${steps.map((s, i) => {
      const v = val(s, ctx.locale) as { title: Record<Locale, string>; body: Record<Locale, string> };
      const img = STEP_IMAGES[s.id] ? assetImg(ctx, assets, STEP_IMAGES[s.id]!, {}) : null;
      return html`<li class="process-step" data-step>
        <span class="process-step__dot" aria-hidden="true"><span></span></span>
        <div class="process-step__body">
          <div><p class="eyebrow">${t(ctx, 'process.step', { n: i + 1 })}</p><h2 class="h3">${v.title[ctx.locale]}</h2><p class="body">${marked(v.body[ctx.locale], [s], ctx)}</p></div>
          ${img ? html`<figure>${img}<figcaption>${credit(ctx, STEP_IMAGES[s.id]!)}</figcaption></figure>` : ''}
        </div>
      </li>`;
    })}
  </ol>` : ''}
  ${reviewNote(ctx, 'process', ['Steps paraphrase the 2014 Thai/English process and Mr. Noodles pages; Pankao to confirm each step and what may be shown (no trade secrets).', 'The 2014 photographs are small (102–186 px wide) and shown at native size only; a new shoot is in the shot list (docs/CONTENT_REQUESTS.md).'])}
</div></section>
<section class="section band" aria-labelledby="pq-h"><div class="wrap grid">
  <div class="cta-band__text"><h2 id="pq-h" class="h3">${t(ctx, 'process.quality.h')}</h2><p>${t(ctx, 'process.quality.body')}</p></div>
  <div class="btn-row cta-band__actions"><a class="btn btn--line" href="${href(ctx.locale, ROUTES.quality)}">${t(ctx, 'cta.quality')}</a><a class="btn btn--primary" href="${href(ctx.locale, ROUTES.oem)}#brief">${t(ctx, 'cta.oem')}</a></div>
</div></section>`;
  return page(ctx, assets, {
    ...meta(ctx, 'process', ROUTES.process),
    jsonLd: [breadcrumbs(ctx, [{ name: t(ctx, 'nav.home'), path: '' }, { name: t(ctx, 'nav.process'), path: ROUTES.process }])],
  }, main);
}

/* ---------- quality ---------- */

export function certCard(ctx: Ctx, c: Certificate, today: string): Raw | null {
  // QLT-02: an expired, superseded, pending or private certificate never shows as current.
  // Sample entries (preview only) show how real certificates will look; they never claim "current".
  const isSample = c.status === 'sample';
  if (isSample) { if (!samplesOn(ctx)) return null; }
  else if (c.status !== 'current' || c.expiresOn < today) return null;
  if (!isSample && ctx.mode === 'production' && !c.ownerApproved) return null;
  return html`<li class="cert${isSample ? ' cert--sample' : ''}"${isSample ? raw(' data-sample') : ''}>
    <h3>${c.standard}</h3>
    ${isSample ? html`<p class="status status--sample">${t(ctx, 'cert.sample')}</p>` : html`<p class="status status--current">${t(ctx, 'cert.current')}</p>`}
    <dl>
      <dt>${t(ctx, 'cert.scope')}</dt><dd>${loc(c.scope, ctx.locale)}</dd>
      <dt>${t(ctx, 'cert.holder')}</dt><dd>${c.operator} · ${c.facility}</dd>
      <dt>${t(ctx, 'cert.issuer')}</dt><dd>${c.issuer}</dd>
      <dt>${t(ctx, 'cert.number')}</dt><dd class="num">${c.number}</dd>
      <dt>${t(ctx, 'cert.validity')}</dt><dd>${formatDate(c.issuedOn, ctx.locale)} – ${formatDate(c.expiresOn, ctx.locale)}</dd>
    </dl>
    ${c.verificationUrl ? linkArrow(c.verificationUrl, t(ctx, 'cert.verify'), ' rel="noopener" target="_blank"') : ''}
  </li>`;
}

export function qualityPage(ctx: Ctx, assets: Assets): Built {
  const cards = [...certificates, ...sampleCertificates].map((c) => certCard(ctx, c, ctx.buildDate)).filter(Boolean) as Raw[];
  const sampleCards = samplesOn(ctx) && sampleCertificates.length > 0;
  const check = processSteps.find((s) => s.id === 'process.check')!;
  const checkV = canShow(check, ctx) ? (val(check, ctx.locale) as { body: Record<Locale, string> }).body[ctx.locale] : null;
  const main = html`
<section class="section section--tight page-head"><div class="wrap">
  ${sectionHead(t(ctx, 'quality.eyebrow'), hd(ctx, 'quality.h1'), t(ctx, 'quality.lede'), 'h1')}
</div></section>
<section class="section section--tight" aria-labelledby="register-h"><div class="wrap">
  <h2 id="register-h" class="h3">${t(ctx, 'quality.register.h')}</h2>
  ${cards.length ? html`${sampleCards ? sampleNote(ctx, 'sample.certs') : ''}<ul class="cert-list" role="list">${cards}</ul>` : html`<div class="register-empty">
    <h3>${hd(ctx, 'quality.empty.h')}</h3>
    <p>${t(ctx, 'quality.empty.body')}</p>
    <div class="btn-row"><a class="btn btn--primary" href="${href(ctx.locale, ROUTES.contact)}?subject=documents#contact-form">${t(ctx, 'cta.requestDocs')}</a></div>
  </div>`}
  <p class="small muted reviewed">${t(ctx, 'quality.reviewed', { date: formatDate(QUALITY_REGISTER_REVIEWED, ctx.locale) })}</p>
  ${reviewNote(ctx, 'marks seen on the 2014 site and in the 2017 catalogue (not shown; none has a checked certificate)', observedMarks.map((m) => `${m.name} — seen on: ${m.seenOn}. Missing: ${m.missing}.`))}
</div></section>
<section class="section band" aria-labelledby="claims-h"><div class="wrap grid">
  <div class="quality-col"><h2 id="claims-h" class="h3">${t(ctx, 'quality.claims.h')}</h2><p>${t(ctx, 'quality.claims.body')}</p>
    ${reviewNote(ctx, 'claims register (none public)', claims.map((c) => `[${c.level}${c.productId ? `: ${c.productId}` : ''}] ${c.text.en} — needs: ${c.evidenceNeeded}`))}
  </div>
  <div class="quality-col"><h2 class="h3">${t(ctx, 'quality.control.h')}</h2>${checkV ? html`<p>${marked(checkV, [check], ctx)}</p>` : ''}${linkArrow(href(ctx.locale, ROUTES.process), t(ctx, 'cta.process'))}</div>
</div></section>
<section class="section section--tight" aria-labelledby="docs-h"><div class="wrap">
  <h2 id="docs-h" class="h3">${t(ctx, 'quality.docs.h')}</h2>
  ${docList(ctx, [...documents, ...sampleDocuments]) ?? html`<p>${t(ctx, 'quality.docs.none')}</p>`}
</div></section>
${ctaBand(ctx, t(ctx, 'cta.requestDocs'), null)}`;
  return page(ctx, assets, {
    ...meta(ctx, 'quality', ROUTES.quality),
    jsonLd: [breadcrumbs(ctx, [{ name: t(ctx, 'nav.home'), path: '' }, { name: t(ctx, 'nav.quality'), path: ROUTES.quality }])],
  }, main);
}

/* ---------- about ---------- */

function timeline(ctx: Ctx): Raw | null {
  const items = sampleTimeline.filter((f) => canShow(f, ctx));
  if (!items.length) return null;
  return html`${sampleNote(ctx, 'sample.timeline')}<ol class="timeline" role="list">${items.map((f) => {
    const v = val(f, ctx.locale) as { when: Record<Locale, string>; what: Record<Locale, string> };
    return html`<li class="arrive"><span class="timeline__when">${v.when[ctx.locale]}</span><span class="timeline__dot" aria-hidden="true"></span><p class="timeline__what">${marked(v.what[ctx.locale], [f], ctx)}</p></li>`;
  })}</ol>`;
}

export function aboutPage(ctx: Ctx, assets: Assets): Built {
  const addr = canShow(address, ctx) ? (val(address, ctx.locale) as string[]) : null;
  const building = assetImg(ctx, assets, 'legacy.contact.building', {});
  const today = ['about.today.own', 'about.today.oem', 'about.today.languages'].map((k) => tx(ctx, k)).filter(Boolean) as Raw[];
  const main = html`
<section class="section section--tight page-head"><div class="wrap">
  ${sectionHead(t(ctx, 'about.eyebrow'), tx(ctx, 'about.h1', {}, { phrases: true }) ?? t(ctx, 'nav.about'), tx(ctx, 'about.lede'), 'h1')}
</div></section>
<section class="section section--tight"><div class="wrap grid about-grid">
  ${tx(ctx, 'about.name.body') ? html`<div class="about-name"><h2 class="h3">${t(ctx, 'about.name.h')}</h2><p class="lede">${tx(ctx, 'about.name.body')}</p></div>` : ''}
  ${today.length ? html`<div class="about-today"><h2 class="h3">${t(ctx, 'about.today.h')}</h2><ul class="checklist" role="list">${today.map((x) => html`<li>${x}</li>`)}</ul></div>` : ''}
</div></section>
<section class="section band" aria-labelledby="history-h"><div class="wrap">
  <h2 id="history-h" class="h3">${t(ctx, 'about.history.h')}</h2>
  ${timeline(ctx) ?? (tx(ctx, 'about.history.body') ? html`<p class="prose">${tx(ctx, 'about.history.body')}</p>` : '')}
  ${reviewNote(ctx, 'heritage timeline candidates (D04) — the timeline renders here once dated evidence is approved', heritageCandidates.map((f) => `${String(val(f, 'en'))} — ${f.status}. ${f.note ?? ''}`))}
  ${reviewNote(ctx, 'legal identity (shown only here until D02)', [
    `${String(val(legalNameTh, 'th'))} / ${String(val(legalNameEn, 'en'))} · registration ${String(val(registration, 'en'))}`,
    String(val(legalFacts, 'en')),
    'The separate 2024 Bangkok restaurant company whose Thai name matches the manufacturer’s pre-2017 name is blocked from all output (src/content/sources.ts → rejectedEntities).',
  ])}
</div></section>
<section class="section" aria-labelledby="where-h"><div class="wrap grid about-where">
  <div><h2 id="where-h" class="h3">${t(ctx, 'about.where.h')}</h2>
    ${addr ? html`<address class="address">${marked(raw(addr.map(esc).join('<br>')), [address], ctx)}</address>` : ''}
    ${linkArrow(href(ctx.locale, ROUTES.contact), t(ctx, 'cta.directions'))}
  </div>
  ${building ? html`<figure class="about-photo">${building}<figcaption class="small muted">${credit(ctx, 'legacy.contact.building')}</figcaption></figure>` : ''}
</div></section>`;
  return page(ctx, assets, {
    ...meta(ctx, 'about', ROUTES.about),
    jsonLd: [breadcrumbs(ctx, [{ name: t(ctx, 'nav.home'), path: '' }, { name: t(ctx, 'nav.about'), path: ROUTES.about }])],
  }, main);
}

/* ---------- contact ---------- */

export function contactPage(ctx: Ctx, assets: Assets): Built {
  const addr = canShow(address, ctx) ? (val(address, ctx.locale) as string[]) : null;
  const q = canShow(mapQuery, ctx) ? String(val(mapQuery, ctx.locale)) : null;
  const directions = q ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(q)}` : null;
  const embed = q ? `https://www.google.com/maps?q=${encodeURIComponent(q)}&output=embed&hl=${ctx.locale}` : null;
  const main = html`
<section class="section section--tight page-head"><div class="wrap">
  ${sectionHead(t(ctx, 'contact.eyebrow'), hd(ctx, 'contact.h1'), t(ctx, 'contact.lede'), 'h1')}
</div></section>
<section class="section section--tight"><div class="wrap contact-grid">
  <div class="stack contact-info">
    ${addr ? html`<div>
      <h2 class="h3">${t(ctx, 'contact.address.h')}</h2>
      <address class="address" data-address="${addr.join(' ')}">${marked(raw(addr.map(esc).join('<br>')), [address], ctx)}</address>
      <div class="btn-row address-actions">
        <button class="btn btn--line js-only" type="button" data-copy-address data-copied="${t(ctx, 'contact.copied')}">${t(ctx, 'contact.copy')}</button>
        ${directions ? html`<a class="btn btn--line" href="${directions}" target="_blank" rel="noopener">${t(ctx, 'contact.directions')} <span class="sr-only">${t(ctx, 'contact.newTab')}</span></a>` : ''}
      </div>
      <p class="sr-only" data-copy-status aria-live="polite"></p>
    </div>` : ''}
    <div>
      <h2 class="h3">${t(ctx, 'contact.channels.h')}</h2>
      <ul class="channel-list" role="list">${join(contactLines(ctx))}</ul>
      ${canShow(sampleHours, ctx) ? html`<h2 class="h3 hours-h">${t(ctx, 'contact.hours.h')} ${sampleTag(ctx)}</h2><p>${marked(String(val(sampleHours, ctx.locale)), [sampleHours], ctx)}</p>` : ''}
      ${reviewNote(ctx, 'contacts', [`Hours not shown: ${String(val(hours, 'en'))} appears only in Yellow Pages (D10).`, 'Two different mobile numbers appear in sources; neither is shown (may belong to individuals).', `Email: ${String(val(email, 'en'))} (2014 site). A company-domain inbox may be preferred.`, `Phone: ${(val(phone, 'en') as { tel: string }).tel} — agrees across 2014 site, Yellow Pages and THIC.`])}
    </div>
    <div>
      <h2 class="h3">${t(ctx, 'contact.oem.h')}</h2>
      <p>${t(ctx, 'contact.oem.body')}</p>
      ${linkArrow(`${href(ctx.locale, ROUTES.oem)}#brief`, t(ctx, 'cta.brief'))}
    </div>
  </div>
  ${embed ? html`<div class="map-col">
    <h2 class="h3">${t(ctx, 'contact.map.h')}</h2>
    <div class="map-panel" data-map data-embed="${embed}" data-map-title="${t(ctx, 'contact.map.title')}">
      <div class="stack">
        <p>${t(ctx, 'contact.map.body')}</p>
        <button class="btn btn--line js-only" type="button" data-map-show>${t(ctx, 'contact.map.show')}</button>
        <p class="small muted">${t(ctx, 'contact.map.pin')}</p>
      </div>
    </div>
  </div>` : ''}
</div></section>
<section class="section band" id="contact-form" aria-labelledby="contact-form-h" tabindex="-1"><div class="wrap grid">
  <div class="form-intro"><h2 id="contact-form-h">${hd(ctx, 'contact.form.h')}</h2></div>
  <div class="form-col">${enquiryForm(ctx, 'general')}</div>
</div></section>`;
  return page(ctx, assets, {
    ...meta(ctx, 'contact', ROUTES.contact),
    jsonLd: [breadcrumbs(ctx, [{ name: t(ctx, 'nav.home'), path: '' }, { name: t(ctx, 'nav.contact'), path: ROUTES.contact }])],
  }, main);
}

/* ---------- privacy & accessibility ---------- */

export function privacyPage(ctx: Ctx, assets: Assets): Built {
  const parts = ['controller', 'collect', 'purpose', 'basis', 'recipients', 'retention', 'files', 'cookies', 'third', 'rights'];
  const main = html`
<section class="section section--tight page-head"><div class="wrap">${sectionHead(null, hd(ctx, 'privacy.h1'), t(ctx, 'privacy.lede'), 'h1')}</div></section>
<section class="section section--tight"><div class="wrap">
  ${reviewNote(ctx, 'draft', ['O2 draft structure (brief 7.9). Controller, recipients, retention and legal basis need the company and a Thai PDPA adviser before release (D02, D11, D19). Sentences that depend on those decisions are marked “O2 draft” and drop out of a production build until approved.'])}
  <div class="legal">${parts.map((k) => {
    const b = tx(ctx, `privacy.${k}.b`);
    return b ? html`<section class="legal-part"><h2 class="h3">${t(ctx, `privacy.${k}.h`)}</h2><p>${b}</p></section>` : '';
  })}
    <section class="legal-part"><h2 class="h3">${t(ctx, 'footer.contact')}</h2><ul class="channel-list" role="list">${join(contactLines(ctx))}</ul></section>
  </div>
</div></section>`;
  return page(ctx, assets, { ...meta(ctx, 'privacy', ROUTES.privacy) }, main);
}

export function accessibilityPage(ctx: Ctx, assets: Assets, testedOn: string): Built {
  const main = html`
<section class="section section--tight page-head"><div class="wrap">${sectionHead(null, hd(ctx, 'a11y.h1'), t(ctx, 'a11y.lede'), 'h1')}</div></section>
<section class="section section--tight"><div class="wrap legal">
  <section class="legal-part"><h2 class="h3">${t(ctx, 'a11y.design.h')}</h2><ul class="checklist" role="list">${[1, 2, 3, 4, 5].map((n) => html`<li>${t(ctx, `a11y.design.${n}`)}</li>`)}</ul></section>
  <section class="legal-part"><h2 class="h3">${t(ctx, 'a11y.tested.h')}</h2><p>${t(ctx, 'a11y.tested.b', { date: formatDate(testedOn, ctx.locale) })}</p><p>${t(ctx, 'a11y.claim')}</p></section>
  <section class="legal-part"><h2 class="h3">${t(ctx, 'a11y.report.h')}</h2><p>${t(ctx, 'a11y.report.b')}</p><ul class="channel-list" role="list">${join(contactLines(ctx))}</ul></section>
</div></section>`;
  return page(ctx, assets, { ...meta(ctx, 'a11y', ROUTES.accessibility) }, main);
}

/* ---------- 404 ---------- */

export function notFound(ctx: Ctx, assets: Assets): Built {
  const main = html`
<section class="section page-head"><div class="wrap">
  <h1>${hd(ctx, '404.h1')}</h1>
  <p class="lede">${t(ctx, '404.body')}</p>
  <ul class="recovery" role="list">
    <li>${linkArrow(href(ctx.locale, ROUTES.products), t(ctx, 'nav.products'))}</li>
    <li>${linkArrow(`${href(ctx.locale, ROUTES.oem)}#brief`, t(ctx, 'cta.oem'))}</li>
    <li>${linkArrow(href(ctx.locale, ROUTES.contact), t(ctx, 'cta.contact'))}</li>
    <li>${linkArrow(href(ctx.locale, ''), t(ctx, 'nav.home'))}</li>
  </ul>
</div></section>`;
  const built = page(ctx, assets, { title: t(ctx, '404.meta.title'), description: t(ctx, '404.body'), path: '404/', status: 404, alternates: false }, main);
  return { ...built, path: `${ctx.locale}/404.html` };
}

export { decisions, brandName };
