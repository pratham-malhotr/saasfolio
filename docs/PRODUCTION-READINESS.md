# Production audit and implementation

## Replaced in this pass

- Fake browser sign-in became Supabase password authentication, email confirmation, sign-out, and password recovery. Cookies are HttpOnly, SameSite=Lax, and Secure in production. Redirect destinations are restricted to local paths. OAuth and simulated magic-link buttons were removed.
- The account dashboard loads the authenticated user, persists settings, and saves actual deals and articles through the database. It no longer invents a profile, saved articles, reputation, or submissions.
- Contact, partnership, and vendor forms submit to a server endpoint with field validation, a request size limit, same-origin checks, and database-backed limits. Success references come from persisted database records. No customer confirmation or admin notification email is claimed.
- The review inbox is limited to confirmed users listed in `ADMIN_EMAILS`. Page and API access are independently checked. Private inquiries are not readable with public credentials. Updating an inquiry status does not automatically publish an unverified offer.
- Newsletter signup requires explicit consent and email confirmation. Tokens are random and stored as hashes; confirmation expires after 24 hours. The signup email includes a working unsubscribe link. A GET of the unsubscribe page does not unsubscribe a recipient: they confirm with a POST, avoiding accidental unsubscriptions from link preview scanners.
- Homepage counts use the catalog rather than invented savings, members, or coupon success rates. Unsupported audience figures and generic social profile links were removed. Focus outlines, skip navigation, reduced-motion cursor behavior, labels, loading UI, and visible content before JavaScript were improved.
- Health output reports configuration presence instead of inventing DNS, cache, database uptime, or latency checks. It is a liveness/configuration endpoint, not an authenticated database readiness probe.

## Required activation

No active provider credentials were present in this workspace. No real account was created, email sent, or production database modified during this work.

1. Create or select the intended Supabase project and apply `supabase/migrations/202610210001_production_flows.sql` with the SQL editor or Supabase CLI. Run the migration once. It creates private inquiries, per-user saved items, newsletter subscriptions, and the request-limit function with explicit grants and row-level security.
2. Add the values in `docs/production.env.example` to the hosting environment. Keep `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`, and `RATE_LIMIT_SECRET` server-only. Use actual project values rather than the placeholders. The service role is needed for public forms and persistent rate limits; account sign-in limits also use it.
3. In Supabase Auth, set the Site URL to `https://saasfolio.tech`, allow `https://saasfolio.tech/auth/callback` and its password-reset query variant, and keep email confirmation enabled. Add explicit localhost callbacks for local testing when needed. Configure the provider's production SMTP and abuse controls. Confirm the email templates use the PKCE confirmation URL that returns to `/auth/callback?code=...`.
4. Verify the sending domain with Resend and set `NEWSLETTER_FROM_EMAIL` to an authorized sender. Newsletter confirmation uses Resend; account confirmation and reset use Supabase Auth's email configuration. Existing pending signups are not subscribed until confirmed. There is no bulk mailing job in this revision. Any future sender must select only `status = 'active'` and include unsubscribe links in every edition.
5. Put only intended administrators' email addresses in `ADMIN_EMAILS`. Create and verify those accounts through the normal signup flow. The allowlist is read on the server and cannot be granted through user-editable profile metadata.
6. Build and deploy to the actual host. Ensure HTTPS, a stable canonical origin and the host's bot/abuse controls. On Vercel, rate limits use `x-vercel-forwarded-for`. Other hosts must explicitly set `TRUSTED_CLIENT_IP_HEADER` to a supported header that their trusted ingress overwrites (`cf-connecting-ip`, `x-vercel-forwarded-for`, `x-real-ip` or `x-forwarded-for`), with the origin protected against direct access. Without this configuration, callers share an anonymous rate-limit bucket: spoofed forwarding headers cannot create unlimited buckets, but the shared limit can reduce availability. Periodically remove expired request-limit rows and adopt an explicit operational data-retention schedule.

Without configuration, APIs return an explicit unavailable response rather than claim that a user signed in or that a form was received. Public browsing remains available.

## Verification

```sh
npm run test:platform
npm run test:offers
npm run build
npm run start -- --hostname 127.0.0.1 --port 3210
npm run seo:audit:brands -- http://127.0.0.1:3210
npm run seo:audit -- http://127.0.0.1:3210
```

Platform tests execute actual route handlers with mocked provider SDK boundaries. They cover validation, cross-origin requests, malformed/oversized bodies, provider/database failure, rate-limit failure, authentication, admin authorization, saved-item ownership, consent, and redirect handling. They do not validate a live database's RLS policies or actual email delivery.

After activation, verify with two separate accounts that account A cannot read/write account B's saved items, a normal user cannot access the admin queue, signup confirmation and recovery links arrive and work, forms appear in the admin inbox, and newsletter confirmation/unsubscribe persists in Supabase.

## Still requires a separate implementation or owner review

- Community discussions, comments, and votes still use browser/session storage. These flows are labeled as previews or local notes. A public forum needs database persistence, moderation, reporting, authenticated authors, and abuse controls before being represented as a shared live community.
- The October 23 publisher audit replaced eight unsupported benchmark articles with referenced buying guides, removed fictitious community authors/activity, and excluded browser-local previews from indexing. The wider software catalog still needs ongoing source review; these changes do not certify every provider claim or external offer.
- Actual support mailboxes, staffing, response times, sponsorship prices, placement inventory, privacy requests, backups, database monitoring, retention, and transactional delivery must be configured and confirmed by the operator. Sponsorship cards are inquiries, not a payment or guaranteed-placement system.
- Account deletion/export, two-factor enforcement, newsletter edition scheduling, provider delivery webhooks, and analytics are not implemented in this pass. Do not present these as existing product capabilities.

## References

- [Supabase server clients](https://supabase.com/docs/guides/auth/server-side/creating-a-client?queryGroups=framework&framework=nextjs)
- [Supabase password authentication](https://supabase.com/docs/guides/auth/passwords)
- [Resend send-email API](https://resend.com/docs/api-reference/emails/send-email)
