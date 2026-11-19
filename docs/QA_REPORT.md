# QA, performance and accessibility report — 19 Nov 2026

Status: **VERIFIED LOCALLY** (this Mac, local server mirroring Cloudflare Pages `_redirects`/`_headers`). Not staged, not live. Raw output: `qa-output/` (check.log, e2e.log/e2e.json, crawl-*.json, perf.json).

## B. Verification (brief §16.1 B)

| Check | Run | Tool / browser / profile | Result | Evidence | Limitation |
|---|---|---|---|---|---|
| Typecheck | yes | tsc 5.9 strict | pass | check.log | — |
| Content schema + locale parity + media rules | yes | `validateContent` | 0 errors; 359 copy keys × th/en/vi | unit | — |
| Unit tests | yes | node:test | 25/25 | check.log | — |
| Preview build + output guards | yes | build.ts | 42 pages, 98 files, guards passed | check.log | — |
| Production rehearsal + guards | yes | build.ts | 27 pages (no product approved yet), 0 preview markup, release BLOCKED (20) | dist-production/release-manifest.json | — |
| Route crawl, both builds | yes | crawl.ts over HTTP | preview 43 pages, 49 links, 36 images, 30 redirects; production 28 pages, 34 links, 30 redirects — all pass | crawl-*.json | Edge redirects untested until cutover |
| Core journeys ×3 locales | yes | Playwright 1.63, WebKit + Chromium | pass | e2e.json | Not real devices |
| Form states (success, validation, 500, retry, slow, duplicate, 429, offline) | yes | WebKit + Chromium vs local test adapter | pass | e2e.json | Real backend not built (D11) |
| Language switch with product and draft | yes | WebKit + Chromium | pass | e2e.json | — |
| Filters, deep links, back/forward, reset | yes | WebKit + Chromium | pass | e2e.json | — |
| Pack ↔ cooked: pointer, keyboard, touch | yes | WebKit + Chromium (touch context) | pass | e2e.json | — |
| Drawer focus containment and return | yes | WebKit + Chromium | pass | e2e.json | — |
| Map only after consent; copy address | yes | Chromium (request log) | pass | e2e.json | Pin accuracy is a human check |
| Opening sequence | yes | Chromium, hero image delayed 2 s | first visit only; reveal starts 722 ms, ends ≈ 1.18 s; headline readable throughout; skipped on return | e2e.json | — |
| Reduced motion | yes | Chromium emulation | no opening, all content visible, process thread static | e2e.json | — |
| No JavaScript | yes | Chromium, JS off | 5 pages × 3 locales usable; all 5 products listed | e2e.json | — |
| Overflow | yes | Chromium | 0 at 320, 360, 375, 390, 430, 768, 1024, 1366, 1440, 1920 × 3 locales × 12 templates | e2e.json | — |
| 200% text | yes | Chromium, root font 200% at 640 px | no sideways scroll (after letting e-mail addresses wrap) | e2e.json | Browser zoom UI not driven |
| Images never enlarged | yes | Chromium | 235 renders ≤ native pixels at 5 widths | e2e.json | — |
| Target size / header height | yes | Chromium 390 × 844 | all ≥ 44 × 44; header 65 px (7.7%) | e2e.json | — |
| axe-core 4.14 (WCAG 2.0–2.2 A/AA + best practice) | yes | Chromium | 39 scans (12 templates × 3 locales + error state, review notes, drawer): 0 critical/serious | e2e.json | Automated only |
| Contrast of every token pair | yes | unit (WCAG formula) | all text ≥ 4.5:1, controls/focus ≥ 3:1 | unit | — |
| Screenshot matrix | yes | WebKit | 123 PNG | ../documents/screenshots/build-2026-11-19/ | — |
| Performance | yes | see below | within budget | perf.json | Local server, no CDN/compression |
| Dependency audit | yes | npm audit | 0 vulnerabilities; 0 runtime dependencies | — | — |
| Release gate | yes | gate.ts | BLOCKED (18 open decisions, 42 unapproved facts, 18 images, copy unreviewed) | — | Expected |

