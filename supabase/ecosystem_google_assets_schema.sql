-- Ecosystem Google Workspace asset registry (links only — content lives in Google).
create table if not exists ecosystem_google_assets (
  id text primary key,
  title text not null,
  kind text not null,
  source_type text not null,
  source_id text not null,
  google_file_id text not null,
  google_url text not null,
  folder_id text,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists ecosystem_google_assets_source_idx
  on ecosystem_google_assets (source_type, source_id);

create index if not exists ecosystem_google_assets_status_idx
  on ecosystem_google_assets (status);
