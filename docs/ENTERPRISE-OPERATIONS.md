# SaaSFolio operational foundations

This release adds code and tested database migrations. Production activation still requires the hosting and provider settings below. No production database was migrated, staff account created, email sent, retention policy enabled, or backup schedule activated during local validation.

## What is implemented

| Area | Implementation | Activation boundary |
| --- | --- | --- |
| Release checks | Lint, unit tests, catalog validation, production build, SEO and browser checks, dependency advisory scan | Enable Actions; protect main after the checks have run |
| Staff access | Database roles, owner/editor/reviewer, confirmed accounts, mandatory AAL2 for privileged actions, last-owner protection | Supabase migrations, first owner and authenticator enrollment |
| Editorial operations | Structured brand/guide/offer forms, preview, revision conflicts, independent approval, history restoration and audited publication/withdrawal | Confirmed staff accounts and managed catalog export configuration |
| Source evidence | Bounded, DNS-pinned HTTPS fetch, robots policy, host-limited redirects, exact evidence and source fingerprints | Sources must expose readable public evidence; a source check is not checkout testing |
| Offer review | Staff-only queue for blocked/removed sources, changed/stale evidence and upcoming expiries; validated customer correction context | Queue uses the deployed collection snapshot; source retries remain subject to collector backoff |
| Catalog releases | Public approved snapshot, cross-reference checks, compact browser projection, PR-based deployment | Merge the checked release and deploy it through the hosting integration |
| Service visibility | Liveness, dependency readiness, protected operational status, request references and redacted structured logs | Configure provider credentials, monitoring token and external alert routing |
| Account privacy | Private JSON export; recent-authenticated deletion, MFA checks, linked-record cleanup and retryable cleanup requests | Apply migrations; enable and test the maintenance repair job |
| Newsletter operations | Signed Resend delivery events, idempotency, bounce/complaint suppression and confirmation protection | Verified sender and configured signed webhook |
| Analytics | Default-off consent, browser privacy signals, preference controls, public-page/offer events and Web Vitals | Confirm the GA4 property settings and verify consented data in its dashboard |
| Recovery | Authenticated encrypted logical export, archive verification, local restore drill and real database test | Choose provider backup/PITR, off-site storage, retention and recovery objectives |

The community still provides browser-local previews. Shared public discussions, reviews, newsletters with a staffed editorial schedule, organization billing, SSO/SAML, contracts and compliance certification are separate product/operating decisions. This release does not claim those capabilities or an enterprise certification.

## Runtime and first activation

Use Node 22 from `.nvmrc`, `npm ci`, `npm run build`, then `npm start` behind the HTTPS hosting ingress. This application requires a Node runtime for authentication, submissions, redirects and administration. A static HTML upload does not provide these features. Configure a separate staging Supabase project and sender before connecting production.

Apply the migrations in filename order using the established Supabase migration mechanism:

1. `202610210001_production_flows.sql` (existing platform tables and limits).
2. `202610290001_editorial_operations.sql` (staff, catalog workflow and audit).
3. `202610290002_privacy_and_maintenance.sql` (deletion, delivery suppression and maintenance).

Back up and rehearse against staging before applying an additive migration to an existing production database. The migrations are versioned once; do not rerun their SQL manually or change an already-applied file. Verify staging sign-in, two-account review, publication, account export/deletion and signed delivery before exposing these controls to real staff.

Configure environment settings through the hosting secret manager, using `.env.example` for names. Public Supabase URL/key can enter the client bundle; service-role, rate-limit, recovery, webhook, monitoring, backup credentials and encryption keys must stay server-side. Shell maintenance scripts read their process environment, not Next's `.env.local` automatically. Provision the environment securely for these commands.

`TRUSTED_CLIENT_IP_HEADER` must match a header the ingress overwrites. Without one, anonymous rate limits share a fallback bucket; clients cannot gain a different bucket by supplying an untrusted header. Confirm the Hostinger Node/VPS and proxy configuration before choosing this setting.

## Staff and publishing

Put the first owner's confirmed email in `ADMIN_EMAILS`. Opening `/admin` can bootstrap that account only while no active owner exists. User-editable metadata cannot grant staff permissions. Enroll an authenticator and verify a code; privileged actions require database-verified `aal2`. Subsequent roles are granted from Team permissions to existing confirmed accounts. Keep a second owner with an independently stored authenticator for recovery; verified authenticators cannot be removed through unfinished-setup cancellation.

Editors prepare drafts and submit them. A different account with reviewer/owner permission approves the exact last-edited revision. Owners publish the approved revision for release. Offers require a successful server-recorded source observation within 14 days, and an unexpired published expiry where present. Changing a draft resets approval and requires a new offer observation. Restoring history creates a new draft. The owner can retire an active publication even while another revision is under review.

