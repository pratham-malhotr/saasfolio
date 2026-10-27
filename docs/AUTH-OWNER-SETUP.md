# Finish authentication setup

The application code supports Google, Apple and independent email/password sign-in. Provider credentials are not configured in this workspace. Complete these steps in the accounts you own; no Brave automation is needed.

## 1. Choose your Supabase project

Open [Supabase Dashboard](https://supabase.com/dashboard/organizations), select the project intended for SaaSFolio, and record its project URL and public publishable key from the project's connection/API settings. A legacy anon key also works. Use this same project throughout the setup.

If this is a new project, run [the database migration](../supabase/migrations/202610210001_production_flows.sql) once in its SQL Editor. If it was applied during the previous account setup, do not re-run it blindly: confirm `saved_items`, `inquiries` and `request_limits` and their policies already exist. The saved-item policy permits only its owner; the private inbox and rate limiter use the server's service credential.

## 2. Add environment variables

Use [production.env.example](production.env.example) as the template for the hosting project's environment variables and your gitignored `.env.local` when testing with Supabase locally:

```dotenv
NEXT_PUBLIC_SITE_URL=https://saasfolio.tech
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=YOUR_PUBLIC_PUBLISHABLE_KEY
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVER_ONLY_SERVICE_KEY
RATE_LIMIT_SECRET=YOUR_FIRST_RANDOM_SECRET
AUTH_RECOVERY_SECRET=YOUR_SECOND_RANDOM_SECRET
ADMIN_EMAILS=YOUR_INTENDED_ADMIN_EMAIL
```

Use `NEXT_PUBLIC_SUPABASE_ANON_KEY` instead of the publishable-key variable for a legacy anon key. Generate each random secret separately with `openssl rand -hex 32` on your own machine, and paste the results directly into the environment manager. Keep all private keys out of chat and GitHub. Local development accounts are disabled in production; leave `LOCAL_AUTH_ENABLED` unset.

Public keys may be embedded during the Next.js build. Rebuild after changing environment variables. Your hosting project's primary domain must be `https://saasfolio.tech`; redirect alternate hostnames such as `www` to that primary domain before starting a login.

## 3. Configure email and callback URLs

In Supabase Authentication:

1. Enable email signup and email confirmation. Set the password minimum to 12 to match the application's announced policy. Provider password policies can impose additional requirements.
2. Configure a production SMTP sender you control. Supabase sends account confirmation and recovery email; the newsletter's Resend integration is separate.
3. Set **Site URL** to `https://saasfolio.tech`.
4. Add `https://saasfolio.tech/auth/callback` to **Redirect URLs**. The app also adds safe `next` and `flow` query parameters; allow those variants using the restricted pattern `https://saasfolio.tech/auth/callback**` if the exact URLs are not individually listed. This keeps the scheme, host and callback path fixed. For local Supabase testing, add the equivalent `http://localhost:3000/auth/callback**` for the port you actually use.

The application callback and the provider callback are different URLs. Google and Apple return to the **Supabase** callback below; Supabase then returns to the application callback above. [Supabase redirect configuration](https://supabase.com/docs/guides/auth/redirect-urls)

## 4. Enable Google

Open [Google Auth Platform](https://console.cloud.google.com/auth/overview) in the intended Google Cloud project. Configure SaaSFolio's consent screen, audience, homepage, [privacy policy](https://saasfolio.tech/privacy) and [terms](https://saasfolio.tech/terms). Use identity/email/profile scopes only.

Create an OAuth client with type **Web application**:

| Setting | Value |
| --- | --- |
| Authorized JavaScript origin | `https://saasfolio.tech` |
| Authorized redirect URI | `https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback` |

Copy the exact callback from Supabase's Google provider page if your project uses a custom Auth domain. Put the Google Client ID and Client Secret into **Supabase → Authentication → Providers → Google** and enable it. These secrets do not belong in the Next.js public environment. Publish/configure the Google audience for the intended users, rather than leaving public users restricted to test accounts. [Official Google setup](https://supabase.com/docs/guides/auth/social-sign-in/auth-google)

## 5. Enable Apple

Open [Apple Developer identifiers](https://developer.apple.com/account/resources/identifiers/list). You need access to the appropriate Apple Developer team and a primary App ID enabled for Sign in with Apple. Create a web Services ID, associate it with that primary App ID, register the website domain, and use your Supabase callback as the Return URL.

Create a Sign in with Apple signing key. Use the team's ID, key ID, Services ID and private `.p8` key to generate the Apple client secret following [Supabase's Apple instructions](https://supabase.com/docs/guides/auth/social-sign-in/auth-apple). Enter the Services ID and generated secret in **Supabase → Authentication → Providers → Apple**, then enable it. Keep the signing key in a private credential store and renew the generated OAuth secret before its six-month expiry. Configure Apple's private-email relay sender if your account emails need it. If your team does not yet have Apple Developer access, Google and email/password can be launched independently.

## 6. Verify before launch

After these settings are saved, rebuild/deploy the authentication changes. Until they are pushed and deployed, the live website continues to run the previous code.

1. Visit `/api/health`: `authMode` should be `supabase`, `accountsConfigured` true, and the enabled provider booleans true. These report configuration, not successful consent or database-policy verification.
2. Register with email, follow the confirmation link in the same browser, sign in and sign out. Request a recovery email, follow it in the same browser, change the password and sign in again. PKCE confirmation/recovery requires the browser that requested the link.
3. Test Google and Apple with real accounts, including cancelling consent and Apple's private email option. Verify that both signup and returning login reach the intended account.
4. With two ordinary test accounts, confirm each account sees only its own saved offers and neither can read the admin inbox. Only a provider-confirmed account exactly listed in `ADMIN_EMAILS` may administer it.
5. Sign out, then confirm protected APIs reject the expired session. Supabase access-token revocation follows the provider's session rules; do not treat logout as instant invalidation of every previously issued JWT.

See [the implementation and security details](AUTHENTICATION.md) for development-only storage, testing boundaries and operational limits.
