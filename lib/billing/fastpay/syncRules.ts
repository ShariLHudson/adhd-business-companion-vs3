/**
 * Entitlement lifecycle rules — never unlock paid plans without verified active status.
 * Never downgrade an active plan from an unverified or unknown signal.
 */

import type { Plan } from "@/lib/companionStore";
import type {
  NormalizedFastPayEvent,
  VoiceEntitlementLifecycleStatus,
  VoicePaidPlan,
  VoicePlanEntitlementRecord,
} from "./types";

const PLAN_RANK: Record<Plan, number> = {
  essential: 0,
  "voice-lite": 1,
  "voice-pro": 2,
};

export function planRank(plan: Plan): number {
  return PLAN_RANK[plan] ?? 0;
}

export function isPaidVoicePlan(plan: Plan): plan is VoicePaidPlan {
  return plan === "voice-lite" || plan === "voice-pro";
}

export function essentialFallbackRecord(
  userId: string,
  email: string | null,
  now: string,
): VoicePlanEntitlementRecord {
  return {
    userId,
    email,
    plan: "essential",
    entitlementStatus: "active",
    subscriptionStatus: null,
    verifiedAt: null,
    paymentProviderRef: null,
    subscriptionId: null,
    productId: null,
    updatedAt: now,
    lastEventId: null,
  };
}

/**
 * Decide next entitlement after a *verified* provider event.
 * Returns null when the event should not mutate state (e.g. pending).
 */
export function nextEntitlementFromVerifiedEvent(args: {
  current: VoicePlanEntitlementRecord | null;
  userId: string;
  email: string | null;
  mappedPlan: VoicePaidPlan;
  event: NormalizedFastPayEvent;
  productId: string | null;
  now?: string;
}): VoicePlanEntitlementRecord | null {
  const now = args.now ?? new Date().toISOString();
  const current =
    args.current ?? essentialFallbackRecord(args.userId, args.email, now);
  const lifecycle = args.event.lifecycleStatus;

  if (lifecycle === "pending") {
    // Honest pending — do not unlock paid capabilities.
    return {
      ...current,
      email: args.email ?? current.email,
      entitlementStatus: current.entitlementStatus,
      subscriptionStatus: "pending",
      paymentProviderRef: args.event.paymentProviderRef,
      subscriptionId: args.event.subscriptionId ?? current.subscriptionId,
      productId: args.productId ?? current.productId,
      updatedAt: now,
      lastEventId: args.event.eventId,
      // plan unchanged
    };
  }

  if (lifecycle === "canceled" || lifecycle === "expired") {
    // Verified end of subscription → safe Essential fallback.
    return {
      userId: args.userId,
      email: args.email ?? current.email,
      plan: "essential",
      entitlementStatus: lifecycle,
      subscriptionStatus: lifecycle,
      verifiedAt: now,
      paymentProviderRef: args.event.paymentProviderRef,
      subscriptionId: args.event.subscriptionId ?? current.subscriptionId,
      productId: args.productId ?? current.productId,
      updatedAt: now,
      lastEventId: args.event.eventId,
    };
  }

  if (lifecycle === "active") {
    const nextPlan = args.mappedPlan;
    // Do not silently downgrade an active higher plan on a lower-tier activation
    // for the same subscription wave — allow upgrade only.
    if (
      isPaidVoicePlan(current.plan) &&
      current.entitlementStatus === "active" &&
      planRank(nextPlan) < planRank(current.plan)
    ) {
      return {
        ...current,
        email: args.email ?? current.email,
        paymentProviderRef: args.event.paymentProviderRef,
        subscriptionId: args.event.subscriptionId ?? current.subscriptionId,
        productId: args.productId ?? current.productId,
        updatedAt: now,
        lastEventId: args.event.eventId,
        verifiedAt: now,
      };
    }

    return {
      userId: args.userId,
      email: args.email ?? current.email,
      plan: nextPlan,
      entitlementStatus: "active",
      subscriptionStatus: "active",
      verifiedAt: now,
      paymentProviderRef: args.event.paymentProviderRef,
      subscriptionId: args.event.subscriptionId,
      productId: args.productId,
      updatedAt: now,
      lastEventId: args.event.eventId,
    };
  }

  // unknown — preserve
  return null;
}

export function publicViewFromRecord(
  record: VoicePlanEntitlementRecord | null,
): {
  plan: Plan;
  entitlementStatus: VoiceEntitlementLifecycleStatus;
  subscriptionStatus: VoiceEntitlementLifecycleStatus | null;
  verifiedAt: string | null;
  paymentProviderRef: string | null;
} {
  if (!record) {
    return {
      plan: "essential",
      entitlementStatus: "active",
      subscriptionStatus: null,
      verifiedAt: null,
      paymentProviderRef: null,
    };
  }

  // Unlock paid minutes only while entitlement is active on a paid plan.
  if (record.entitlementStatus === "active" && isPaidVoicePlan(record.plan)) {
    return {
      plan: record.plan,
      entitlementStatus: "active",
      subscriptionStatus: record.subscriptionStatus,
      verifiedAt: record.verifiedAt,
      paymentProviderRef: record.paymentProviderRef,
    };
  }

  return {
    plan: "essential",
    entitlementStatus:
      record.entitlementStatus === "canceled" ||
      record.entitlementStatus === "expired" ||
      record.entitlementStatus === "pending"
        ? record.entitlementStatus
        : "active",
    subscriptionStatus: record.subscriptionStatus,
    verifiedAt: record.verifiedAt,
    paymentProviderRef: record.paymentProviderRef,
  };
}
