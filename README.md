# Meridian

An Umrah flight search for travel agents in the UK, the US and Canada, started from the October 2026 project plan.

Agents can search Jeddah and Medina, compare fares, read the conditions, enter passenger details and save a demonstration booking. Staff can sign in and see bookings the server managed to store. Terms, privacy, cookies and refunds are draft pages for the selling business to replace. Hotels and visas are not in this version.

## What is live

Nothing is sold. Sample fares are generated in the app so the screens work before a Duffel agreement exists. Card numbers are checked and then discarded. Only the brand and last four digits are kept, and no charge is made. Duffel search can be switched on with an access token. Creating an airline order stays off until payments are approved.

## Run it

```bash
npm install
npm run dev
```

Open http://localhost:3000. Try London to Jeddah, then use **Fill sample traveller** at checkout. The demonstration card is `4242 4242 4242 4242`.

## Deploy on Vercel

Import the GitHub repository. The framework is Next.js and the root is this project. Add the environment variables from `.env.example` when you have them. `ADMIN_PASSWORD` has no default.

Without Supabase, a booking is written to `.data/bookings.json` when the filesystem allows it, and it is also kept in the browser that made it. On Vercel the local file does not last. Add the SQL in `supabase/schema.sql`, then set `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`, to keep bookings.

## Still to connect

- Duffel production access, and a decision on who tickets
- A PCI-conscious payment provider and the merchant of record
- Transactional email
- Approved legal wording, support contact and financial protection
- Hotel search, as a later phase
