/** Page shell: head, preview bar, header, drawer, footer, O2 credit. */
import { readFileSync } from 'node:fs';
import { address, brandDescriptor, brandName, email, fax, location, phone } from '../content/facts.ts';
import { formatProducts } from '../content/products.ts';
import { LOCALES, type Locale } from '../content/types.ts';
import { assetImg } from './media.ts';
import { canShow, fact, formatDate, href, loc, ROUTES, t, val, type Ctx } from './context.ts';
import { attrs, html, join, raw, type Raw } from './html.ts';
import type { Assets } from './assets-out.ts';

export const SITE_ORIGIN = 'https://www.pankaothai.com';

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

export function langSwitch(ctx: Ctx, path: string, cls = 'lang'): Raw {
  return html`<nav class="${cls}" aria-label="${t(ctx, 'lang.label')}">${LOCALES.map((l) =>
    html`<a href="${href(l, path)}" hreflang="${l}" lang="${l}" data-lang-switch="${l}"${attrs({ 'aria-current': l === ctx.locale ? 'true' : null })}><span aria-hidden="true">${LANG_SHORT[l]}</span><span class="sr-only">${t({ locale: l }, `lang.${l}`)}</span></a>`,
  )}</nav>`;
}

function brandBlock(ctx: Ctx, assets: Assets): Raw {
  const name = fact(ctx, brandName);
  const desc = fact(ctx, brandDescriptor);
  const mark = assetImg(ctx, assets, 'legacy.logo', { cls: 'brand__mark', decorative: true, eager: true });
  return html`<a class="brand" href="${href(ctx.locale, '')}">
    ${mark}
    <span class="brand__words">
      <span class="brand__name">${name ?? ''}</span>
      ${desc ? html`<span class="brand__sub">${desc}</span>` : ''}
    </span>
    <span class="sr-only">${t(ctx, 'nav.home')}</span>
  </a>`;
}

function navList(ctx: Ctx): Raw {
  return html`<ul role="list">${NAV.map((n) =>
    html`<li><a href="${href(ctx.locale, n.path)}"${attrs({ 'aria-current': isCurrent(ctx, n.path) ? 'page' : null })}>${t(ctx, n.key)}</a></li>`,
  )}</ul>`;
}

const MENU_ICON = raw('<svg viewBox="0 0 18 18" aria-hidden="true" focusable="false"><path d="M2 5h14M2 9h14M2 13h14" stroke="currentColor" stroke-width="1.6" fill="none"/></svg>');
const CLOSE_ICON = raw('<svg viewBox="0 0 18 18" aria-hidden="true" focusable="false"><path d="M4 4l10 10M14 4L4 14" stroke="currentColor" stroke-width="1.6" fill="none"/></svg>');
export const ARROW = raw('<svg viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path d="M2 8h11M9 4l4 4-4 4" stroke="currentColor" stroke-width="1.6" fill="none"/></svg>');
export const PIN = raw('<svg viewBox="0 0 18 18" aria-hidden="true" focusable="false"><path d="M9 16.5s5.5-5 5.5-9a5.5 5.5 0 0 0-11 0c0 4 5.5 9 5.5 9z" stroke="currentColor" stroke-width="1.4" fill="none"/><circle cx="9" cy="7.5" r="1.9" fill="currentColor"/></svg>');

