# SaaSFolio impression-drop investigation — 31 October 2026

The reported change from approximately 1,000+ daily impressions to 4–5 has **not yet been independently verified in the reporting account**. The owner has not supplied the dashboard, comparison dates, filters or exported performance data. A public technical crawl cannot establish whether Google impressions actually fell, which queries lost visibility, or why Google changed rankings.

The live audit found healthy responses across the existing sitemap, an older deployment missing 77 newer source URLs, oversized collection HTML that exceeds Google's fetch limit, CDN challenges requiring verification with Google, and skipped production monitors. These findings warrant action, but none alone proves the cause of the reported decrease.

The owner's subsequent clarification places the decline specifically after a good October 29, worsening on October 30 and the start of October 31. See the [date-specific follow-up](impression-drop-timeline-2026-10-31.md), including the exact Search Console day boundaries in India and the unmerged automation updates. The public technical issues below have not been shown to originate during that interval.

## Scope and evidence

Checked approximately 01:22–01:30 UTC / 06:52–07:00 India time on 31 October. Repository main and GitHub main both resolve to `b49702b74a858a34a45ed47321b7cdc5f80cd520` (29 October).

- Crawled every **1,099 live sitemap URL**, plus sitemap and robots documents, using the existing paced indexing audit with two concurrent public GETs.
- Ran **114 targeted public page checks** covering all source/live sitemap differences, important landing pages, four previously broken retired offers, aliases, query canonicals, private-page directives and deliberately nonexistent paths.
- Checked **29 distinct JavaScript/CSS resources** referenced by the sampled successful pages.
- Inspected four public pages in fresh mobile Chrome, with JavaScript enabled and disabled: eight visits. Optional Google measurement endpoints were blocked.
- Compared normal requests with synthetic Googlebot user agents, checked HTTP/WWW redirects, examined repository history and read recent GitHub Actions outcomes.
- Consulted Google's current reporting, crawler and incident documentation and Hostinger's crawler documentation.

No application code, production configuration, account, offer, deployment or Search Console setting was changed. Browser navigation automatically encountered Hostinger's JavaScript challenge and sent a validation POST to `/hcdn-cgi/jschallenge-validate`; no form, account or analytics submission was initiated by the audit.

## 1. Existing sitemap pages are technically accessible from this connection

| Check | Observed result |
| --- | --- |
| Live sitemap URLs | 1,099 of 1,099 returned HTTP 200 |
| Canonicals | All sitemap pages have the expected self-canonical in the HTML head |
| Index directives | No unexpected `noindex` on any sitemap page |
| Robots | HTTP 200; allows public pages, excludes `/api/`, advertises the canonical sitemap |
| Sitemap | HTTP 200; valid XML, production host, unique URLs and valid modification dates |
| Crawl failures | No ordinary-request 403, 429 or 5xx in the full sitemap crawl |
| Sampled JS/CSS | 29 of 29 returned HTTP 200 |
| Alternate origins | HTTP redirects to HTTPS with 301; tested WWW route redirects to the apex host with 308 |
| Previously broken retired offers | All four now return 308 to their intended same-brand guide/profile; destinations are healthy sitemap pages |
| Selected page descriptions and structured data | Concise descriptions and parseable JSON-LD on the sampled successful public pages |
| Mobile rendering | Headings and native links present on all eight visits; no uncaught browser exceptions or horizontal overflow |
| JavaScript disabled | Homepage, discount collection, Notion guide and Semrush profile retain visible content and links |

This is a point-in-time observation from one connection, not proof of historical uptime, successful verified-Google access, indexing or ranking.

## 2. The newer source changes are not fully deployed

The current source generates **1,172 sitemap URLs**, while production advertises **1,099**. Comparing URL sets shows **77 source URLs missing from production** and four production URLs omitted by current source. Every one of the 77 source-only URLs was checked and returned **404**.

| Source-only URL family | Count |
| --- | --- |
| Savings collections | 4 |
| Individual discount guides | 24 |
| Software profiles | 23 |
| Offer pages | 23 |
| Articles | 3 |
| Total | 77 |

Examples include `/coupon-codes`, `/startup-deals`, `/student-discounts`, `/nonprofit-discounts`, `/discounts/wp-rocket` and `/articles/find-and-use-saas-coupon-codes`. The live homepage also retains the older “SaaS Discounts, Software Deals & Reviews” title. `/api/ready`, introduced in the later operations changes, returns 404 on production.

