# Brand discount SEO

The primary search landing pages for brand discount queries live at `/discounts/[slug]`. `/discounts` links to every currently indexable brand guide. Hostinger and Namecheap have guides backed by sourced coupon records. Ten brands have original editorial buying guides, reviewed against official sources on 2026-10-21.

| Landing page | Search intent and editorial focus |
| --- | --- |
| `/discounts/beehiiv` | beehiiv discount / promo code; newsletter tiers, growth budgets, migration and annual commitment |
| `/discounts/predis-ai` | Predis discount / Predis.ai coupon; usable-content cost, generation usage, brands and publishing |
| `/discounts/snov-io` | Snov discount / Snov.io coupon; credits, recipients, separate services and campaign budgets |
| `/discounts/ocoya` | Ocoya discount / promo code; profiles, users, shared credits and trial conversion |
| `/discounts/taplio` | Taplio discount / coupon; yearly, team and bundle eligibility and non-stacking rules |
| `/discounts/systeme-io` | Systeme.io discount / coupon; launch validation, contacts, funnels and migration costs |
| `/discounts/smartlead` | Smartlead discount / coupon; contact storage, follow-ups, infrastructure and add-ons |
| `/discounts/streamyard` | StreamYard discount / coupon; individual/business eligibility and recording workflows |
| `/discounts/anytrack` | AnyTrack discount / coupon; sessions, websites, integrations and overages |
| `/discounts/baremetrics` | Baremetrics discount / coupon; revenue eligibility, integrations and analytics evaluation |

Each editorial page includes a distinct title and description, an original introduction and buying summary, a workflow comparison table, four or more substantive sections, brand-specific redemption steps, visible questions, official references and relevant links to other guides. These are original buying considerations, not hands-on product reviews or checkout tests. Volatile numeric observations live in the dated source-notes panel, which is hidden after 30 days without review. Ocoya now has a corresponding sourced catalog profile at `/tools/ocoya`.

## Page responsibilities

- `/discounts/[slug]`: brand-wide coupon availability, sourced offers, billing guidance, eligibility, redemption, and questions.
- `/deals/[slug]`: one specific coupon, free plan, trial, or promotion with its individual terms.
- `/tools/[slug]`: product features, pricing research, alternatives, and a server-rendered discount availability section for every brand.

Each page has its own canonical URL. Tracking parameters canonicalize to that clean URL. Brand pages have unique title tags, descriptions, Open Graph and Twitter cards, and generated brand sharing images. Breadcrumbs, software entities, and the visible offer list are represented in JSON-LD. No coupon acceptance, rating, Product rich result, or FAQ rich result is promised.

## Adding another brand

1. Confirm a real tool profile and an official provider URL exist.
2. Publish a sourced coupon or monetary offer through the existing reviewed-offer and catalog refresh workflow. The current catalog requires checks within 14 days and excludes published expirations.
3. For a brand without a monetary offer, write original buying guidance in `lib/data/brand-discount-guides.ts`. Include a distinct description, official source, actual review date, billing or eligibility considerations, and useful questions. Do not copy a guide and only replace the brand name.
4. The brand route is created for an editorial guide or a brand with historical sourced coupon evidence. A non-editorial guide with no current coupon or saving becomes `noindex, follow` and leaves the sitemap and directory until refreshed. Established URLs can still explain that no offer is recorded.
5. Editorial pricing observations disappear after 30 days without review. Review the actual source before changing the date. Evergreen guidance stays visible.
6. Refresh the catalog before the 14-day source window ends; do not merely update timestamps. If refreshing fails, investigate the source rather than creating a replacement claim.

## Validation and release

Run `npm run build`, start production on a spare port, then run:

```sh
npm run seo:audit:brands -- http://localhost:3210
npm run seo:audit -- http://localhost:3210
```

The first command checks twelve brand routes in rendered HTML, including editorial depth, workflow tables, redemption steps, sources, related guides, links, schema, query canonicals, unknown-brand 404s, browser/bot metadata, and generated images. The second checks the complete sitemap and other existing SEO protections.

After deployment, submit `https://saasfolio.tech/sitemap.xml` in Google Search Console and Bing Webmaster Tools. Inspect the priority brand URLs in Search Console, check the rendered page, and request indexing. Deployment and Search Console submission must be performed separately; local validation does not publish or submit URLs.

Review Search Console performance weekly by landing page and brand query family. Track impressions, clicks, click-through rate, average position, indexed status, and offer freshness. Compare similar 28-day periods. Use observed queries to improve the actual guide, rather than adding repetitive keyword variants. Build further brand guides around real merchant information and original guidance.

Google chooses whether to index a page, its search position, title link, and snippet. Good metadata and technical SEO support discovery; they do not guarantee a placement. Useful, maintained content and relevant earned links remain ongoing work.

## References checked

- [Google: title links](https://developers.google.com/search/docs/appearance/title-link)
- [Google: snippets and descriptions](https://developers.google.com/search/docs/appearance/snippet)
- [Google: crawlable site navigation](https://developers.google.com/search/docs/specialty/ecommerce/help-google-understand-your-ecommerce-site-structure)
- [Google: spam policies](https://developers.google.com/search/docs/essentials/spam-policies)
- [Predis.ai official pricing](https://predis.ai/pricing/)
- [beehiiv official pricing](https://www.beehiiv.com/pricing)
- [beehiiv plan and subscriber-tier help](https://www.beehiiv.com/support/article/23874462928663-plan-types-and-subscriber-plan-tier-pricing)
- [Snov.io official pricing](https://snov.io/pricing)
- [Ocoya official pricing](https://www.ocoya.com/pricing)
- [Taplio official plan help](https://intercom.help/taplio/en/articles/17172779-taplio-plans-and-pricing-starter-growth-and-pro-compared)
- [Taplio official discount rules](https://intercom.help/taplio/en/articles/17357648-discounts-and-coupon-codes-on-taplio)
- [Systeme.io official pricing](https://systeme.io/pricing)
- [Smartlead official pricing](https://www.smartlead.ai/pricing)
- [StreamYard official pricing](https://streamyard.com/pricing)
- [AnyTrack official pricing](https://anytrack.io/pricing)
- [AnyTrack feature comparison](https://readme.anytrack.io/docs/plan-comparison)
- [Baremetrics official pricing](https://baremetrics.com/pricing)
