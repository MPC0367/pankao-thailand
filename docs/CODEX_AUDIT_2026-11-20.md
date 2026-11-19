# Codex audit, third edition — what was built (20 Nov 2026, overnight)

**The request.** The owner asked for Codex (three-brain) to audit the live preview in the format of the previous audits, then: "run it immediately, then publish the changes to a local host first … Do not push anything to the live branch without my approval."

**The audit.** Codex scored the live build `8c0c623` at 7.8/10 (up from 6.8). The report is `../documents/audits/Pankao_Codex_Website_Audit_2026-11-20.md` (28 sections). It ran read-only and changed no files; its sandbox could not start browsers, which it says itself.

**The build.** Every "O2 can fix now" item was built on the local branch `o2/codex-audit-2026-11-20`. Nothing was pushed or deployed, and `o2/pankao-greenfield-build` and `gh-pages` are untouched.

**Where to review.** The local public build is `npm run build:pages`, served by the preview entry `pankao-pages` at http://localhost:4532/pankao-thailand/th/. The private review build is `pankao` at http://localhost:4530.

## Built (O2 can fix now)

| Finding | What changed | Check |
|---|---|---|
| **F10.2 / F16.1 (P0)** Preview JSON-LD asserted unapproved brand, address, telephone and Hotmail | Structured data publishes a fact only if the owner has approved it (`canPublishStructured` in `context.ts`; `seo.ts`). Previews now carry breadcrumbs only. Public-preview titles and link previews start "พรีวิว · / Preview · / Bản xem trước ·" | `crawl:pages` fails on any Organization, Product, PostalAddress or ContactPoint in the public build, or on a missing prefix. `audit:metrics`: 15/15 pages clean and titled |
| F13.1 / F07.1 OEM still 9 phone screens | "Start your brief" button after the proof photos; on phones a compact sticky "Start your brief" link appears once the opening has scrolled away and hides when the form is in view; the sample "At a glance" terms moved below the form and fold away; square proof photos and a two-column formats list on phones | OEM **8.2** phone screens (target ≤ 8.2); link visible, 48 px |
| F18.1 Actual ≠ current | Class-A captions read "Archive photo from the company's 2014 website" (th/vi too). The ledger gains `currentness` (archival / illustrative) and `era` | `ASSET_LEDGER.md` columns |
| F21.1 / F22.1 Audit trail | The ledger records original and derivative SHA-256 (12 hex) and the review state (O2 side-by-side 2026-11-20, owner approval pending) | `npm run reports` |
| F06.1 Products odd card | The fifth card (Mr. Noodles) spans the row: on desktop the wide pack photo sits beside its text; the range-band pack photo is 2:1 | Products **4.7** desktop screens (≤ 4.7) |
| F06.2 Process whitespace | Tighter steps; each image (190 px) sits beside its step | Process **4.1** desktop screens (≤ 4.2) |
| F12.2 Spec column | The specification heading is sticky beside its table on desktop | Visual |
| F07.2 Product navigation | Jump row (Overview · Specifications · Documents · Related) under the breadcrumbs; "Back to all formats" after the specification | 4 working jumps |
| F14.3 Quality samples | One full sample certificate, three compact ones; the 2014 quality points as a short line (marks kept) | Quality **6.0** phone screens (≤ 6.2) |
| F03.1 About length | The 2014 slogan and history in one card beside the rice field; the plant photo is 4:3 and the field 16:9 on phones | About **5.2** phone screens (≤ 5.2) |
| F05.1 / F17.3 Hosted release evidence | `.github/workflows/post-deploy-checks.yml`: after each Pages build (or on demand) GitHub runs `pages-smoke` and `audit-metrics` against the live address in Chromium and WebKit and keeps the results as an artifact. **Not pushed; runs only once the owner approves a push** | — |
| F15.4 Evidence modes | `npm run screens:public` writes labelled public-build screenshots with an INDEX naming the build mode, address and commit: `../documents/screenshots/public-preview-2026-11-20/` (72) | — |
| F09.1, F25.1, F04.1, F18.2, F21.1, F22.1 (protect) | Unchanged: header 106 px, Home order and 8.3 screens, truth gates, per-asset approval, non-generative restoration | `audit:metrics` |
| F08.1 Opening | Owner decision kept (full ~4 s once per session) | — |

## Measured (local public build, Chromium)

`npm run audit:metrics`: 18/18 targets met.
- Phone chrome is 106 px; the header is one row.
- Home is 8.3 (en) and 8.1 (th) phone screens, and 6.2 desktop.
- OEM is 8.2 phone screens, Quality 6.0 and About 5.2; Products is 4.7 desktop and Process 4.1.
- Structured data and titles are correct on 15/15 pages; the product jump row works.
- OEM has 7 required inputs, 4 proof photos and "Prepare my brief".
- The opening plays once and is instant on reload.

Unit 27/27, crawls (preview, production and public), e2e 35/35 (WebKit + Chromium, axe with no critical or serious issues), Pages smoke 7/7.

## Only the company can supply (unchanged by this pass)

The owned enquiry operation (recipient, SLA, privacy, retention); current photography (the 24–30 asset pack); active SKUs and specifications; current certificates; approved history and identity (including the logo's wording); confirmed contacts, hours and map pin; legacy image rights and consent; native review in th/en/vi. All are listed in Codex §26 and `docs/generated/MEDIA_INVENTORY.md`.

## To publish (only on the owner's word)

1. Fast-forward `o2/pankao-greenfield-build` to `o2/codex-audit-2026-11-20` and push it. That push also activates the post-deploy workflow.
2. Run `npm run pages:deploy`.
3. Verify with `pages:smoke` and `audit:metrics` against the live URL.

The way back is `gh-pages` `8c0c623`.
