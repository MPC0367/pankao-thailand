/**
 * Images and their honest fallbacks. An image renders only when its ledger entry allows it
 * in this mode (preview: any recorded asset; production: productionApproved only). Display
 * size never exceeds the asset's native pixels.
 */
import { assetById } from '../content/assets.ts';
import type { Product } from '../content/types.ts';
import type { Assets } from './assets-out.ts';
import { loc, t, type Ctx } from './context.ts';
import { attrs, html, raw, type Raw } from './html.ts';

export function assetAllowed(ctx: Pick<Ctx, 'mode'>, id: string): boolean {
  const a = assetById.get(id);
  if (!a) throw new Error(`asset "${id}" is not in the asset ledger`);
  if (ctx.mode === 'production') return a.productionApproved;
  return true;
}

type ImgOpts = { cls?: string; decorative?: boolean; eager?: boolean; sizes?: string; extra?: Record<string, string> };

export function assetImg(ctx: Ctx, assets: Assets, id: string, opts: ImgOpts = {}): Raw | null {
  if (!assetAllowed(ctx, id)) return null;
  const a = assetById.get(id)!;
  const out = assets.media.get(id);
  if (!out) throw new Error(`asset "${id}" has no built file (run npm run media)`);
  const alt = opts.decorative ? '' : loc(a.alt, ctx.locale);
  const img = html`<img src="${out.src}" width="${out.width}" height="${out.height}" alt="${alt}"${attrs({
    class: opts.cls ?? null,
    loading: opts.eager ? null : 'lazy',
    decoding: 'async',
    'data-asset': id,
    ...(opts.extra ?? {}),
  })}>`;
  if (!out.webp) return img;
  return html`<picture${opts.cls ? '' : ''}><source type="image/webp" srcset="${out.webp}">${img}</picture>`;
}

export function credit(ctx: Ctx, id: string): string {
  const a = assetById.get(id);
  return a?.credit ? loc(a.credit, ctx.locale) : '';
}

/** Typeset product plate: the fallback when no approved photograph exists. Decorative. */
export function strandPlate(product: Pick<Product, 'strand'>, label: string): Raw {
  return html`<div class="strand-plate" data-strand="${product.strand}" aria-hidden="true"><span>${label}</span></div>`;
}

/**
 * Pack ↔ prepared-dish media (M6). Hover/focus on fine pointers, a labelled toggle on
 * every device, instant under reduced motion. Falls back to the strand plate.
 */
export function packDish(ctx: Ctx, assets: Assets, product: Product, label: string, idSuffix: string): Raw {
  const dry = product.media.pack ? assetImg(ctx, assets, product.media.pack, { cls: 'view-dry' }) : null;
  const dish = product.media.dish ? assetImg(ctx, assets, product.media.dish, { cls: 'view-dish' }) : null;
  const plate = strandPlate(product, dry ? '' : label);
  if (!dry) return html`<div class="format-card__media stripe-${product.stripe}">${plate}</div>`;
  const mediaId = `media-${product.id}-${idSuffix}`;
  return html`<div class="format-card__media stripe-${product.stripe}" id="${mediaId}" data-view="pack">
    ${plate}${dry}${dish ?? ''}
  </div>
  ${dish ? html`<button class="view-toggle" type="button" aria-pressed="false" aria-controls="${mediaId}" data-view-toggle>${t(ctx, 'products.show.cooked')}</button>` : ''}`;
}

export const nothing = raw('');
