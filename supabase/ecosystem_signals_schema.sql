-- Aggregated user intelligence (categorized signals only — no conversation text).
-- Powers the ADHD Business Ecosystem Dashboard in Go High Level.

create table if not exists ecosystem_signal_counts (
  signal_kind text not null,
  signal_category text not null,
  count integer not null default 0,
  last_seen timestamptz not null default now(),
  primary key (signal_kind, signal_category)
);

create index if not exists ecosystem_signal_counts_count_idx
  on ecosystem_signal_counts (count desc);
