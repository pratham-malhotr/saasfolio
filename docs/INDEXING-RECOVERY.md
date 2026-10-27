# Search Console indexing recovery — 27 October 2026

The site already serves its generated XML sitemap at [https://saasfolio.tech/sitemap.xml](https://saasfolio.tech/sitemap.xml). Its source is `app/sitemap.ts`; `app/robots.ts` advertises it. Do not add a second conflicting static sitemap or replace the generated file with a stale export.

The [validation ledger](reports/indexing-validation-2026-10-27.json) records live response counts, local redirect destinations, test results and raw-evidence digests. After the redirect correction, all four targeted production-preview checks passed with one 308 followed by a self-canonical, indexable 200 page. The full build, 24 offer/history tests and nine indexing-audit tests passed.

## What the live crawl established

Using ordinary public GETs from this connection, all **1,009 URLs in the live sitemap returned 200**. The sitemap and robots.txt also returned 200. The complete local production SEO audit passed 1,009 sitemap pages, 2,012 JSON-LD blocks, 79 sharing images and 900 additional internal destinations, including canonical/noindex and missing-page checks.

Four URLs recovered from actual repository offer history returned 404 on the deployed site:

| Previously published URL | Intended permanent destination after deployment |
| --- | --- |
| `/deals/meetgeek-free-plan` | `/discounts/meetgeek` |
| `/deals/browserbase-free-plan` | `/tools/browserbase` |
| `/deals/dubb-free-trial` | `/tools/dubb` |
| `/deals/recraft-free-plan` | `/tools/recraft` |

These examples were discovered from retained catalog evidence, **not** from an authenticated Search Console export. The exact URLs behind the owner's 403, other-4xx and 5xx reports have not been supplied. No current 5xx response was reproduced in the sitemap crawl.

The live crawl also found that `www.saasfolio.tech` serves duplicate pages rather than redirecting to the declared apex host. The new application configuration permanently redirects this alternate host to the canonical origin while retaining the path and query.

## Fixes prepared in the repository

- A durable registry preserves 1,565 exact historical offer identifiers and their canonical brands. Source refreshes retain this identity before replacing/deleting current offer evidence. The scheduled workflow publishes the registry and snapshot together.
- Known retired offers redirect to an indexable guide or profile for that same available brand. Old claims are not revived as active coupons. Fabricated identifiers and unavailable/unknown brands retain honest 404 behavior; the site does not redirect all errors to the homepage.
- Only the page owns the redirect. Metadata supplies the destination's canonical URL without independently redirecting. Real HTTP testing exposed duplicate `Location` headers when both phases redirected; this pattern was removed from deal and brand routes.
- A repeatable indexing audit produces JSON/CSV evidence for sitemap responses, canonical/indexing directives, HTTP failures, safe redirects and optional Search Console URL imports. It separates intentional private/noindex pages from unexpected public failures and never calls API, authentication or newsletter-confirmation routes from an imported URL list.

The sitemap continues to contain current canonical public pages, excluding account utilities, browser-local community previews, unavailable providers and pricing-only offer placeholders. Retired identifiers are redirect records, not new sitemap entries.

## Check the reported 403/4xx/5xx errors

A request from this connection using a Googlebot user-agent string received a small Hostinger 403 document, while ordinary requests worked. **This does not prove verified Google crawlers are blocked.** Hostinger checks crawler IPs/DNS and deliberately rejects impersonated crawler user agents. Use Google's live URL test or verified crawler logs as the deciding evidence. [Hostinger crawler documentation](https://www.hostinger.com/support/hostinger-cdn-search-engine-crawlers-and-seo/), [Google crawler verification](https://developers.google.com/crawling/docs/crawlers-fetchers/verify-google-requests)

For a failing **verified** live test, review Hostinger Dashboard → Websites → this site → Performance → CDN → Manage. Check whether attack mode, country/IP restrictions or explicit bot-blocking rules affect Google. Adjust the specific rule supported by the failure evidence; do not allow every request merely claiming to be Googlebot. If failures persist, give Hostinger support the exact URL, method, UTC time, Search Console result and `x-hcdn-request-id` from the failing response. No support message has been sent by this work. [Hostinger's troubleshooting procedure](https://www.hostinger.com/support/hostinger-cdn-troubleshooting-website-errors/)

For 5xx, compare the failing time with the Node application/restart/resource logs and CDN logs. An old Search Console event is not proof of a continuing error. For 429, retain `Retry-After` and identify the layer imposing the limit. Public catalog pages do not call the account request limiter. Auth/API 401/403 and genuinely unknown-page 404 can be intentional and should not be converted to public indexable pages. [Google's HTTP-status guidance](https://developers.google.com/crawling/docs/troubleshooting/http-status-codes)

## Deploy, submit, and validate

1. Deploy a fresh build of this revision to the Hostinger application serving `saasfolio.tech`, then restart the application. Publishing source code and validating a local build do not establish a successful production deployment. If a redirect still serves an older response, clear the relevant hosting/CDN cache and repeat the check. Authentication activation has its own [owner guide](AUTH-OWNER-SETUP.md).
2. Verify the four old URLs return a single 308 followed by the indicated 200 destination. Confirm `https://www.saasfolio.tech/sitemap.xml` redirects once to the apex sitemap and that the apex sitemap/robots remain readable.
3. In the verified `saasfolio.tech` Search Console property, open **Sitemaps** and submit `https://saasfolio.tech/sitemap.xml`. Remove obsolete sitemap submissions only after confirming they point to an obsolete or missing file.
4. In **URL Inspection**, use **Test live URL** for an affected URL and its canonical destination. Follow the relevant Page indexing issue's **Validate fix** action after deployment and a successful live test. A retired URL becoming “Page with redirect” is expected; the destination is the URL intended for indexing.
5. Export examples for any remaining 404, 403, other-4xx or 5xx issue and run the audit below. Keep private reports outside the public repository. Google decides indexing; a sitemap helps discovery and does not override access errors or guarantee inclusion. [Google sitemap guidance](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap)

```sh
# Full local production audit (start the production server on port 3214 first):
npm run seo:audit:indexing -- http://127.0.0.1:3214 --json /tmp/indexing-local.json --failures-csv /tmp/indexing-local.csv

# Check actual exported URL examples and redirect targets after deployment:
npm run seo:audit:indexing -- https://saasfolio.tech --urls /path/to/search-console.csv --urls-only --json /tmp/indexing-gsc.json --failures-csv /tmp/indexing-gsc.csv
```

The audit defaults to two concurrent requests with pacing and uses an ordinary diagnostic user agent. An optional Googlebot user-agent test is a synthetic comparison, not a substitute for Google's verified live inspection. Reports explicitly label imported-only checks so they cannot be mistaken for a new full-site crawl.
