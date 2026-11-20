/** Page shell: head, preview bar, header, drawer, footer, O2 credit. */
import { readFileSync } from 'node:fs';
import { address, brandDescriptor, brandName, email, fax, location, phone } from '../content/facts.ts';
import { formatProducts, products as allProducts } from '../content/products.ts';
import { LOCALES, type Locale } from '../content/types.ts';
import { pkMark } from './mark.ts';
import { BASE, MARK_APPROVED, ORIGIN, PUBLIC_PREVIEW, SHOW_LOADER } from '../content/presentation.ts';
import { canShow, fact, formatDate, href, loc, ROUTES, t, val, type Ctx } from './context.ts';
import { attrs, html, join, raw, type Raw } from './html.ts';
import type { Assets } from './assets-out.ts';

export const SITE_ORIGIN = ORIGIN;

export type PageMeta = {
  title: string; // already localized, without brand suffix
  description: string;
  /** Path after /{locale}/ ; same in every locale. */
  path: string;
  jsonLd?: object[];
  /** Pages that exist in every locale get hreflang alternates. */
  alternates?: boolean;
  status?: 404;
  bodyClass?: string;
};

const NAV: { key: string; path: string }[] = [
  { key: 'nav.products', path: ROUTES.products },
  { key: 'nav.oem', path: ROUTES.oem },
  { key: 'nav.process', path: ROUTES.process },
  { key: 'nav.quality', path: ROUTES.quality },
  { key: 'nav.about', path: ROUTES.about },
  { key: 'nav.contact', path: ROUTES.contact },
];

const LANG_SHORT: Record<Locale, string> = { th: 'TH', en: 'EN', vi: 'VI' };
const HTML_LANG: Record<Locale, string> = { th: 'th', en: 'en', vi: 'vi' };
const OG_LOCALE: Record<Locale, string> = { th: 'th_TH', en: 'en_GB', vi: 'vi_VN' };

const isCurrent = (ctx: Ctx, path: string) => path !== '' && (ctx.path === path || ctx.path.startsWith(path));

const GLOBE = raw('<svg viewBox="0 0 18 18" aria-hidden="true" focusable="false"><circle cx="9" cy="9" r="7" stroke="currentColor" stroke-width="1.3" fill="none"/><path d="M2.2 9h13.6M9 2c2.2 2.3 2.2 11.7 0 14M9 2c-2.2 2.3-2.2 11.7 0 14" stroke="currentColor" stroke-width="1.1" fill="none"/></svg>');
const CHEVRON = raw('<svg class="chev" viewBox="0 0 12 12" aria-hidden="true" focusable="false"><path d="M3 4.5l3 3 3-3" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>');

/**
 * Language dropdown (owner, 19 Nov 2026: "make the language change a dropdown menu"). A native
 * <details>, so it opens without JavaScript; site.js closes it on Escape and outside clicks.
 */
export function langSwitch(ctx: Ctx, path: string, cls = ''): Raw {
  return html`<details class="lang-menu${cls ? ` ${cls}` : ''}" data-dropdown>
    <summary>${GLOBE}<span class="sr-only">${t(ctx, 'lang.label')}: </span><span class="lang-menu__current">${t(ctx, `lang.${ctx.locale}`)}</span><span class="lang-menu__code" aria-hidden="true">${LANG_SHORT[ctx.locale]}</span>${CHEVRON}</summary>
    <ul role="list" class="dropdown">${LOCALES.map((l) =>
      html`<li><a href="${href(l, path)}" hreflang="${l}" lang="${l}" data-lang-switch="${l}"${attrs({ 'aria-current': l === ctx.locale ? 'true' : null })}><span>${t({ locale: l }, `lang.${l}`)}</span><span class="dropdown__meta" aria-hidden="true">${LANG_SHORT[l]}</span></a></li>`,
    )}</ul>
  </details>`;
}

function brandBlock(ctx: Ctx, assets: Assets): Raw {
  const name = fact(ctx, brandName);
  const desc = fact(ctx, brandDescriptor);
  const mark = ctx.mode === 'preview' || MARK_APPROVED ? pkMark('hd', 'brand__mark') : raw('');
  void assets;
  return html`<a class="brand" href="${href(ctx.locale, '')}">
    ${mark}
    <span class="brand__words">
      <span class="brand__name">${name ?? ''}</span>
      ${desc ? html`<span class="brand__sub">${desc}</span>` : ''}
    </span>
    <span class="sr-only">${t(ctx, 'nav.home')}</span>
  </a>`;
}

