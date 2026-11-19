import { assets as ledger } from '../../src/content/assets.ts';
import type { Assets } from '../../src/build/assets-out.ts';
import type { Ctx } from '../../src/build/context.ts';
import type { Locale, Mode } from '../../src/content/types.ts';

/** Asset paths without touching the filesystem. */
export function fakeAssets(): Assets {
  return {
    css: '/assets/site.css',
    headJs: '/assets/head.js',
    siteJs: '/assets/site.js',
    media: new Map(ledger.map((a) => [a.id, { src: `/media/${a.id}.jpg`, webp: `/media/${a.id}.webp`, width: a.width, height: a.height }])),
  };
}

export const ctx = (mode: Mode, locale: Locale = 'en', path = ''): Ctx => ({ mode, locale, path, buildDate: '2026-11-19' });

/** Visible public text: strips review notes, scripts and tags. */
export function publicText(html: string): string {
  return html
    .replace(/<aside class="review-note"[\s\S]*?<\/aside>/g, ' ')
    .replace(/<script[\s\S]*?<\/script>/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ');
}
