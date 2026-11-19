# Information architecture and page contract

## Routes (each in `/th/`, `/en/`, `/vi/`; slugs shared so the language switch keeps the page)

```
/{l}/                                Home
/{l}/products/                       Products index (search th/en/vi names, format filter, URL state)
/{l}/products/rice-vermicelli/       Rice vermicelli
/{l}/products/rice-stick-pad-thai/   Rice stick (Chanthaburi / Pad Thai)
/{l}/products/rice-flake-guay-jub/   Rice flake (Guay Jub)
/{l}/products/brown-rice-noodles/    Brown-rice noodles
/{l}/products/mr-noodles/            Mr. Noodles (own brand line)
/{l}/oem/                            OEM / private label + enquiry brief (#brief)
/{l}/process/                        Process
/{l}/quality/                        Quality: certificate register, claims rule, documents
/{l}/about/                          About (identity, the name, today, history slot)
/{l}/contact/                        Contact: address, copy, directions, map on request, form (#contact-form)
/{l}/privacy/  /{l}/accessibility/   Privacy notice (draft) and accessibility statement
/{l}/404.html                        Locale 404 with recovery links
/                                    Language preference redirect (Thai default, x-default, no-script → /th/)
```

Not built (no content or operating owner): resources, applications, careers, news, distributor finder, shop, sample orders, terms.

Navigation: Products · OEM · Process · Quality · About · Contact · TH/EN/VI · primary action "Discuss an OEM project". Inline from 1180 px; below that a compact header (wordmark, OEM button from 640 px, Menu) and a modal drawer. No fixed bottom bar (decided: the header carries the primary action and the drawer the rest; a bar would compete with forms on phones). Footer: identity, products, company, contact, privacy/accessibility, "website facts last reviewed", language, O2 credit last.

## Home sequence (brief §7.1)

1. Opening — eyebrow (manufacturer · Nonthaburi), H1 *Rice, shaped into noodles in Nonthaburi*, lede naming own brand + OEM + Thailand/export, OEM primary + formats secondary, location line, the grain hero.
2. Format navigator — four formats with strand-width plates, pack ↔ cooked toggle.
3. OEM chapter (deep leaf) — own packs vs made under your brand, the DIPROM 2024 record, link to Quality.
4. Process — five steps, link to Process.
5. Quality module — **omitted** (no checked certificate; owner wording needed). Quality route is in the OEM chapter and navigation.
6. Heritage pause — **omitted** until D04 (review note lists candidates).
7. Markets — folded into the lede (Thailand and export, DIPROM); regions only in review notes until D08.
8. Closing — OEM project / contact and directions.

## A. Current-site coverage and greenfield decisions (brief §16.1 A)

| Existing route / function (2014) | New route / function | Decision | Evidence / test |
|---|---|---|---|
| Thai, English, Vietnamese page sets (30 hand-built files, flag icons) | One content model, three locale views, TH/EN/VI text switch keeping page, query, anchor and form draft | Retain the commitment, rebuild differently | `build.test.ts` hreflang/lang; e2e language switch |
| `index` Home with welcome text, claim list, product boxes, cert marks | `/{l}/` composed capability → formats → OEM → process → action | Recompose | Screenshots `home-*`; requirement IA-01 |
| `history` "more than 30 years" | `/{l}/about/` current identity, the name, today; dated timeline slot | Rebuild differently; 30/80-year claims blocked (D04) | `truth.test.ts` AC-EV-03 |
| `process` 4 statements + 4 small photos | `/{l}/process/` five steps with progress thread, photos at native size | Rebuild from evidence | e2e reduced motion; screenshots |
| `product` overview with pack → dish rollover (pointer only) | `/{l}/products/` search, filter, URL state, pack ↔ cooked on hover, focus and a labelled toggle | Rebuild as a product system | e2e filter + toggle (pointer, keyboard, touch) |
| `mrnoodles` brand page | `/{l}/products/mr-noodles/` brand line listing its formats | Retain as a brand page, marked until D03 | Page + review note |
| `rice_vermicelli`, `rice_stick`, `rice_flake`, `rice_brown` | Product detail template: identity, uses, specification table with honest unknowns, claims rule, documents, related, CTA | Rebuild | `truth.test.ts` PRD-07 |
| Health/diet claims (gluten-free, no MSG, organic, cholesterol…) | Claims register; none public until SKU evidence | Replace | `truth.test.ts` legacy claims never public |
| Certification marks image (8 marks) | `/{l}/quality/` register (holder, scope, number, issuer, validity), request route | Replace | `truth.test.ts` AC-EV-01 |
| OEM sentence ("also produce by order") | `/{l}/oem/` statement, formats, draft path, brief guidance, enquiry form | Replace with a complete journey | e2e form states |
| Domestic / Asia, America, Europe, Australia | "Thailand and export markets" (DIPROM 2024); regions review-only | Retain only supported meaning | Truth ledger `markets.*` |
| `contact` page, footer address/phones/fax/email, tax number | `/{l}/contact/` address, copy, directions, map after consent, channels, form; footer contacts | Retain approved channels; mobile numbers omitted; tax/registration review-only (D02) | e2e map consent + copy |
| Hero raster slogans ("From Thai rice to world kitchen…") | Live text headline; slogan claims in the register | Replace (raster text removed) | — |
| Legacy URLs | `_redirects` 30 × 301, one hop, locale-correct | Conditional migration (D18) | `npm run crawl` |
| Pumpkin noodles (Thai home list only) | Verification slot, review card | Blocked until D05 | Catalogue report |
| Fax number | Footer and contact (marked) | Retain, confirm (D10) | — |
