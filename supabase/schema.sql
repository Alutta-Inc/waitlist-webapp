-- ═══════════════════════════════════════════════════════════
-- ALUTTA WAITLIST SCHEMA
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ═══════════════════════════════════════════════════════════

-- Enable UUID extension (already enabled by default on Supabase)
create extension if not exists "uuid-ossp";

-- ── WAITLIST TABLE ──────────────────────────────────────────
create table if not exists waitlist (
  id             uuid primary key default uuid_generate_v4(),
  first_name     text not null,
  email          text not null unique,
  country        text,                        -- home country (optional)
  destination    text,                        -- intended destination: US/UK/CA
  program        text,                        -- intended program type
  referral_code  text unique,                 -- this user's shareable code
  referred_by    text,                        -- referral code of referrer
  source         text default 'hero',         -- hero | final_cta | direct
  utm_source     text,
  utm_medium     text,
  utm_campaign   text,
  ip_address     text,
  confirmed_at   timestamptz,                 -- email confirmation timestamp
  created_at     timestamptz default now(),
  updated_at     timestamptz default now()
);

-- Index for fast lookups
create index if not exists waitlist_email_idx       on waitlist(email);
create index if not exists waitlist_referral_idx    on waitlist(referral_code);
create index if not exists waitlist_referred_by_idx on waitlist(referred_by);
create index if not exists waitlist_created_at_idx  on waitlist(created_at desc);

-- ── ROW LEVEL SECURITY ─────────────────────────────────────
-- Only the service role (server-side) can read/write
alter table waitlist enable row level security;

-- No public read or write — all access goes through API routes using service role key
create policy "No public access" on waitlist for all using (false);

-- ── REFERRAL STATS VIEW ─────────────────────────────────────
create or replace view referral_stats as
select
  w.referral_code,
  w.first_name,
  w.email,
  count(r.id) as referral_count
from waitlist w
left join waitlist r on r.referred_by = w.referral_code
group by w.id, w.referral_code, w.first_name, w.email
order by referral_count desc;

-- ── UPDATED_AT TRIGGER ──────────────────────────────────────
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger waitlist_updated_at
  before update on waitlist
  for each row execute function update_updated_at();
