# SaaSFolio discount SEO audit

Audit date: 23 October 2026. Scope: local source, the public homepage, search discovery, provider pricing sources, and production HTML from the local build.

The follow-up [individual brand SEO notes](brand-seo.md) document the expansion to sixteen original guides, brand-specific eligibility and troubleshooting, and permanent redirects for name variants. Validation totals below describe the initial homepage-focused pass.

## Findings

The supplied screenshot path had expired, and Search Console query/page data was not available. This audit cannot establish which URL receives the reported rank-tracker impressions or whether those impressions represent a site-wide problem.

The source contains legitimate Ranktracker and other SEO-tool profiles. Global metadata does not describe SaaSFolio as a rank tracker. A relevant product profile can receive impressions for that product while the business itself is a software discount directory. Check the landing page for the reported query in Search Console before removing pages or changing their indexing.

Several observable issues weakened the discount focus:

| Finding | Change |
| --- | --- |
| The homepage H1 was “DISCOVER. SAVE. SCALE.” | The primary heading now describes SaaS discounts and software deals. |
| The homepage emphasized architecture reviews, tech stacks and unrelated technical topics | Introductory text, search prompt, discovery links, calls to action and decorative tickers now focus on software savings. Unsupported “verified coupon” claims were removed from these sections. |
| The main navigation omitted `/discounts` | Discounts now has a main navigation link. |
| The priority brands were largely absent from homepage content | A server-rendered section links to eight original brand guides, with beehiiv, Predis.ai, Taplio and Baremetrics first. |
| Annual savings were buried in editorial source notes | Ten guides now show reviewed savings options, conditions, source links and review dates near the top. |
| The discount hub was a flat list with little buying guidance | It now groups brands by category and explains coupon codes, annual billing, trials, eligibility and renewal costs. |
| Two priority brands were missing from footer shortcuts | Taplio and Baremetrics now have direct discount-guide links beside beehiiv and Predis.ai. |
| A Taplio pricing help link returned 404 | It now points to the current official pricing article. |

The site already had individual discount canonicals, a public sitemap, utility-page noindex rules, related-guide links, source attribution and brand social images. These protections were retained and checked. The homepage now also identifies its featured discount guides in JSON-LD, and the shared website entity describes the software savings topic.

## Search intent and landing pages

Keep one primary landing page for each brand’s discount intent. Individual `/deals/` URLs describe specific offers; `/tools/` URLs describe product features and alternatives.

| Query intent | Primary URL |
| --- | --- |
| SaaS discounts, software coupon codes | `/` |
| SaaS discounts by brand, software discounts | `/discounts` |
| beehiiv discount, beehiiv promo code, beehiiv coupon | `/discounts/beehiiv` |
| Predis discount, Predis.ai discount code, Predis promo code | `/discounts/predis-ai` |
| Taplio discount, Taplio coupon code, Taplio annual savings | `/discounts/taplio` |
| Baremetrics discount, Baremetrics coupon code | `/discounts/baremetrics` |
| Snov.io, Ocoya, Systeme.io, Smartlead, StreamYard or AnyTrack discount | The matching `/discounts/[brand]` guide |
| Specific coupon or promotion conditions | Its individual `/deals/[offer]` page |

These are content targets, not measured search volumes or promised rankings. Do not create separate near-duplicate pages for “coupon,” “promo” and “discount” versions of the same brand query.

## Reviewed provider sources

The new savings summaries are based on official sources checked during this audit. An annual billing reduction is distinct from a coupon code. No checkout verification or exclusive partnership discount is asserted.

