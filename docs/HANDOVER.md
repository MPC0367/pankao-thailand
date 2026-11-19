# Handover — Pankao Thailand website (19 Nov 2026)

## In one paragraph

A new website for the rice-noodle factory in Sai Noi, Nonthaburi (บริษัท สหปั้นข้าว จำกัด), built from scratch in Thai, English and Vietnamese. It is finished and tested **on O2's computer only**: nothing is online, nothing was sent to anyone, and the company has not yet confirmed any of the facts it shows. The preview marks every unconfirmed fact; the "production" version of the same site already removes them automatically, which is why it currently shows almost nothing about products. Twenty decisions from the company stand between this and publication; they are listed below in plain words.

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

(D17 social accounts and D20 shop/careers/news are settled by default: none.) The full register with consequences and options: `docs/generated/OWNER_DECISIONS.md`. What to send: `docs/generated/CONTENT_REQUESTS.md`.

## Where things are

- Site code and docs: `Clients/Pankao Thailand/site/` (local git, branch `o2/pankao-greenfield-build`, no remote).
- Brief, research, legacy-site archive, screenshots: `Clients/Pankao Thailand/documents/`.
- Preview: `npm run serve` → http://localhost:4530 (studio preview `pankao`); production rehearsal on 4531 (`pankao-production`).

## Limits (not done, by design or because they need people)

Not deployed; no staging. No real enquiry backend. Not tested on a real iPhone, Android phone or in LINE's browser; no screen-reader session (VoiceOver/TalkBack/NVDA). No native Thai/Vietnamese review. Map pin not checked on site. Certificates not verified with issuers. Legal review of the privacy notice not done. DataForThai's own pages could not be read automatically (identity confirmed from two other registry-derived sources).
