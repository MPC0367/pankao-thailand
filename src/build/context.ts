/**
 * Build context: mode + locale, the copy lookup, and the one place that decides whether a
 * fact may render and how it is marked. Components call these; they never decide truth.
 */
import { common } from '../content/copy-common.ts';
import { pages } from '../content/copy-pages.ts';
import { allCompanyFacts, brandName } from '../content/facts.ts';
import { products } from '../content/products.ts';
import { SHOW_SAMPLES } from '../content/presentation.ts';
import { sampleHours, sampleOemTerms, sampleTimeline } from '../content/samples.ts';
import type { CopyEntry, EvidenceStatus, Fact, Locale, Localized, Mode, Value } from '../content/types.ts';
import { esc, raw, type Raw } from './html.ts';

export const copy: Record<string, CopyEntry> = { ...common, ...pages };

export type Ctx = {
  mode: Mode;
  locale: Locale;
  /** Path after /{locale}/, e.g. "products/rice-vermicelli/". */
  path: string;
  buildDate: string;
};

/* ---------- fact registry ---------- */

export const factRegistry = new Map<string, Fact<unknown>>();
for (const f of [...allCompanyFacts, ...sampleTimeline, ...sampleOemTerms, sampleHours] as Fact<unknown>[]) factRegistry.set(f.id, f);
for (const p of products) {
  const fs = [p.name, p.brand, p.summary, p.uses, p.brandedOrOem, ...Object.values(p.technical)];
  for (const f of fs) if (f) factRegistry.set(f.id, f as Fact<unknown>);
}

const STRENGTH: EvidenceStatus[] = [
  'owner-confirmed',
  'government-current',
  'first-party-current',
  'directory-secondary',
  'government-historical',
  'first-party-stale',
  'marketplace-secondary',
  'research-lead',
  'unverified',
  'sample',
  'conflicted',
];

export function weakest(statuses: EvidenceStatus[]): EvidenceStatus {
  return statuses.reduce<EvidenceStatus>((w, s) => (STRENGTH.indexOf(s) > STRENGTH.indexOf(w) ? s : w), 'owner-confirmed');
}

export function isLocalized<T>(v: Value<T>): v is Localized<T> {
  return typeof v === 'object' && v !== null && 'th' in (v as object) && 'en' in (v as object) && 'vi' in (v as object);
}

export function val<T>(f: Fact<T>, locale: Locale): T {
  return isLocalized(f.value) ? f.value[locale] : (f.value as T);
}

export function loc<T>(v: Localized<T> | T, locale: Locale): T {
  return isLocalized(v as Value<T>) ? (v as Localized<T>)[locale] : (v as T);
}

/** May this fact appear on a page in this mode? */
export function canShow(f: Fact<unknown> | null | undefined, ctx: Pick<Ctx, 'mode'>): f is Fact<unknown> {
  if (!f) return false;
  if (f.visibility !== 'public' || f.status === 'conflicted') return false;
  if (f.status === 'sample') return ctx.mode === 'preview' && SHOW_SAMPLES;
  if (ctx.mode === 'production') return f.ownerApproved === true;
  return true;
}

export function factsShowable(ids: string[], ctx: Pick<Ctx, 'mode'>): boolean {
  return ids.every((id) => {
    const f = factRegistry.get(id);
    if (!f) throw new Error(`copy depends on unknown fact "${id}"`);
    return canShow(f, ctx);
  });
}

function needsMark(fs: Fact<unknown>[], ctx: Ctx): boolean {
  return ctx.mode === 'preview' && fs.some((f) => !f.ownerApproved);
}

function markAttrs(fs: Fact<unknown>[], ctx: Ctx): string {
  const status = weakest(fs.map((f) => (f.ownerApproved ? 'owner-confirmed' : f.status)));
  const label = t(ctx, `status.${status}`);
  return ` class="fact" data-fact="${esc(fs.map((f) => f.id).join(' '))}" data-status="${status}" data-label="${esc(label)}"`;
}

/** Wrap runs of Thai script inside English/Vietnamese text in lang="th" (LOC-05). */
export function langRuns(escaped: string, locale: Locale): string {
  if (locale === 'th') return escaped;
  return escaped.replace(/[\u0E00-\u0E7F]+(?:[ ]+[\u0E00-\u0E7F]+)*/g, (m) => `<span lang="th">${m}</span>`);
}