## Performance (brief §11.3, §14.6)

Profile: Chromium, 390 × 844 @3x, 4× CPU slowdown, 1.6 Mbps down / 750 kbps up, 150 ms RTT, cold cache, 3 runs (median, range) + 1 warm run; Thai pages; local server **without compression** (Cloudflare will gzip/brotli: CSS 38 → 8.5 KB, JS 24 → 7.8 KB).

| Page | LCP median (range) | CLS | Blocking | Menu input → paint | Transfer (uncompressed) | JS | Warm LCP / transfer | 3rd party |
|---|---|---|---|---|---|---|---|---|
| Home | 800 ms (796–816) | 0 | 38 ms | 96 ms | 150 KB | 25 KB | 276 ms / 35 KB | 0 |
| Products | 712 ms (708–716) | 0 | 9 ms | 66 ms | 132 KB | 25 KB | 272 ms / 30 KB | 0 |
| Product | 704 ms (696–708) | 0 | 9 ms | 66 ms | 114 KB | 25 KB | 268 ms / 28 KB | 0 |
| OEM | 764 ms (756–824) | 0 | 0 ms | 27 ms | 138 KB | 25 KB | 288 ms / 39 KB | 0 |
| Contact | 752 ms (752–756) | 0 | 0 ms | 22 ms | 114 KB | 25 KB | 288 ms / 28 KB | 0 |

Budgets: LCP ≤ 2.5 s ✔ · CLS < 0.1 (preferred < 0.02) ✔ · JS ≤ 100 KB ✔ · page ≤ 500 KB ✔ · no third party before consent ✔ · fonts: one preloaded Trirong subset per locale (9–13 KB each).

## Accessibility (brief §11.4, §14.5)

Tested: semantic landmarks, skip link, one H1 per page, heading order (axe), keyboard on navigation, drawer, filters, toggles, map button and forms (WebKit + Chromium), focus ring 3 px, focus containment and return, error summary with field links and `aria-invalid`/`aria-describedby`, live regions for result counts and form status, `lang` on every page and Thai runs, reflow 320 px and 200 % text, reduced motion, increased contrast tokens, 44 px targets.

**Not tested (human checks still required, §14.8):** VoiceOver (iPhone/Mac), TalkBack, NVDA; a real iPhone in Safari; a real Android phone in Chrome; LINE's in-app browser; native Thai and Vietnamese copy review; a real enquiry reaching a real inbox; the map pin on site; certificates with their issuers; legal/privacy review. The accessibility statement on the site says so and claims no full conformance.

## Defects found and fixed during verification

| Found by | Defect | Fix |
|---|---|---|
| Output guard | Review note named the restaurant's district | Reworded; guard keeps blocking it |
| Visual check | Thai nav wrapped at 1024 px; Thai H1 broke mid-phrase | Nav collapses below 1180 px; Thai headings break only between phrases |
| Visual check | 2014 photos and the hero pack were enlarged up to 1.8× | Specimens at native size; hero grain fixed at 190 × 258 |
| Crawl | Production OEM title fell back to "OEM" | Descriptive fallbacks per page |
| e2e (WebKit) | `upgrade-insecure-requests` broke scripts on http://localhost | Local server only drops that directive; deployed headers keep it |
| e2e | Drawer focus left the dialog; map iframe lazy after consent; footer links 33 px wide | Focus trap; eager map; 44 px min-width |
| e2e | E-mail address overflowed at 200 % text | Long addresses wrap |
| Contact screenshot | Phone/fax/email squeezed into a label column | Single-column channel list |
| Unit fixture | Document download did not state its language | Language shown with version, date, type, size |
| Opening test | Worst case with a slow image ended ≈ 1.56 s | Cap at 720 ms → ends ≈ 1.18 s |
