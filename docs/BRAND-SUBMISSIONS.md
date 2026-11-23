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
5. Published managed brands now qualify for public profiles, directory/search results and the sitemap without needing a second hard-coded guide. Retired brands remain excluded. The directory also accepts approved owner submissions via the process below.

## Approve a directory listing

The production shared Supabase project runs SaaSFolio without account services.
To review an application, open Supabase **Table Editor**, select **saasfolio**,
and open **inquiries**. Filter to kind `submission` and inspect the rows
whose payload has `submissionType: brand`. Review the official website,
pricing or documentation, original description, and the submitter's authority.
In the case of a full editorial profile, follow the catalog publication process
above from an account-enabled deployment.

For a directory card, use the Supabase SQL Editor. Copy the row's receipt ID
and its exact `updated_at`. Set the hostname without `www.` and choose a
unique lowercase, hyphenated slug. For an already reviewed profile, use its
existing slug in both slug arguments. For a new brand, pass `null` as shown.

```sql
select saasfolio.approve_brand_listing(
  '<receipt-uuid>'::uuid, '<updated_at>'::timestamptz,
  'brand.example.com', 'brand-name', null, 'manual'
);
```

A returned UUID confirms approval. A null result means the row changed,
the submission was ineligible, or the domain or slug is already listed.
The approval records the public directory fields and resolves the inquiry in
one transaction. To remove a submitted listing or a sponsorship, set
`hidden_at` on its row in `saasfolio.brand_listings`.

### Automatic directory approval

After saving a brand, owners can open **Verify your brand**, enter their
receipt and submission email, and publish the generated DNS TXT record.
**Check domain and approve** checks the record, the submitted homepage, and
a distinct same-domain pricing or documentation page. The check looks for
matching brand identity and readable product content. Ambiguous submissions,
duplicates and sources that cannot be checked stay available for manual review.
A new approved card links to the official site and labels the copy as
brand-submitted information.

### Sponsored placement

**Promote your brand** on `/brands` offers $49 USD for one month and $349 USD
for one year. It opens an email draft to `prathammalhotracsai@gmail.com` with
the selected period. Arrange payment and dates directly by email.

After confirmation, find the approved row in `saasfolio.brand_listings`.
Set both `sponsored_from` and `sponsored_until` to the agreed dates. The
brand appears above matching search and category results during that
period, with a Sponsored label. The listing returns to alphabetical
order when the period ends. To end a promotion early, clear both dates.

### Production setup for an existing shared project

Render the additive migration for the existing `saasfolio` schema. Run the
generated SQL in Supabase SQL Editor before deploying the new app:

```sh
node --input-type=module -e 'import { readFileSync } from "node:fs"; import { qualifyApplicationSql } from "./scripts/lib/database-schema.mjs"; const file = "supabase/migrations/202611230001_brand_listings_and_promotions.sql"; console.log("begin;\n" + qualifyApplicationSql(readFileSync(file, "utf8"), "saasfolio") + "\ncommit;");'
```

Set `BRAND_LISTINGS_ENABLED=true` and a server-only
`BRAND_VERIFICATION_SECRET` generated with `openssl rand -hex 32` in
Hostinger, then deploy. Keep the secret stable so issued TXT values continue
to work. The existing exposed schemas and private table grants are sufficient.

## Directory and content

The homepage puts brand discovery first, with search, category shortcuts, eighteen product cards, hosting research and editorial articles. `/brands?q=...&category=...` renders the chosen results on the server and provides interactive search, category, letter and offer filters. Existing canonical profile URLs remain in place.

Four documentation-based profiles were added to the published collection: Cloudflare, DigitalOcean, Render and Fly.io. That earlier release contained 140 published brand profiles, including seven hosting brands; the November 17 release adds twelve documented profiles and a dedicated 20-provider hosting desk. Three new hosting articles cover Hostinger, Cloudflare Pages and DigitalOcean App Platform, with original examples, decision records, limitations and linked official sources. These are documentation reviews, not hands-on benchmarks. No ratings, audience numbers or current prices were invented.

Individual profiles and articles retain their existing metadata and structured-data pipeline. The new articles enter the sitemap automatically. Submission forms remain `noindex`. Existing privacy, editorial and affiliate disclosures stay accessible. The November 17 release switches the site to affiliate funding and removes advertising verification and sales pages. Search traffic is measured after release; it is not guaranteed by these changes.

## Verification

- `npm run test:unit` covers real route handlers with provider boundaries replaced by test doubles, including intake failures and managed-publication selection.
- `npm run validate:publisher` checks attribution, sources and duplicate substantive paragraphs.
- `npx tsc --noEmit` and `npm run build` check the actual Next.js application.
- Start a production preview on port 3245, then run `npm run test:browser:brands`. An optional first argument selects another local origin. This checks mobile/desktop layouts, filters, preview behavior, links and no-JavaScript access; it sends no inquiries.
- `npm run test:browser:intake` starts its own isolated development server on port 3246 and uses the real form and API to save one synthetic record, match its receipt and confirm retention after reload. It removes its temporary store and shuts down the test server. It does not connect to Supabase or send email. Chrome must be installed or selected with `CHROME_PATH`.

Run the existing SEO and publisher HTTP audits against the final production build before release. Browser reports and release-specific limits are recorded in `docs/reports/`.

## November 17, 2026 intake hardening

New browser submissions include a random request key. Apply `supabase/migrations/202611170001_brand_submission_receipts.sql` before deploying this release. The service-only `save_brand_submission` function stores the contact email, full validated product context, consent and pending status atomically. Identical retries return the same reference, including concurrent requests. Reusing a key for changed content returns a conflict and does not overwrite a saved submission. Existing clients without a key retain their original insert path.

The private inquiries table now holds `submission_key` and `submission_fingerprint` alongside the existing product payload. Neither anonymous visitors nor ordinary signed-in accounts can read it or invoke the intake RPC. Owner/reviewer access continues through the staff workflow. Privacy redaction clears the retry metadata with the private payload. The readiness endpoint now requires schema version 4.

The form can download a complete JSON draft before sending, and a saved receipt with the submitted details after success. Downloads happen only when the visitor clicks; no personal form data is automatically placed in browser storage. A draft download is explicitly labeled as not submitted. It is also a backup for long messages that email applications may truncate.

The admin inbox supports brand-specific and status filters, search by brand/domain/contact/reference, refresh and JSON export of matching loaded records. Pagination and export scope are labeled so a filtered first page is not confused with the entire database. Private exports should be stored securely. Preparing public catalog copy still excludes the contact details and does not publish automatically.

The inquiry body limit is 64,000 bytes so valid multilingual descriptions accepted by the form can reach validation; oversized requests remain rejected. Product field limits, unsafe-URL checks, consent, honeypot, origin checks, rate limits, staff MFA and optimistic status updates remain in effect.

Validation used the real browser form/API with a temporary development store and a separate disposable PostgreSQL database. Checks covered persistence, contact fields, receipt matching, identical retries, conflicting retries, draft/receipt downloads, table/function privileges, eight concurrent PostgreSQL requests, privacy cleanup and an encrypted backup/restore. No real submissions were created or emails sent. This checkout contains no production provider credentials; production storage and actual existing submissions were not accessed or activated.
