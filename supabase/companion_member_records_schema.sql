-- Durable member-record store — the generic persistence foundation for
-- beta-critical member work (Beta Blocker 1).
--
-- Apply with service-role migrations against Supabase. Never expose the service
-- role to the browser. Members read/write their own rows via the anon client,
-- gated by the RLS policies below (auth.uid() = user_id).
--
-- One row per (user_id, domain, record_id). Payload is domain-shaped JSONB;
-- schema_version lets a domain evolve; record_version is optimistic concurrency.

create table if not exists public.companion_member_records (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users (id) on delete cascade,
  domain          text not null,
  record_id       text not null,
  status          text not null default 'active'
                    check (status in ('active', 'archived', 'deleted')),
  schema_version  integer not null default 1,
  record_version  integer not null default 1,
  payload         jsonb not null,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  unique (user_id, domain, record_id)
);

create index if not exists companion_member_records_owner_domain_idx
  on public.companion_member_records (user_id, domain, status, updated_at desc);

-- Keep updated_at honest on every write.
create or replace function public.companion_member_records_touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists companion_member_records_set_updated_at
  on public.companion_member_records;
create trigger companion_member_records_set_updated_at
  before update on public.companion_member_records
  for each row execute function public.companion_member_records_touch_updated_at();

-- Table privileges. RLS (below) constrains WHICH rows each role may touch; these
-- GRANTs are the prerequisite table-level access. Members act as `authenticated`
-- (via their JWT) and get select/insert/update only — never delete, since removal
-- is soft (status = 'deleted'). `service_role` (server/admin, bypasses RLS) gets
-- full access. `anon` is intentionally omitted: unauthenticated callers have no
-- access at all. Explicit here so the table does not depend on project-level
-- default privileges.
grant select, insert, update on public.companion_member_records to authenticated;
grant all on public.companion_member_records to service_role;

-- Row Level Security: a member may only ever see or change their own rows.
alter table public.companion_member_records enable row level security;

drop policy if exists "member reads own records"
  on public.companion_member_records;
create policy "member reads own records"
  on public.companion_member_records
  for select
  using (auth.uid() = user_id);

drop policy if exists "member inserts own records"
  on public.companion_member_records;
create policy "member inserts own records"
  on public.companion_member_records
  for insert
  with check (auth.uid() = user_id);

drop policy if exists "member updates own records"
  on public.companion_member_records;
create policy "member updates own records"
  on public.companion_member_records
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- No member-facing DELETE policy: deletes are soft (status = 'deleted') so
-- member work is never hard-lost (Constitution 117 — never lose user work).