/** Every product, as on the 2014 sidebar's "ปั้นข้าวของเรา" submenu. */
function productLinks(ctx: Ctx): Raw[] {
  return allProducts.filter((p) => canShow(p.name, ctx)).map((p) =>
    html`<li><a href="${href(ctx.locale, `products/${p.slug}/`)}"${attrs({ 'aria-current': ctx.path === `products/${p.slug}/` ? 'page' : null })}>${String(val(p.name, ctx.locale))}</a></li>`);
}

/** In the header the products item has a submenu; in the drawer the products are listed under it. */
function navList(ctx: Ctx, place: 'header' | 'drawer'): Raw {
  return html`<ul role="list">${NAV.map((n) => {
    const link = html`<a href="${href(ctx.locale, n.path)}"${attrs({ 'aria-current': isCurrent(ctx, n.path) ? 'page' : null })}>${t(ctx, n.key)}</a>`;
    if (n.path !== ROUTES.products) return html`<li>${link}</li>`;
    const items = productLinks(ctx);
    if (!items.length) return html`<li>${link}</li>`;
    if (place === 'drawer') return html`<li>${link}<ul role="list" class="drawer-sub">${items}</ul></li>`;
    return html`<li class="nav-has-sub">${link}<details class="nav-sub" data-dropdown>
      <summary><span class="sr-only">${t(ctx, 'nav.products.more')}</span>${CHEVRON}</summary>
      <ul role="list" class="dropdown">${items}<li class="dropdown__all"><a href="${href(ctx.locale, ROUTES.products)}">${t(ctx, 'nav.products.all')} ${ARROW}</a></li></ul>
    </details></li>`;
  })}</ul>`;
}

const MENU_ICON = raw('<svg viewBox="0 0 18 18" aria-hidden="true" focusable="false"><path d="M2 5h14M2 9h14M2 13h14" stroke="currentColor" stroke-width="1.6" fill="none"/></svg>');
const CLOSE_ICON = raw('<svg viewBox="0 0 18 18" aria-hidden="true" focusable="false"><path d="M4 4l10 10M14 4L4 14" stroke="currentColor" stroke-width="1.6" fill="none"/></svg>');
export const ARROW = raw('<svg viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path d="M2 8h11M9 4l4 4-4 4" stroke="currentColor" stroke-width="1.6" fill="none"/></svg>');
export const PIN = raw('<svg viewBox="0 0 18 18" aria-hidden="true" focusable="false"><path d="M9 16.5s5.5-5 5.5-9a5.5 5.5 0 0 0-11 0c0 4 5.5 9 5.5 9z" stroke="currentColor" stroke-width="1.4" fill="none"/><circle cx="9" cy="7.5" r="1.9" fill="currentColor"/></svg>');

function header(ctx: Ctx, assets: Assets): Raw {
  return html`<header class="site-header" data-header>
  <div class="header-bar">
  <div class="header-glass" data-glass aria-hidden="true"></div>
  <div class="header-bar__inner">
    ${brandBlock(ctx, assets)}
    <nav class="nav" aria-label="${t(ctx, 'nav.label')}">${navList(ctx, 'header')}</nav>
    ${langSwitch(ctx, ctx.path)}
    <a class="btn btn--primary header-cta" href="${href(ctx.locale, ROUTES.oem)}#brief">${t(ctx, 'cta.oem')}</a>
    <button class="menu-button" type="button" aria-haspopup="dialog" aria-controls="drawer" data-menu-open>${MENU_ICON}<span>${t(ctx, 'nav.menu')}</span></button>
  </div>
  </div>
</header>
<dialog class="drawer" id="drawer" aria-label="${t(ctx, 'nav.label')}" data-drawer>
  <div class="drawer__inner">
    <div class="drawer__top">
      <span class="brand__name">${fact(ctx, brandName) ?? ''}</span>
      <button class="menu-button" type="button" data-menu-close>${CLOSE_ICON}<span>${t(ctx, 'nav.close')}</span></button>
    </div>
    <nav aria-label="${t(ctx, 'nav.label')}">${navList(ctx, 'drawer')}</nav>
    <a class="btn btn--primary" href="${href(ctx.locale, ROUTES.oem)}#brief">${t(ctx, 'cta.oem')}</a>
  </div>
</dialog>`;
}

/** Loading animation: Pankao's oval logo forms (oval, sprigs, PK, then the arc lettering), gold threads fall (owner's request). */
function loader(ctx: Ctx): Raw {
  if (!SHOW_LOADER) return raw('');
  const showMark = ctx.mode === 'preview' || MARK_APPROVED;
  return html`<div class="loader" aria-hidden="true" data-loader>
  <div class="loader__inner">
    ${showMark ? pkMark('ld', 'loader__mark') : ''}
    <div class="loader__threads"><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div>
  </div>
</div>`;
}

