/**
 * FastPay → Spark Estate Voice entitlement types.
 * Provider payloads are normalized before entitlement writes.
 */

import type { Plan } from "@/lib/companionStore";

export type VoicePaidPlan = "voice-lite" | "voice-pro";

export type VoiceEntitlementLifecycleStatus =
  | "active"
  | "pending"
  | "canceled"
  | "expired"
  | "unknown";

export type FastPayWebhookEventType =
  | "payment.created"
  | "payment.completed"
  | "payment.failed"
  | "payment.expired"
  | "subscription.active"
  | "subscription.canceled"
  | "subscription.expired"
  | "subscription.updated"
  | "unknown";

export type NormalizedFastPayEvent = {
  /** Provider event id — used for idempotency. */
  eventId: string;
  eventType: FastPayWebhookEventType;
  /** Payment / charge / transaction id from the provider. */
  paymentProviderRef: string;
  /** Optional recurring subscription id. */
  subscriptionId: string | null;
  /** Raw provider status string (non-sensitive). */
  providerStatus: string | null;
  /** Mapped lifecycle status. */
  lifecycleStatus: VoiceEntitlementLifecycleStatus;
  /** Product / payment-link identifiers found on the event. */
  productCandidates: string[];
  customerEmail: string | null;
  sparkUserId: string | null;
  occurredAt: string;
};

export type VoicePlanEntitlementRecord = {
  userId: string;
  email: string | null;
  plan: Plan;
  entitlementStatus: VoiceEntitlementLifecycleStatus;
  subscriptionStatus: VoiceEntitlementLifecycleStatus | null;
  verifiedAt: string | null;
  paymentProviderRef: string | null;
  subscriptionId: string | null;
  productId: string | null;
  updatedAt: string;
  lastEventId: string | null;
};

export type ApplyEntitlementResult =
  | {
      ok: true;
      applied: boolean;
      duplicate: boolean;
      record: VoicePlanEntitlementRecord | null;
      reason: string;
    }
  | {
      ok: false;
      code:
        | "invalid_signature"
        | "malformed"
        | "unknown_product"
        | "user_match_failed"
        | "store_error";
      reason: string;
      preserveEntitlement: true;
    };

export type VoiceEntitlementPublicView = {
  plan: Plan;
  entitlementStatus: VoiceEntitlementLifecycleStatus;
  subscriptionStatus: VoiceEntitlementLifecycleStatus | null;
  verifiedAt: string | null;
  paymentProviderRef: string | null;
};
