# Preflight record (brief Part 2.4), 19 Nov 2026

## 0. Authority

Local research, design, build and verification only. No deployment, DNS, hosting, form sending, outbound message, account or social action was taken. Release token `APPROVE_PANKAO_PRODUCTION_DEPLOY` has not been given.

## 1. Repository and current-source reconciliation

- No Pankao repository or local project existed. Created `Clients/Pankao Thailand/` with `site/` (this local git repository, no remote, branch `o2/pankao-greenfield-build`) and `documents/` (brief, research, screenshots; never in a repository).
- Read first: `context/ai/README.md`, `context/clients/pankao.md` (Codex's research record of 19 Nov), Codex's log, the studio notes. The brief's markdown sources are copied to `documents/brief/`.
- Current public site: pankaothai.com behind Cloudflare; every HTML file last modified 12 Oct 2014; UTF-8 (not TIS-620); no build or source repository to inherit. Hosting and DNS ownership of pankaothai.com are not established (D18).

## 2. Identity

| | Manufacturer (this project) | Rejected |
|---|---|---|
| Thai | บริษัท สหปั้นข้าว จำกัด | [removed] |
| English | SAHA PANKAO COMPANY LIMITED | [removed] CO., LTD. |
| Registration | 0125550039493 | [removed] |
| Registered | 25 May 2007, capital THB 16 m, TSIC 10742, active | 19 Sep 2024, THB 1 m, TSIC 56101 (restaurant) |
| Address | 45 หมู่ที่ 9 ซอยวัดสโมสร ถนนปทุมธานี-บางเลน ต.ไทรใหญ่ อ.ไทรน้อย จ.นนทบุรี 11150 | [removed], Bangkok [removed] |

**Name collision (new finding):** the 2014 site and Yellow Pages still print the manufacturer's pre-2017 name *[removed] / [removed]* — which is now exactly the restaurant's legal Thai name. The new site therefore never prints that string; identity checks key on registration number and address, never on name. DataForThai answered every automated read with a Cloudflare challenge (not bypassed); the identity fields were read from two other DBD-derived records (TaeJing, Creden). Rejected record: `docs/generated/REJECTED_ENTITY.md`.

## 3. Evidence ledger

22 sources with IDs, dates, claims and limitations: `docs/generated/SOURCE_LEDGER.md` (readable research notes: `../documents/research/SOURCE_LEDGER.md`). Key: DIPROM 20 Feb 2024 (government) calls the company an OEM contract factory for เส้นหมี่, เส้นก๋วยเตี๋ยวจันทร์ and dried pasta, domestic and international; THIC lists the operator but shows **no** Halal certificate; TaeJing lists 20 Thai FDA registrations under facility 12-2-02151, partly other brands (not named publicly); no official social account found.

## 4. Current 30-URL inventory and redirect map

10 page types × 3 locales (`stem.html`, `stem_en.html`, `stem_vn.html`), all 200, no 404s, no extra pages; `/sitemap.xml` 404; `robots.txt` has no directives; http/https/www/bare all answer 200 with no redirect. Full inventory, metadata audit, verbatim statements and 61 images: `../documents/research/legacy-site/INVENTORY.md`. Redirect map: `docs/generated/REDIRECT_MAP.md`.

## 5. Existing-function inventory

See `docs/INFORMATION_ARCHITECTURE.md` → current-site coverage (table A).

## 6. Conflicts and owner decisions

Heritage 30 vs 80 years vs 2007 registration; old vs new company name; product lists differ between site, directory, DIPROM, catalogue and FDA; two mobile numbers; certifications only as marks; Vietnamese page contradicts itself on fat claims. Register: `docs/generated/OWNER_DECISIONS.md` (20 decisions, 18 open).

## 7. Asset and rights inventory

61 legacy images (all ≤ 470 px wide, many 102–230 px, several with raster text); no vector logo; no current photography; DIPROM gallery image and marketplace pack photos are research references only. 18 used in the preview at native size or reduced, each in `docs/generated/ASSET_LEDGER.md`; none production-approved.

## 8. Technology decision

`docs/ADR-001-stack.md`.

## 9. Baseline screenshots and metadata

60 baseline screenshots (30 pages × 1440/390) plus WebKit and hover states: `../documents/screenshots/baseline-2026-11-19/`. No viewport meta (a 390 px phone receives a 980 px layout at ≈ 0.4 scale), no `<h1>`–`<h6>`, no `lang`, no alt text on any of 194 images, no canonical/hreflang/OG/JSON-LD.

## 10. Plan and gates

Phases 0–8 of the brief, each with its exit check, were executed in order in this session; results and evidence in `docs/QA_REPORT.md` and `docs/REQUIREMENTS_TRACE.md`.
