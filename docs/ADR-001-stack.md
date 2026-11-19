# ADR-001 — Stack: dependency-free static generator in TypeScript

Date: 19 Nov 2026 · Status: accepted for the local build · Brief §11.1

## Context

No Pankao repository existed. The live site is a 2014 table layout with no build to inherit. The brief suggests Astro + TypeScript + schema-validated content + plain CSS as a strong default, and allows another choice with a recorded rationale. O2's own website already runs a framework-free Node build on Cloudflare Pages.

## Decision

A static site generator written in TypeScript (`src/build/`), run directly by Node 24+ (native type stripping, no compile step), with:

- content as typed TypeScript modules validated at build time (`validate.ts`) instead of a CMS;
- plain CSS with design tokens, one fingerprinted stylesheet (38 KB raw, 8.5 KB gzip);
- three small vanilla scripts as progressive enhancement (24 KB raw, 7.8 KB gzip in total; no runtime dependencies);
- output for Cloudflare Pages: static files + `_redirects` + `_headers`.

Dev dependencies only: `typescript` (typecheck), `playwright` and `axe-core` (verification).

## Why not Astro / Next.js

| Criterion | This build | Astro | Next.js static export |
|---|---|---|---|
| Hosting fit | Any static host; Cloudflare Pages files generated | Same | Same |
| Locale routing | Explicit `/{th,en,vi}/` tree, shared slugs | i18n routing | i18n via folders |
| Redirects | `_redirects` generated from the legacy map, tested over HTTP | Same file | Same file |
| Form/backend fit | Separate endpoint; local test adapter in `scripts/serve.ts` | Same | Same |
| Content editing | Typed files + truth ledger; a reviewer edits one record | Content collections | Files or CMS |
| JavaScript cost | 24 KB raw / 7.8 KB gzip, no framework runtime | Islands, small | React runtime |
| Truth guards | Built into the renderer (fact-level preview/production) | Would be added on top | Would be added on top |
| Rollback | Re-deploy a previous artefact (Pages keeps every deployment) | Same | Same |

The deciding factor is the truth system: the brief's central requirement is that every rendered fact carries a status and that production silently drops unapproved ones. Owning the renderer makes that a property of every template rather than a convention, with no framework upgrade cycle for a site that changes rarely.

## Consequences

- Templates are tagged template strings with escaping by default (`src/build/html.ts`); no JSX.
- No image pipeline beyond `cwebp` (installed via Homebrew); larger photography will need `sharp` or a CDN resize when the company supplies originals.
- A CMS can be added later in front of the same content model if the company wants self-service editing (not requested).
