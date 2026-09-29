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

For direct registration and immediate login, disable **Confirm email** in Supabase Dashboard → Authentication → Providers → Email. `supabase.auth.signUp()` then returns a session; the existing database trigger creates the customer profile. The application does not implement a confirmation-email flow.

No password reset, resend-email workflow, vehicle, booking, payment or upload functionality is included.

## Organization

- `lib/supabase/client.ts`: cookie-based browser client, ready for future client-side use.
- `lib/supabase/server.ts`: request-scoped server client; writable cookie support for actions/handlers.
- `proxy.ts`: refreshes sessions and passes refreshed cookies to server rendering and the browser; prevents shared caching of auth routes.
- `lib/auth.ts`: verifies users with `getUser`, selects the current user's profile through RLS and enforces role access.
- `lib/auth-validation.ts`: shared input validation and action result type.
- `types/profile.ts`: profile, role and Phase 1 database types.
- `app/auth/actions.ts`: validated registration, login and logout Server Actions.
- `components/auth/`: simple forms, pending/error states, reusable logout and placeholders.
- `app/{login,register,customer,admin}/page.tsx`: route entry points; `app/page.tsx` is public home.

Authorization uses `profiles.role`, never an email address or submitted role. Missing/unrecognized profiles fail closed with a visible error and logout option. Profile queries use the verified user's ID. Server-rendered protected pages recheck access, including direct URL requests. Future protected Server Actions and Route Handlers must also call authorization checks; a page guard is not authorization for separate endpoints.

Sessions use the SSR library's cookies, with no manual localStorage/token persistence. Login/logout invalidate the Next.js router cache. Do not enable shared CDN caching for authenticated responses.

## Test manually

1. **Registration:** open `/register`, try blank name, invalid email, a short password and mismatched passwords. Submit valid details using a new email. Confirm the existing trigger creates exactly one profile with the name/phone and `role = customer`. Expect an immediate session and redirect to `/customer`.
2. **Customer login:** log in with that account. Expect `/customer`, your name and `Role: Customer`. Refresh and open the URL in another tab to verify cookie sessions.
3. **Admin login:** log out, then sign in with an existing Supabase-managed account whose profile has `role = admin`. Expect `/admin`, its name and `Role: Admin`. Do not create admins via public registration.
4. **Wrong role:** as a customer enter `/admin` directly; expect `/customer`. As an admin enter `/customer`; expect `/admin`.
5. **Logged out:** click Logout; expect `/login`. Revisit both protected routes directly and using browser Back/refresh; neither should reveal a dashboard. A private browser window should also redirect both routes to `/login`.
6. **Failures:** try an incorrect password. A test account with a missing/inaccessible profile should see an error, never a dashboard. Test a service outage to verify connection errors and retry behavior.
7. **Session renewal:** leave a test session past the access-token lifetime, then refresh a protected route; the proxy should renew its cookies while the refresh token remains valid.

## Checks

```sh
node --test tests/auth.test.mjs
npm run lint
npm run build
npx tsc --noEmit
```

The Node tests use mocked Supabase responses to exercise validation, authorization and action failure paths without creating users or changing the database. They are not a live Supabase integration test. Real registration, trigger/RLS behavior and session renewal require the manual checks above.

SSR architecture reference: https://supabase.com/docs/guides/auth/server-side/creating-a-client?framework=nextjs

## Phase 2 — Admin vehicle management

The admin vehicle routes use the existing `requireRole("admin")` profile check and the current cookie-backed Supabase client. Every write action checks the role again, and all database and Storage requests use the logged-in user session so existing RLS policies still apply. No schema changes, service-role key, booking flows or payment features were added.

Routes added: `/admin/vehicles`, `/admin/vehicles/new`, `/admin/vehicles/[id]`, and `/admin/vehicles/[id]/edit`. The admin placeholder now links to Vehicle Management.

Implementation details:

- `lib/vehicles.ts` fetches vehicles and image rows; `lib/vehicle-display.ts` contains client-safe image/price helpers; `lib/vehicle-validation.ts` validates and converts form values.
- `app/admin/vehicles/actions.ts` implements create/update/delete, image registration/deletion, and primary-image changes. Inputs are validated server-side; duplicate registration numbers get a friendly message.
- `components/vehicles/` provides the reusable vehicle form/list, metadata, gallery, upload, and confirmation controls.
- `next.config.ts` allows optimized images from the configured Supabase `vehicle-images` public bucket host.
- Image upload checks JPEG/PNG/WEBP MIME type and 5 MB size, generates a UUID filename inside the vehicle's folder, uploads with the browser session, then stores its public URL in `vehicle_images`. It permits at most five images per vehicle and removes the uploaded object if the image row cannot be saved.
- The first image is primary. Admins can select a different primary; deleting the primary promotes the earliest remaining image.
- Deleting an image removes its Storage object and then its row. Deleting a vehicle removes its Storage objects first, then deletes the vehicle; `ON DELETE CASCADE` handles image rows. Confirmation is required for both deletion actions.

Manual checklist (use an admin profile and a test vehicle):

1. Open `/admin/vehicles`, add a vehicle with all fields; blank optional year/seats should save as null and price should stay numeric.
2. Check the row, primary image placeholder, detail link, and LKR/day price; test search by name, brand, model and registration, plus type and status filters.
3. Open details, edit fields, save, and confirm updates; change status among available, maintenance and inactive.
4. Upload JPEG, PNG and WEBP files; check invalid formats, files over 5 MB, and a sixth image are rejected.
5. Confirm the first image becomes primary, set another primary, and check the list thumbnail updates.
6. Delete a non-primary image, then delete the primary while another remains; confirm the remaining image becomes primary and removed files are no longer public.
7. Delete a vehicle and verify it disappears along with its Storage objects.
8. As an admin, open each vehicle route and submit actions. As a customer, try each URL and confirm redirection to `/customer`; attempt direct action submissions and confirm the server rejects them. Also confirm Supabase RLS denies unauthorized database or Storage access.

Registration and RLS still use the existing Supabase configuration. Confirm email must be off in the Supabase project for immediate signup.
