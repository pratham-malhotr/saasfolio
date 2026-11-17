# SaaSFolio in a shared Supabase project

SaaSFolio uses the `saasfolio` PostgreSQL schema inside the existing CircleOfIRA
project. CircleOfIRA's `public` tables and functions are not renamed, migrated,
or queried by SaaSFolio. Do not apply SaaSFolio's unmodified `public` migrations
to this shared project: `newsletter_subscribers` already exists for the other site.

The shared-project installer is generated from the canonical migrations:

```sh
node scripts/prepare-database-schema.mjs saasfolio > /private/tmp/saasfolio-schema.sql
```

Run that SQL once using the Supabase SQL editor. It creates a new schema in one
transaction, preserves the PUBLIC database role in privilege statements, records
each source migration's SHA-256, and refuses an existing namespace. Do not rerun
it to upgrade an installation. Later migrations must be reviewed and qualified
for this namespace separately.

Add `saasfolio` to Data API exposed schemas, preserving the project's existing
entries. Schema usage grants do not grant table reads. The migrations explicitly
revoke public access to inquiries and permit `save_brand_submission` only for
the server's service role. Do not use blanket table/function grants from setup
examples or enable automatic exposure of new tables.

Set these variables on **SaaSFolio's** Hostinger deployment:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://skztxqtxmtlvhybipyiq.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<project publishable key>
SUPABASE_SERVICE_ROLE_KEY=<server-only secret key>
SUPABASE_DB_SCHEMA=saasfolio
SUPABASE_AUTH_ENABLED=false
RATE_LIMIT_SECRET=<random private value>
MONITORING_TOKEN=<random private value>
```

Do not commit actual keys. Redeploy after setting environment variables because
the submission page's availability is rendered at build time. Authenticated and
service clients, readiness probes, maintenance and catalog exports all select
the same explicit database schema.

Supabase Auth is shared at the project level; a database schema does not create
an independent user pool. SaaSFolio therefore runs in intake-only mode:
`SUPABASE_AUTH_ENABLED=false` blocks sign-in, recovery, session use and account
changes through SaaSFolio, while allowing server-side submission persistence.
The CircleOfIRA Auth settings, redirect URLs, users and providers are unchanged.
Review saved brands in Supabase Table Editor → schema `saasfolio` → `inquiries`.
The website's MFA-protected admin inbox requires a future deliberately configured
account setup; it is not enabled by this database-only connection.

Verification:

```sh
npm run test:unit
DATABASE_TEST_SCHEMA=saasfolio npm run test:database
npm run build
```

The custom-schema database test includes a same-named table for another website,
duplicate-install rejection, all existing permissions/workflow/privacy tests,
eight concurrent submission retries and an encrypted backup/restore drill. All
database tests require an empty, explicitly named local disposable database.
