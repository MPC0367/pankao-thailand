# Premium UI/UX and media audit — what was built (20 Nov 2026)

The owner sent `Pankao_Thailand_Live_UI_UX_Premium_Audit.pdf` (31 pages, audited live build `eb5971e`) with no words. It was built on branch `o2/premium-audit-2026-11-20`. Measured by `npm run audit:metrics` (Chromium, public-preview build) and the full suites.

## The one change from the audit, by the owner's choice

**Opening.** The audit asked for 0.9–1.4 s and no replay on reload. Earlier that day the owner had asked to slow the animation down, so the choice was put to them. They chose "Full 4 s once, then skip": the logo forms in full on a visitor's first open in a session (root link included), and reloads and later visits show the page at once (`pk-seen`). It still never plays between the site's own pages, on back/forward, or under reduced motion.

## Audit item → state

| Audit item | Target | Now |
|---|---|---|
| P0 opening | ≤ 1.4 s, skip reload | First open plays (~4 s, the owner's choice); reload instant ✔ |
| P1 mobile chrome | preview + header ≤ 112 px at 390; one row; dismissible strip; anchors | **106 px** worst case across 320–430 px in th/en/vi, one row. The strip is one line on phones, closes for the session, and the footer keeps the preview note. The mark shrinks on scroll; `scroll-padding-top` follows the header ✔ |
| P1 media inventory | classify 61 legacy + stock; request originals | `docs/generated/MEDIA_INVENTORY.md` (`npm run media:inventory`): 61 files by source class, use and action, plus the request list (the audit's minimum asset pack) ✔ |
| P1 AI/enhancement | restore actual packs and textures; log every derivative | Real packs re-staged on cream (backdrop keyed out, cut-off edge faded; pack and print unaltered). Archive factory, trays, building and lab cleaned and enlarged; dish photos sized so no slot stretches them; dry close-ups CAS-sharpened. Every edit is in the ledger's "crop and edit log". The side-by-side review is in `../documents/photos/enhanced-2026-11-20/side-by-side.png`. Nothing generative ✔ |
| P1 new photography | factory, process, QA, packing, people | **Company to supply.** The shot list is in the media inventory |
| P1 OEM | 6–7 required inputs; optional second step; proof media; "prepare/copy/download" | **7** required (company, name, email, country, main format, message, consent); volume optional. Role, phone, business type, formats, application, need, packaging, timeline and documents sit in "Add more detail (optional)", which opens itself on an error or a restored draft. The button reads "Prepare my brief" on the public preview. **4** of the company's own photos under the OEM opening. Fax left out of the form's contact list ✔ |
| P1 trust | verify identity, claims, certificates, contacts | **Company to supply** (D02, D05–D10, D18). Nothing new is claimed; samples and the 2014 words stay tagged |
| P2 homepage | 8.5–9.5 phone screens; hero → proof strip → products → OEM → process + quality → heritage + place → CTA | **8.3** (en) / **8.1** (th) screens, in that order. The welcome and slogan moved to About; "BEST Quality" and the marks to Quality (a short line stays on home); the empty review grid is gone from the public build; tighter section rhythm on phones; products 2 × 2 on phones ✔ |
| P2 visual refinement | captions with source class; one ratio per component; UI motion 160–240 ms; no blurred arrivals | One caption system: a filled dot marks the company's own 2014 photograph, an open ring a licensed illustrative one. Proof frames 4:5, cards 4:3, serving ideas 3:2. `--t-ui` 200 ms. Photographs arrive without fading ✔ |
| Proof alignment | images that prove each section's claim | Quality: the actual 2014 lab photograph instead of rice paddies. Products: the real packs instead of generic vermicelli (both stock photos removed from the site). Process: enhanced archive stages at their own proportions. Product pages: specification before the serving idea ✔ |
| P2 native review | th/en/vi sign-off | **People to supply** |

## Checks (20 Nov 2026)

- **Code and builds:** unit 27/27; crawls of the preview, public and production builds all pass.
- **Browser suites:** e2e 35/35 (WebKit + Chromium, including axe with no critical or serious findings); Pages smoke 7/7.
- **Audit targets:** `audit:metrics` all met.
- **Tests amended:** MED-04 treats `.proof` frames as filled photo frames (the owner's 19 Nov decision); the truth test knows the new tagged blocks.

## The way back

Published 20 Nov 2026 as `gh-pages` `8c0c623` (source `f32a2b5`). The live preview before it is `gh-pages` `eb5971e` (source `5b3266d`).
