/** Escaping template tag: every interpolation is escaped unless wrapped in raw(). */

export class Raw {
  readonly html: string;
  constructor(html: string) {
    this.html = html;
  }
  toString(): string {
    return this.html;
  }
}

export const raw = (s: string): Raw => new Raw(s);

export function esc(v: unknown): string {
  return String(v)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

type Part = Raw | string | number | boolean | null | undefined | Part[];

function part(v: Part): string {
  if (v === null || v === undefined || v === false || v === true) return '';
  if (Array.isArray(v)) return v.map(part).join('');
  if (v instanceof Raw) return v.html;
  return esc(v);
}

export function html(strings: TemplateStringsArray, ...values: Part[]): Raw {
  let out = '';
  strings.forEach((s, i) => {
    out += s;
    if (i < values.length) out += part(values[i] as Part);
  });
  return new Raw(out);
}

export const join = (items: Part[], sep = ''): Raw => raw(items.map(part).join(sep));

/** Attribute helper: attrs({ href, 'aria-current': cur ? 'page' : null }) */
export function attrs(map: Record<string, string | number | boolean | null | undefined>): Raw {
  return raw(
    Object.entries(map)
      .filter(([, v]) => v !== null && v !== undefined && v !== false)
      .map(([k, v]) => (v === true ? ` ${k}` : ` ${k}="${esc(v)}"`))
      .join(''),
  );
}
