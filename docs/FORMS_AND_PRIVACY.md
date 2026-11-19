# Enquiry forms, backend contract, operations decision and data-flow inventory

## Forms

| Form | Where | Required | Optional |
|---|---|---|---|
| OEM brief | `/{l}/oem/#brief` | company, name, work email, country/market, type of business, message, consent | role, phone, formats (vermicelli, rice stick, Guay Jub, brown rice, dried pasta, not sure), intended use, own brand vs OEM, packaging/pack size, volume range (not sure → regular orders), timing, documents/standards needed |
| General | `/{l}/contact/#contact-form` (`?subject=documents` preselects) | name, work email, subject, message, consent | company, phone, country |

No file uploads (D12). Honeypot field `website`; a submission faster than 1.5 s is refused generically. Labels above fields; optional fields marked; errors in text with a mark, an error summary that takes focus and links to fields, `aria-invalid` + `aria-describedby`; draft kept in `sessionStorage` (survives a language switch; cleared on verified success).

## Client states (all exercised by `npm run e2e` in WebKit and Chromium)

pristine · focused · invalid + error summary · submitting (button disabled, "Sending…") · slow (> 4 s "Still sending") · **success only on HTTP 201 with an enquiry ID** · duplicate (409 → "We already have this enquiry", same ID) · server failure (5xx → "not sent", draft kept, Try again, Copy brief, Download .txt, Email it, Call) · rate limited (429) · offline (no request, draft kept, copy/download) · backend not configured (production today: no request, same fallbacks). A timed-out request is retried with the same `Idempotency-Key`, so a retry cannot create a second record. Nothing falls back silently to email.

## Backend contract (brief §11.6)

```
POST /api/enquiries     Content-Type: application/json (or form-urlencoded without JS)
Idempotency-Key: <uuid per draft>
201 { enquiryId, receivedAt }       after the record is durably written
400 { error: "validation_error", fields? }   409 { error: "duplicate", enquiryId, receivedAt }
413 upload_too_large · 429 rate_limited (Retry-After) · 500/503 temporarily_unavailable
```

Server rules: validate and normalise; store once; return 201 only after durable acceptance; send notifications as a separate observable step that cannot duplicate the record; rate-limit per address; log IDs only, never message content or personal fields.

**Today:** `scripts/serve.ts` implements this contract as a **local test adapter** (writes `.local/enquiries.jsonl`, git-ignored, labelled "LOCAL TEST — NOT PRODUCTION"). It sends nothing to anyone. The preview form says so above the fields.

## Operations decision (D11) — options for the owner

| Option | Fit | Notes |
|---|---|---|
| Cloudflare Pages Function + D1, notification email to the sales inbox (same pattern as O2's own website) | Recommended | Durable record in the company's or O2's Cloudflare account; retention job; no third party sees content |
| Google Apps Script web app writing to a Google Sheet in the company's account | Workable | Simple for staff; Sheet becomes the record; needs a monitored owner |
| Email-only service | Not recommended | Delivery is not durable acceptance; harder to prove "received" honestly |

Whichever is chosen needs: the receiving person/inbox, a realistic response expectation (none is stated until then), retention period, who can see records, and the privacy notice updated to match.

## Data-flow inventory

| Data | Collected by | Purpose | Stored | Recipients | Retention | Status |
|---|---|---|---|---|---|---|
| Form fields listed above | Enquiry forms | Reply to the enquiry; quotation/sample discussion on request | Backend record (not chosen) | Company staff handling enquiries; the storage processor | Not decided (D11/D19) | Local test only |
| Form draft | Visitor's browser `sessionStorage` | Keep answers across a language switch or failure | The visitor's device, until the tab closes or success | Nobody | Session | Implemented |
| Opening seen flag `pk-opened` | `localStorage` | Skip the opening on return | Visitor's device | Nobody | Until cleared | Implemented, disclosed |
| Review toggle `pk-review` | `localStorage` (preview only) | Remember review-note preference | Reviewer's device | Nobody | Until cleared | Preview only |
| Map | Google, only after "Show map" | Show the location | Google | Google | Google's policy | Disclosed before loading |
| Analytics, cookies, social embeds | — | — | — | — | — | None (D13) |

The privacy page is O2's draft structure; sentences that depend on the controller, recipients, retention or legal basis are marked and drop out of a production build until D02, D11 and D19 are resolved. It makes no legal assurance and needs Thai PDPA review.
