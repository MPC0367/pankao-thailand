/**
 * Content schema validation (runs before rendering) and output guards (run on every
 * generated file). Any problem stops the build with the exact content ID.
 */
import { assetById, assets } from '../content/assets.ts';
import { certificates, claims, documents } from '../content/claims.ts';
import { decisions } from '../content/decisions.ts';
import { products } from '../content/products.ts';
import { MANUFACTURER_REGISTRATION, rejectedEntities, sourceById } from '../content/sources.ts';
import { LOCALES, type Fact, type Mode } from '../content/types.ts';
import { copy, factRegistry, isLocalized } from './context.ts';

export class BuildError extends Error {}

export function validateContent(): string[] {
  const errs: string[] = [];
  const need = (ok: unknown, msg: string) => { if (!ok) errs.push(msg); };

  // Facts: sources exist, never cite a rejected source, localized values complete.
  for (const [id, f] of factRegistry) {
    need(f.sourceIds.length > 0, `fact ${id}: no source`);
    for (const s of f.sourceIds) {
      const src = sourceById.get(s);
      need(src, `fact ${id}: unknown source ${s}`);
      need(src?.appliesToEntity !== 'rejected-restaurant', `fact ${id}: cites rejected source ${s}`);
    }
    if (isLocalized(f.value)) for (const l of LOCALES) need((f.value as Record<string, unknown>)[l] !== undefined && (f.value as Record<string, unknown>)[l] !== '', `fact ${id}: missing ${l} value`);
    need(!(f.ownerApproved && !f.ownerApprovalRef), `fact ${id}: owner-approved without an approval reference`);
  }

  // Copy: every key complete in every locale (LOC-01/02); fact dependencies exist.
  for (const [key, e] of Object.entries(copy)) {
    for (const l of LOCALES) need(typeof e[l] === 'string' && e[l].trim().length > 0, `copy ${key}: missing ${l} translation`);
    for (const f of e.facts ?? []) need(factRegistry.has(f), `copy ${key}: depends on unknown fact ${f}`);
  }

  // Products: unique ids/slugs, valid references, SKU fields never hold a placeholder.
  const ids = new Set<string>();
  const slugs = new Set<string>();
  for (const p of products) {
    need(!ids.has(p.id), `product ${p.id}: duplicate id`);
    need(!slugs.has(p.slug), `product ${p.id}: duplicate slug ${p.slug}`);
    need(/^[a-z0-9-]+$/.test(p.slug), `product ${p.id}: slug must be lowercase ascii`);
    ids.add(p.id);
    slugs.add(p.slug);
    for (const r of p.related) need(products.some((x) => x.id === r), `product ${p.id}: related ${r} missing`);
    for (const c of p.claimIds) need(claims.some((x) => x.id === c), `product ${p.id}: claim ${c} missing`);
    for (const dId of p.documentIds) need(documents.some((x) => x.id === dId), `product ${p.id}: document ${dId} missing`);
    for (const m of Object.values(p.media)) if (m) need(assetById.has(m), `product ${p.id}: asset ${m} not in ledger`);
    for (const l of LOCALES) need(p.altNames[l] !== undefined, `product ${p.id}: altNames missing ${l}`);
  }

  // Claims: company and product claims are separate records (QLT-04).
  for (const c of claims) {
    if (c.level === 'company') need(!c.productId, `claim ${c.id}: company claim must not name a product`);
    else need(c.productId && products.some((p) => p.id === c.productId), `claim ${c.id}: product claim needs an existing productId`);
    for (const cert of c.certificateIds) need(certificates.some((x) => x.id === cert), `claim ${c.id}: certificate ${cert} missing`);
  }

  // Certificates: every public field present.
  for (const c of certificates) {
    for (const k of ['standard', 'operator', 'facility', 'issuer', 'number', 'issuedOn', 'expiresOn'] as const) need(c[k], `certificate ${c.id}: missing ${k}`);
    need(c.issuedOn < c.expiresOn, `certificate ${c.id}: expiry before issue`);
  }

  // Documents: approved documents need a version, date, size and file.
  for (const d of documents) need(d.file && d.version && d.bytes > 0, `document ${d.id}: incomplete metadata`);

  // Assets: never enlarge, complete alt text, generated images never claim to be actual.
  for (const a of assets) {
    need(a.maxDisplayWidth <= a.width, `asset ${a.id}: display slot wider than the file (${a.maxDisplayWidth} > ${a.width})`);
    need(!(a.rightsBasis === 'generated' && a.actualPankaoOrGeneric === 'actual-pankao'), `asset ${a.id}: generated image tagged as actual facility/product (media-truth error)`);
    need(!(['licensed-stock', 'generated'].includes(a.rightsBasis) && a.actualPankaoOrGeneric === 'actual-pankao'), `asset ${a.id}: stock or generated image cannot depict the actual company`);
    need(!(a.rightsBasis === 'research-only' && a.productionApproved), `asset ${a.id}: research-only asset cannot be production-approved`);
    need(!(a.productionApproved && !a.permissionReference), `asset ${a.id}: production-approved without a permission reference`);
  }

  need(new Set(decisions.map((x) => x.id)).size === decisions.length, 'decisions: duplicate id');
  return errs;
}

/* ---------------- output guards ---------------- */

const MARKERS = [/\[VERIFY/i, /\bTODO\b/, /\bTBC\b/, /lorem ipsum/i, /\bLOREM\b/, /\[object Object\]/, /\bundefined\b/, /\bNaN\b/];

export type GuardContext = { mode: Mode; allowedMedia: Set<string> };

/** Returns problems found in one generated text file. */
export function guardOutput(file: string, text: string, g: GuardContext): string[] {
  const out: string[] = [];
  for (const r of rejectedEntities) for (const s of r.forbiddenStrings) if (text.includes(s)) out.push(`${file}: contains rejected-entity string "${s}" (${r.id})`);
  for (const m of MARKERS) if (m.test(text)) out.push(`${file}: contains internal marker ${m}`);
  const regs = text.match(/\b0\d{12}\b/g) ?? [];
  for (const reg of regs) if (reg !== MANUFACTURER_REGISTRATION) out.push(`${file}: unknown 13-digit registration ${reg}`);
  if (g.mode === 'production') {
    if (text.includes(MANUFACTURER_REGISTRATION)) out.push(`${file}: legal registration rendered without owner approval (D02)`);
    for (const s of ['class="fact"', 'review-note', 'preview-bar', 'data-review-toggle', 'noindex']) if (text.includes(s) && !(s === 'noindex' && (/404/.test(file) || file === 'index.html'))) out.push(`${file}: production output contains preview-only markup "${s}"`);
    for (const m of text.matchAll(/data-asset="([^"]+)"/g)) if (!g.allowedMedia.has(m[1]!)) out.push(`${file}: renders unapproved asset ${m[1]}`);
  }
  return out;
}

export function factApprovalSummary(): { approved: number; total: number; unapproved: Fact<unknown>[] } {
  const all = [...factRegistry.values()].filter((f) => f.visibility === 'public');
  const unapproved = all.filter((f) => !f.ownerApproved);
  return { approved: all.length - unapproved.length, total: all.length, unapproved };
}
