# Hosting article expansion — November 17, 2026

The dedicated hosting library now contains **22 guides and 18,117 words**. This follow-up adds **12 original guides and 10,154 words**, with nine substantive sections per article, reader-specific recommendations, practical exercises, decision records, comparison matrices, FAQs and references to primary documentation.

New articles:

1. Render vs Railway for a Node.js side project.
2. Vercel vs a VPS for a Next.js SaaS application.
3. Cloudflare Pages vs Netlify for an affiliate blog.
4. Kinsta vs SiteGround for freelance WordPress clients.
5. Hetzner ARM vs x86 VPS: check Docker compatibility first.
6. Postgres on your VPS vs a managed database for a small SaaS.
7. VPS snapshots vs WordPress backups: what can you restore?
8. How to size an n8n VPS by workflows and concurrency.
9. Slow WooCommerce checkout: PHP workers, RAM or the database?
10. Hosting email vs transactional email for WordPress forms.
11. How to estimate hosting bandwidth and overage costs.
12. Several client websites on one VPS: costs and isolation.

The new collection leads the hosting hub and latest-article lists. Relevant foundational guides now link back to the new material. Existing article URLs are preserved. Every new article uses the established canonical metadata, tailored description, Open Graph/Twitter preview, Article structured data, sitemap, provider-action and full initial-HTML rendering paths. Topic choices reflect specific reader intent; no keyword volumes, difficulty scores, rankings or traffic outcomes are invented.

Four new original illustrations were generated with the built-in image_gen tool and copied into `public/images/hosting/`: `application-deployment.webp`, `database-recovery.webp`, `wordpress-store.webp` and `hosting-network.webp`. Optimized assets are 1440 × 810 and approximately 48–92 KiB each. The full eight-image prompt set and saved paths are recorded in `docs/research/hosting/image-prompts.json`. The article inventory records reader intent, word count, source URLs, artwork and related reading in `docs/research/hosting/article-inventory-2026-11-17.json`.

Verification:

- All 164 existing unit tests pass.
- TypeScript passes; ESLint has zero errors and the same 12 pre-existing marketing-script warnings.
- Publisher source validation covers 36 articles and reports no repeated substantive editorial paragraphs.
- Catalog validation passes; the raw/public catalog distinction is preserved.
- Production build passes, generating 583 pages.
- Browser verification checks all 22 hosting article responses for canonicals, descriptions, article/social metadata, source-grounded structured data, artwork and complete pre-JavaScript content. Desktop/mobile layouts, shortlist controls, calculator edge cases, no-JavaScript reading, social-image rendering and exact offer redirects pass without runtime errors or broken assets.
- The publisher HTTP audit passes for all 36 source-reference panels, privacy/funding text, ad-free metadata, private cache controls and permanent aliases.

The work is prepared for the user's requested GitHub push in three commits, covering the hosting publishing platform/content, retry-safe submissions, and documentation/evidence. Pre-existing untracked November 6 audit files are excluded.

Production deployment and database activation are separate from pushing source. Existing setup requirements remain: production Supabase secrets and the new intake migration for online submission storage, and approved partner destinations for hosting referral commissions. This content expansion does not claim that those account-side settings were supplied or activated.
