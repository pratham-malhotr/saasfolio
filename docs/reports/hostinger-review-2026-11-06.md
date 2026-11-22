# Hostinger dashboard review — 6 November 2026

This opening section records the initial inspection before the owner's authorization to apply further improvements. The completion follow-up at the end supersedes the unresolved country-filter and deployment findings.

Inspected the user's existing, authenticated Hostinger tab in Brave through its enabled Apple Events page scripting. This is dashboard/UI evidence, not REA/CDP evidence or a test originating from a verified Google crawler. Only navigation, reading and one dashboard reload were performed. No deployment, country list, security level, account verification, email, purchase or hosting setting was changed.

The deployment history for saasfolio.tech shows GitHub connected to `pratham-malhotr/saasfolio`, branch `main`. Commit `254fb750f3bcec03855a20082b5dc1dcf71b2052` (`fix(contact): route public inquiries to owner email`) is marked **Completed** and **Current**, displayed at `2026-11-06 10:09:01`. The preceding `867d15e9` release is also completed. Older October 29 entries show build failures; they are not the current deployment. A generic dashboard tooltip saying auto-deployment was off conflicts with the concrete GitHub-connected deployment history and is not treated as proof that the connection is disabled.

The dashboard indicates HTTPS/SSL and CDN enabled and reports no malware found over the preceding 30 days. The CDN security selector is **Medium**, rather than Under Attack. The Traffic blocking section states that no IP addresses are blocked. These settings were inspected without changing them.

The unresolved finding is the country filter at:

`Websites → saasfolio.tech → Performance → CDN → Manage → Traffic blocking`

The visible country-mode control has **Allow only specific countries** selected (`aria-selected="true"`); **Block specific countries** is unselected. The list says **No countries are allowed**, and the panel warns that no traffic will reach the website until at least one country is allowed. The selection persisted through a dashboard reload, reopening Traffic blocking and a further five-second settling period. No confirmation dialog or explicit load/save error was displayed.

A fresh ordinary public GET to https://saasfolio.tech/ returned HTTP 200 with the expected SaaSFolio page, rather than a hosting challenge. Consequently, the panel warning does not establish that all visitors or verified Google crawlers are currently blocked. The discrepancy remains unresolved; no underlying CDN API configuration, worldwide reachability or Google-origin request was inspected.

For a globally public publication, the concrete proposed correction is **Block specific countries** with an empty blocked-country list. Hostinger documents that changing country modes clears the existing country list. The displayed current list is empty. Applying this proposal changes sitewide visitor access and was not performed during this inspection.

Before an AdSense resubmission, resolve or confirm this country-filter state, then run Google Search Console's live URL test and inspect AdSense's own crawler-access status. Search Console's test and AdSense's review crawlers are separate; ordinary public requests do not certify either.

References:

- [Hostinger country-filter modes](https://www.hostinger.com/support/7931101-hostinger-cdn-how-to-block-countries/)
- [Hostinger verified crawler access and live testing](https://www.hostinger.com/support/hostinger-cdn-search-engine-crawlers-and-seo/)
- [Earlier live-site audit](live-adsense-audit-2026-11-06.md)

The dashboard's Page Speed scores were dated October 27, before the latest content and payload changes. They were not treated as current performance measurements, and no new speed benchmark was run in this inspection. Environment-variable values, credentials, other websites and external account messages were not accessed or changed.

## Authorized completion follow-up

After the owner authorized the remaining improvements, the empty country allowlist was changed to **Block specific countries**, with no countries blocked. The saved selection persisted through a reload. CDN security remains Medium. This removes the contradictory empty-allowlist configuration; it does not establish that Google had previously been blocked.

Actual Google Search Console smartphone live tests subsequently fetched the homepage, editorial policy and budget guide successfully. The domain property's manual-action and security reports both showed no issues. The sitemap was resubmitted successfully and now reports 399 discovered pages. These are Search Console results, not an AdSense approval.

A newly completed Hostinger mobile Page Speed result dated November 6 at 10:35:20 scored **93/100**: FCP 2.2 seconds, LCP 2.2 seconds, TBT 120 milliseconds, CLS 0. This is a provider lab result rather than field performance data.

The final publisher-usability patch passed all required GitHub checks and was merged as `334080426885e53be70ebf273e675837a9a02021`. Hostinger now marks that release **Completed** and **Current**, displayed at `2026-11-06 14:51:04`. Standard public URLs and normal Brave tabs show the deployed email drafts and revised homepage. See [the completed readiness report](adsense-readiness-followup-2026-11-06.md) for validation and remaining AdSense review status.
