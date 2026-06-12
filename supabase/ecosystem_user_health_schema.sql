-- User health intelligence — anonymous engagement & retention (no conversation text).

create table if not exists ecosystem_user_health (
  user_id text primary key,
  last_activity_at timestamptz not null,
  last_login_at timestamptz,
  login_count integer not null default 0,
  feature_usage_count integer not null default 0,
  companion_usage_count integer not null default 0,
  session_count integer not null default 0,
  cancelled_at timestamptz,
  recovered_at timestamptz,
  health_score integer not null default 100,
  health_status text not null default 'healthy',
  days_since_last_activity integer not null default 0,
  updated_at timestamptz not null default now()
);

create index if not exists ecosystem_user_health_status_idx
  on ecosystem_user_health (health_status, days_since_last_activity desc);
