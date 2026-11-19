# Release, rollback and post-release runbook

**Nothing here has been run.** Each step that changes anything outside this Mac needs the owner's explicit instruction, quoted with the release token `APPROVE_PANKAO_PRODUCTION_DEPLOY`, and is done by O2 only on that word.

## 1. Before any release (Gates A–C)

1. All open decisions resolved in `src/content/decisions.ts` from written owner confirmations (`npm run gate` exits 0).
2. Facts, claims, certificates and images approved with references (`ownerApproved`/`productionApproved`).
3. Enquiry backend selected and built (D11); privacy text reviewed (D19); native copy review recorded (D16).
4. `npm run check` and `npm run e2e` pass on the release commit; `npm run perf` within budget.
5. Content freeze: tag the commit, keep `dist-production/release-manifest.json` (file hashes, blockers = none).

## 1a. Labelled public preview (GitHub Pages, live since 19 Nov 2026)

Not a release: the preview build at https://mpc0367.github.io/pankao-thailand/, for showing the company.

1. Commit everything (the deploy names the source commit).
2. `npm run pages:deploy` — only on the owner's word. Builds `dist-pages/` (`PANKAO_PUBLIC_PREVIEW=on`, base `/pankao-thailand`), runs `crawl:pages`, force-pushes the output as the single commit of `gh-pages`.
3. `npm run pages:smoke -- --url=https://mpc0367.github.io/pankao-thailand` (WebKit + Chromium: 30 pages each, loader, glass, form sends nothing, axe).
4. Rollback: push an earlier build the same way, or turn Pages off in the repository settings.

## 2. Private staging (Gate D)

- Cloudflare Pages project (in the company's account, or O2's with their agreement), **preview deployment only**, from `dist-production/` plus `X-Robots-Tag: noindex` added for staging, or protected with Cloudflare Access.
- Owner walks identity, products, claims, certificates, contacts and media on staging; native reviewers record approval.
- Rehearse: deploy → crawl (`node scripts/crawl.ts` against the staging URL needs a small change of base URL) → roll back → re-deploy.

## 3. Production (Gate E) — only on the owner's token

1. Record: exact artefact (commit + manifest hash), host, domain, DNS changes, responsible operator, time window.
2. Back up the current site: download the 30 legacy pages and assets (already archived in `../documents/research/legacy-site/` on 19 Nov 2026) and note the current DNS records and Cloudflare settings for pankaothai.com.
3. Deploy `dist-production/` to the Pages project's production branch. `_redirects` and `_headers` deploy with it.
4. Attach the custom domain `www.pankaothai.com` (and apex) to the Pages project.
5. Zone rules (not in `_redirects`): `http → https` (Always Use HTTPS) and `pankaothai.com → https://www.pankaothai.com/$1` (single redirect rule, 301, keep query). These cover the protocol and host variants observed on 19 Nov 2026.
6. HSTS only after a week without problems (start `max-age=86400`, no preload).

## 4. Post-release verification (Gate F) — before calling it live

- Every canonical page 200 in all three locales; 404s are real 404s.
- All 30 legacy URLs (and their http/bare-host variants) reach the right page in one hop **at the edge** (`curl -sI`), query strings kept.
- Canonical, hreflang, sitemap, robots and structured data reference the live domain; no `noindex` left from staging.
- Form: a real test enquiry reaches the named recipient and the record store; a forced failure shows the honest failure state.
- Map loads only after "Show map"; contacts and directions correct; pin location checked by someone who knows the site.
- Search Console: sitemap submitted, indexing requested for /th/, /en/, /vi/.
- Only then: status `LIVE — VERIFIED` in the handover.

## 5. Rollback

- **Pages**: Deployments → previous deployment → "Rollback to this deployment" (instant; keeps the domain).
- **Back to the 2014 site**: detach the custom domain from the Pages project and restore the DNS records noted in step 3.2; the old site's files must still be on its original host (confirm before cutover who controls it).
- **Redirect rules**: disable the zone rules from step 3.5.
- After rollback, re-run §4 against whatever is serving.

## 6. Ownership after release (REL-05)

| Area | Owner (to be named by the company) |
|---|---|
| Enquiries (reading, replying, record store) | |
| Content and product data | |
| Certificates and their expiry dates | |
| Translations (Thai, English, Vietnamese) | |
| Privacy notice and data requests | |
| Hosting, domain, DNS | |
| Website maintenance | O2 Design Studio (if contracted) |
