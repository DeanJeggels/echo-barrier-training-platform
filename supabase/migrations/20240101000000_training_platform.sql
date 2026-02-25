-- =============================================================================
-- Echo Barrier Training Platform — Database Schema
-- Follows Supabase Postgres best practices:
--   • (select auth.uid()) in RLS policies (evaluated once, not per-row)
--   • to authenticated role on all user policies
--   • force row level security on all tables
--   • explicit indexes on FK columns
--   • timestamptz (not timestamp) for all time columns
--   • text (not varchar) for string columns
--   • bigint identity PKs for internal tables; uuid FK where referencing auth.users
--   • SECURITY DEFINER + set search_path = '' on trigger functions
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Shared updated_at trigger function
-- -----------------------------------------------------------------------------
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- -----------------------------------------------------------------------------
-- 1. user_profiles
--    Extends auth.users; auto-created by trigger on new auth user
-- -----------------------------------------------------------------------------
create table if not exists public.user_profiles (
  id                   uuid          not null references auth.users (id) on delete cascade,
  email                text          not null,
  first_name           text,
  last_name            text,
  company_name         text,
  hubspot_contact_id   text,
  created_at           timestamptz   not null default now(),
  updated_at           timestamptz   not null default now(),

  constraint user_profiles_pkey primary key (id)
);

alter table public.user_profiles enable row level security;
alter table public.user_profiles force row level security;

-- Policies: use (select auth.uid()) so the function is evaluated once, not per row
create policy "authenticated users can view own profile"
  on public.user_profiles
  for select
  to authenticated
  using ((select auth.uid()) = id);

create policy "authenticated users can update own profile"
  on public.user_profiles
  for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- Trigger: auto-create profile row on new auth user
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.user_profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

-- Drop trigger first to make migration idempotent
drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- updated_at trigger
drop trigger if exists set_user_profiles_updated_at on public.user_profiles;

create trigger set_user_profiles_updated_at
  before update on public.user_profiles
  for each row
  execute function public.handle_updated_at();

-- -----------------------------------------------------------------------------
-- 2. training_sessions
--    Records each time a user opens the ElevenLabs training agent
-- -----------------------------------------------------------------------------
create table if not exists public.training_sessions (
  id                    bigint        generated always as identity,
  user_id               uuid          not null references auth.users (id) on delete cascade,
  agent_conversation_id text,
  started_at            timestamptz   not null default now(),
  created_at            timestamptz   not null default now(),

  constraint training_sessions_pkey primary key (id)
);

-- Index the FK column (Postgres does not auto-index FKs)
create index if not exists training_sessions_user_id_idx
  on public.training_sessions (user_id);

alter table public.training_sessions enable row level security;
alter table public.training_sessions force row level security;

create policy "authenticated users can view own sessions"
  on public.training_sessions
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "authenticated users can insert own sessions"
  on public.training_sessions
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

-- -----------------------------------------------------------------------------
-- 3. invite_requests
--    Audit log of every email submitted via the registration form.
--    Only accessible via service role (admin dashboard / n8n).
-- -----------------------------------------------------------------------------
create table if not exists public.invite_requests (
  id          bigint        generated always as identity,
  email       text          not null,
  status      text          not null default 'pending',
  hubspot_contact_id text,
  created_at  timestamptz   not null default now(),
  updated_at  timestamptz   not null default now(),

  constraint invite_requests_pkey primary key (id),
  constraint invite_requests_status_check
    check (status in ('pending', 'invited', 'registered', 'failed'))
);

-- Unique index: one invite request row per email
create unique index if not exists invite_requests_email_idx
  on public.invite_requests (email);

-- Enable RLS — no authenticated-user policies means all access denied to non-service roles
alter table public.invite_requests enable row level security;
alter table public.invite_requests force row level security;

drop trigger if exists set_invite_requests_updated_at on public.invite_requests;

create trigger set_invite_requests_updated_at
  before update on public.invite_requests
  for each row
  execute function public.handle_updated_at();
