# Roadly Car & Van Rental

A responsive rental MVP built with Next.js App Router, TypeScript, Tailwind CSS and the existing Supabase project. It supports direct customer registration/sign-in, a public vehicle catalogue, date-based availability checks, customer bookings/profile, and an admin workspace for vehicles, bookings, customers and payment records.

## Run locally

Set the existing Supabase project URL and anon/publishable key in `.env.local` (never commit real keys):

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-existing-anon-key
```

Install dependencies with `npm install`, then run `npm run dev` and open http://localhost:3000.

## Supabase requirements

This app uses the existing database, auth, profile trigger, Storage bucket and `is_vehicle_available` RPC. It makes no schema or RLS changes and never uses a service-role key. Registration only sends name and phone metadata; the existing database trigger must create a `customer` profile. Admin accounts are managed separately.

For registration to create an account and immediately establish a session without confirmation email, turn **Confirm email** off in Supabase Dashboard → Authentication → Providers → Email. If this setting is on, Supabase may create the account while withholding a session; the app surfaces that configuration issue and does not add a confirmation-email flow.

Existing RLS must allow public reads of vehicles and vehicle images; authenticated customers to read/update only their own profile, read their own bookings/payment records, and insert their own pending bookings; and admins to read/update the management data and use the existing `vehicle-images` bucket. The app uses the signed-in user's session for every query, mutation and storage request. Verify those existing policies in the target project before live use; the app does not bypass or repair them. Vehicle availability is date-based and is checked with the existing RPC at search and booking submission. The database's existing overlap constraint remains the final concurrency guard.

## Main routes

- `/` — landing page with date/type search and live featured vehicles.
- `/vehicles` and `/vehicles/[id]` — public catalogue, search and vehicle details; date filters use the existing availability RPC.
- `/register`, `/login` — existing Supabase Auth flows. Successful users route by `profiles.role`.
- `/my-bookings`, `/my-bookings/[id]`, `/profile` — customer-only booking history and profile editing.
- `/admin` — live operational counts, payment totals and recent requests.
- `/admin/vehicles` — vehicle and image management using the existing public `vehicle-images` bucket.
- `/admin/bookings`, `/admin/bookings/[id]` — booking review and allowed lifecycle transitions.
- `/admin/customers`, `/admin/customers/[id]` — customer profiles and booking history.
- `/admin/payments` — payment tracking only (cash/bank transfer); no payment gateway is connected.

Customer cancellation is not exposed because the existing customer booking-update RLS policy and business rules were not available to safely establish that permission. The rental team can reject/cancel through the admin booking workflow. Customer email addresses are not queried for the admin customer list because the existing `profiles` table does not store them and this app does not use privileged Auth APIs.

## Checks

```sh
npm run lint
npx tsc --noEmit
npm run build
node --test tests/*.test.mjs
```

The automated auth tests use mocked Supabase responses. They do not verify live RLS, the signup trigger, Storage policies, availability RPC, or actual booking inserts. Test those behaviors with a customer and admin account in the connected Supabase project before launch. Never use a production customer's records for test mutations.
