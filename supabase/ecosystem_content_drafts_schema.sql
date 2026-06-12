-- Content Drafts for PostCraft review (founder approval required — no auto-publish).

create table if not exists ecosystem_content_drafts (
  id text primary key,
  topic text not null,
  topic_key text not null,
  asset_type text not null,
  asset_label text not null,
  title text not null,
  angle text not null,
  opportunity_score integer not null default 0,
  trend text not null default 'stable',
  source_signal_summary text not null default '',
  why_this_matters text not null default '',
  body text not null default '',
  status text not null default 'drafted',
  post_craft_sync_ready boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  approved_at timestamptz
);

create index if not exists ecosystem_content_drafts_status_idx
  on ecosystem_content_drafts (status, updated_at desc);
