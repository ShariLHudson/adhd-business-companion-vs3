-- Revenue Intelligence events (anonymous customer refs only).
create table if not exists ecosystem_revenue_events (
  id text primary key,
  kind text not null,
  amount numeric not null default 0,
  recurring_amount numeric,
  currency text not null default 'USD',
  occurred_at timestamptz not null,
  source text not null default 'internal',
  customer_ref text
);

create index if not exists ecosystem_revenue_events_occurred_at_idx
  on ecosystem_revenue_events (occurred_at desc);

create index if not exists ecosystem_revenue_events_kind_idx
  on ecosystem_revenue_events (kind);
