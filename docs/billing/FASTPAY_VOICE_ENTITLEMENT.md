# FastPay Voice Plan Entitlement Sync

**Date:** 2026-07-23  
**Scope:** Verified Voice Lite / Voice Pro activation after FastPay (FastPayDirect) payment  
**Code:** `lib/billing/fastpay/` · `app/api/billing/fastpay/webhook` · `app/api/billing/voice-entitlement`

---

## Provider integration

Spark Estate uses FastPayDirect payment links from Plan & Voice settings:

| Plan | Default payment-link id |
|---|---|
| Voice Lite | `69ff6b3034d67b041e7e886e` |
| Voice Pro | `69ff6b81c43a7488828c26be` |

Checkout opens the hosted FastPayDirect page. **Opening the page does not change entitlement.**

Webhook endpoint (configure in the FastPay / FastPayDirect developer settings):

`POST /api/billing/fastpay/webhook`

Member entitlement read (authenticated):

`GET /api/billing/voice-entitlement`  
Header: `Authorization: Bearer <supabase_access_token>`

---

## Product mapping

Env overrides (comma-separated):

- `FASTPAY_VOICE_LITE_PRODUCT_IDS`
- `FASTPAY_VOICE_PRO_PRODUCT_IDS`

Candidates are taken from webhook fields such as `product_id`, `payment_link_id`, metadata, and product labels. Human labels containing “Voice Lite” / “Voice Pro” are accepted as a fallback.

---

## Verification method

1. Read the **raw request body** (not re-serialized JSON).
2. Read `X-FastPay-Signature` (supports bare hex or `sha256=<hex>`).
3. Compute `HMAC-SHA256(rawBody, FASTPAY_WEBHOOK_SECRET)`.
4. Compare with `crypto.timingSafeEqual`.
5. Reject with **401** when the signature is missing or invalid.

**Never** activate from:

- browser redirect / return URL alone  
- “payment page opened” pending localStorage  
- unsigned or malformed webhook bodies  

Secrets stay server-side (`FASTPAY_WEBHOOK_SECRET`). Client code never embeds the webhook secret.

---

## Entitlement lifecycle

Stored fields (`voice_plan_entitlements`):

| Field | Meaning |
|---|---|
| `plan` | `essential` · `voice-lite` · `voice-pro` |
| `entitlement_status` | `active` · `pending` · `canceled` · `expired` · `unknown` |
| `subscription_status` | Provider subscription status when available |
| `verified_at` | Timestamp of last verified activating/ending event |
| `payment_provider_ref` | Provider payment / charge id |
| `subscription_id` | Provider subscription id when present |
| `last_event_id` | Last processed webhook event id |

Rules:

| Provider lifecycle | Effect |
|---|---|
| `pending` | Keep current unlocked plan; do **not** unlock paid minutes |
| `active` + mapped product | Activate Voice Lite or Voice Pro (upgrade allowed) |
| `canceled` / `expired` | Fall back to **Essential Voice** |
| `unknown` | No entitlement mutation |

**Essential Voice** remains the safe fallback.  
**Never downgrade** an active plan based on an unverified signal.

Idempotency: `voice_plan_webhook_events.event_id` is unique. Duplicate deliveries return success without inconsistent rewrites.

---

## User association

Preferred order:

1. `metadata.spark_user_id` / `sparkUserId` (attached to the payment link query when the member is signed in)
2. Customer / contact email → Supabase Auth user lookup (service role)

If neither resolves → **user_match_failed**: preserve entitlement, log non-sensitive ids, acknowledge webhook (`200`) so the provider does not retry forever without a fixable signal.

---

## Retry behavior

- FastPay retries failed deliveries (documented exponential backoff).
- Invalid signature → `401` (provider may retry; fix secret/config).
- Unknown product / user match failure → `200` + no entitlement change (avoids poison retries).
- Store errors → `500` (safe to retry).

---

## Client refresh (Plan & Voice UI)

After return/focus/visibility:

1. `GET /api/billing/voice-entitlement`
2. On verified active paid plan → `savePrefs({ plan })`, clear local pending, show calm confirmation, mark Current Voice Plan, hide inappropriate CTAs
3. On pending → keep existing pending wording; do not unlock
4. On soft failure → preserve current entitlement; show non-alarming status

Offer presentation (labels, prices absence, CTA wording) is unchanged except for status/confirmation lines required by verified sync.

---

## Manual recovery

1. Confirm webhook secret and product id env vars.
2. Confirm the payment event id in FastPay dashboard.
3. Re-send the webhook, or insert/update `voice_plan_entitlements` for the `user_id` with `entitlement_status = active` and the correct `plan` / `payment_provider_ref`.
4. Ask the member to reopen Plan & Voice (focus refresh) or sign out/in.

Schema: `supabase/voice_plan_entitlements_schema.sql`.

---

## Known limitations

- Without `SUPABASE_SERVICE_ROLE_KEY` + applied schema, entitlements persist in **process memory** (dev/tests only — not multi-instance durable).
- FastPayDirect payment-link UIs may not always forward query metadata; email matching is the backup path.
- Browser-only members with no auth session cannot be matched until they sign in with the paying email.
- Redirect/return URLs are informational only and never grant access.

---

## Environment

```bash
FASTPAY_WEBHOOK_SECRET=whsec_...
FASTPAY_VOICE_LITE_PRODUCT_IDS=69ff6b3034d67b041e7e886e
FASTPAY_VOICE_PRO_PRODUCT_IDS=69ff6b81c43a7488828c26be
SUPABASE_SERVICE_ROLE_KEY=...
```