The four live-only URLs are `/deals/clickup-free-plan` and three older comparison pages. The current source curates those comparisons differently. These differences establish an older live build; they do not establish the exact deployed commit or prove that a formerly live page disappeared during the reported drop. Hostinger deployment history is needed for that attribution.

**Action:** Inspect the Hostinger deployment branch, build revision and failed-build/restart history. Publish a validated build of the intended revision and verify these exact missing URLs afterward. A successful GitHub push or CI run does not establish a successful Hostinger deployment.

## 3. Two live collections exceed Google's documented fetch limit

| Live page | Uncompressed HTML bytes | End of main content | First Next.js hydration payload |
| --- | --- | --- | --- |
| `/tools` | 4,276,959 | Byte 2,836,809 | Byte 2,850,552 |
| `/deals` | 4,306,652 | Byte 3,261,386 | Byte 3,275,442 |

Google currently documents a **2 MB limit for Googlebot fetches**, applied to uncompressed data; its detailed explanation includes response headers in the budget. Content beyond that cutoff is not passed through for indexing/rendering. [Googlebot documentation](https://developers.google.com/search/docs/crawling-indexing/googlebot), [Google's fetch-limit explanation](https://developers.google.com/search/blog/2026/03/crawler-blog-post).

An approximate first-2,000,000-body-byte parse loses **255 distinct links within the tools main content** and **622 within the deals main content**, compared with the full HTML. Both pages' main content and initial hydration payload extend beyond the cutoff. Head metadata and JSON-LD remain near the beginning. The exact Google boundary also includes headers and may differ from this approximation.

This is a concrete crawl/rendering defect. It does not mean every destination becomes undiscoverable: many also appear in the sitemap and other pages. It also does not, without performance history, establish a new sitewide ranking loss. The existing local build's tools HTML is also over 4 MB, so deploying the current source alone should not be assumed to fix this.

**Action:** Paginate collections using crawlable URLs, bound the initial card count and client data, and keep a useful server-rendered heading and content on every page. Measure uncompressed HTML after implementation and deployment. Compression alone does not resolve Google's uncompressed-size limit.

## 4. CDN access needs a verified Google test

Normal public requests succeeded. Synthetic requests identifying themselves as `Googlebot` received **Hostinger HTTP 403** on both `/` and `/robots.txt`. During ordinary mobile Chrome inspection, the browser also encountered a homepage 403/challenge, then reached the correct public content after Hostinger validation.

Hostinger documents IP/DNS verification for search crawlers and rejects requests that merely impersonate Googlebot. Therefore the synthetic 403 is **not evidence that verified Googlebot is blocked**. Hostinger also documents that Under Attack mode, country restrictions and explicit bot rules can affect legitimate crawlers. [Hostinger crawler guidance](https://www.hostinger.com/support/hostinger-cdn-search-engine-crawlers-and-seo/).

**Action:** Run Search Console → URL Inspection → Test live URL on `/`, `/discounts/notion`, and one URL that lost impressions. Check Settings → Crawl stats → Host status and response distribution. If verified tests fail with 403/429 or robots-fetch errors, correlate the exact UTC time and URL with Hostinger security/access logs. Adjust the specific evidenced rule. Do not allow all clients just because they claim to be Googlebot.

Synthetic homepage request reference: `b4b9e46609b192ef35b2c63706dd891f-mum-edge7`, 31 October at 01:23:34 UTC.

## 5. Monitoring is skipped; repository checks and production are separate

The last 30 GitHub Actions runs include multiple **Production availability** jobs marked **skipped**, including [the most recent observed monitor](https://github.com/pratham-malhotr/saasfolio/actions/runs/41143137841). Its job is skipped before any steps. The workflow is gated by `vars.MONITORING_ENABLED == 'true'`; the observed runs did not pass that gate.

The latest main-branch [Website checks run succeeded](https://github.com/pratham-malhotr/saasfolio/actions/runs/40841552459). An [October 30 offer-refresh run failed](https://github.com/pratham-malhotr/saasfolio/actions/runs/41044023905) during `npm run build` with a `next/font` Google loader `TypeError`; a [later offer-refresh run succeeded](https://github.com/pratham-malhotr/saasfolio/actions/runs/41126271579). These are repository workflow events, not evidence of a production outage or a failed Hostinger deployment. Some PR checks also require action; they are not the deployed site's runtime health.

**Action:** After validating the intended deployment and readiness configuration, activate the production monitor and route failures to the owner's chosen alert destination. The skipped jobs cannot supply historical uptime evidence for the impression-drop window.

## 6. Analytics consent is not the explanation on the inspected deployment

Commit `227765b` on 29 October changed optional GA4 measurement to require consent. However, production still initializes the older `G-7G7TJJENC0` configuration without the new consent prompt, confirmed from both HTML and Chrome. That new consent implementation therefore cannot explain the measured behaviour of this inspected deployment.

Search Console impressions measure appearances in Google results; a page's GA4 tag does not collect those impressions. Analytics page views, Search Console impressions, ad impressions and third-party visibility estimates must be identified before comparing numbers. [Search Console metric definitions](https://support.google.com/webmasters/answer/7576553?hl=en).

## 7. Check reporting freshness before treating “today” as a collapse

Google says the latest Search Console data can be preliminary and change as collection completes. Dotted chart segments indicate preliminary data. Standard daily reports use Pacific time; the 24-hour view uses the browser's local time. [Data freshness](https://support.google.com/webmasters/answer/17011364?hl=en), [dates and time zones](https://support.google.com/webmasters/answer/17011259?hl=en).

At approximately 07:00 India time on 31 October, Pacific time was still approximately 18:30 on **30 October**. Thus an India-calendar “today” and a standard Search Console reporting day are not aligned. The latest 4–5 impressions may be incomplete, but the unavailable dashboard data prevents confirming that explanation.

Google's [Search Status Dashboard](https://status.search.google.com/) showed no current incidents, and its [data-anomalies page](https://support.google.com/webmasters/answer/6211453) listed no new relevant October incident when checked. This does not rule out an unreported service issue or a site-specific ranking change.

## Evidence needed to establish the actual cause

1. Identify the dashboard and exact two dates; record the property's host, search type, date range, “last updated” label, preliminary status and active page/query/country/device/search-appearance filters.
2. For Search Console, export daily clicks, impressions, CTR and position over the available recent history, preferably the last 28 days. Compare equal **completed** periods and the last three finalized days. Do not combine incompatible chart and page-table aggregation totals.
3. Export comparison results by Pages and Queries, preserving the filters. Determine whether the lost impressions belonged to the homepage, guides, product profiles, offers or one concentrated query group. Broad product-name impressions can move differently from discount-intent queries; losing one group must not be inferred without the actual rows.
4. For the top losing URLs, inspect Google's last crawl, selected canonical, index status and live test. Correlate changes with Hostinger deployment and verified crawler logs. Review Manual Actions and Security Issues inside the owner's property; neither was accessible to this audit.

A Search Console/GA4 integration was discovered, but it is **not connected**. The owner can connect Windsor.ai to the relevant reporting account, or provide a Search Console export and screenshots of the chart/date/filters and live inspection results. Credentials should remain in the provider's connection flow.

If finalized days remain near the previous baseline, the tiny latest-day figure reflects reporting-window/freshness behaviour. If finalized impressions also fell, use the losing Pages/Queries plus crawl/index evidence to distinguish access failure, URL changes, canonical reassignment, ranking loss and demand changes. Avoid another broad title/URL/indexing rewrite until that comparison is available. [Google's traffic-drop investigation guide](https://developers.google.com/search/docs/monitor-debug/debugging-search-traffic-drops).

## Saved machine-readable evidence

- [Full live indexing crawl](live-indexing-2026-10-31.json) and [failure CSV](live-indexing-failures-2026-10-31.csv) — zero crawl errors; CSV contains its header only.
- [Source/live sitemap comparison](live-source-sitemap-comparison-2026-10-31.json).
- [Targeted page and asset checks](live-visibility-diagnostics-2026-10-31.json).
- [Mobile Chrome and no-JavaScript visits](live-browser-visibility-2026-10-31.json), including the automatic CDN challenge observation.
- [Google fetch-cutoff analysis](google-fetch-cutoff-2026-10-31.json).
- [Repository workflow evidence](production-workflow-history-2026-10-31.json).
