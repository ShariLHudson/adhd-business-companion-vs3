-- Cost Intelligence events (vendor categories only — no secrets).
create table if not exists ecosystem_cost_events (
  id text primary key,
  category text not null,
  amount numeric not null default 0,
  currency text not null default 'USD',
  occurred_at timestamptz not null,
  source text not null default 'manual',
  note text
);

create index if not exists ecosystem_cost_events_occurred_at_idx
  on ecosystem_cost_events (occurred_at desc);

create index if not exists ecosystem_cost_events_category_idx
  on ecosystem_cost_events (category);
