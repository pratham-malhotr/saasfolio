# Hosting research and brand intake release — November 17, 2026

## Implemented

- `/hosting`: 20-provider research hub, workload/approach filters, a three-provider responsibility comparison and a complete-term renewal calculator. Responsive layouts, native anchor navigation, optional motion and reduced-motion support.
- Twelve additional published hosting profiles, bringing the published collection from 140 to 152. New editorial profiles cover Hetzner, Vultr, Linode/Akamai, OVHcloud, Scaleway, UpCloud, Cloudways, Kinsta, SiteGround, DreamHost, Railway and Netlify.
- Ten original hosting articles, approximately 8,000 words in total. Each has nine sections, a specific reader, conditional recommendations, a practical exercise, a decision record, a comparison table, FAQs and references. The publisher story is explicitly fictional; no experience, benchmarks or business results are fabricated.
- Four original built-in image_gen illustrations, optimized as 1440 × 810 WebP files. Complete prompt set and saved paths: `docs/research/hosting/image-prompts.json`. Assets: `public/images/hosting/`. The images are used in articles, the hub and article-specific social cards.
- Article canonicals, unique descriptions, Open Graph/Twitter cards, Article and breadcrumb structured data, image information, publication dates, internal reading paths and sitemap discovery. Full article text is available before JavaScript runs.
- Four official-source introductory offers, preserving term length, cap/renewal conditions, evidence dates and the catalog's freshness limit. Source evidence: `docs/research/hosting/offer-observations.json`.
- AdSense ownership metadata removed. `/ads.txt` authorizes no sellers. The old ad-sales route redirects to the affiliate disclosure. Privacy and funding text match the affiliate-funded model.
- Optional server-only approved hosting affiliate URL registry. Exact campaigns require exact mappings; generic partner homepages cannot silently replace promotion activation routes. No partner IDs were invented.
- Brand submissions: private retry-safe storage RPC, matching receipts for identical requests, conflict handling for changed requests, full-details draft and receipt downloads, and a larger byte envelope that supports the form's valid multilingual input limits.
- Staff inbox: brand/status filters, contact/domain/reference search, refresh, matching-loaded-record JSON export and readable feature lists. Existing staff authorization, private storage and editorial publication boundaries remain in place.

## Validation

- 164 unit tests pass, including calculator edge cases, filter composition, source-safe redirects, affiliate configuration, input validation, private intake, failure handling, inbox exports and editorial journeys.
- TypeScript check passes. ESLint reports zero errors and 12 existing warnings in Instagram marketing scripts.
- Catalog validation passes: 799 canonical raw catalog brands, 215 historical/current source offers and 894 source records. Raw catalog size is separate from the 152 editorially published profiles.
- Publisher source validation passes: 126 brand guides, six original comparisons, 26 documented profiles and 24 articles; no duplicated substantive editorial paragraphs.
- Production build passes: 559 generated pages.
- Hosting browser checks cover all ten article metadata/schema/initial-HTML responses, generated social image, mobile/desktop layouts, search, empty results, shortlist cap, retained selection, calculator changes/invalid input, no-JavaScript reading and exact promotional redirects. The report is `docs/reports/hosting-browser-2026-11-17.json`.
- Real form → API → isolated development store → matching receipt succeeds. Draft and receipt downloads preserve contact/product details; retries reuse the reference; changed content conflicts; saved records survive page reload. Report: `docs/reports/brand-intake-e2e-2026-11-17.json`.
- Disposable PostgreSQL migrations, permissions, private-table access, retry behavior, changed-content rejection and privacy cleanup pass. Eight concurrent requests retain one record and return one reference. An encrypted backup/restore retains the data and privileges. No production database was accessed.
- The local publisher HTTP audit passes: no ad metadata/scripts or authorized sellers, correct private-response cache controls, visible privacy/funding text, all 24 article source panels, redirects and non-indexed previews.

## Activation and remaining limits

These changes are local and have not been deployed. The checkout has no production Supabase configuration, service-role key or rate-limit secret. Production storage and the existing inbox therefore have not been accessed or activated. Apply `supabase/migrations/202611170001_brand_submission_receipts.sql` and configure the existing required provider secrets before deployment. The protected readiness endpoint now expects schema version 4. Do not announce saved online submissions until a controlled deployed acceptance test confirms storage.

No approved hosting affiliate destinations were supplied. Add real provider/offer mappings to `HOSTING_AFFILIATE_URLS` in the server environment to enable those commissions. Until then, hosting links go to official sources. Existing unrelated affiliate configuration is preserved. No email was sent and no application for a partner program was submitted.

The npm audit identified an existing moderate advisory in Next.js 16.4.2 (GHSA-mfr8-8qww-v76h), with npm reporting 16.4.6 as the patch target. No high or critical production-dependency advisories were reported. Dependency upgrades were not included in this content/intake release. The existing Instagram lint warnings were left unchanged. Search traffic and conversions require post-deployment measurement; no ranking or revenue result is claimed.
