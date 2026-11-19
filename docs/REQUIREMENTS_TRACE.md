# Requirement and acceptance trace (brief Parts IV and V)

Labels as the brief defines them. **VERIFIED LOCALLY** = reproduced on this Mac by a recorded check (unit = `npm test`, crawl = `npm run crawl`, e2e = `npm run e2e`, perf = `npm run perf`, gate = `npm run gate`). Nothing here is staging- or live-verified. Evidence files: `qa-output/`, `../documents/screenshots/build-2026-11-19/`.

## Part IV — 86 controlled requirements

| ID | Status | Evidence / reason |
|---|---|---|
| GOV-01 | VERIFIED LOCALLY | One manufacturer record (`facts.ts` legal.*, `MANUFACTURER_REGISTRATION`); unit AC-ID-01 |
| GOV-02 | VERIFIED LOCALLY | `rejectedEntities` + output guard over every HTML/JSON/XML/TXT in both builds; unit AC-ID-02 |
| GOV-03 | VERIFIED LOCALLY | No deploy, DNS or send code exists; gate exits 1; RUNBOOK needs the owner token |
| GOV-04 | VERIFIED LOCALLY | Components render facts via `fact()`/`tx()`; copy declares `facts`; unit GOV-05 traces home.h1 |
| GOV-05 | VERIFIED LOCALLY | Preview marks, production omits; unit + build test (no fact markup in production) |
| GOV-06 | VERIFIED LOCALLY | `conflicted` never renders (heritage 30/80, mobiles); conflicts listed in SOURCE_LEDGER |
| GOV-07 | VERIFIED LOCALLY | `docs/generated/OWNER_DECISIONS.md` (consequence, default, options, evidence, release effect) |
| GOV-08 | VERIFIED LOCALLY | This trace and `QA_REPORT.md` use the labels; nothing is called live |
| IA-01 | VERIFIED LOCALLY | build test (42 pages), crawl 200s |
| IA-02 | VERIFIED LOCALLY (conditional) | 30 × 301 one hop, locale-correct, query kept (crawl); edge behaviour BLOCKED until cutover (D18) |
| IA-03 | VERIFIED LOCALLY | build test: every target in its own locale; production falls back to the products index, never home |
| IA-04 | VERIFIED LOCALLY | Header + drawer nav; e2e drawer; screenshots |
| IA-05 | VERIFIED LOCALLY | e2e language switch on a product (vi → en) and mid-form (en → th) |
| IA-06 | VERIFIED LOCALLY | Breadcrumbs + BreadcrumbList on product pages; axe clean |
| IA-07 | VERIFIED LOCALLY | O2 credit last link on every page (build test); production footer has only approved data (none yet) |
| IA-08 | VERIFIED LOCALLY | crawl: real 404 in th/vi with products + contact links |
| PRD-01 | VERIFIED LOCALLY | Stable ids/slugs validated (`validateContent`) |
| PRD-02 | VERIFIED LOCALLY | unit: legacy claims never public; spec fields null |
| PRD-03 | VERIFIED LOCALLY | Template shows format, category and document status on every product |
| PRD-04 | VERIFIED LOCALLY (partial) | Compare by format filter, strand-width code, spec table; numeric widths and pack formats BLOCKED (D06) |
| PRD-05 | VERIFIED LOCALLY | e2e pointer/keyboard/touch in WebKit + Chromium |
| PRD-06 | VERIFIED LOCALLY | e2e filter → back/forward → reset |
| PRD-07 | VERIFIED LOCALLY | unit: "Not yet published", never 0/N/A |
| PRD-08 | VERIFIED LOCALLY (fixture) | unit: title, language, version, date, type, size; no real document yet (D06) |
| OEM-01 | VERIFIED LOCALLY | `/oem/` in nav, header CTA, home, product pages |
| OEM-02 | VERIFIED LOCALLY | OEM copy traces to DIPROM 2024 + 2014 site; no MOQ, lead time, formulation or export claims |
| OEM-03 | IMPLEMENTED — NOT VERIFIED | Fields and required/optional set; approval by the form owner BLOCKED (D11) |
| OEM-04 | VERIFIED LOCALLY (timeout: implemented) | e2e: pending, success, validation, server failure, offline, duplicate click; 20 s timeout path implemented, not exercised |
| OEM-05 | VERIFIED LOCALLY | e2e: success only after 201 with an ID |
| OEM-06 | VERIFIED LOCALLY | Formats, market, pack, volume ranges, timing fields |
| OEM-07 | VERIFIED LOCALLY | No file input; "does not take attachments" |
| OEM-08 | VERIFIED LOCALLY | e2e: Copy / Download .txt / Email / Call on failure and offline |
| QLT-01 | VERIFIED LOCALLY | unit fixture certificate shows all fields |
| QLT-02 | VERIFIED LOCALLY | unit: expired/superseded/unapproved never render |
| QLT-03 | VERIFIED LOCALLY | No Halal statement anywhere public; THIC listing recorded as operator-only |
| QLT-04 | VERIFIED LOCALLY | unit: product claim stays on its product, never on Quality |
| QLT-05 | VERIFIED LOCALLY | Request route (`/contact/?subject=documents`); no private files linked |
| QLT-06 | VERIFIED LOCALLY | "Register last reviewed 19 November 2026" |
| QLT-07 | Not applicable yet | `markAssetId`/`markUseApproved` modelled; no mark is shown until a certificate exists |
| QLT-08 | VERIFIED LOCALLY | Quality control links to the process step |
| LOC-01 | VERIFIED LOCALLY | 359 copy keys × 3 locales; facts and assets in 3 locales (validateContent) |
| LOC-02 | VERIFIED LOCALLY | unit AC-IA-03 |
| LOC-03 | BLOCKED — OWNER/PROVIDER INPUT | Vietnamese is O2's draft (D16) |
| LOC-04 | IMPLEMENTED — NOT VERIFIED | Thai written first, phrase-aware headings; native editorial review BLOCKED (D16) |
| LOC-05 | VERIFIED LOCALLY | `<html lang>` per page; Thai runs in EN/VI wrapped `lang="th"`; credit `lang="en"`; axe |
| LOC-06 | VERIFIED LOCALLY | Overflow 320–1920 in 3 locales; 200% text; screenshots (Thai phrases, Vietnamese diacritics) |
| LOC-07 | VERIFIED LOCALLY | Shared ids/slugs; names, alt text and copy per locale |
| LOC-08 | VERIFIED LOCALLY | Titles, descriptions, og:locale and JSON-LD names per locale |
| UX-01 | VERIFIED LOCALLY | e2e overflow at 320/360/375/390/430; screenshots |
| UX-02 | VERIFIED LOCALLY | e2e drawer keyboard; axe; real screen readers not run |
| UX-03 | VERIFIED LOCALLY | e2e no-JS: 5 pages × 3 locales |
| UX-04 | VERIFIED LOCALLY | e2e: headline readable during the opening; skipped on return |
| UX-05 | VERIFIED LOCALLY | e2e reduced motion |
| UX-06 | VERIFIED LOCALLY | Opening ends ≤ 1.1 s from navigation, only on a first visit while the hero image loads |
| UX-07 | VERIFIED LOCALLY | No fixed bottom bar; sticky header with scroll padding; forms unobstructed |
| UX-08 | VERIFIED LOCALLY | e2e focus returns to the menu button; 3 px focus ring |
| UX-09 | VERIFIED LOCALLY | e2e targets ≥ 44 × 44 |
| UX-10 | VERIFIED LOCALLY | M1–M10 only (ART_DIRECTION); CLS 0 (perf) |
| MED-01 | VERIFIED LOCALLY | Every image in the ledger; production renders none unapproved (guard) |
| MED-02 | VERIFIED LOCALLY | Validation rejects stock/generated tagged as actual; none used |
| MED-03 | VERIFIED LOCALLY | No marketplace or social image used |
| MED-04 | VERIFIED LOCALLY | Ledger `maxDisplayWidth ≤ width`; e2e: no render larger than native |
| MED-05 | BLOCKED — OWNER/PROVIDER INPUT | 2014 pack photos may not match current packs (D05, D15) |
| MED-06 | VERIFIED LOCALLY | Purpose-based alt in 3 locales; decorative logo `alt=""` beside the visible name |
| MED-07 | Not applicable | No video supplied |
| MED-08 | VERIFIED LOCALLY | WebP + JPEG fallback, intrinsic width/height, lazy below the fold; single size because none exceeds its native slot |
| TEC-01 | VERIFIED LOCALLY | build test + sitemap test |
| TEC-02 | VERIFIED LOCALLY | build test: JSON-LD parses, no Restaurant/ratings/offers/nutrition |
| TEC-03 | BLOCKED — OWNER/PROVIDER INPUT | Data-flow inventory done; controller, processor, retention need D02/D11/D19 |
| TEC-04 | VERIFIED LOCALLY (test adapter) | Server-side validation, length limits, escaping by default, no secrets; production backend not built |
| TEC-05 | VERIFIED LOCALLY (automated + keyboard) | axe on every template × 3 locales + states; zoom, contrast, focus, errors; screen-reader sampling BLOCKED (human) |
| TEC-06 | VERIFIED LOCALLY | crawl both builds |
| TEC-07 | VERIFIED LOCALLY | perf: ≤ 150 KB/page, JS 24 KB raw, LCP ≤ 0.8 s on the throttled profile |
| TEC-08 | VERIFIED LOCALLY | `loading="lazy"` with dimensions below the fold; CLS 0 |
| TEC-09 | VERIFIED LOCALLY | e2e: no third-party request before "Show map"; perf: 0 third-party |
| TEC-10 | VERIFIED LOCALLY | No analytics code |
| TEC-11 | VERIFIED LOCALLY | 404 and form failure states keep contact recovery, no internals |
| TEC-12 | VERIFIED LOCALLY | `_headers` (CSP, nosniff, referrer, permissions, frame-ancestors); `npm audit` 0 vulnerabilities (6 dev deps, 0 runtime) |
| REL-01 | VERIFIED LOCALLY | Status everywhere is VERIFIED LOCALLY |
| REL-02 | VERIFIED LOCALLY | gate exits 1 listing 18 open decisions; manifest BLOCKED |
| REL-03 | IMPLEMENTED — NOT VERIFIED | Redirects tested locally; RUNBOOK written; staging rehearsal BLOCKED (D18) |
| REL-04 | IMPLEMENTED — NOT VERIFIED | `release-manifest.json` with file hashes; content freeze happens at release |
| REL-05 | DESIGNED — NOT IMPLEMENTED | Responsibility table in RUNBOOK §6; names BLOCKED |
| REL-06 | VERIFIED LOCALLY | build test |
| REL-07 | VERIFIED LOCALLY | 123 screenshots (WebKit) |
| REL-08 | VERIFIED LOCALLY | HANDOVER limits and QA_REPORT "not run" |

