-- PostCraft sync metadata (queue status per approved draft).

create table if not exists ecosystem_postcraft_sync (
  draft_id text primary key,
  status text not null default 'ready',
  last_sync_attempt timestamptz,
  error text,
  updated_at timestamptz not null default now()
);

create index if not exists ecosystem_postcraft_sync_status_idx
  on ecosystem_postcraft_sync (status, updated_at desc);
