-- PostCraft live publishing outcomes (metadata only).
create table if not exists ecosystem_postcraft_publishing (
  draft_id text primary key,
  publish_status text not null,
  postcraft_id text,
  scheduled_at timestamptz,
  published_at timestamptz,
  publish_results jsonb,
  error text,
  updated_at timestamptz not null default now()
);

create index if not exists ecosystem_postcraft_publishing_status_idx
  on ecosystem_postcraft_publishing (publish_status);
