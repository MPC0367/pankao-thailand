# Handover — Pankao Thailand website (19 Nov 2026)

## In one paragraph

A new website for the rice-noodle factory in Sai Noi, Nonthaburi (บริษัท สหปั้นข้าว จำกัด), built from scratch in Thai, English and Vietnamese. It is finished and tested **on O2's computer only**: nothing is online, nothing was sent to anyone, and the company has not yet confirmed any of the facts it shows. The preview marks every unconfirmed fact; the "production" version of the same site already removes them automatically, which is why it currently shows almost nothing about products. Twenty decisions from the company stand between this and publication; they are listed below in plain words.

## Premium audit (20 Nov 2026): built on branch `o2/premium-audit-2026-11-20` (`1f40bbb`), not yet on the public preview

The owner sent `Pankao_Thailand_Live_UI_UX_Premium_Audit.pdf` (31 pages) with no words. Every buildable item is built; the record, item by item, is `docs/PREMIUM_AUDIT_2026-11-20.md`. The headlines:
- **Phones:** one-row header and a one-line dismissible preview strip, 106 px at worst (audit: ≤ 112).
- **Homepage:** 8.3 phone screens, down from 11.9.
- **OEM:** 7 required inputs with an optional second step, "Prepare my brief", and four of the company's own photographs.
- **Packs:** the real packs re-staged on cream.
- **Archive:** factory, trays, building and lab enhanced (non-generative), with an edit log for every image.
- **Media:** `MEDIA_INVENTORY.md` classifies all 61 legacy files.
- **Captions:** one system, a filled dot for the company's own photos and an open ring for illustrative ones.
- **Opening:** the full ~4 s logo once per session, then instant (the owner chose this over the audit's 1.4 s).
- **Waiting on the company:** new photography, certificates, contacts and native review.

**To publish:** fast-forward `o2/pankao-greenfield-build` to the branch, then run `npm run pages:deploy` (on the owner's word).

## Fourth round (20 Nov 2026) — on the public preview since 20 Nov 2026 (`gh-pages` `eb5971e` from `3da9420`; the way back `43724cc`)

- **Loading animation fixed** ("where is my loading animation"):
  - **What was wrong:** it never played when arriving through the root link. The language redirect made the referrer this site, and on github.io every other project shares that origin. It also played only once per tab.
  - **Now:** it plays on every fresh open and reload, through the root too; not between the site's own pages, not on back/forward, never under reduced motion.
  - **Tests:** they now require it to appear, not merely to be gone.
- **Dry close-ups clearer:** deblocked, lightly denoised, enlarged to 632×714 in two Lanczos steps with contrast-adaptive sharpening (`scripts/media.ts`). Not generative.
- **Illustrative photographs on every main page** ("use the internet … add what is appropriate for each page"):
  - **What:** nine images under Pexels, Unsplash or CC0 licences, each tagged "ภาพประกอบ / Illustrative photo", captioned and credited with a link, preview only.
  - **Where:** Home rice fields; Products dry vermicelli ("not a Pankao product"); a serving idea on each product page; Process jasmine rice; Quality paddies; About a canal in Nonthaburi (Bang Khu Rat, named as such).
  - **Left out:** sun-drying racks, since Pankao bakes its noodles dry.
  - **Record:** `../documents/photos/illustrative-2026-11-20/README.md`.
- **Checks:** unit 27/27, crawls, e2e 35/35, Pages smoke 7/7 locally.

## Third round (20 Nov 2026) — on the public preview since 20 Nov 2026 (`gh-pages` `43724cc` from `f33ca0f`; the way back `d75a80b`)

- **Clearer photos** ("make the images clearer"): the cooked-dish photos now use their whole 460×400 originals (they had been reduced to 186×210 and then stretched). The dry close-ups, the Mr. Noodles dish and the hero pack are enlarged once at build time with Lanczos and a light sharpen (`scripts/media.ts`); no generative upscaling. The dry close-ups stay softer than the dishes: their originals are 186 px, so new photography is still the real fix.
- **Softer background** ("make the gradients on the background less abrupt"): band edges fade over up to 240 px and the dark sections over up to 150 px, both on a smoothstep curve. The drifting lights fall off on a bell curve.
- **Slower loader** ("too fast slow it down"): about 1.7× slower. The logo forms over ~3.7 s and the loader clears at ~4.1 s; it still skips on a click.
- **Checks:** unit 27/27, crawls, e2e 35/35, Pages smoke 7/7 locally.

## Second round from O2's owner (19–20 Nov 2026) — on the public preview since 20 Nov 2026 (`gh-pages` `d75a80b` from `0e34b75`; the way back `dddf471`)

- **Background:** a fixed layer of soft gold and cream lights drifts as the page scrolls (`.aura`, site.js; still under reduced motion). The bands and the dark chapters fade into it at their edges instead of stopping square.
- **Photographs fill their frames:** cards, product-page frames and the home hero panel are now the photograph itself, edge to edge and rounded. The owner's words: "make the picture larger we dont need a border image in the background". MED-04 is amended: up to 3.5× in those frames, native size elsewhere. The 2014 photos are small, so they look soft at that size until new photography arrives.
- **Everything on pankaothai.com, in its own three languages** (`src/content/legacy.ts`), tagged "จากเว็บไซต์เดิม / From the current website" and shown in the preview only (`PANKAO_LEGACY=off` hides it; production never shows it; decision D23):
  - Home: the welcome and the banner slogan, "BEST Quality", and the quality-certifications paragraph with the marks named. Their logos are not reproduced, and the note says current certificates are still to come.
  - Products: the "ปั้นข้าวของเรา" range, including pumpkin noodles, with the product-page promises.
  - Product pages: each product's own text.
  - Process and About: the process intro with the three photo captions, and "ตำนานปั้นข้าว" (the history).
  - Contact: the registered name with the tax ID (0-1255-50039-49-3).
  - Left out: the second mobile number (it may be a person's).
- **Language switch is a dropdown** (globe + current language, native `<details>`), in the header at every width and in the footer.
- **Products submenu:** the header's Products item opens a list of every product, as the old sidebar's "ปั้นข้าวของเรา ▶" did. The drawer lists the products under Products.
- **Loader:** the oval logo forms. The oval draws, the sprigs grow, PK is drawn then filled, then the arc lettering appears letter by letter (~2.4 s).
  - By the owner's choice the arcs keep the 2014 wording, drawn as outlines so the old name is never text (`scripts/logo/make-logo-art.py`; record `../documents/Approvals/2026-11-19 Logo keeps the 2014 wording (O2 owner decision).md`; D21).
  - The header mark is the same logo.
- **Checks:** unit 27/27, crawl (preview, production, pages), e2e 35/35 in WebKit and Chromium, Pages smoke 7/7 locally.
- **Published 20 Nov 2026** on the owner's "Yes, publish" after the ship check (Ready): `npm run pages:deploy` → `gh-pages` `d75a80b`. To go back, push the earlier build (`dddf471`, from `56d92cc`) the same way.

## Public preview on GitHub Pages (19 Nov 2026)

On the owner's "publish live" the dressed preview went online at **https://mpc0367.github.io/pankao-thailand/** (repo `MPC0367/pankao-thailand`, branch `gh-pages`, built by `npm run build:pages` with the site under `/pankao-thailand`). It is a **labelled preview, not the launch**: every page `noindex`, a strict meta CSP, no review notes or review toggle, the Sample tags kept, and the enquiry form honest about having no backend (it offers Copy brief, Download, Email and Call). pankaothai.com is untouched; moving the site there needs domain access and the company's decisions (D18 and the rest below). The built output includes the 2014 site's photographs (Pankao's own, already public on the old site; rights not confirmed in writing). Republish: `npm run pages:deploy` (refuses an uncommitted tree, builds, crawls, force-pushes `gh-pages`); check: `npm run pages:smoke -- --url=https://mpc0367.github.io/pankao-thailand`. The way back: push an earlier build, or turn Pages off (repo Settings → Pages).

## Dressed for the client meeting (19 Nov 2026, evening)

On the owner's word the preview now reads as a finished site: **sample values** fill every gap (typical specifications per product, four sample certificate cards, a documents list with Request buttons, a history timeline, OEM terms at a glance, opening hours), each with a small gold **Sample** tag and a one-line note; the palette is **white, cream, natural gold and roasted brown** with soft daylight gradients; the header is **liquid glass** (Glisse); a **loading animation** draws the recoloured **PK mark** on the first open of a tab. When showing it, the Sample tags tell Pankao exactly which values they must supply or correct. `PANKAO_SAMPLE_TAGS=off` hides the tags, `PANKAO_SAMPLES=off` returns to the honest "not yet published" view; production never shows samples.

## What a visitor gets (preview)

- **Home**: "Rice, shaped into noodles in Nonthaburi" — the company name (ปั้นข้าว, to shape rice) turned into its headline; the real Mr. Noodles pack in a rice-grain window; the four noodle formats; own brand vs production under your brand; a 2024 government record describing the factory as an OEM producer; five process steps; two ways to start a conversation.
- **Products**: search in any of the three languages, filter by format, every product page with typical dishes and a specification table that honestly says "not yet published" until the label is supplied.
- **OEM**: what a project needs, how it usually starts (marked as O2's draft until the factory confirms), and a brief form with every success and failure state handled honestly.
- **Quality**: a certificate register that lists a certificate only once the certificate itself is checked. The eight logos on the old site are not repeated.
- **About, Process, Contact** (address copy, directions, map only on request), **Privacy** (draft), **Accessibility**, and a 404 that helps.
- Grey "review notes" (button in the dark preview bar) show what each fact rests on and what is still needed.

## The one identity risk, handled

A different company — a 2024 restaurant business in [removed], Bangkok, registration [removed] — has exactly the Thai name the factory used before 2017 ([removed]). The website never prints that name, and the build stops if that registration, name or address ever appears.

## C. Content status (brief §16.1 C)

| Content | Source | Status | Shown | Owner input |
|---|---|---|---|---|
| Brand name ปั้นข้าวไทย / Pankao Thailand | Working label | To confirm | Preview, marked | D01 |
| Legal name and registration | Government-derived records | Documented | Review notes only | D02 |
| Address, landline, fax | 2014 site, Yellow Pages, THIC, registry | Documented / legacy | Preview, marked | D10 |
| Email pk_pankao@hotmail.com | 2014 site | Legacy | Preview, marked | D10 |
| Mobile numbers, hours | Conflicting / directory only | — | Never | D10 |
| OEM production, Thailand and export | DIPROM 2024 + 2014 site | Government source | Preview, marked | D09 |
| Four formats + Mr. Noodles | 2014 site (+ DIPROM for vermicelli and rice stick) | Legacy | Preview, marked | D03, D05 |
| Rice pasta, pumpkin, yanang, other widths, instant, khanom jeen | DIPROM, catalogue, directory, FDA aggregator | Leads | Review cards only | D05 |
| Ingredients, weights, shelf life, cooking, claims | None current | Unknown | "Not yet published" | D06 |
| Gluten-free, no MSG, organic, cholesterol… | 2014 site | Unsupported | Never | D06 |
| Certificates | Marks only | Unverified | Register empty + request route | D07 |
| 30 / 80 years, founder, "first factory" | 2014 site / 2017 catalogue | Conflicting | Never | D04 |
| Markets by region | 2014 site | Legacy | Review notes only | D08 |
| Process steps | 2014 site | Legacy | Preview, marked | D09 |
| Photographs (18) | 2014 site | Rights unconfirmed | Preview only, native size | D15 |
| Privacy notice | O2 draft | Draft | Preview, marked | D19 |
| Vietnamese text | O2 draft | Not reviewed | Preview | D16 |

## D. Owner decisions, in plain words

1. **D01** What is the company's public name in Thai and English?
2. **D02** May the website name the legal company and its registration in the footer and privacy notice?
3. **D03** Is Mr. Noodles still sold, and how does it relate to Pankao?
4. **D04** What history can be published, with which documents (30 years? 80 years? founder? first factory?)
5. **D05** Which products are made today? (Rice pasta? Pumpkin? Yanang? Other widths?)
6. **D06** For each product: the current label or specification sheet.
7. **D07** Current certificates (BRC, HACCP, GMP, Halal…), or confirmation they have lapsed.
8. **D08** Which export countries may be named?
9. **D09** What can be said about OEM (formats, packaging, samples, minimum order, lead time) and what are the real first steps?
10. **D10** Which phone, fax and email are public? Working hours?
11. **D11** Who receives website enquiries, where are they stored, how fast can someone reply?
12. **D12** Should buyers be able to attach files? (Off for now.)
13. **D13** Any visitor measurement? (Off for now.)
14. **D14** Is the map pin in the right place?
15. **D15** Can the 2014 photographs be reused, and can O2 photograph the factory and packs (shot list ready)?
16. **D16** Who reviews the Thai, English and Vietnamese text?
17. **D18** When ready, may this replace pankaothai.com, and who controls that domain?
18. **D19** Privacy wording reviewed under Thai PDPA.
19. **D21** Do you approve the recoloured PK mark (cream, gold, espresso) for the website, or should we use your original artwork?
20. **D22** Please replace each value marked "Sample" with your real one (labels, certificates, documents, dates, OEM terms, hours).

(D17 social accounts and D20 shop/careers/news are settled by default: none.) The full register with consequences and options: `docs/generated/OWNER_DECISIONS.md`. What to send: `docs/generated/CONTENT_REQUESTS.md`.

## Where things are

- Site code and docs: `Clients/Pankao Thailand/site/`, public on GitHub at https://github.com/MPC0367/pankao-thailand (Pankao confirmed, 19 Nov 2026; default branch `o2/pankao-greenfield-build`). The website itself is not deployed.
- Brief, research, legacy-site archive, screenshots: `Clients/Pankao Thailand/documents/`.
- Preview: `npm run serve` → http://localhost:4530 (studio preview `pankao`); production rehearsal on 4531 (`pankao-production`).

## Limits (not done, by design or because they need people)

Not deployed; no staging. No real enquiry backend. Not tested on a real iPhone, Android phone or in LINE's browser; no screen-reader session (VoiceOver/TalkBack/NVDA). No native Thai/Vietnamese review. Map pin not checked on site. Certificates not verified with issuers. Legal review of the privacy notice not done. DataForThai's own pages could not be read automatically (identity confirmed from two other registry-derived sources).
