# SEO implementation and deployment checklist

The expanded catalog keeps the current design and adds 12 crawlable category
pages. See [catalog and offer operations](CATALOG-AND-OFFERS.md) for source
provenance, duplicate consolidation, stale offers, and scheduled updates.

See the [26 October brand discount search review](discount-search-audit-2026-10-26.md)
for the current landing-page improvements, source reviews and Search Console
measurement procedure.

The [24-guide expansion](brand-discount-expansion-2026-10-26.md) adds twelve
providers and a repeatable nine-intent audit for each brand's canonical guide.

## Implemented

- Unique server-rendered titles and concise descriptions for public pages.
  Product descriptions, codes, and offer terms determine search copy; the site
  does not claim checkout tests, success rates, or coupon stacking without proof.
- Canonical URLs use `NEXT_PUBLIC_SITE_URL` (default `https://saasfolio.tech`).
  Duplicate brand names resolve to one profile; legacy profile and offer URLs
  permanently redirect to current canonical pages. Filter/tracking query strings
  canonicalize to their hub, and reversed comparisons resolve to a curated pair.
- Category pages publish real catalog counts and filtered collections using the
  existing deals UI. Homepage category cards link to these crawlable URLs.
- `Organization`, `WebSite`, `WebPage`, `CollectionPage`, `ItemList`,
  `SoftwareApplication`, `Article`, and `BreadcrumbList` JSON-LD is rendered in
  HTML. Software entities describe features and official URLs without invented
  `AggregateRating`, `Review`, `Offer`, or price fields. FAQ schema matches visible
  deal FAQs; profiles do not publish invisible FAQ content. JSON-LD escapes `<`.
- Public profiles, sourced offers, category collections, comparisons, articles,
  and discussions are in the canonical sitemap. Pricing-only offer pages use
  `noindex, follow` and are excluded to avoid duplicating profiles. Modification
  dates come from recorded content/evidence changes or article dates.
- Pages depending on offers and the sitemap revalidate hourly. Offers expire
  according to published dates or a 14-day source freshness limit.
- Immediate `/go/[id]` server redirects preserve offer-specific destinations and
  query parameters. Unknown identifiers return 404. Redirects are `noindex` and
  uncached, and affiliate links use `sponsored nofollow` attributes.
- Admin, authentication, profile, member, and submission routes remain noindex.
  Public missing pages use `notFound()`. Assets and noindex pages remain
  crawlable so bots can read directives; API paths are excluded in robots.txt.
- Open Graph and Twitter previews, the shared 1200 × 630 image, article images,
  and optional Google/Bing verification metadata are preserved.

## Validate locally

```sh
npm run validate:catalog
npm run test:offers
npm run build
npm run start -- --hostname 127.0.0.1 --port 3210
# In another terminal:
npm run seo:audit -- http://127.0.0.1:3210
```

The production-response audit checks every sitemap page, JSON-LD, headings,
canonical metadata, internal destinations, sharing images, noindex utilities,
invalid routes, legacy links, and real redirect headers.

## Deploy and submit to search engines

1. Set the values in [SEO.env.example](SEO.env.example), using the public HTTPS
   production origin. Build and deploy this revision to the host serving
   saasfolio.tech. Local changes do not publish the site.
2. Add the Domain property `saasfolio.tech` in
   [Google Search Console](https://search.google.com/search-console). Verify
   ownership using Google's supplied DNS TXT record. A URL-prefix property can
   alternatively use the configured HTML verification token.
3. Submit `https://saasfolio.tech/sitemap.xml` in the Sitemaps report. Use URL
   Inspection to test the homepage, a category, a newly added brand, and a sourced
   offer, and request indexing for representative pages.
4. Keep HTTPS and the canonical hostname consistent in the host/DNS settings.
   Confirm any alternate-host redirects in the deployed environment.
5. Test representative pages in Google's
   [Rich Results Test](https://search.google.com/test/rich-results). Software
   entity markup alone does not promise software rating or merchant rich results.
6. Optionally verify [Bing Webmaster Tools](https://www.bing.com/webmasters/) and
   submit the same sitemap.
7. Publish and enable the offer refresh workflow, and connect its commits to the
   hosting deployment as described in the catalog operations guide.

## Content work that remains separate

Existing editorial articles, example community discussions, audience statistics,
product benchmarks, and some legacy descriptions are demonstration-style content
and have not all received factual review. The catalog expansion does not certify
those claims, author credentials, or testimonials. Publish original research,
screenshots, accurate reviewer attribution, and dated vendor evidence before
presenting them as independent tested reviews.

Search Console impressions and queries should guide future editorial work.
Indexing and rankings depend on the search engines, content quality, site access,
and external signals; metadata and a larger catalog cannot guarantee a position.