function previewBar(ctx: Ctx): Raw {
  if (ctx.mode !== 'preview') return raw('');
  /* Public preview: one short line on phones (the full sentence from 640 px), dismissible for the session (premium audit, P1
     mobile chrome). The footer keeps the preview note, so the site never stops being labelled. */
  if (PUBLIC_PREVIEW) return html`<div class="preview-bar preview-bar--public" role="region" aria-label="O2 preview" data-preview-bar><div class="wrap">
    <p><span class="preview-bar__short">${t(ctx, 'preview.short')}</span><span class="preview-bar__full">${t(ctx, 'preview.public')}</span></p>
    <button type="button" class="preview-bar__close js-only" data-preview-dismiss aria-label="${t(ctx, 'preview.dismiss')}"><svg viewBox="0 0 18 18" aria-hidden="true" focusable="false"><path d="M4 4l10 10M14 4L4 14" stroke="currentColor" stroke-width="1.6" fill="none"/></svg></button>
  </div></div>`;
  return html`<div class="preview-bar" role="region" aria-label="O2 preview">
  <div class="wrap">
    <p><span class="preview-bar__short">${t(ctx, 'preview.short')}</span><span class="preview-bar__full">${t(ctx, 'preview.text')}</span></p>
    <button type="button" aria-pressed="false" data-review-toggle>${t(ctx, 'preview.toggle')}</button>
  </div>
</div>`;
}

export const O2_CREDIT = raw(readFileSync(new URL('./o2-credit.html', import.meta.url), 'utf8').trim());

/** Contact lines; `fax: false` leaves the fax out where it distracts (premium audit: de-emphasise the fax). */
export function contactLines(ctx: Ctx, opts: { fax?: boolean } = {}): Raw[] {
  const out: Raw[] = [];
  if (canShow(phone, ctx)) {
    const p = val(phone, ctx.locale) as { display: Record<Locale, string>; tel: string };
    out.push(html`<li><a href="tel:${p.tel}">${t(ctx, 'footer.phone')} ${fact(ctx, { ...phone, value: p.display[ctx.locale] })}</a></li>`);
  }
  if (opts.fax !== false && canShow(fax, ctx)) {
    const p = val(fax, ctx.locale) as { display: Record<Locale, string>; tel: string };
    out.push(html`<li><span class="footer-plain">${t(ctx, 'footer.fax')} ${fact(ctx, { ...fax, value: p.display[ctx.locale] })}</span></li>`);
  }
  if (canShow(email, ctx)) {
    // A break opportunity after the @ (Codex F15.5): the address wraps as "name@ / host", never with one letter left over.
    const shown = fact(ctx, email)!;
    out.push(html`<li><a href="mailto:${String(val(email, ctx.locale))}">${raw(shown.html.replace('@', '@<wbr>'))}</a></li>`);
  }
  return out;
}

function footer(ctx: Ctx): Raw {
  const addr = canShow(address, ctx) ? (val(address, ctx.locale) as string[]) : null;
  const products = formatProducts.filter((p) => canShow(p.name, ctx));
  return html`<footer class="site-footer">
  <div class="wrap">
    <div class="grid">
      <div class="footer-brand">
        <p class="display">${fact(ctx, brandName) ?? ''}</p>
        ${fact(ctx, brandDescriptor) ? html`<p class="muted">${fact(ctx, brandDescriptor)}</p>` : ''}
        ${addr ? html`<address class="footer-address">${fact(ctx, { ...address, value: addr.join(', ') })}</address>` : ''}
      </div>
      ${products.length ? html`<div class="footer-col"><h2>${t(ctx, 'footer.products')}</h2><ul role="list">${products.map((p) => html`<li><a href="${href(ctx.locale, `products/${p.slug}/`)}">${fact(ctx, p.name)}</a></li>`)}</ul></div>` : ''}
      <div class="footer-col"><h2>${t(ctx, 'footer.company')}</h2><ul role="list">
        <li><a href="${href(ctx.locale, ROUTES.oem)}">${t(ctx, 'nav.oem')}</a></li>
        <li><a href="${href(ctx.locale, ROUTES.process)}">${t(ctx, 'nav.process')}</a></li>
        <li><a href="${href(ctx.locale, ROUTES.quality)}">${t(ctx, 'nav.quality')}</a></li>
        <li><a href="${href(ctx.locale, ROUTES.about)}">${t(ctx, 'nav.about')}</a></li>
      </ul></div>
      <div class="footer-col footer-col--wide"><h2>${t(ctx, 'footer.contact')}</h2><ul role="list">
        ${join(contactLines(ctx))}
        <li><a href="${href(ctx.locale, ROUTES.contact)}">${t(ctx, 'cta.directions')}</a></li>
      </ul></div>
    </div>
    <div class="footer-legal">
      <ul role="list" class="footer-links">
        <li><a href="${href(ctx.locale, ROUTES.privacy)}">${t(ctx, 'footer.privacy')}</a></li>
        <li><a href="${href(ctx.locale, ROUTES.accessibility)}">${t(ctx, 'footer.accessibility')}</a></li>
        <li><span>${t(ctx, 'footer.reviewed', { date: formatDate(ctx.buildDate, ctx.locale) })}</span></li>
        ${PUBLIC_PREVIEW ? html`<li><span>${t(ctx, 'preview.short')}</span></li>` : ''}
      </ul>
      ${langSwitch(ctx, ctx.path, 'lang-menu--up')}
      ${O2_CREDIT}
    </div>
  </div>
</footer>`;
}