## Part V — 42 acceptance scenarios

| Scenario | Status | Evidence |
|---|---|---|
| AC-ID-01 correct manufacturer | VERIFIED LOCALLY | unit; guard rejects any other 13-digit registration |
| AC-ID-02 restaurant rejection | VERIFIED LOCALLY | unit; build guard in both modes |
| AC-ID-03 unapproved brand | VERIFIED LOCALLY | marked in preview; gate fails on D01 |
| AC-EV-01 expired certificate | VERIFIED LOCALLY | unit |
| AC-EV-02 unscoped claim | VERIFIED LOCALLY | unit (gluten-free fixture) |
| AC-EV-03 heritage conflict | VERIFIED LOCALLY | unit (th/en/vi About) |
| AC-IA-01 legacy route coverage | VERIFIED LOCALLY | crawl (30, one hop, no chain) |
| AC-IA-02 equivalent language switch | VERIFIED LOCALLY | e2e |
| AC-IA-03 missing translation | VERIFIED LOCALLY | unit |
| AC-IA-04 unknown route | VERIFIED LOCALLY | crawl (real 404, Thai recovery) |
| AC-PRD-01 search and reset | VERIFIED LOCALLY | e2e (focus returns to "All") |
| AC-PRD-02 pack-to-dish on touch | VERIFIED LOCALLY | e2e tap, pack stays visible |
| AC-PRD-03 specification version | VERIFIED LOCALLY (fixture) | unit |
| AC-PRD-04 unknown attribute | VERIFIED LOCALLY | unit |
| AC-OEM-01 useful minimum brief | VERIFIED LOCALLY | stored test record has contact, organisation, market, formats, consent; no hidden values (`.local/e2e/enquiries.jsonl`) |
| AC-OEM-02 failure recovery | VERIFIED LOCALLY | e2e |
| AC-OEM-03 duplicate submit | VERIFIED LOCALLY | e2e (one POST) |
| AC-OEM-04 offline preparation | VERIFIED LOCALLY | e2e |
| AC-CT-01 contact privacy | VERIFIED LOCALLY | Required-field note, consent with purpose and privacy link above Send |
| AC-CT-02 map consent | VERIFIED LOCALLY | e2e (no Google request before the click) |
| AC-UX-01 keyboard drawer | VERIFIED LOCALLY | e2e both engines |
| AC-UX-02 reduced motion | VERIFIED LOCALLY | e2e |
| AC-UX-03 warm-cache revisit | VERIFIED LOCALLY | e2e (second visit: no opening) |
| AC-UX-04 no JavaScript | VERIFIED LOCALLY | e2e |
| AC-UX-05 zoom and language stress | VERIFIED LOCALLY | e2e 200% text, 3 locales |
| AC-UX-06 form errors | VERIFIED LOCALLY | e2e |
| AC-MED-01 unlicensed marketplace image | VERIFIED LOCALLY | Production renders only approved assets; research-only cannot be approved (unit) |
| AC-MED-02 generated factory image | VERIFIED LOCALLY | unit (media-truth error) |
| AC-MED-03 low-resolution hero | VERIFIED LOCALLY | unit + e2e native-size check; hero grain fixed at 190 × 258 |
| AC-MED-04 product identity | BLOCKED — OWNER/PROVIDER INPUT | Needs current pack photography mapped to SKUs (D15) |
| AC-TEC-01 hreflang set | VERIFIED LOCALLY | build test + crawl (all alternates 200) |
| AC-TEC-02 structured product claim | VERIFIED LOCALLY | Product JSON-LD = visible name + summary only |
| AC-TEC-03 sitemap hygiene | VERIFIED LOCALLY | production sitemap = canonical pages only |
| AC-TEC-04 slow connection | VERIFIED LOCALLY | perf: text/LCP ≤ 0.8 s, no artificial loader |
| AC-TEC-05 image layout stability | VERIFIED LOCALLY | dimensions on every image (crawl), CLS 0 |
| AC-TEC-06 third-party failure | VERIFIED LOCALLY | Address, copy and directions work without the map (e2e) |
| AC-TEC-07 form abuse boundary | VERIFIED LOCALLY (test adapter) | 429 with draft kept; honeypot and timing refusals |
| AC-REL-01 local is not live | VERIFIED LOCALLY | Reports say VERIFIED LOCALLY |
| AC-REL-02 missing owner approval | VERIFIED LOCALLY | gate exits 1 with the decision list |
| AC-REL-03 redirect rehearsal | VERIFIED LOCALLY | crawl against the local server honouring `_redirects` |
| AC-REL-04 rollback | DESIGNED — NOT IMPLEMENTED | RUNBOOK §5; needs a staging project to rehearse |
| AC-REL-05 post-release proof | BLOCKED — OWNER/PROVIDER INPUT | No release authorised |
