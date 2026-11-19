/**
 * The PK mark, recoloured (owner, 19 Nov 2026: "maybe recolor their logo to make it feel more
 * premium"). Redrawn as vector from the 88 px 2014 GIF: the oval, the PK monogram and the two
 * rice-ear sprigs, in cream, natural gold and espresso. The arched lettering of the old mark is
 * left out on purpose: it spells the pre-2017 company name that now belongs to a different
 * company (see sources.ts). O2's working treatment until the company approves it (D21).
 */
import { raw, type Raw } from './html.ts';

/** Grains along a curved stem, computed once (no inline styles: CSP-safe). */
function sprig(): string {
  // Cubic stem from the base of the oval up toward the top, left side.
  const P = [[30, 74], [21, 60], [21, 40], [33, 22]] as const;
  const at = (t: number) => {
    const u = 1 - t;
    const x = u ** 3 * P[0][0] + 3 * u * u * t * P[1][0] + 3 * u * t * t * P[2][0] + t ** 3 * P[3][0];
    const y = u ** 3 * P[0][1] + 3 * u * u * t * P[1][1] + 3 * u * t * t * P[2][1] + t ** 3 * P[3][1];
    const dx = 3 * u * u * (P[1][0] - P[0][0]) + 6 * u * t * (P[2][0] - P[1][0]) + 3 * t * t * (P[3][0] - P[2][0]);
    const dy = 3 * u * u * (P[1][1] - P[0][1]) + 6 * u * t * (P[2][1] - P[1][1]) + 3 * t * t * (P[3][1] - P[2][1]);
    return { x, y, a: (Math.atan2(dy, dx) * 180) / Math.PI };
  };
  const grains: string[] = [];
  const ts = [0.22, 0.34, 0.46, 0.58, 0.7, 0.82];
  ts.forEach((t, i) => {
    const p = at(t);
    for (const side of [-1, 1]) {
      const nx = p.x + side * 3.4 * Math.cos(((p.a + 90) * Math.PI) / 180);
      const ny = p.y + side * 3.4 * Math.sin(((p.a + 90) * Math.PI) / 180);
      const rot = p.a + 90 + side * 28;
      grains.push(`<ellipse class="mk-grain mk-g${i}" cx="${nx.toFixed(2)}" cy="${ny.toFixed(2)}" rx="1.9" ry="4.1" transform="rotate(${rot.toFixed(1)} ${nx.toFixed(2)} ${ny.toFixed(2)})"/>`);
    }
  });
  const tip = at(1);
  grains.push(`<ellipse class="mk-grain mk-g6" cx="${tip.x.toFixed(2)}" cy="${(tip.y - 2.6).toFixed(2)}" rx="1.9" ry="4.2" transform="rotate(${(tip.a + 90).toFixed(1)} ${tip.x.toFixed(2)} ${(tip.y - 2.6).toFixed(2)})"/>`);
  return `<path class="mk-stem" pathLength="100" d="M${P[0].join(' ')} C${P[1].join(' ')} ${P[2].join(' ')} ${P[3].join(' ')}"/>${grains.join('')}`;
}

const SPRIG = sprig();

/**
 * @param id unique prefix for gradient ids (the header and the loader both use the mark)
 */
export function pkMark(id: string, cls: string, title?: string): Raw {
  const g = `${id}-gold`;
  const c = `${id}-cream`;
  return raw(`<svg class="${cls}" viewBox="0 0 140 96" ${title ? `role="img" aria-label="${title}"` : 'aria-hidden="true" focusable="false"'}>
<defs>
<linearGradient id="${g}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e9d39c"/><stop offset=".45" stop-color="#c49a4a"/><stop offset="1" stop-color="#8d6727"/></linearGradient>
<radialGradient id="${c}" cx=".42" cy=".3" r=".85"><stop offset="0" stop-color="#fffdf7"/><stop offset=".7" stop-color="#f7efdf"/><stop offset="1" stop-color="#ecdfc4"/></radialGradient>
</defs>
<ellipse class="mk-oval" pathLength="100" cx="70" cy="48" rx="66" ry="44" fill="url(#${c})" stroke="url(#${g})" stroke-width="2.4"/>
<ellipse class="mk-ring" pathLength="100" cx="70" cy="48" rx="60.5" ry="38.6" fill="none" stroke="url(#${g})" stroke-width=".8"/>
<g class="mk-sprig" fill="url(#${g})" stroke="url(#${g})">${SPRIG}</g>
<g class="mk-sprig mk-sprig--r" fill="url(#${g})" stroke="url(#${g})" transform="translate(140 0) scale(-1 1)">${SPRIG}</g>
<text class="mk-pk" x="70" y="60.5" text-anchor="middle">PK</text>
</svg>`);
}
