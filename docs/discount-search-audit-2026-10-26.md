# Individual SaaS brand discount search review

Reviewed 26 October 2026 across the source, direct public HTML, official provider material and a local production build. Three parallel reviews covered original content, individual landing pages and technical SEO.

## What the evidence shows

The public site already exposes 46 original brand discount guides. Its homepage describes SaaS discounts; individual guides have their own canonicals and link to separate product profiles. Direct public HTML for beehiiv includes the existing savings and eligibility guidance, even though a cached search extraction showed older content. Search snippets are not a reliable deployment check.

Search Console query-to-page data was unavailable. The reported Semrush/rank-tracker impressions therefore cannot be attributed to a particular landing URL or diagnosed as a site-wide positioning problem. Existing product profiles describe those tools. Preserve their useful product intent while making reviewed discount guides easier to discover from relevant buying pages.

## Changes

| Area | Result |
| --- | --- |
| Homepage | Twelve direct brand guide links, including beehiiv, Predis.ai, Taplio and Baremetrics, with explicit discount labels. The selection is editorial and does not claim measured popularity. |
| Discount directory | Concise alphabetical brand links above the detailed category cards. |
| Category pages | All reviewed guides in the matching software category appear before the offer filters, including when there is no current individual coupon. |
| Comparisons | Direct links to the reviewed discount guides for the two compared brands. These links are rendered on the server. |
| Mobile categories | Filter, sort and submission controls wrap within the device width instead of making category pages horizontally scroll. |
| Individual guides | Separate status for coupon codes, provider savings and free access; code listings grouped apart from other offers; working section links. |
| Product profiles | Shortcuts to the guide’s coupon status, provider savings, eligibility and redemption sections when available. |
| Priority content | Four guides refreshed from current official sources with direct best-value answers and specific redemption, renewal and eligibility guidance. See [the source review](discount-content-review.md). |
| Freshness | Dated editorial FAQs and search descriptions now expire with the provider savings review. Old percentages and trial terms cannot survive in those surfaces after the table expires. Evergreen guidance remains available. |
| Audits | Added followed/descriptive discovery links, exact category/comparison destinations, section targets, profile shortcuts, distinct product/discount canonicals, Googlebot directives and direct sitemap URL checks. |

No public coupon, exclusive promotion, checkout test or seasonal sale was invented. The offer snapshot and its evidence dates were not modified.

## Search intent and measurement

Maintain one canonical guide per brand for discount, coupon and promo variants. Use specific offer pages for individual promotion terms and product profiles for pricing/features/alternatives. Do not make near-duplicate pages for every query variant.

| Query family | Landing page |
| --- | --- |
| beehiiv discount / coupon / promo code | `/discounts/beehiiv` |
| Predis / Predis.ai discount / promo code | `/discounts/predis-ai` |
| Taplio discount / coupon / student discount | `/discounts/taplio` |
| Baremetrics discount / annual discount / startup offer | `/discounts/baremetrics` |
| Notion, Canva, Slack or Hostinger discounts | The matching existing `/discounts/[brand]` guide |
| SaaS discounts by brand | `/discounts` |

These are supported content targets, not measured keyword volumes or promised rankings. A student/startup question can have a useful negative or conditional answer when the provider does not publish an eligible offer.

After deployment, inspect the changed homepage, directory and four priority guides in Search Console. Confirm the live rendered content and Google-selected canonical, then request recrawling and submit/recheck the existing sitemap. [Google explains that recrawling can take days to weeks and does not guarantee inclusion](https://developers.google.com/search/docs/crawling-indexing/ask-google-to-recrawl).

For a baseline, compare the last 28 days with the preceding 28 days, using the same country/device filters. Filter queries with `(?i)(discounts?|coupons?|promo|voucher|offers?)`, then inspect the Pages tab for each priority brand. Record impressions, clicks, CTR and average position for its canonical guide. Separately inspect the reported Semrush/rank-tracker queries and their actual landing URLs. Compare again after recrawling; annotate deployment and review dates. Do not infer a ranking improvement from audit passes alone.

## Validation

The combined production build, TypeScript, catalog validation and 22 offer/savings tests pass. ESLint reports zero errors and six existing warnings in authentication/navigation files. The enhanced rendered audits pass all 46 guides, 991 sitemap pages, 1,976 JSON-LD blocks and 55 sharing images, including contextual links and additional internal destinations.

The focused discount Chrome smoke passes on the final build: five brand guides at 390px and 1440px, actual device-width checks, availability states, section navigation, category/comparison links and cold no-JavaScript discovery from the homepage, directory, categories, comparisons and product profiles. It caught the category filter overflow fixed above. No signup, checkout or external offer was opened by this focused check.

Reproduce with `npm run test:browser:discounts -- http://127.0.0.1:3210` after building and starting the local production server. Chrome must be available; set `CHROME_PATH` outside macOS.

The existing full browser smoke reached its separate no-JavaScript Hostinger external-navigation check and failed there. That broader suite is not represented as a pass.

Repository changes are prepared locally. No deployment or Search Console submission is implied by this report.

The linking and title changes follow [Google’s crawlable link guidance](https://developers.google.com/search/docs/crawling-indexing/links-crawlable) and [title-link guidance](https://developers.google.com/search/docs/appearance/title-link). The implementation emphasizes useful brand-specific answers, source evidence and relevant navigation.
