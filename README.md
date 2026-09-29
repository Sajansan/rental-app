# Car & Van Rental — Phase 1

Next.js App Router, TypeScript, Tailwind and the existing Supabase backend. This phase contains authentication and role-protected placeholders only.

## Run locally

The installed dependencies already include `@supabase/ssr` and `@supabase/supabase-js`.

Set these in `.env.local` (never commit real keys):

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-existing-anon-key
```

Run `npm install` if needed, then `npm run dev` and open http://localhost:3000.

## Existing Supabase configuration

No SQL migrations, tables, profile writes, buckets or policies are created by this app. The existing signup trigger must populate `profiles` from `full_name` and `phone` metadata and assign `customer` independently of user-controlled role metadata. Existing RLS must permit users to select their own profile and prevent customers from promoting their role. Admin accounts remain managed separately in Supabase.

For email confirmation, set the Supabase Auth **Site URL** to your app origin (`http://localhost:3000` locally, your HTTPS origin in production). In Auth → Email Templates → Confirm signup, set the confirmation link to:

```html
<a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email">Confirm your email</a>
```

The included route verifies the token, stores the session in cookies, and sends the user through `/login` to their profile's role destination. Invalid/expired links show an error. This token-hash flow works even when the email opens in a different browser. With email confirmation disabled, signup immediately establishes a session and redirects. The existing default Supabase verification email can also verify the address; users can then return to `/login` manually.

No password reset, resend-email workflow, vehicle, booking, payment or upload functionality is included.

## Organization

- `lib/supabase/client.ts`: cookie-based browser client, ready for future client-side use.
- `lib/supabase/server.ts`: request-scoped server client; writable cookie support for actions/handlers.
- `proxy.ts`: refreshes sessions and passes refreshed cookies to server rendering and the browser; prevents shared caching of auth routes.
- `lib/auth.ts`: verifies users with `getUser`, selects the current user's profile through RLS and enforces role access.
- `lib/auth-validation.ts`: shared input validation and action result type.
- `types/profile.ts`: profile, role and Phase 1 database types.
- `app/auth/actions.ts`: validated registration, login and logout Server Actions.
- `app/auth/confirm/route.ts`: email confirmation endpoint.
- `components/auth/`: simple forms, pending/error states, reusable logout and placeholders.
- `app/{login,register,customer,admin}/page.tsx`: route entry points; `app/page.tsx` is public home.

Authorization uses `profiles.role`, never an email address or submitted role. Missing/unrecognized profiles fail closed with a visible error and logout option. Profile queries use the verified user's ID. Server-rendered protected pages recheck access, including direct URL requests. Future protected Server Actions and Route Handlers must also call authorization checks; a page guard is not authorization for separate endpoints.

Sessions use the SSR library's cookies, with no manual localStorage/token persistence. Login/logout invalidate the Next.js router cache. Do not enable shared CDN caching for authenticated responses.

## Test manually

1. **Registration:** open `/register`, try blank name, invalid email, a short password and mismatched passwords. Submit valid details using a new email. Confirm the existing trigger creates exactly one profile with the name/phone and `role = customer`. Verify email if enabled, then sign in. If confirmation is disabled, expect `/customer` immediately.
2. **Customer login:** log in with that account. Expect `/customer`, your name and `Role: Customer`. Refresh and open the URL in another tab to verify cookie sessions.
3. **Admin login:** log out, then sign in with an existing Supabase-managed account whose profile has `role = admin`. Expect `/admin`, its name and `Role: Admin`. Do not create admins via public registration.
4. **Wrong role:** as a customer enter `/admin` directly; expect `/customer`. As an admin enter `/customer`; expect `/admin`.
5. **Logged out:** click Logout; expect `/login`. Revisit both protected routes directly and using browser Back/refresh; neither should reveal a dashboard. A private browser window should also redirect both routes to `/login`.
6. **Failures:** try an incorrect password and an unconfirmed email. A test account with a missing/inaccessible profile should see an error, never a dashboard. Test a service outage to verify connection errors and retry behavior.
7. **Session renewal:** leave a test session past the access-token lifetime, then refresh a protected route; the proxy should renew its cookies while the refresh token remains valid.

## Checks

```sh
node --test tests/auth.test.mjs
npm run lint
npm run build
npx tsc --noEmit
```

The Node tests use mocked Supabase responses to exercise validation, authorization and action failure paths without creating users or changing the database. They are not a live Supabase integration test. Real registration, email delivery, trigger/RLS behavior and session renewal require the manual checks above.

SSR architecture reference: https://supabase.com/docs/guides/auth/server-side/creating-a-client?framework=nextjs
