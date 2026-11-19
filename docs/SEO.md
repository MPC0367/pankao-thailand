# Search and structured-data map

| Item | Preview build | Production build |
|---|---|---|
| Robots meta | `noindex, nofollow` on every page | `index, follow` (404 pages and the `/` language chooser: `noindex`) |
| `X-Robots-Tag` header | `noindex, nofollow` | none |
| robots.txt | `Disallow: /` | `Allow: /` + sitemap |
| sitemap.xml | none | canonical pages only, with `xhtml:link` alternates for th/en/vi/x-default |
| Canonical | `https://www.pankaothai.com/{l}/…` (self) | same |
| hreflang | th, en, vi, x-default (→ th), reciprocal on every page | same |
| Titles / descriptions | Unique per page and locale, native wording; fact-dependent titles fall back to neutral page names in production | same |
| Open Graph | type, title, description, url, locale, site_name; no image until an approved one exists | same |

Structured data (only from facts that may show in the mode; tests forbid Restaurant, ratings, offers, nutrition):

| Page | JSON-LD |
|---|---|
| Home | `Organization` (name, url, address, ContactPoint for approved phone/email) + `WebSite` (inLanguage th/en/vi) |
| Products, OEM, Process, Quality, About, Contact | `BreadcrumbList` |
| Product detail | `BreadcrumbList` + `Product` (name, description, category "Dried rice noodles", manufacturer reference; brand only on the Mr. Noodles page) |

No FAQ schema (no real questions from buyers yet). Indexable live text replaces the 2014 raster slogans and product labels. Search queries buyers use, from the benchmark review: rice vermicelli, rice stick (by width), Chanthaburi noodles, Pad Thai noodles, OEM rice noodles Thailand, brown rice noodles — covered by page titles, H1s and alternative names on each product page.

Before release: Search Console for the domain (the company's account or O2's with their consent), submit the sitemap, request indexing for /th/, /en/, /vi/ and product pages, check the 30 legacy redirects in the Coverage report after cutover.
