# Shared-project database connection verification

The existing CircleOfIRA Supabase project now contains a separate `saasfolio`
schema. Its 16 preexisting `public` tables remain present under their original
names. Four canonical SaaSFolio migrations were applied atomically in the new
namespace and recorded with source hashes. No CircleOfIRA table migration or
Auth configuration change was applied.

Observed against the live isolated database:

- `platform_readiness`: HTTP 200, `ready: true`, schema version 4.
- The installed Supabase JavaScript SDK returns the same readiness result.
- Publishable-key reads of `inquiries` return permission denied (`42501`).
- Publishable-key calls to `save_brand_submission` return `42501` without a write.
- Existing exposed schemas `public` and `graphql_public` are retained alongside
  `saasfolio`; the PostgREST role override is documented in `SHARED-SUPABASE.md`.

Local validation of the release:

- 167 unit tests pass, including intake-only Auth isolation.
- Default and custom-schema PostgreSQL suites pass: workflow permissions,
  row-level security, private intake, privacy redaction, eight concurrent retries
  producing one receipt, encrypted backup and restoration.
- The custom-schema suite preserves a different website's same-named newsletter
  table and rejects a second first-install attempt.
- Production build passes: 583 generated pages. Lint has zero errors and 12
  preexisting warnings in marketing assets.
- Production response audits pass: publisher content, security/readiness, brand
  identity, SEO, brand SEO, search-intent content coverage, offers and HTTP
  reliability. SEO audit checks 362 sitemap pages and 718 JSON-LD blocks.
- Browser checks pass for publisher content, brand intake presentation, mobile
  and desktop discounts, all footer/page interactions, offers, Auth and privacy.
  Those automated UI suites intercept external writes and do not establish a
  successful live brand submission.

Release checks also corrected hosting JSON-LD context, links to incomplete
discount guides, wrapped footer link click areas, and obsolete browser checks
that still expected an advertising sales page. The current site uses affiliate
funding and redirects `/advertise` to its disclosure.

This report distinguishes database connectivity from the final live form test.
The latter must verify the public website's returned receipt against its saved
`saasfolio.inquiries` record after Hostinger deploys this schema-aware release.
No actual keys, raw contact submissions or account tokens belong in this report.
