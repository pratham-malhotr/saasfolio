# Hosting research — November 17, 2026

This release targets specific buying decisions rather than a generic “best web hosting” ranking. Query choices reflect reader intent; search volume and keyword difficulty have not been measured or invented.

| Article | Reader and primary decision |
| --- | --- |
| Hetzner vs DigitalOcean: VPS for a small business website | A developer choosing the complete self-managed setup |
| Vultr vs Linode: choosing a VPS for a small application | An application owner comparing repeatable deployments |
| Hostinger VPS vs managed WordPress for a solo blogger | A publisher deciding who will maintain the server |
| Cloudways vs DigitalOcean: what WordPress management buys | A freelancer comparing management scope and handover |
| Shared vCPU vs dedicated vCPU for WordPress and APIs | An operator diagnosing the bottleneck before upgrading |
| Coolify on a VPS vs managed hosting for a solo developer | A developer budgeting control, state and administration |
| VPS hosting for India: choose a region before a brand | A founder comparing dynamic request paths and billing |
| Hosting discounts: compare the first term and renewal | A buyer normalizing the full prepaid commitment |
| Move web hosts without losing your SEO foundations | A publisher preserving URLs, data and crawl access |
| How a solo publisher can run a WordPress site reliably | A clearly fictional planning scenario for a solo operator |

The ten articles contain approximately 8,000 words of original editorial guidance, nine sections each, concrete exercises, decision records, comparison tables, FAQs, source references and related reading. They do not claim firsthand hosting tests, customer interviews, provider benchmarks or traffic outcomes. The fictional publisher is explicitly identified as fictional.

Official provider pages were inspected through the web tool. Sources include Hetzner Cloud and its billing FAQ; DigitalOcean Droplet allocation and backup documentation; Vultr Cloud Compute documentation; Akamai CPU products; Scaleway instances; UpCloud cloud servers; Hostinger VPS; Cloudways pricing; Kinsta WordPress; SiteGround hosting; DreamHost hosting; Railway pricing; Netlify documentation; WordPress backup guidance; and Google's guidance for hosting moves with and without URL changes. The articles retain the exact reference URLs. Blocked Vultr marketing pages were replaced with accessible official documentation. Contabo was not added to the published set because its source was blocked.

`offer-observations.json` records four provider-sourced introductory offers. Observations preserve duration, renewal and eligibility limitations, do not infer campaign expiry dates, and do not assert checkout acceptance. Source fingerprints explicitly identify their excerpt basis. The catalog's existing 14-day evidence age limit applies. The evergreen articles avoid hard-coding these offers as ongoing entitlements.

`image-prompts.json` records the complete prompts and final paths for four original illustrations made with the built-in image_gen tool. Optimized 1440 × 810 WebP files live in `public/images/hosting/`. Illustrations are labeled and are not presented as provider data-center photographs or benchmark charts. Article-specific social cards combine these assets with each article title.

Approved hosting referral URLs can be configured in the server-only `HOSTING_AFFILIATE_URLS` JSON registry described in `.env.example`. No hosting partner IDs were supplied, so current hosting destinations remain official provider links. A generic brand referral cannot replace a specific promotion's activation path; configure an exact offer-slug mapping for that campaign.

## Follow-up article expansion

Twelve more guides now cover Render versus Railway, Vercel versus a VPS, Cloudflare Pages versus Netlify, Kinsta versus SiteGround for freelancers, ARM container compatibility, managed PostgreSQL, snapshot/backup scope, n8n workload sizing, WooCommerce execution capacity, WordPress notification delivery, bandwidth billing and multiple client sites on one VPS. They add approximately 10,150 words of original analysis. Each contains nine sections, a specific reader, a conditional recommendation, a concrete exercise, a decision record, a comparison table, two FAQs and linked primary sources. The dedicated hosting collection now contains 22 guides and approximately 18,100 words.

Four additional built-in image_gen illustrations cover application deployment, database recovery, WordPress storefronts and hosting networks. The same prompt manifest records all eight optimized project assets. New articles appear first in the hosting collection and the latest-article lists, while the foundational guides link back to relevant new material.

The additional primary-source review used Render deployment and disk documentation; Railway volumes and pricing; Next.js self-hosting; Vercel function limits; Docker multi-platform builds; Hetzner architecture constraints; PostgreSQL backup methods; DigitalOcean PostgreSQL, snapshot and bandwidth documentation; n8n installation and queue-mode guidance; WooCommerce server recommendations; Kinsta PHP performance; SiteGround collaboration and backup documentation; WordPress wp_mail behavior and hardening; Gmail sender requirements; and the Cloudflare/Netlify function references. No keyword-volume estimates, support experiences, performance measurements, client results or prices were fabricated.

## Fourteen additional decision guides

The latest expansion brings the dedicated hosting collection to 36 guides and
the full article catalog to 50. It covers WordPress renewal comparisons,
European VPS choices, stateful application platforms, upload APIs, Ghost
publishing, cache diagnosis, object storage, staging index controls, domain
ownership during a hosting move, recovery objectives and staging billing.
The machine-readable inventory records the current word counts and source URLs.

Each new guide has nine substantive sections, a comparison table, two FAQs,
related reading and a specific audience. Concrete documented constraints include
Render's single-instance persistent disks and deployment limitations, Railway's
volume replica restrictions, Workers' isolate memory and request-body boundaries,
and the difference between Ghost's publishing plans. Recommendations are
conditional editorial judgments. Numerical exercises and publisher scenarios are
explicitly fictional; they do not imply provider benchmarks or customer results.

Ghost joins the directory as the 21st hosting provider, with managed publishing
and self-hosting responsibilities distinguished. Four additional original
illustrations cover location, publishing, performance and reliability. The prompt
manifest now records 12 assets. All 50 articles have a cover and an individual
sharing image, including the older non-hosting articles.

The public article audit measures a reproducible twenty-check on-page checklist.
Its 100/100 results do not assert Google rankings or measured keyword difficulty.
Actual dated Search Console observations and query mappings remain in private,
gitignored owner reports. New guides are explicitly unmeasured when the captured
search reporting period predates their publication. See
[the scoring methodology](../../ARTICLE-SEO-SCORING.md).