export function document(ctx: Ctx, assets: Assets, meta: PageMeta, main: Raw): string {
  const brand = canShow(brandName, ctx) ? String(val(brandName, ctx.locale)) : '';
  const base = brand ? `${meta.title} | ${brand}` : meta.title;
  // The public preview says so in tabs and link previews too (Codex audit F10.2).
  const title = PUBLIC_PREVIEW ? `${t(ctx, 'preview.titlePrefix')} · ${base}` : base;
  const canonical = `${SITE_ORIGIN}${href(ctx.locale, meta.path)}`;
  const alternates = meta.alternates !== false
    ? [...LOCALES.map((l) => `<link rel="alternate" hreflang="${l}" href="${SITE_ORIGIN}${href(l, meta.path)}">`), `<link rel="alternate" hreflang="x-default" href="${SITE_ORIGIN}${href('th', meta.path)}">`].join('\n')
    : '';
  const robots = ctx.mode === 'preview' || meta.status === 404 ? '<meta name="robots" content="noindex, nofollow">' : '<meta name="robots" content="index, follow">';
  const fontSubset = ctx.locale === 'th' ? 'thai' : ctx.locale === 'vi' ? 'vietnamese' : 'latin';
  const ld = (meta.jsonLd ?? []).map((o) => `<script type="application/ld+json">${JSON.stringify(o).replace(/</g, '\\u003c')}</script>`).join('\n');
  const ogImage = '';
  return `<!doctype html>
<html lang="${HTML_LANG[ctx.locale]}" class="no-js" data-mode="${ctx.mode}" data-loader-mode="${SHOW_LOADER ? 'on' : 'off'}"${assets.glassJs ? ` data-glass-src="${assets.glassJs}"` : ''}>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${escText(title)}</title>
<meta name="description" content="${escAttr(meta.description)}">
${robots}
${meta.status === 404 ? '' : `<link rel="canonical" href="${canonical}">`}
${meta.status === 404 ? '' : alternates}
<meta property="og:type" content="website">
<meta property="og:title" content="${escAttr(title)}">
<meta property="og:description" content="${escAttr(meta.description)}">
${meta.status === 404 ? '' : `<meta property="og:url" content="${canonical}">`}
<meta property="og:locale" content="${OG_LOCALE[ctx.locale]}">
${brand ? `<meta property="og:site_name" content="${escAttr(brand)}">` : ''}
${ogImage}
<meta name="twitter:card" content="summary">
<meta name="theme-color" content="#f7f2e7">
<meta name="format-detection" content="telephone=no">
${PUBLIC_PREVIEW ? `<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'self'; frame-src https://www.google.com; form-action 'self'; base-uri 'self'; object-src 'none'">` : ''}
<link rel="preload" href="${BASE}/fonts/trirong-600-${fontSubset}.woff2" as="font" type="font/woff2" crossorigin>
${fontSubset === 'latin' ? '' : `<link rel="preload" href="${BASE}/fonts/trirong-600-latin.woff2" as="font" type="font/woff2" crossorigin>`}
${assets.glisseCss ? `<link rel="stylesheet" id="glisse-styles" href="${assets.glisseCss}">` : ''}
<link rel="stylesheet" href="${assets.css}">
<script src="${assets.headJs}"></script>
<script src="${assets.siteJs}" defer></script>
${ld}
</head>
<body${meta.bodyClass ? ` class="${meta.bodyClass}"` : ''}>
<div class="aura" aria-hidden="true"><i class="a1"></i><i class="a2"></i><i class="a3"></i><i class="a4"></i></div>
${loader(ctx).html}
<a class="skip" href="#main">${escText(t(ctx, 'skip'))}</a>
${previewBar(ctx).html}
${header(ctx, assets).html}
<main id="main" tabindex="-1">
${main.html}
</main>
${footer(ctx).html}
</body>
</html>
`;
}

function escText(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
function escAttr(s: string): string {
  return escText(s).replace(/"/g, '&quot;');
}

export { loc, location };
