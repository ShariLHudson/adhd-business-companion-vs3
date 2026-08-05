-- Authoritative Creation persistence — companion_creation_workspaces.
-- Read/written by lib/creationDurable/repository.ts (write → read-back →
-- verify workspaceId + version; see lib/creationDurable/mapping.ts for the
-- exact row shape this schema must match: AuthoritativeCreationRecord ↔
-- CreationDurableRow).
--
-- Phase P0.5 (2026-08-05) — Create Durable Trust Foundation. This file did
-- NOT previously exist in the repository despite the app depending on this
-- table since at least Beta Blocker 1 (docs/BETA_BLOCKER_1_DURABLE_PERSISTENCE_PLAN.md).
-- The table already exists in the live production Supabase project — this
-- file captures it as the repository source of truth going forward so a
-- fresh environment (or a disaster-recovery rebuild) is no longer blocked
-- on tribal knowledge.
--
-- ============================================================================
-- VERIFICATION METHOD AND CONFIDENCE — read before trusting this file
-- ============================================================================
-- No Supabase CLI, database connection string, or Management API access
-- token was available in this environment, so a full `pg_dump`-equivalent
-- introspection (indexes, constraints, triggers, exact RLS policy text)
-- was not possible. What WAS verified, read-only, directly against the
-- live project using the already-configured service-role and anon REST
-- credentials (no row data was fetched or logged at any point):
--
--   1. The table exists in production and currently holds member rows
--      (confirmed via a HEAD/count-only request — zero rows read).
--   2. The exact column set, types, nullability, and defaults below were
--      read from PostgREST's live OpenAPI schema document for this table
--      (GET {supabase_url}/rest/v1/ with Accept: application/openapi+json).
--      This is a live, verified capture — not a guess.
--   3. An unauthenticated (anon) read attempt was rejected with Postgres
--      error 42501 "permission denied for table companion_creation_workspaces"
--      — i.e. anon has no blanket table-level grant. This is consistent
--      with (but does not by itself prove the exact predicate of) RLS
--      scoped to auth.uid() = user_id.
--
-- What was NOT independently verified (no DB-level access available):
--   - The exact RLS policy definitions and their predicates.
--   - The exact GRANT statements for the `authenticated` role.
--   - Indexes and their definitions.
--   - Whether user_id carries a foreign-key constraint to auth.users.
--
-- The RLS/GRANT section below is therefore left as commented-out reference
-- SQL, modeled on the sibling table this app already ships with an
-- identical shape and an explicit "reference model" note in
-- docs/BETA_BLOCKER_1_DURABLE_PERSISTENCE_PLAN.md (companion_member_records,
-- see companion_member_records_schema.sql in this directory), and it is
-- consistent with the anon-denial behavior observed above. It is NOT
-- claimed to be a verified reproduction of the live policy. Before applying
-- this section to any environment — including using it to recreate this
-- table from scratch — a maintainer with direct database access must
-- confirm the live policy text (Supabase Dashboard → Authentication →
-- Policies, or `select * from pg_policies where tablename =
-- 'companion_creation_workspaces';`) and update this file to match, or
-- knowingly accept this modeled version.
--
-- The `create table if not exists` statement below is safe to run against
-- the live project as-is: it is a no-op there (the table already exists)
-- and gives a fresh environment the correct column-level contract.
-- ============================================================================

create table if not exists public.companion_creation_workspaces (
  id                    text primary key,
  user_id               uuid not null,
  creation_type         text not null default '',
  title                 text not null default '',
  status                text not null default 'active',
  original_request      text not null default '',
  kind                  text not null default 'creation',
  event_record_id       text,
  project_home_id       text,
  persistence_version   integer not null default 1,
  payload               jsonb not null,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

-- ============================================================================
-- MODELED, NOT VERIFIED — see confidence note above. Commented out so this
-- file can never silently alter live security posture on re-run. Uncomment
-- only after confirming against the live project.
-- ============================================================================

-- create index if not exists companion_creation_workspaces_owner_idx
--   on public.companion_creation_workspaces (user_id, status, updated_at desc);
--
-- alter table public.companion_creation_workspaces
--   add constraint companion_creation_workspaces_user_id_fkey
--   foreign key (user_id) references auth.users (id) on delete cascade;
--
-- grant select, insert, update on public.companion_creation_workspaces to authenticated;
-- grant all on public.companion_creation_workspaces to service_role;
--
-- alter table public.companion_creation_workspaces enable row level security;
--
-- drop policy if exists "member reads own creation workspaces"
--   on public.companion_creation_workspaces;
-- create policy "member reads own creation workspaces"
--   on public.companion_creation_workspaces
--   for select
--   using (auth.uid() = user_id);
--
-- drop policy if exists "member inserts own creation workspaces"
--   on public.companion_creation_workspaces;
-- create policy "member inserts own creation workspaces"
--   on public.companion_creation_workspaces
--   for insert
--   with check (auth.uid() = user_id);
--
-- drop policy if exists "member updates own creation workspaces"
--   on public.companion_creation_workspaces;
-- create policy "member updates own creation workspaces"
--   on public.companion_creation_workspaces
--   for update
--   using (auth.uid() = user_id)
--   with check (auth.uid() = user_id);
