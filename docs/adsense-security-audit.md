# AdSense, security and experience review — October 23, 2026

This review combines public GET requests to `https://saasfolio.tech`, repository and route-handler inspection, the npm advisory service, production-build HTTP audits, and an isolated Chrome session. It does not access the owner's AdSense dashboard, provision a database, send email, make purchases, or certify every external vendor claim. Passing these checks does not guarantee Google's approval.

## Live findings and changes

| Finding before this release | Change |
| --- | --- |
| `ads.txt` returned 404; the AdSense loader ran on every route, including login, legal and missing pages. | Added the existing publisher's seller record and `google-adsense-account` ownership metadata. This release uses verification only and does not request Google ads. Ad serving needs a separate implementation after approval and consent configuration. |
| Privacy text did not explain Google's advertising data use or ad choices. | Added a clear current-state statement, future Google/third-party cookie and device-data disclosures, personalized advertising choices, and links to Google's policies. |
| `/api/auth/session`, `/api/account` and `/api/admin/inquiries` carried `Cache-Control: public` despite private response helpers. | Fixed the global header override. APIs and account/authentication routes now use private, non-storable responses. |
| Public health output exposed runtime/framework versions, environment and process uptime. | Removed those details. Configuration booleans remain public to support honest service-availability notices; they do not establish provider connectivity. |
| Rate-limit keys accepted arbitrary forwarding headers. | Trust an explicitly configured ingress header; Vercel uses its dedicated header. Other unconfigured hosts share an anonymous bucket. See the hosting instructions below. |
| URL validation accepted local/private address variants in submitted websites and some redirect paths. | Use one HTTPS-domain normalizer across submissions, offers and source discovery. Reject credentials, IP literals, local/internal names and explicit nonstandard ports while preserving campaign parameters. This is syntactic validation, not a DNS-rebinding guarantee. |
| Eight articles used unsupported benchmark results and fictitious author credentials. Seeded discussions implied real members and activity. | Replaced the articles with eight original referenced buying guides under the SaaSFolio editorial identity. Old article URLs redirect permanently. Discussions are explicitly editorial prompts with zero invented engagement, marked noindex and removed from the sitemap. |
| Legacy profile pros/cons and comparison headlines implied tested results, rankings and precise costs without evidence. | Removed unsupported evaluations, empty feature panels and benchmark framing. Provider descriptions and external offers still need ongoing source review. |
| Live account, submission and newsletter configuration checks were false. | Forms now explain unavailability, prevent futile submissions and provide an email alternative. This fixes the user experience; it does not configure the missing services or verify mailboxes. |
| Malformed browser discussion storage could break the page or impersonate public activity. | Validate stored drafts, preserve their local-only identity, reject malformed entries and handle invalid vote maps. |
| A root loading boundary could leave the real page hidden on a fresh no-JavaScript visit. | Removed that blanket boundary. Chrome now verifies visible homepage content and functional coupon links before any hydration. |
| Scroll and particle animations had lifecycle issues; reveal animations had no visible starting movement. | Cancel the current animation frame on cleanup, respond to changes in reduced-motion preference and restore actual reveal motion while keeping server-rendered content visible. |

The homepage also has a finite, staggered headline entrance and underline animation, shorter copy, category discovery chips, and compact brand cards. Featured brands are selected alphabetically across categories before a category repeats; affiliate commission is not a selection input. Repeated named-brand pitches were removed from the hero and footer. The browser test saves desktop/mobile screenshots to the system temporary directory for visual review.

## Google requirements and account-side work

