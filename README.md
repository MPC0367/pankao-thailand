# Pankao Thailand — manufacturer website (greenfield, local build)

The new website for the Nonthaburi rice-noodle manufacturer **บริษัท สหปั้นข้าว จำกัด / SAHA PANKAO COMPANY LIMITED** (registration 0125550039493). Built from scratch by O2 Design Studio from the brief `../documents/brief/` (19 Nov 2026). The current site, pankaothai.com, is research and migration evidence only.

**Status: a labelled public preview is on GitHub Pages since 19 Nov 2026 — https://mpc0367.github.io/pankao-thailand/ (O2's owner: "publish live"). It is not pankaothai.com, not the production site, and nothing on it is approved by the company yet.** The preview is `noindex`, has no review notes, keeps the gold Sample tags, and its enquiry form sends nothing (it offers copy, download, email and phone). Republish with `npm run pages:deploy` (only on the owner's word), check with `npm run pages:smoke -- --url=https://mpc0367.github.io/pankao-thailand`. A separate 2024 Bangkok restaurant company with a near-identical Thai name is blocked from every output (`src/content/sources.ts`).

## Commands

```bash
npm install            # build/dev tools: typescript, esbuild, glisse + preact (bundled into one header island), playwright, axe-core
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

## Client presentation preview (19 Nov 2026)

The preview is dressed for showing to the company: O2 **sample values** fill every gap (specifications, certificate and document entries, a history timeline, OEM terms, hours), each with a small gold “Sample” tag; the header is **liquid glass** (Glisse on Preact); a **loading animation** plays on a tab's first open; the PK mark is **recoloured** in cream and gold. Switches for `npm run build`:

```bash
PANKAO_SAMPLES=off npm run build      # the honest view: "not yet published" instead of samples
PANKAO_SAMPLE_TAGS=off npm run build  # samples without their tags (say so when showing it)
PANKAO_LOADER=off npm run build       # no loading animation
```

Samples never reach a production build (status `sample`, guarded and tested). Recorded as decisions D21 (mark) and D22 (samples).

## How it is built

- `src/content/` — the only place business facts live: `facts.ts` (identity, contact, OEM, process, heritage candidates), `products.ts`, `claims.ts` (claims, certificates, documents), `assets.ts` (asset ledger), `decisions.ts`, `copy-*.ts` (all text in th/en/vi side by side), `sources.ts` + `data/*.json` (source ledger and the rejected entity).
- Every fact has a status, sources and `ownerApproved`. `src/build/context.ts` decides what may render: the **preview** shows unapproved public facts with a review marker; **production** shows only approved ones. A sentence that asserts a fact lists it (`facts: [...]`) and disappears in production until approved.
- `src/build/` renders static HTML (no framework), fingerprints CSS/JS/fonts/images, writes `_redirects` and `_headers` for Cloudflare Pages, and runs output guards that fail the build on: rejected-entity strings, unknown registrations, internal markers, preview markup in production, unapproved images.
- `src/client/` — small vanilla scripts (loader, header, drawer, filters, pack↔dish, process thread, copy address, consented map, enquiry form) plus `glass.js`, the Glisse liquid-glass island bundled by esbuild on Preact compat (19 KB gzip, loaded at idle).
- Fonts: Trirong (Cadson Demak, OFL) self-hosted in Thai/Latin/Vietnamese subsets; body text uses system fonts.

## To approve something (after the company confirms in writing)

Set `ownerApproved: true` and `ownerApprovalRef` (where the confirmation is) on the fact, claim, certificate or asset (`productionApproved` + `permissionReference` for images); resolve the decision in `decisions.ts`; run `npm run check`, `npm run e2e`, `npm run gate`. Publishing is a separate owner instruction: see `docs/RUNBOOK.md`.

## Documents

`docs/HANDOVER.md` (start here) · `docs/PREFLIGHT.md` · `docs/ADR-001-stack.md` · `docs/ART_DIRECTION.md` · `docs/INFORMATION_ARCHITECTURE.md` · `docs/FORMS_AND_PRIVACY.md` · `docs/SEO.md` · `docs/QA_REPORT.md` · `docs/RUNBOOK.md` · `docs/REQUIREMENTS_TRACE.md` · `docs/generated/` (source ledger, truth ledger, claims, certificates, assets, decisions, redirects, locale parity, catalogue, content requests).

Public on GitHub at https://github.com/MPC0367/pankao-thailand since 19 Nov 2026, with Pankao's confirmation (relayed by O2's owner). Client photographs, the full research record and the brief stay in `../documents/` and never enter this repository; the research ledger here omits personal phone numbers, a private person's name and the brands Pankao produces for (OEM). The website itself is published only as the labelled preview on the `gh-pages` branch (built output, which does carry the 2014 site's photographs: Pankao's own, already public on its old site; rights not yet confirmed in writing); `main` and the working branch hold no photographs.
