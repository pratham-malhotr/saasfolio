# SaaSFolio brand intake and directory refresh — 14 November 2026

Implemented in the local repository. No production deployment or production database configuration was performed.

The homepage now emphasizes software discovery, searchable brands, hosting, source-based reviews and submission entry points. The directory supports category URLs and server-rendered query results. The published catalog contains 140 brands, including seven hosting brands. New documentation reviews cover Hostinger, Cloudflare Pages and DigitalOcean App Platform; official sources, original examples, limitations and decision exercises are visible in each article.

The new anonymous brand intake validates public HTTPS links, product context, category, pricing model, distinct features, contact details and explicit consent. It saves pending inquiries through the existing database integration and displays the stored record ID only after a confirmed write. Owners can prepare an editorial draft from the review inbox. Private contact details remain out of that draft. Published managed brand records now enter public profiles, search and the sitemap; raw submissions and retired brands do not.

Verification completed:

- All 155 unit tests passed, including route validation, storage failures, rate limits and managed-publication selection.
- Publisher source validation passed for 126 brand guides, six comparisons, 14 documented profiles and 14 articles, with no duplicate substantive paragraphs.
- TypeScript and the final production build passed; 508 routes/assets were generated.
- A real browser submission reached the real API and saved one synthetic pending record in an isolated development-only store. The receipt matched the stored ID and the record survived reload. The temporary store and test server were removed; no email or production submission was sent.
- Twenty browser page/viewport/interaction checks passed, including 390px and 1440px layouts, category URLs, search, live preview, required fields, duplicate-domain normalization and no-JavaScript links. No browser exceptions or failed local assets were recorded.
- The SEO audit passed for all 317 sitemap pages, 627 structured-data blocks and 145 sharing images. Canonical URLs, missing-page behavior and utility noindex passed. An old audit assertion was corrected to check the intentional official-provider fallback when its historical coupon has expired.
- The publisher content crawl reported zero indexing or content errors. The largest HTML response was 498,461 bytes; 39 script assets were checked, with a maximum of 243,176 bytes.
- The publisher/security audit passed for ownership metadata, ads.txt, privacy controls, source citations, private cache headers and existing redirects. No ad-serving code was activated.

Production configuration remains absent for accounts, web forms and newsletter delivery. Until Supabase is connected and the new version is deployed, online brand intake is not live. The unconfigured page clearly offers a complete email draft and never claims that a record was saved. See `docs/BRAND-SUBMISSIONS.md` for the required environment settings and acceptance steps. Provider SDK behavior is covered by route tests; an actual production Supabase write and staff publication still require that connection.

There are currently zero offers eligible for publication under the existing source-freshness rules. The work preserves those rules instead of presenting stale codes as current. Brand research, profiles and hosting articles remain available. Google makes its own AdSense decision; passing internal checks does not establish approval.

Evidence: `brand-intake-e2e-2026-11-14.json`, `brand-submission-browser-2026-11-14.json`, and `brand-refresh-publisher-2026-11-14.json` in this directory.