| Brand | Source and recorded option |
| --- | --- |
| beehiiv | [Official pricing](https://www.beehiiv.com/pricing): yearly billing savings depend on the selected subscription. |
| Predis.ai | [Official pricing](https://predis.ai/pricing/): annual reductions differ across the displayed plans. |
| Taplio | [Official discount policy](https://intercom.help/taplio/en/articles/17357648-discounts-and-coupon-codes-on-taplio): yearly pricing, organization seats and eligible bundles; stacking restrictions apply. [Current plan article](https://intercom.help/taplio/en/articles/17357650-taplio-plans-and-pricing-starter-growth-and-pro-compared) replaces the broken source. |
| Baremetrics | [Official pricing](https://baremetrics.com/pricing): annual savings depend on the eligible package; revenue bands and integrations matter. |
| Snov.io | [Official pricing](https://snov.io/pricing): annual Sales Suite savings; other services have their own pricing. |
| Ocoya | [Official pricing](https://www.ocoya.com/pricing): yearly billing option, with profile, credit and user limits to compare. |
| Systeme.io | [Official pricing](https://systeme.io/pricing): annual billing option, separate from the free plan. |
| Smartlead | [Official pricing](https://www.smartlead.ai/pricing): yearly software pricing; infrastructure and additional services need a separate budget. |
| StreamYard | [Official pricing](https://streamyard.com/pricing): yearly billing, with individual/business eligibility to check. |
| AnyTrack | [Official pricing](https://anytrack.io/pricing): annual billing option; website limits and session overages matter. |

Editorial savings options disappear from tables, summary cards and generated savings FAQs after 30 days without a new review. Future-dated observations are also suppressed. The existing live offer catalog has a separate 14-day source freshness limit and respects published expiries. An expired observation does not remove the original evergreen guide.

Maintain these review dates only after inspecting the sources again. Source checks establish what a provider publishes, rather than successful acceptance at checkout.

## Validation

Run after building and starting the production server:

```sh
npm run build
npm run start -- --hostname 127.0.0.1 --port 3210
npm run seo:audit:brands -- http://127.0.0.1:3210
npm run seo:audit -- http://127.0.0.1:3210
npm run test:offers
npm run validate:catalog
```

The brand audit checks the homepage's discount intent and links, then exercises all 12 brand discount pages, metadata, sitemap inclusion, canonicals, structured data, visible FAQs, provider savings tables, related links, tool profiles and social images. It accounts for Next.js streaming HTML when inspecting the homepage.

The full production audit covers 986 sitemap pages, 1,966 JSON-LD blocks, 21 sharing images, internal destinations, utility noindex directives, missing pages and query canonicals. Offer tests include a clock-controlled regression verifying that savings expire from summaries and FAQs while the guide remains available.

Repository-wide ESLint currently has existing errors in unrelated animation, community, modal and redirect components. The files changed for this SEO work are checked separately. The pre-existing advertising-script edit in `app/layout.tsx` is preserved.

## After deployment

1. Inspect `/`, `/discounts` and the four priority brand guides in Google Search Console. Confirm the rendered heading, canonical, indexability and Google-selected canonical; request indexing for these changed pages.
2. Submit or recheck `https://saasfolio.tech/sitemap.xml` in the correct Search Console property. The sitemap URL was already present in `robots.txt`.
3. For the reported rank-tracker query, open the **Pages** tab in Performance. Record the actual landing URL, impressions, clicks and position. A product-profile result and a homepage result call for different follow-up decisions.
4. Record a deployment-date baseline. Compare equal 28-day periods for `/discounts/` pages and queries matching `(?i)(discount|coupon|promo|deal|offer)`. Inspect the priority brands separately. Track clicks and conversions alongside impressions and position.
5. Keep provider observations reviewed and correct expired promotions. Build additional brand guides when there is original, sourced savings guidance to publish. Avoid expanding the index with empty coupon pages or invented codes.

Google's guidance supports [clear, descriptive titles and prominent headings](https://developers.google.com/search/docs/appearance/title-link) and [crawlable links with meaningful anchor text](https://developers.google.com/search/docs/crawling-indexing/links-crawlable). Its [SEO starter guide](https://developers.google.com/search/docs/fundamentals/seo-starter-guide) explains that changes need time to be reflected and do not guarantee a particular ranking. These edits improve the site's signals and usefulness; Search Console is needed to measure the result after deployment.
