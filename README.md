# SaaSFolio

SaaS brand guides, sourced offers, coupon discovery and software comparisons for [saasfolio.tech](https://saasfolio.tech).

The application uses Next.js 16.4.2 App Router, React 19, TypeScript and Tailwind CSS 4. Public catalog pages are rendered from versioned source evidence and approved catalog releases. Accounts and private operational workflows use Supabase. Newsletter confirmation and signed delivery events use Resend.

## Local development

Use Node 22 from `.nvmrc` (supported range is declared in `package.json`).

```sh
git clone https://github.com/pratham-malhotr/saasfolio.git
cd saasfolio
nvm use
npm ci
cp .env.example .env.local
npm run dev
```

Open <http://localhost:3000>. Configure real provider values through your local environment or hosting secret manager. Public Supabase keys may enter the browser bundle; service keys and operational secrets must remain server-side. The development-only local account store is disabled by default and cannot be enabled in production.

Read the installed Next.js guides in `node_modules/next/dist/docs/` before changing framework code, as required by [AGENTS.md](AGENTS.md).

## Product and operations

- Brand directories, original discount guides, search landing pages, comparisons and savings tools.
- Source-attributed offers, coupon copying and direct HTTP redirects. Pricing links do not claim a discount; source observations do not establish checkout acceptance.
- Cloud signup/login, provider authentication, recovery, saved items and profile controls, subject to provider configuration.
- Confirmed staff roles with MFA, independent editorial approval, revision conflicts/history, source checks and PR-based catalog releases.
- Staff offer-review queues for blocked sources, changed/stale evidence and upcoming expiries; private correction and submission review.
- Account data export/deletion, retryable private-data cleanup, delivery suppression and configurable maintenance.
- Default-off optional analytics, private-route exclusions, sanitized events and Web Vitals.
- Dependency readiness, sanitized error references, scheduled response checks, encrypted database exports and isolated restore drills.

Community discussions and interaction previews remain browser-local. Shared public moderation, organization billing and SSO/SAML are not implemented. Production account/email operation, mobile field performance and recovery objectives require staging/provider verification; local fixtures do not establish those outcomes.

See [catalog and offer documentation](docs/CATALOG-AND-OFFERS.md) for evidence, source restrictions and refresh behavior. See [operational setup and recovery](docs/ENTERPRISE-OPERATIONS.md) for migrations, first-owner activation, secrets, release controls, retention and rollback.

## Release checks

```sh
npm run lint
npm run test:unit
npm run validate:catalog
npm run test:database
npm run build
npm run check:production-build
npm audit --omit=dev --audit-level=high
```

Database checks require PostgreSQL client/server binaries on `PATH`, or an explicitly named empty local test database. They exercise actual permissions, RLS and workflow transitions, then perform an encrypted dump/restore drill. They refuse production database targets. Browser checks require Chrome (`CHROME_PATH` on hosts where it is not found automatically), run against the production build, intercept provider writes and analytics, and include modest local concurrency checks.

GitHub Actions run application, database and dependency checks. Scheduled offer and editorial releases open reviewable PRs. Monitoring, managed exports and maintenance need the repository variables described in the operations guide; committing workflows does not activate those integrations or branch protection.

## Hosting

```sh
npm run build
npm start
```

Use a Node-capable host behind HTTPS. Authentication, private APIs, redirects and administration require a server runtime. Keep staging separate from production and complete the activation steps in the operations guide before enabling staff publishing or scheduled maintenance.
