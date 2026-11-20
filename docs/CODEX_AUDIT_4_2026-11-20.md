# Codex audit, fourth edition: what was built (20 Nov 2026, afternoon)

**The request.** The owner asked: "Run another Codex audit on the live site". After reading the report they said: "Yes, build them". The build ran on localhost first; after reviewing it the owner said "Yes, publish".

**Published 20 Nov 2026, about 14:25 Bangkok:** `o2/pankao-greenfield-build` fast-forwarded to `69d787f` and pushed, GitHub Pages `gh-pages` `5077ab8` from `69d787f`. Live checks: `pages-smoke --url` 13/13 (42 pages × WebKit and Chromium, the three unknown-page 404s, the OEM link, 60 product jumps; HTML, CSS and the 63 KB hero WebP all `max-age=600`), `audit:metrics --url` all targets met, and the hosted "Post-deploy checks" run on `69d787f` passed. The way back is `gh-pages` `785148b`.

**The audit.** Codex audited the live build `785148b` (from `3b75089`) and scored it 7.9/10, up from 7.8. It estimated that O2 alone could reach about 8.2.
- Report: `../documents/audits/Pankao_Codex_Website_Audit_2026-11-20_fourth_edition.md`.
- O2's own browser run of the live site, which Codex read because its sandbox cannot start a browser: `../documents/audits/evidence-2026-11-20-fourth/`.
- Claude checked each "O2 now" claim on the live site before building. One was overstated: F17.5 counted the JPEG fallbacks. The pages already serve WebP through `<picture>`, so the hero is 64 KB, not 159.5 KB.

**The build.** Local branch `o2/codex-audit-4-2026-11-20`, from `2cd72ee`.

## Built

| Finding | What changed | Check |
|---|---|---|
| **F19.2 (P0)** The public repository carried the unrelated 2024 company's name, registration and address, and the manufacturer's former English name, as searchable text | The build guard's 18 strings are now base64 of a UTF-8 JSON array in `src/content/data/blocked-strings.json`, decoded in `src/content/sources.ts`. `rejected-entity.json` left the repo; the full record is in O2's private `documents/research/`. Sources, raster notes, the generated reports, HANDOVER and PREFLIGHT now say "the pre-2017 name" | A new unit test fails if any tracked text file contains a blocked identity string. The guard test checks every decoded string. **History rewritten on 20 Nov 2026** at the owner's word (see HANDOVER → Current state); a gap found on the way, the Yellow Pages link spelling the name percent-encoded, is fixed and the test now catches link-encoded forms (`71aa0b9`) |
| **F17.4** Unknown `/en/` and `/vi/` addresses showed the Thai 404 page (GitHub Pages serves one root `404.html`) | The root 404 carries the English and Vietnamese pages in `<template>`s. `src/client/notfound.js` (deferred, before `site.js`) swaps in the one for the address, with its `lang`, title and description. The status stays 404, and without script the Thai page stays. `scripts/serve.ts` now serves a base-path build the way GitHub does | `pages-smoke`: th/en/vi unknown pages return 404 with the matching `lang`, one h1 and four links in that language (WebKit and Chromium). `crawl:pages` checks that the templates and script are present |
| **F13.4** The OEM phone link reappeared after the form had scrolled away, and came after the form in reading order | It now sits right after the proof section in the DOM. It shows only while the brief is still ahead (`briefAhead` = not yet in view and below), so scrolling back above the form brings it back | `pages-smoke`: it lies between the proof and `#brief` in reading order; across a scroll of the whole page at 390 px, it never covers a form control, summary or footer link, and never shows once the brief is reached |
| **F15.5** The phone footer split the email, leaving "m" alone on a line | A `<wbr>` after the @ in `contactLines`, so it breaks as "name@" / "host". Copying still gives the whole address | The footer email is 2 lines, "pk_pankao@" and "hotmail.com", and copies as one address |
| **F11.1 / F06.1** A large blank pause under the Mr. Noodles card, and the same pack photo twice | The products index printed an empty 144 px review-notes box in the public and production builds; it now renders only in the private review build. The "Our noodles" band no longer repeats the pack photo | Gap from the list to the band: about 330 px down to 187 px. Products is **4.2** desktop screens (was 4.7) |
| **F17.5** First-screen images were lazy; one width per photo | The first two cards on the products index and the product page's top photo load eagerly (the latter with `fetchpriority="high"`). The seven 1600 px illustrations also get an 800 px WebP through `srcset`/`sizes` (the wide one uses `(min-width: 1360px) 1280px, 100vw`) | e2e MED-04: no image renders above its native size. `crawl` checks every srcset candidate |
| **F05.2** Hosted checks sampled templates only | `pages-smoke` now covers every generated page (42 = 14 routes × 3 languages, product pages read from the products index), unknown pages in three languages, the OEM link, every product jump (60 on 15 pages) and axe on 8 routes × 3 languages. It also records cache headers and the hero's WebP weight | 13/13 locally. The GitHub workflow runs the same file |
| **F05.3** HANDOVER's first paragraph said "nothing is online" | A "Current state" block opens the handover: preview live at `785148b`, this branch unpublished, production not launched, the way back | — |
| F17.6 Cache headers | Not changed. GitHub Pages sets `max-age=600` on everything and ignores `_headers`; production's `_headers` already set one year, immutable. The smoke test records the policy | — |

## Measured (local)

| Check | Result |
|---|---|
| `npm run check` (typecheck, unit 28/28, preview and production builds, crawls, reports) | Pass |
| `npm run e2e` | 35/35 |
| `pages-smoke` | 13/13 |
| `crawl:pages` | Pass (55 images, srcset candidates included) |
| `audit:metrics` | 18/18 |

Audit-metric figures:
- Products 4.2 desktop screens.
- Home 8.3/8.1 phone screens.
- OEM 8.2.
- Quality 6.0.
- About 5.2.
- Header 106 px.

## Review on localhost

| Preview | Address |
|---|---|
| `pankao-pages` (public build) | http://localhost:4532/pankao-thailand/en/products/ |
| Unknown page, for the 404 language | e.g. http://localhost:4532/pankao-thailand/vi/khong-co/ |
| `pankao` (review build) | http://localhost:4530 |

## How it was published

1. Ship check: Ready (the checks above; no pricing, secrets or private files in the diff; `noindex`; the O2 credit last).
2. Fast-forwarded `o2/pankao-greenfield-build` to this branch and pushed it, so the fourth-edition `pages-smoke` is now what the post-deploy workflow runs.
3. `npm run pages:deploy` → `gh-pages` `5077ab8`.
4. `pages-smoke` and `audit:metrics` against the live address; the hosted workflow passed too.

The way back is `gh-pages` `785148b`.