/** Inline wrapper for preview markers; production returns the content unchanged. */
export function marked(content: Raw | string, fs: Fact<unknown>[], ctx: Ctx, tag = 'span'): Raw {
  const inner = langRuns(content instanceof Object && 'html' in content ? (content as Raw).html : esc(content), ctx.locale);
  if (!needsMark(fs, ctx)) return raw(inner);
  return raw(`<${tag}${markAttrs(fs, ctx)}>${inner}</${tag}>`);
}

/** Render a fact's value (string facts) with its marker, or null when it may not show. */
export function fact(ctx: Ctx, f: Fact<unknown> | null | undefined): Raw | null {
  if (!canShow(f, ctx)) return null;
  return marked(String(val(f, ctx.locale)), [f], ctx);
}

/* ---------- copy ---------- */

function fill(s: string, vars: Record<string, string | number>): string {
  return s.replace(/\{(\w+)\}/g, (m, k: string) => (k in vars ? String(vars[k]) : m));
}

/** Plain copy string (UI text, website rules). Throws on a missing key or locale. */
export function t(ctx: Pick<Ctx, 'locale'>, key: string, vars: Record<string, string | number> = {}): string {
  const e = copy[key];
  if (!e) throw new Error(`missing copy key "${key}"`);
  const s = e[ctx.locale];
  if (!s) throw new Error(`missing ${ctx.locale} copy for "${key}"`);
  return fill(s, vars);
}

/** Fact-aware copy: null in production unless every fact it asserts is approved; marked in preview. */
export function tx(ctx: Ctx, key: string, vars: Record<string, string | number> = {}, opts: { phrases?: boolean } = {}): Raw | null {
  const e = copy[key];
  if (!e) throw new Error(`missing copy key "${key}"`);
  const deps = [...(e.facts ?? [])];
  const text = e[ctx.locale];
  if (text.includes('{brand}')) deps.push('brand.name');
  if (!factsShowable(deps, ctx)) return null;
  const v = { brand: String(val(brandName, ctx.locale)), ...vars };
  let s = esc(fill(text, v));
  if (opts.phrases && ctx.locale === 'th') s = phrases(s);
  const fs = deps.map((id) => factRegistry.get(id)!) as Fact<unknown>[];
  if (!fs.length) return raw(langRuns(s, ctx.locale));
  return marked(raw(s), fs, ctx);
}

/** Thai headings: break only between space-separated phrases (each phrase may still wrap
 *  internally when it alone is wider than the line, so nothing overflows on phones). */
export function phrases(escaped: string): string {
  return escaped.split(' ').map((w) => `<span class="ph">${w}</span>`).join(' ');
}

/** Plain-text version of tx (for <title>, meta, aria): null when it may not show. */
export function txPlain(ctx: Ctx, key: string, vars: Record<string, string | number> = {}): string | null {
  const e = copy[key];
  if (!e) throw new Error(`missing copy key "${key}"`);
  const deps = [...(e.facts ?? [])];
  if (e[ctx.locale].includes('{brand}')) deps.push('brand.name');
  if (!factsShowable(deps, ctx)) return null;
  return fill(e[ctx.locale], { brand: String(val(brandName, ctx.locale)), ...vars });
}

/* ---------- dates ---------- */

export function formatDate(iso: string, locale: Locale): string {
  const d = new Date(`${iso}T00:00:00+07:00`);
  const tag = locale === 'th' ? 'th-TH' : locale === 'vi' ? 'vi-VN' : 'en-GB';
  return new Intl.DateTimeFormat(tag, { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Bangkok' }).format(d);
}

/* ---------- routes ---------- */

export const ROUTES = {
  home: '',
  products: 'products/',
  oem: 'oem/',
  process: 'process/',
  quality: 'quality/',
  about: 'about/',
  contact: 'contact/',
  privacy: 'privacy/',
  accessibility: 'accessibility/',
} as const;

export const href = (locale: Locale, path: string): string => `/${locale}/${path}`;
export const productPath = (slug: string): string => `products/${slug}/`;