The static website does not read private staff tables. Approved database publications are exported to `managed-catalog.json` and its generated compact `managed-public-index.json`. Both are validated together. New brands need original guide coverage; related guides, canonical identities and provider destinations are checked. Public exports omit drafts, staff IDs and private inquiries. Retired offer identities remain for stable historical destinations. A collector recheck for the same managed revision can withdraw missing evidence; failed requests do not refresh it.

The Offers section groups operational issues by recorded source, with filters and pagination. Removed sources and expired offers come first, followed by changed evidence, blocked/unavailable sources, stale evidence and expiry within seven days. It keeps the last successful evidence separate from the most recent request and the scheduled retry. Refreshing the queue performs no provider requests. A newer managed publication supersedes observations of older revisions; retired managed offers are excluded. Customer correction links preserve a validated offer/brand identity in an unreviewed inquiry; reviewers can filter these in the inbox. Reports never change a public listing automatically. Older free-text reports remain in the regular contact inbox.

Set these GitHub repository variables only after staging validation:

| Variable | Meaning |
| --- | --- |
| `MANAGED_CATALOG_ENABLED=true` | Enable the hourly approved-catalog export workflow |
| `NEXT_PUBLIC_SUPABASE_URL` | Production project HTTPS URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` or `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Public project key; the exporter does not use a service key |
| `MONITORING_ENABLED=true` | Enable the 15-minute production response monitor |
| `MAINTENANCE_ENABLED=true` | Enable the daily maintenance workflow, initially dry-run |
| `MAINTENANCE_APPLY_ENABLED=true` | Apply configured retention and repair completed-auth-deletion cleanup |

