/**
 * Structured data built only from facts that may show in this mode (TEC-02). Never a
 * Restaurant type, never ratings, offers, nutrition or certificates without evidence.
 */
import { address, brandName, email, phone } from '../content/facts.ts';
import type { Locale, Product } from '../content/types.ts';
import { canPublishStructured, href, val, type Ctx } from './context.ts';
import { SITE_ORIGIN } from './layout.ts';
import { BASE } from '../content/presentation.ts';

export function organization(ctx: Ctx): object[] {
  if (!canPublishStructured(brandName)) return [];
  const org: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${SITE_ORIGIN}${BASE}/#organization`,
    name: val(brandName, ctx.locale),
    url: `${SITE_ORIGIN}${href(ctx.locale, '')}`,
  };
  if (canPublishStructured(address)) {
    const a = val(address, 'en') as string[];
    org.address = {
      '@type': 'PostalAddress',
      streetAddress: `${a[0]}, ${a[1]}`,
      addressLocality: 'Sai Noi',
      addressRegion: 'Nonthaburi',
      postalCode: '11150',
      addressCountry: 'TH',
    };
  }
  const points: object[] = [];
  if (canPublishStructured(phone)) points.push({ '@type': 'ContactPoint', contactType: 'sales', telephone: (val(phone, ctx.locale) as { tel: string }).tel, availableLanguage: ['th', 'en'] });
  if (canPublishStructured(email)) points.push({ '@type': 'ContactPoint', contactType: 'customer service', email: val(email, ctx.locale) });
  if (points.length) org.contactPoint = points;
  const site = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_ORIGIN}${BASE}/#website`,
    url: `${SITE_ORIGIN}${BASE}/`,
    name: val(brandName, ctx.locale),
    inLanguage: ['th', 'en', 'vi'],
    publisher: { '@id': `${SITE_ORIGIN}${BASE}/#organization` },
  };
  return [org, site];
}

export function breadcrumbs(ctx: Ctx, items: { name: string; path: string }[]): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, item: `${SITE_ORIGIN}${href(ctx.locale, it.path)}` })),
  };
}

/** Product only with a stable public identity; no offers, ratings or nutrition. */
export function productLd(ctx: Ctx, p: Product, locale: Locale): object | null {
  if (!canPublishStructured(p.name) || !canPublishStructured(p.summary)) return null;
  const o: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: val(p.name, locale),
    description: val(p.summary, locale),
    category: 'Dried rice noodles',
    url: `${SITE_ORIGIN}${href(locale, `products/${p.slug}/`)}`,
  };
  if (canPublishStructured(brandName)) o.manufacturer = { '@id': `${SITE_ORIGIN}${BASE}/#organization` };
  if (p.brand && canPublishStructured(p.brand) && p.format === 'brand') o.brand = { '@type': 'Brand', name: val(p.brand, locale) };
  return o;
}
