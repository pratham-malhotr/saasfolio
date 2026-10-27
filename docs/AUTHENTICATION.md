# Account authentication

Email/password registration and sign-in remain independent of Google and Apple. Both social options use Supabase Auth's server-side PKCE flow. They appear on login and signup; an unconfigured provider stays disabled with an explanation. The server checks the project's public Auth settings rather than trusting a browser flag.

For the account owner's dashboard steps and exact values, use [Finish authentication setup](AUTH-OWNER-SETUP.md).

## Production configuration

1. Select the intended Supabase project and apply `supabase/migrations/202610210001_production_flows.sql`. Its saved-item policy checks the authenticated owner on reads and writes; inquiries and request-limit records are inaccessible to public/authenticated database roles.
2. Configure the hosting environment from `docs/production.env.example`. Use a Supabase public publishable key or the legacy anon key for the SSR client. The service role is server-only and supports the persistent request limiter and private inquiry service. Generate independent random values for `RATE_LIMIT_SECRET` and `AUTH_RECOVERY_SECRET`; the latter accepts 64 hexadecimal characters (`openssl rand -hex 32`). Never put service-role, recovery, Google or Apple secrets in a `NEXT_PUBLIC_*` variable, repository, browser storage or screenshot.
3. Set Supabase's Site URL to `https://saasfolio.tech`. Allow the exact application callbacks used by this deployment, including `https://saasfolio.tech/auth/callback`, its `next` query variants for `/profile`, `/submit` and password recovery, and the OAuth `flow=oauth` variant. Use a restricted callback-path pattern only when needed for internal destinations; do not allow arbitrary origins. Add explicit localhost callbacks only for development.
4. Keep email signup and email confirmation enabled. Configure production SMTP, a minimum password length of 12 to match this interface, and the provider's abuse controls. Configure session lifetime and security notifications for the operator's needs. Leaked-password rejection is a Supabase paid-plan setting; the application does not claim it is enabled or purchase a plan. [Supabase password security](https://supabase.com/docs/guides/auth/password-security)
5. Set `ADMIN_EMAILS` to exact intended addresses. Administrators must have provider-confirmed emails; editable profile fields and development accounts cannot grant this role.

`GET /api/health` returns configuration/readiness booleans only, including `authProviders`, `authMode` and `minimumPasswordLength`. It does not expose keys or certify successful provider consent, SMTP delivery, database migrations or healthy production storage.

## Google

In the intended Google Cloud project, configure the OAuth consent screen for SaaSFolio with its homepage, privacy and terms URLs. Request only identity, email and profile scopes. Create a Web application OAuth client. Its redirect URI is the Supabase project's `/auth/v1/callback` URL, **not** the application's `/auth/callback` URL. Put that client's ID and secret into Supabase Auth → Providers → Google and enable it. Configure the intended audience and publishing status so public users are not restricted to a developer test list. [Google setup in Supabase](https://supabase.com/docs/guides/auth/social-sign-in/auth-google)

## Apple

Apple web sign-in requires the appropriate Apple Developer account and identifier configuration. Configure a Services ID associated with a Sign in with Apple primary App ID, register the website domain and Supabase return URL, and generate the provider client secret using the team's signing key. Store the Services ID and generated secret in Supabase's Apple provider configuration. Apple OAuth client secrets require renewal at least every six months; schedule rotation securely outside this repository. Handle Apple's private relay address as the user's provider-confirmed identity and configure relay email delivery if needed. Do not merge accounts merely because a user enters an email or assume Apple always provides a name. [Apple setup in Supabase](https://supabase.com/docs/guides/auth/social-sign-in/auth-apple)

## Security behavior

- Passwords are sent over HTTPS to the server and authentication provider; production password hashing is performed by Supabase using salted bcrypt. SaaSFolio does not store plaintext production passwords or hash passwords in the browser. New passwords must contain 12–128 characters; login accepts existing passwords without applying the new minimum, and whitespace is preserved. [Password storage](https://supabase.com/docs/guides/auth/password-security)
- Authentication cookies are HttpOnly, host-scoped, SameSite=Lax, and Secure in production. OAuth uses a short-lived PKCE verifier and a one-use code exchanged on the server. The browser receives a validated authorization URL, not session tokens or client secrets.
- The admin Server Component's session is refreshed in the Next.js proxy before rendering. Rotated cookies reach both the render request and the browser; the page and APIs still check authorization independently. Public catalog pages do not run this account refresh.
- OAuth destinations and internal redirects are validated server-side. A production callback always uses the configured canonical origin. Failure pages do not echo upstream descriptions, tokens or codes; private responses and callbacks use no-store caching.
- Mutations require same-origin JSON, have a bounded request body and enforce request limits. Database-backed limits use a keyed address digest from an explicitly trusted ingress header. The ingress must overwrite that header and prevent direct origin access. The process-local limiter is only a fallback and does not replace shared production abuse controls.
- Password changes require the current password or a short-lived signed proof from a genuine provider recovery exchange. A URL parameter alone cannot grant recovery. Recovery proofs bind the authenticated user and session; local password changes revoke existing local sessions.
- Server APIs authenticate independently of the UI. Saved items use the authenticated user ID and database ownership policy; public responses include an explicit small user projection rather than a provider session or account record.

## Development-only accounts

Local accounts are disabled unless all of the following are set: `NODE_ENV=development` or `test`, `LOCAL_AUTH_ENABLED=true`, and a dedicated `LOCAL_AUTH_SECRET` containing 64 hexadecimal characters. Local mode is always disabled in production and never replaces a failed configured Supabase login.

The development store uses salted scrypt password hashes, restrictive file permissions, atomic writes and opaque revocable sessions stored as keyed digests. It has no built-in demo passwords or administrator accounts. `LOCAL_AUTH_DATA_DIR` can point at an isolated test directory. Storage errors fail the request rather than report a successful signup or save. This single-machine development store is not a production database or an email delivery system. Legacy default-signed sessions are intentionally invalidated; the reserved insecure seed accounts are removed when an opted-in store is loaded.

Development stores have an 8 MiB limit per file. A busy or abandoned write lock fails closed; the operator must inspect and repair a stale lock after confirming its owning process is no longer running. Local files are protected by OS permissions and contain personal information; they are not encrypted backups.

## Verification boundary

Route tests replace provider SDK/network boundaries; browser checks intercept application mutations and provider navigation. They do not create real users, deliver email or prove live Google/Apple consent or database policies. After provider activation, complete real email signup/confirmation, login, recovery, Google consent, Apple consent/private relay, logout, and two-account ownership checks against the intended deployment. Only then describe these provider sign-ins as live.

Run `npm run test:auth` for the provider, recovery, proxy and local-store regressions. `npm run test:auth:http` starts its own development server with cloud configuration cleared, uses an isolated temporary account store, checks the real HTTP signup/password/logout lifecycle, and removes its test data. `npm run test:browser:auth -- http://127.0.0.1:3210` checks the login interface against intercepted fixtures in an isolated headless Chrome profile. It never uses a personal Brave profile.