Allow Actions to create pull requests. Refresh and editorial workflows maintain distinct `automation/*` branches without force pushes. Conflicts stop the workflow for review. These PRs never auto-merge. Review generated diffs, approve any GitHub-required workflow run, and complete Website checks before merging. Token-created PR/push behavior is governed by [GitHub's workflow trigger rules](https://docs.github.com/en/actions/how-tos/write-workflows/choose-when-workflows-run/trigger-a-workflow). Connect merged main revisions to the hosting deployment. The staff screen shows approved and deployed release counters separately.

After a successful CI run, protect main with required application, database-permissions and dependency-security checks, PR review, resolved conversations, blocked force pushes and blocked deletion. Enable secret scanning/push protection if available for this repository. These repository settings are not activated by merely committing a workflow file.

## Monitoring and diagnosis

`/api/health` proves the Node process responds and describes configured features. `/api/ready` returns 200 only when Auth, the database readiness RPC, schema version 3 and catalog freshness checks pass; otherwise it returns 503. It does not send a test newsletter. `/api/ops/status` adds detailed checks only with `Authorization: Bearer <MONITORING_TOKEN>`; placeholder tokens are rejected. Readiness results are cached for 15 seconds. Collector freshness requires a released collection run within 26 hours, so keep release reviews and deployments current.

Server failures include `X-Request-ID`; API failures also supply a support reference. Structured logs allowlist operation/route templates, safe identifiers, status and duration. They omit raw error messages, stacks, request content, cookies and query strings. Set `APP_RELEASE` to the deployed commit. Optional `NEXT_PUBLIC_CLIENT_DIAGNOSTICS=true` enables rate-limited sanitized client-error reports. Hosting/provider access logs have independent retention and privacy settings.

The monitor fails on unavailable public responses, invalid sitemap/robots, missing liveness or failed readiness. Configure repository notification recipients or an external alert service and test an alert deliberately in staging. No paging provider, log drain or uptime SLA is provisioned by this repository.

## Privacy, delivery and retention

Account export requires a confirmed cloud identity and returns only profile, owned saved items, email-linked submissions and newsletter state. It is an attachment with `private, no-store`; large accounts return an assistance error rather than a partial export. Account deletion requires a primary sign-in within five minutes and, when enrolled, a fresh authenticator code. A token refresh alone is insufficient. Auth removal occurs before linked private data is erased. The cleanup request remains repairable if a provider timeout interrupts cleanup. Published editorial records remain with deleted-author IDs cleared. The last owner must transfer access before deletion. Supabase Storage ownership can also block Auth deletion; the current application does not upload account-owned Storage objects. See [Supabase user management](https://supabase.com/docs/guides/auth/managing-user-data).

Configure Resend to POST supported delivery events to `/api/webhooks/resend`, with its endpoint signing secret in `RESEND_WEBHOOK_SECRET`. The route authenticates raw bytes and a five-minute timestamp window using [Resend/Svix signature rules](https://resend.com/docs/webhooks/verify-webhooks-requests). Event IDs deduplicate retries. Bounces and complaints unsubscribe and suppress confirmation delivery. Later delivery events and ordinary signup cannot unsuppress the record. Test a signed fixture and a real staging email before activation; no real delivery was exercised locally.

Run `npm run ops:maintenance -- --dry-run` first. Unset retention values delete no inquiries/subscriptions. Explicit policy values are `INQUIRY_RETENTION_DAYS` (30–3650; resolved/rejected only), `PENDING_NEWSLETTER_RETENTION_DAYS` (2–365) and `UNSUBSCRIBED_RETENTION_DAYS` (30–3650; suppressed records retained). `--apply` also clears expired limit buckets and repairs deletion cleanup. Set the service key as a GitHub secret only if using the scheduled maintenance job. Choose retention with the product's actual support and privacy policy before activation.

GA4 is loaded only after analytics consent on eligible public pages. Private account/auth/staff/submission pages are excluded from our emitted events. Search/form contents, coupon values and query strings are omitted. Explicit events cover page views, outbound offer clicks, debounced search-result counts (including zero matches), copy outcomes, correction-link opens and Web Vitals. These counts cannot identify which search text failed. Set `NEXT_PUBLIC_GA_ID` to the intended property. In GA4 stream settings disable automatic enhanced measurement/history/search/form/click tracking; this implementation emits explicit events. Verify in DebugView that events do not duplicate and carry no personal fields. The site offers equal allow/decline controls, persisted choices, keyboard-accessible preferences, revocation and DNT/GPC handling. This is an analytics control, not a Google-certified advertising CMP; advertising serving remains disabled.

## Backup and recovery

Choose provider-managed backup/PITR, off-site retention, an owner, and achievable RPO/RTO before promising recovery. Database exports do not include Storage object bytes, provider OAuth settings, sending-domain configuration or hosting secrets. Supabase documents these limits in [Database Backups](https://supabase.com/docs/guides/platform/backups). Logical exports are a supplement to the provider recovery plan.

For a supplemental export, provision `BACKUP_DATABASE_URL`, a separately retained 32-byte `BACKUP_ENCRYPTION_KEY` expressed as 64 hexadecimal characters, and a private `BACKUP_DIRECTORY`. Use a `pg_dump` client at least as new as the database server and configure the provider's TLS CA (`sslmode=verify-full` and `sslrootcert` where needed). Run `npm run ops:backup`. Credentials enter the child environment, not command-line arguments. The archive is streamed directly through AES-256-GCM, written with mode 0600, authenticated and checked with `pg_restore --list`. Existing backups are never overwritten. No plaintext dump is written. Store the encryption key separately; loss of the key prevents recovery. Transfer completed encrypted exports to the selected restricted off-site store and verify retention there; that external storage/schedule is not configured here.

For an isolated drill, provision an empty local PostgreSQL instance with the required `anon`, `authenticated`, `service_role` and any provider-specific extension roles. Set `RESTORE_TEST_URL` to its `postgres` maintenance database on localhost/127.0.0.1. Run `npm run ops:restore-drill -- /private/path/backup.sfb`. The tool authenticates the archive before restore, creates a uniquely named `saasfolio_restore_test_*` database, verifies readiness/RLS/private-table grants, then drops only that created database. It never targets a remote production database or overwrites an existing database. Provider-specific logical dumps may need the provider's supported restore procedure in an isolated staging project; do not treat the local fixture drill as proof of production Supabase recovery.

For an application rollback, redeploy the previous known-good Git commit and its build-time public configuration. Preserve compatible additive database migrations; do not automatically roll back schema by dropping tables. Recheck Auth, saved items, redirects, ready status and the deployed catalog counter. For data incidents, use the rehearsed provider recovery procedure and verify any post-restore deletion/suppression requests before resuming delivery.

## Local validation

`npm run test:unit`, `npm run test:database`, `npm run lint`, `npm run validate:catalog`, `npm run build`, and `npm run check:production-build` form the local release checks. Database tests require PostgreSQL binaries or an explicitly named local empty `DATABASE_TEST_URL`; they refuse a general production connection. They exercise actual grants, RLS, AAL2, independent review, revision conflicts, source proof, last-owner protection, privacy cleanup and encrypted dump/restore. They use synthetic accounts and data only. Browser form/provider fixtures intercept writes and external analytics; they do not certify real provider delivery, provider MFA enrollment or production hosting behavior.

Production-build checks also issue 60 local requests with six concurrent workers across a search landing, offer redirects, authorization failures and invalid forms. Redirects are not followed, and invalid forms fail before persistence. This checks response correctness under modest concurrency; it does not establish production capacity or a service-level objective. The mobile privacy browser fixture exercises failed-search/copy measurements without delivering data to Google.
