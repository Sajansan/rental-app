# Supabase frontend mapping

Inspected the connected `rental-app` project (`yagupbxrvgplylpgfihw`) on 6 October 2026 using read-only metadata queries. No database records, schema, policies, functions, storage objects, or authentication settings were modified.

| Existing capability | Frontend |
| --- | --- |
| Auth and profile-creation trigger | Registration and sign-in, customer/admin routing |
| `profiles` | Own profile editing, admin customer directory and booking history |
| `vehicles` | Signed-in fleet browsing, search, type/fuel/transmission filters, price/seats sorting, admin fleet editing |
| `vehicle_images` and `vehicle-images` bucket | Vehicle galleries, admin upload, removal, primary-photo selection; existing bucket limit is 5 MB |
| `bookings` | Date selection, rate estimate, pending booking requests, customer history, admin status lifecycle |
| `payments` | Admin cash/bank-transfer recording, pending/failed status updates, customer payment history and remaining balance |
| `is_vehicle_available` | Existing RPC used for date search and booking checks |

## Existing access rules and limits

- Fleet tables have SELECT policies for authenticated users, with no anonymous SELECT policy. Visitors see a sign-in prompt, not a misleading empty fleet. Public browsing would need a separately approved database policy change.
- Customer bookings/payments are restricted to their user ID. Admins use the current profile role and existing RLS policies. Clients use the configured publishable/anon key, never a service-role key.
- Customers have no booking UPDATE policy. Cancellation and status management remain admin actions.
- `is_vehicle_available` runs with invoker privileges. Customers can only see their own reservations, so date search can show a vehicle booked by someone else. The existing `prevent_overlapping_vehicle_bookings` exclusion constraint rejects overlapping pending/confirmed/active bookings at insertion. Fixing the search's global availability requires a separately reviewed database change.
- No Edge Functions were deployed. Payments are records of cash/bank transfers, not online checkout.
- At inspection there were five profiles and no fleet, image, booking, or payment records. No seed records were added.

## Validation

Production build, TypeScript, ESLint, existing authentication tests, and local behavioral tests are run without submitting live mutations. Browser verification covers public pages, filter disclosure, navigation, and responsive layout. Live authenticated create/update/upload flows require real accounts and permission to write test data.

References: [Supabase server-side authentication](https://supabase.com/docs/guides/auth/server-side/nextjs), [Row level security](https://supabase.com/docs/guides/database/postgres/row-level-security). Next.js conventions were checked against the bundled `node_modules/next/dist/docs` guides.
