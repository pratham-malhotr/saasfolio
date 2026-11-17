# Hosting article release — November 17, 2026

The article catalog now contains 50 original articles, including 36 dedicated
hosting guides with 29,934 section-body words. Fourteen new guides compare
specific hosting decisions rather than claim a universal best host. The
published directory contains 153 brands, including 21 hosting providers.

The expansion covers Hostinger/SiteGround renewals, Hetzner/OVHcloud,
Scaleway/Hetzner, UpCloud/DigitalOcean, stateful Fly.io/Render applications,
Railway/DigitalOcean persistent storage, Workers/upload APIs, Ghost publishing,
WordPress cache diagnosis, object storage, staging indexing, hosting moves
without domain transfers, recovery objectives and temporary staging costs.

Every article has visible source references, individual metadata, Article and
breadcrumb structured data, related reading, a cover and a sharing image.
Four new illustrations complete a twelve-image hosting collection. Fictional
publisher scenarios and example budgets are labeled; no provider benchmarks,
customer outcomes, keyword difficulty or search volume are asserted. Ghost's
managed publishing and self-hosting requirements are distinguished.

## Validation

- Production build and complete production-check suite passed.
- 172 unit tests passed; catalog and editorial validation passed.
- All 377 sitemap URLs returned HTTP 200 in the production-build audit,
  with zero indexing or content errors.
- All 50 rendered articles passed the twenty-check custom on-page audit:
  average 100/100, minimum 100/100, zero failed checks or unavailable articles.
- Hosting browser checks passed at mobile and desktop widths and with JavaScript
  disabled: all 36 article metadata records, provider search, empty state,
  three-provider shortlist, preserved selection and renewal calculator behavior.
  No runtime errors or failed assets were observed in that hosting check.

The on-page score is a transparent technical checklist, not a Google score,
ranking forecast, originality assessment or performance measurement. Evidence
for each check is retained in `article-seo-2026-11-17.json`; the methodology is
documented in `docs/ARTICLE-SEO-SCORING.md`. Measured Search Console reports,
including their date window and query coverage, remain private and gitignored.
New guides are not given invented search positions.

## Previously released live intake

The live HTTPS brand form was independently verified against the isolated
`saasfolio` schema in the existing CircleOfIRA Supabase project. It returned
HTTP 201 with matching saved fields, pending-review status and downloadable
receipt. An identical retry returned the same receipt and one database record;
changed content with the same key returned HTTP 409. Anonymous database reads
were denied, the submission survived a page reload, and the disposable test
record was removed. CircleOfIRA's existing public tables were unchanged.

One initial document navigation received a recoverable CDN 403; the final
form reload returned HTTP 200. The complete result is preserved in
`brand-submission-live-final-2026-11-17.json`. Account authentication remains
disabled to avoid mixing the two websites' identities. Brand submissions remain
enabled and are reviewed privately before publication.

## Separate catalog maintenance

The scheduled offer refresh had stopped before crawling because its generated
snapshot conflicted with published main. The automation branch was reconciled
against the published snapshot, preserving URL history, and a real source
refresh was triggered. Its separate checked release must finish before catalog
freshness can be reported as current; no freshness timestamps were fabricated.