Google accepts site ownership verification through ad code, an ads.txt file **or a meta tag**. Serving ads requires a site with **Ready** status after Google's review. The configured account identifier is the existing `ca-pub-4529948026803680`; it has not been independently matched against the owner's dashboard. [Google site management](https://support.google.com/adsense/answer/12131223?hl=en)

`ads.txt` is recommended rather than an approval prerequisite. The new public file contains `google.com, pub-4529948026803680, DIRECT, f08c47fec0942fa0`. The owner should check that AdSense recognizes the record after deployment. [Google ads.txt guide](https://support.google.com/adsense/answer/12171612?hl=en)

The owner still needs to check Sites status, any account verification/payment tasks, and whether a consent message has actually been published. Google's certified TCF CMP requirement applies when serving personalized ads to visitors in the EEA, UK and Switzerland. A homemade banner is not a certified CMP. This release does not claim that a CMP is installed or that personalized advertising consent has been obtained. [Google consent requirements](https://support.google.com/adsense/answer/13554116?hl=en)

Google assesses original content, useful navigation and policy compliance. A sitemap, a large number of brands, or a passing technical test does not establish content quality or guarantee approval. Further vendor-source review should add practical buying value, rather than more near-identical coupon pages. [Eligibility](https://support.google.com/adsense/answer/9724?hl=en), [Publisher policies](https://support.google.com/adsense/answer/10502938?hl=en), [Privacy disclosures](https://support.google.com/adsense/answer/1348695?hl=en)

## Production services and security limits

The public live check at `2026-10-23T08:14:56Z` reported accounts, forms and newsletter configuration as false. Follow [PRODUCTION-READINESS.md](./PRODUCTION-READINESS.md) and [production.env.example](./production.env.example) to apply the Supabase migration and configure authentication, private server credentials, administrative access and Resend delivery in the hosting environment. Actual database row policies, authenticated cross-account isolation and delivery must then be exercised against the configured service. No production credentials were requested or written into the repository.

Only configure `TRUSTED_CLIENT_IP_HEADER` where the ingress overwrites that header and the origin cannot be reached directly. Vercel documents its dedicated client-address header in [Request headers](https://vercel.com/docs/headers/request-headers#x-vercel-forwarded-for). Without a trusted address, shared anonymous limits can reduce form availability. Baseline CSP directives now constrain base URLs, plugins, framing and form destinations; this is not a complete nonce-based script CSP or a penetration-test certification.

Online `npm audit --omit=dev --json` reported **zero known production dependency advisories** on October 23. The full audit reports **five high-severity package entries from one development-tool dependency chain**: `eslint-config-next → @next/eslint-plugin-next → fast-glob → micromatch → braces`. `braces@3.0.3` is affected by CVE-2026-93687, a stack-exhaustion issue. The upstream advisory lists **no patched version**. The suggested npm force-fix downgrades the Next ESLint configuration to version 14, which is inappropriate for Next 16. The advisory remains open; no fabricated version override, force downgrade or lint removal was applied. Recheck for a supported upstream patch. [Upstream advisory](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm)

## Reproducible validation

```sh
npm run lint
npx tsc --noEmit
npm run test:offers
npm run test:platform
npm run test:security
npm run test:savings
npm run validate:catalog
npm audit --omit=dev
npm run build
npm run start -- --hostname 127.0.0.1 --port 3210
# Run these against the production server in a separate terminal:
npm run audit:publisher -- http://127.0.0.1:3210
npm run seo:audit:brands -- http://127.0.0.1:3210
npm run brand:audit -- http://127.0.0.1:3210
npm run seo:audit -- http://127.0.0.1:3210
npm run test:browser:offers -- http://127.0.0.1:3210
```

Final verification after rebasing onto automated offer refresh `4d0d3fe` passed: the production build, 35 regression tests, lint without warnings, TypeScript and catalog validation (711 canonical brands, 703 available profiles, 161 snapshot offer records). The HTTP audits passed for 924 sitemap pages, 1,842 JSON-LD blocks, 25 sharing images, 16 brand guides, ownership metadata/ads.txt, private cache headers, privacy choices and article references. Chrome passed coupon dialogs/redirects, denied clipboard fallback, mobile search and savings, correction-form context, unavailable services, malformed storage, normal/reduced motion, and cold no-JavaScript content. Desktop and mobile screenshots were inspected. Counts can change with the scheduled offer refresh and are not a claim that every brand has a coupon.