function header(ctx: Ctx, assets: Assets): Raw {
  return html`<header class="site-header" data-header>
  <div class="wrap">
    ${brandBlock(ctx, assets)}
    <nav class="nav" aria-label="${t(ctx, 'nav.label')}">${navList(ctx)}</nav>
    ${langSwitch(ctx, ctx.path)}
    <a class="btn btn--primary header-cta" href="${href(ctx.locale, ROUTES.oem)}#brief">${t(ctx, 'cta.oem')}</a>
    <button class="menu-button" type="button" aria-haspopup="dialog" aria-controls="drawer" data-menu-open>${MENU_ICON}<span>${t(ctx, 'nav.menu')}</span></button>
  </div>
</header>
<dialog class="drawer" id="drawer" aria-label="${t(ctx, 'nav.label')}" data-drawer>
  <div class="drawer__inner">
    <div class="drawer__top">
      <span class="brand__name">${fact(ctx, brandName) ?? ''}</span>
      <button class="menu-button" type="button" data-menu-close>${CLOSE_ICON}<span>${t(ctx, 'nav.close')}</span></button>
    </div>
    <nav aria-label="${t(ctx, 'nav.label')}">${navList(ctx)}</nav>
    <a class="btn btn--primary" href="${href(ctx.locale, ROUTES.oem)}#brief">${t(ctx, 'cta.oem')}</a>
    ${langSwitch(ctx, ctx.path)}
  </div>
</dialog>`;
}

function previewBar(ctx: Ctx): Raw {
  if (ctx.mode !== 'preview') return raw('');
  return html`<div class="preview-bar" role="region" aria-label="O2 preview">
  <div class="wrap">
    <p>${t(ctx, 'preview.text')}</p>
    <button type="button" aria-pressed="false" data-review-toggle>${t(ctx, 'preview.toggle')}</button>
  </div>
</div>`;
}

export const O2_CREDIT = raw(readFileSync(new URL('./o2-credit.html', import.meta.url), 'utf8').trim());

export function contactLines(ctx: Ctx): Raw[] {
  const out: Raw[] = [];
  if (canShow(phone, ctx)) {
    const p = val(phone, ctx.locale) as { display: Record<Locale, string>; tel: string };
    out.push(html`<li><a href="tel:${p.tel}">${t(ctx, 'footer.phone')} ${fact(ctx, { ...phone, value: p.display[ctx.locale] })}</a></li>`);
  }
  if (canShow(fax, ctx)) {
    const p = val(fax, ctx.locale) as { display: Record<Locale, string>; tel: string };
    out.push(html`<li><span class="footer-plain">${t(ctx, 'footer.fax')} ${fact(ctx, { ...fax, value: p.display[ctx.locale] })}</span></li>`);
  }
  if (canShow(email, ctx)) {
    out.push(html`<li><a href="mailto:${String(val(email, ctx.locale))}">${fact(ctx, email)}</a></li>`);
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
      </ul>
      ${langSwitch(ctx, ctx.path)}
      ${O2_CREDIT}
    </div>
  </div>
</footer>`;
}

export function document(ctx: Ctx, assets: Assets, meta: PageMeta, main: Raw): string {
  const brand = canShow(brandName, ctx) ? String(val(brandName, ctx.locale)) : '';
  const title = brand ? `${meta.title} | ${brand}` : meta.title;
  const canonical = `${SITE_ORIGIN}${href(ctx.locale, meta.path)}`;
  const alternates = meta.alternates !== false
    ? [...LOCALES.map((l) => `<link rel="alternate" hreflang="${l}" href="${SITE_ORIGIN}${href(l, meta.path)}">`), `<link rel="alternate" hreflang="x-default" href="${SITE_ORIGIN}${href('th', meta.path)}">`].join('\n')
    : '';
  const robots = ctx.mode === 'preview' || meta.status === 404 ? '<meta name="robots" content="noindex, nofollow">' : '<meta name="robots" content="index, follow">';
  const fontSubset = ctx.locale === 'th' ? 'thai' : ctx.locale === 'vi' ? 'vietnamese' : 'latin';
  const ld = (meta.jsonLd ?? []).map((o) => `<script type="application/ld+json">${JSON.stringify(o).replace(/</g, '\\u003c')}</script>`).join('\n');
  const ogImage = '';
  return `<!doctype html>
<html lang="${HTML_LANG[ctx.locale]}" class="no-js" data-mode="${ctx.mode}">
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
<link rel="preload" href="/fonts/trirong-600-${fontSubset}.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="${assets.css}">
<script src="${assets.headJs}"></script>
<script src="${assets.siteJs}" defer></script>
${ld}
</head>
<body${meta.bodyClass ? ` class="${meta.bodyClass}"` : ''}>
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
