# Authentication validation — 27 October 2026

The local implementation is complete. Google/Apple activation, production SMTP, database-policy verification and deployment require the intended provider accounts and credentials. Follow [the owner setup guide](AUTH-OWNER-SETUP.md); these are not represented as completed live sign-ins.

## Passed checks

- `npm run test:auth`: 33 tests covering Google/Apple starts, actual installed SDK S256 generation, protected PKCE cookies, callback failures, recovery proof/session binding, password reauthentication, strict redirects, configuration readiness, SSR cookie refresh and the development store's password/session/storage protections.
- `npm run test:platform`: 18 tests covering private-account authorization, saved-item ownership, admin confirmation checks, server-side forms, limits and request validation, plus submission preflight regressions.
- `npm run test:auth:http`: real HTTP signup, profile update, administrator denial, current-password enforcement, password change, old-password rejection, session rotation, CSRF rejection and logout revocation. This starts an isolated development server with cloud credentials cleared and removes its temporary test account/store afterward. It does not touch the workspace's account store.
- `npm run test:browser:auth -- http://127.0.0.1:3214`: headless Chrome passed at 390px and 1440px, with 22 intercepted authentication requests. Coverage includes unavailable/configured providers, independent email signup/login/reset, password whitespace and minimums, safe return links, duplicate guards, Google/Apple navigation, generic callback errors, recovery/current-password UI and sign-out failure/retry/success. No uncaught browser errors, actual provider authorizations or account emails occurred.
- Full production build, TypeScript, ESLint and whitespace checks passed.
- `npm audit --omit=dev`: zero reported vulnerabilities at the time checked. This is a dependency-advisory check, not a guarantee of application security.

## Implementation boundaries

Production uses Supabase-managed password authentication and OAuth. Local JSON accounts require explicit development/test opt-in and cannot activate in production or replace a failed Supabase login. Existing insecure built-in accounts/default-signed sessions are retired; genuine development account hashes upgrade after successful authentication.

The admin refresh proxy updates both the server-render request and browser cookies. Authorization remains in the page and APIs. It does not add provider lookups to public catalog pages.

No Brave access, live account creation, provider dashboard configuration or production database changes were used. This revision contains the implementation; these local checks do not establish production deployment or live provider activation.
