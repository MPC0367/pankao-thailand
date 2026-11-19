"""Draw the lettering of Pankao's oval logo as vector outlines (no text in the output).

The owner chose (19 Nov 2026) that the forming logo keeps the 2014 logo's exact wording: the
company name in Thai along the top arc and in English along the bottom, with PK in the middle.
That wording is the pre-2017 company name, which is now also the legal name of an unrelated
company, so it must never appear on the site as text: it is drawn here as outlines from Trirong
(SIL OFL, already self-hosted) and written to src/build/logo-art.ts as path data only. The
strings are kept as escapes so a text search of the repository does not match them either.

  uv run --no-project --with fonttools --with brotli --with uharfbuzz python3 scripts/logo/make-logo-art.py
"""
import io
import math
import os

import uharfbuzz as hb
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.ttLib import TTFont

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
FONTS = os.path.join(ROOT, 'src', 'fonts')
OUT = os.path.join(ROOT, 'src', 'build', 'logo-art.ts')

# The 2014 logo's arcs, word by word (Thai has no space glyph in the Thai subset).
TOP_WORDS = ['\u0e1a\u0e23\u0e34\u0e29\u0e31\u0e17', '\u0e1b\u0e31\u0e49\u0e19\u0e02\u0e49\u0e32\u0e27', '\u0e08\u0e33\u0e01\u0e31\u0e14']
BOTTOM_WORDS = ['\u0050\u0041\u004e', '\u004b\u0041\u004f', '\u0043\u004f\u002e\u002c\u004c\u0054\u0044\u002e']
MONOGRAM = 'PK'

# Geometry in the mark's 140 x 96 viewBox (oval centre 70,48; inner ring 60.5 x 38.6).
TOP = dict(size=7.8, cx=70, cy=51.5, a=46.5, b=31.0, side=-1, gap=0.32, track=0.0)
BOTTOM = dict(size=6.2, cx=70, cy=45.0, a=46.0, b=33.5, side=1, gap=0.3, track=0.07)
PK = dict(size=37.0, x=70, y=61.0, track=0.02)


def load(name):
    f = TTFont(os.path.join(FONTS, name))
    f.flavor = None
    buf = io.BytesIO()
    f.save(buf)
    data = buf.getvalue()
    font = TTFont(io.BytesIO(data))
    return font, hb.Font(hb.Face(data)), font['head'].unitsPerEm


def num(v):
    s = f'{v:.2f}'.rstrip('0').rstrip('.')
    return '0' if s in ('-0', '') else s


def shape_words(hbf, words, upem, gap, track):
    """Glyph runs grouped into clusters, laid out on one baseline in font units."""
    clusters, pen = [], 0.0
    for wi, w in enumerate(words):
        buf = hb.Buffer()
        buf.add_str(w)
        buf.guess_segment_properties()
        hb.shape(hbf, buf, {})
        groups = {}
        x = pen
        for info, pos in zip(buf.glyph_infos, buf.glyph_positions):
            g = groups.setdefault(info.cluster, {'start': x, 'adv': 0.0, 'glyphs': []})
            g['glyphs'].append((info.codepoint, x + pos.x_offset, pos.y_offset))
            g['adv'] += pos.x_advance
            x += pos.x_advance
        for c in sorted(groups):
            g = groups[c]
            clusters.append(g)
        pen = x + track * upem * len(groups)
        if wi < len(words) - 1:
            pen += gap * upem
    # Spread tracking evenly between clusters.
    if track:
        shift = 0.0
        for g in clusters:
            g['start'] += shift
            g['glyphs'] = [(gid, gx + shift, gy) for gid, gx, gy in g['glyphs']]
            shift += track * upem
    width = max(g['start'] + g['adv'] for g in clusters)
    return clusters, width


def arc_table(cx, cy, a, b, side, n=4000):
    pts = []
    for i in range(n + 1):
        t = math.pi - math.pi * i / n  # left to right
        pts.append((t, cx + a * math.cos(t), cy + side * b * math.sin(t)))
    lens = [0.0]
    for i in range(1, len(pts)):
        lens.append(lens[-1] + math.dist(pts[i][1:], pts[i - 1][1:]))
    return pts, lens


def at_length(pts, lens, s):
    lo, hi = 0, len(lens) - 1
    while lo < hi - 1:
        mid = (lo + hi) // 2
        if lens[mid] < s:
            lo = mid
        else:
            hi = mid
    t0, x0, y0 = pts[lo]
    t1, x1, y1 = pts[hi]
    k = 0 if lens[hi] == lens[lo] else (s - lens[lo]) / (lens[hi] - lens[lo])
    x, y = x0 + (x1 - x0) * k, y0 + (y1 - y0) * k
    phi = math.atan2(y1 - y0, x1 - x0)
    return x, y, phi


def draw(font, gid, xx, xy, yx, yy, dx, dy):
    gs = font.getGlyphSet()
    pen = SVGPathPen(gs, ntos=num)
    gs[font.getGlyphName(gid)].draw(TransformPen(pen, (xx, xy, yx, yy, dx, dy)))
    return pen.getCommands()


def arc_text(fontfile, words, cfg):
    font, hbf, upem = load(fontfile)
    clusters, width = shape_words(hbf, words, upem, cfg['gap'], cfg['track'])
    s = cfg['size'] / upem
    pts, lens = arc_table(cfg['cx'], cfg['cy'], cfg['a'], cfg['b'], cfg['side'])
    mid = lens[-1] / 2
    out = []
    for g in clusters:
        anchor = g['start'] + g['adv'] / 2
        px, py, phi = at_length(pts, lens, mid - width * s / 2 + anchor * s)
        c, si = math.cos(phi), math.sin(phi)
        d = ''
        for gid, gx, gy in g['glyphs']:
            ox, oy = gx - anchor, gy
            d += draw(font, gid, s * c, s * si, s * si, -s * c,
                      px + s * (c * ox + si * oy), py + s * (si * ox - c * oy))
        if d:
            out.append(d)
    return out


def straight(fontfile, text, cfg):
    font, hbf, upem = load(fontfile)
    clusters, width = shape_words(hbf, [text], upem, 0, cfg['track'])
    s = cfg['size'] / upem
    x0 = cfg['x'] - width * s / 2
    out = []
    for g in clusters:
        d = ''
        for gid, gx, gy in g['glyphs']:
            d += draw(font, gid, s, 0, 0, -s, x0 + gx * s, cfg['y'] - gy * s)
        out.append(d)
    return out


top = arc_text('trirong-600-thai.woff2', TOP_WORDS, TOP)
bottom = arc_text('trirong-600-latin.woff2', BOTTOM_WORDS, BOTTOM)
pk = straight('trirong-600-latin.woff2', MONOGRAM, PK)

ts = lambda name, arr: f'export const {name}: readonly string[] = [\n' + ''.join(f"  '{d}',\n" for d in arr) + '];\n'
with open(OUT, 'w', encoding='utf-8') as fh:
    fh.write('/**\n * Generated by scripts/logo/make-logo-art.py (do not edit by hand): the lettering of the 2014 oval\n'
             ' * logo as outlines from Trirong (SIL OFL), one path per letter cluster so the loader can form them\n'
             ' * one by one. Path data only: the wording is never present as text (owner decision, 19 Nov 2026).\n */\n')
    fh.write(ts('LOGO_TOP', top))
    fh.write(ts('LOGO_BOTTOM', bottom))
    fh.write(ts('LOGO_PK', pk))
print(f'top {len(top)} clusters, bottom {len(bottom)}, PK {len(pk)} -> {os.path.relpath(OUT, ROOT)}')
