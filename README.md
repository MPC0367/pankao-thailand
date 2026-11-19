# Pankao Thailand — manufacturer website (greenfield, local build)

The new website for the Nonthaburi rice-noodle manufacturer **บริษัท สหปั้นข้าว จำกัด / SAHA PANKAO COMPANY LIMITED** (registration 0125550039493). Built from scratch by O2 Design Studio from the brief `../documents/brief/` (19 Nov 2026). The current site, pankaothai.com, is research and migration evidence only.

**Status: VERIFIED LOCALLY — private preview. Not deployed, not live, not approved by the company.** A separate 2024 Bangkok restaurant company with a near-identical Thai name is blocked from every output (`src/content/sources.ts`).

## Commands

```bash
npm install            # dev tools only: typescript, playwright, axe-core
npm run media          # prepare preview images from ../documents/research/legacy-site/images → media-source/ (git-ignored)
npm run build          # private preview → dist/            (noindex, review notes, legacy images, local form test adapter)
npm run build:production  # production rehearsal → dist-production/ (only owner-approved facts and images)
npm run serve          # http://localhost:4530 (dist)  ·  npm run serve:production → :4531
npm test               # unit tests (truth model, identity guard, claims, certificates, redirects, contrast, whole build)
npm run crawl          # HTTP crawl of both builds: pages, links, images, 30 legacy redirects, 404s, headers
npm run e2e            # Playwright: WebKit + Chromium journeys, form states, axe-core, overflow, no-JS, screenshots
npm run perf           # throttled-phone lab measurements → qa-output/perf.json
npm run reports        # registers in docs/generated/ from the content model
npm run gate           # release gate: exits 1 while owner decisions are open
npm run check          # typecheck + test + both builds + crawl + reports
```

Studio previews (`.claude/launch.json`): `pankao` (4530, preview) and `pankao-production` (4531). Node ≥ 24 (TypeScript runs natively; no compile step).

## How it is built

- `src/content/` — the only place business facts live: `facts.ts` (identity, contact, OEM, process, heritage candidates), `products.ts`, `claims.ts` (claims, certificates, documents), `assets.ts` (asset ledger), `decisions.ts`, `copy-*.ts` (all text in th/en/vi side by side), `sources.ts` + `data/*.json` (source ledger and the rejected entity).
- Every fact has a status, sources and `ownerApproved`. `src/build/context.ts` decides what may render: the **preview** shows unapproved public facts with a review marker; **production** shows only approved ones. A sentence that asserts a fact lists it (`facts: [...]`) and disappears in production until approved.
- `src/build/` renders static HTML (no framework), fingerprints CSS/JS/fonts/images, writes `_redirects` and `_headers` for Cloudflare Pages, and runs output guards that fail the build on: rejected-entity strings, unknown registrations, internal markers, preview markup in production, unapproved images.
- `src/client/` — 3 small scripts (≈ 25 KB, no dependencies): opening, header, drawer, filters, pack↔dish, process thread, copy address, consented map, enquiry form.
- Fonts: Trirong (Cadson Demak, OFL) self-hosted in Thai/Latin/Vietnamese subsets; body text uses system fonts.

## To approve something (after the company confirms in writing)

Set `ownerApproved: true` and `ownerApprovalRef` (where the confirmation is) on the fact, claim, certificate or asset (`productionApproved` + `permissionReference` for images); resolve the decision in `decisions.ts`; run `npm run check`, `npm run e2e`, `npm run gate`. Publishing is a separate owner instruction: see `docs/RUNBOOK.md`.

## Documents

`docs/HANDOVER.md` (start here) · `docs/PREFLIGHT.md` · `docs/ADR-001-stack.md` · `docs/ART_DIRECTION.md` · `docs/INFORMATION_ARCHITECTURE.md` · `docs/FORMS_AND_PRIVACY.md` · `docs/SEO.md` · `docs/QA_REPORT.md` · `docs/RUNBOOK.md` · `docs/REQUIREMENTS_TRACE.md` · `docs/generated/` (source ledger, truth ledger, claims, certificates, assets, decisions, redirects, locale parity, catalogue, content requests).

Client photographs and research files stay in `../documents/` and never enter this repository. This repository has no remote; do not push it anywhere public.
