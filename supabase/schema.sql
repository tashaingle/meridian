-- Run this in the Supabase SQL editor before setting SUPABASE_URL
-- and SUPABASE_SERVICE_ROLE_KEY. The service role is the only key the app uses.
-- Row level security stays on and there is no public policy.

create table if not exists public.bookings (
  reference text primary key,
  idempotency_key text unique not null,
  email text not null,
  created_at timestamptz not null default now(),
  payload jsonb not null
);

alter table public.bookings enable row level security;
