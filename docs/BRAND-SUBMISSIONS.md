# Brand submissions and directory refresh

Visitors use `/submit` to suggest a brand without creating an account. The form collects official links, a category, pricing model, original product context, three to eight features and a private contact address. The sidebar previews the public portion. The existing offer form remains at `/submit/offer`.

## Production connection

Online intake uses the existing Supabase `inquiries` table and request-limit RPC. It does not require a new migration. Apply all migrations in `supabase/migrations/` to the selected project in filename order if that database has not been set up.

Configure these values through the host's environment settings, then rebuild and deploy:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (or `NEXT_PUBLIC_SUPABASE_ANON_KEY`)
- `SUPABASE_SERVICE_ROLE_KEY`, server only
- `RATE_LIMIT_SECRET`, a random private secret
- `ADMIN_EMAILS`, the confirmed first owner used by the existing staff bootstrap
- `TRUSTED_CLIENT_IP_HEADER`, only if the ingress is documented to overwrite the selected header; see `.env.example`

The repository has no usable production database credentials. The previous live-site report also records forms as unconfigured. Until the production connection is supplied, the form explicitly offers **Open submission email**, includes the completed details in a mail draft, and asks the visitor to send it. It does not display a saved receipt. No email is sent automatically.

`GET /api/health` reports `checks.formsConfigured` without revealing credentials. This confirms configuration, not connectivity. Use the protected readiness checks described in `docs/PRODUCTION-READINESS.md` to verify the database, schema and request-limit service. Complete one controlled acceptance test against the configured deployment before announcing online submissions.

## Review and publication

1. A successful `POST /api/inquiries` with `kind: submission` and `submissionType: brand` writes a pending inquiry and returns its database ID. Validation, origin checks, the honeypot and the existing persistent request limit apply. Success appears only after storage confirms the insert.
2. A confirmed owner with MFA opens `/admin` → **inquiries**. **Prepare brand draft** opens the catalog editor with public product fields. It excludes the contact name/email and leaves the review date empty. Replacing unsaved work asks the editor first.
3. Check the official sources, revise submitted claims, confirm the canonical slug and fill the actual review date. For an existing brand, open and edit the existing catalog entry rather than creating a second identity. Save the draft and submit it for review.
4. Follow the existing separate-account review and owner release workflow. An inquiry marked resolved does not publish a brand. Export and deploy the approved managed catalog using `docs/ENTERPRISE-OPERATIONS.md` and `docs/CATALOG-AND-OFFERS.md`.
5. Published managed brands now qualify for public profiles, directory/search results and the sitemap without needing a second hard-coded guide. Retired brands remain excluded. Raw visitor submissions never publish themselves.

## Directory and content

The homepage puts brand discovery first, with search, category shortcuts, eighteen product cards, hosting research and editorial articles. `/brands?q=...&category=...` renders the chosen results on the server and provides interactive search, category, letter and offer filters. Existing canonical profile URLs remain in place.

Four documentation-based profiles were added to the published collection: Cloudflare, DigitalOcean, Render and Fly.io. There are now 140 published brand profiles, including seven hosting brands. Three new hosting articles cover Hostinger, Cloudflare Pages and DigitalOcean App Platform, with original examples, decision records, limitations and linked official sources. These are documentation reviews, not hands-on benchmarks. No ratings, audience numbers or current prices were invented.

Individual profiles and articles retain their existing metadata and structured-data pipeline. The new articles enter the sitemap automatically. Submission forms remain `noindex`. Existing privacy, editorial and affiliate disclosures stay accessible. Google decides AdSense approval; these changes do not establish an approval outcome.

## Verification

- `npm run test:unit` covers real route handlers with provider boundaries replaced by test doubles, including intake failures and managed-publication selection.
- `npm run validate:publisher` checks attribution, sources and duplicate substantive paragraphs.
- `npx tsc --noEmit` and `npm run build` check the actual Next.js application.
- Start a production preview on port 3245, then run `npm run test:browser:brands`. An optional first argument selects another local origin. This checks mobile/desktop layouts, filters, preview behavior, links and no-JavaScript access; it sends no inquiries.
- `npm run test:browser:intake` starts its own isolated development server on port 3246 and uses the real form and API to save one synthetic record, match its receipt and confirm retention after reload. It removes its temporary store and shuts down the test server. It does not connect to Supabase or send email. Chrome must be installed or selected with `CHROME_PATH`.

Run the existing SEO and publisher HTTP audits against the final production build before release. Browser reports and release-specific limits are recorded in `docs/reports/`.
