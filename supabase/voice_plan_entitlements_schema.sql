-- Voice plan entitlements — verified FastPay / FastPayDirect payments only.
-- Apply with service-role migrations. Never expose service role to the browser.

create table if not exists voice_plan_entitlements (
  user_id text primary key,
  email text,
  plan text not null check (plan in ('essential', 'voice-lite', 'voice-pro')),
  entitlement_status text not null
    check (entitlement_status in ('active', 'pending', 'canceled', 'expired', 'unknown')),
  subscription_status text
    check (
      subscription_status is null
      or subscription_status in ('active', 'pending', 'canceled', 'expired', 'unknown')
    ),
  verified_at timestamptz,
  payment_provider_ref text,
  subscription_id text,
  product_id text,
  last_event_id text,
  updated_at timestamptz not null default now()
);

create index if not exists voice_plan_entitlements_email_idx
  on voice_plan_entitlements (email);

create table if not exists voice_plan_webhook_events (
  event_id text primary key,
  payment_provider_ref text not null default '',
  processed_at timestamptz not null default now(),
  user_id text,
  outcome text not null default ''
);

create index if not exists voice_plan_webhook_events_processed_at_idx
  on voice_plan_webhook_events (processed_at desc);
