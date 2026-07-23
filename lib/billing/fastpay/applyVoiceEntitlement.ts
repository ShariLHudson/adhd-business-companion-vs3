/**
 * Apply a verified FastPay webhook event to Voice plan entitlement.
 * Signature must already be verified by the caller.
 */

import { mapProductCandidateToVoicePlan } from "./productMap";
import { getVoiceEntitlementStore } from "./entitlementStore";
import { logBillingEvent } from "./logBilling";
import { resolveBillingUser } from "./resolveUser";
import { nextEntitlementFromVerifiedEvent } from "./syncRules";
import type { ApplyEntitlementResult, NormalizedFastPayEvent } from "./types";

export type ApplyVoiceEntitlementDeps = {
  store?: ReturnType<typeof getVoiceEntitlementStore>;
  resolveUser?: typeof resolveBillingUser;
  now?: () => string;
};

export async function applyVerifiedVoiceEntitlementEvent(
  event: NormalizedFastPayEvent,
  deps: ApplyVoiceEntitlementDeps = {},
): Promise<ApplyEntitlementResult> {
  const store = deps.store ?? getVoiceEntitlementStore();
  const resolveUser = deps.resolveUser ?? resolveBillingUser;
  const now = deps.now?.() ?? new Date().toISOString();

  const already = await store.getProcessedEvent(event.eventId);
  if (already) {
    const existing = already.userId
      ? await store.getByUserId(already.userId)
      : null;
    logBillingEvent("info", "Duplicate webhook ignored", {
      surface: "apply-entitlement",
      eventId: event.eventId,
      paymentProviderRef: event.paymentProviderRef,
      userId: already.userId,
      code: "duplicate",
    });
    return {
      ok: true,
      applied: false,
      duplicate: true,
      record: existing,
      reason: "Event already processed.",
    };
  }

  const mappedPlan = mapProductCandidateToVoicePlan(event.productCandidates);
  if (!mappedPlan) {
    await store.markProcessed({
      eventId: event.eventId,
      paymentProviderRef: event.paymentProviderRef,
      processedAt: now,
      userId: null,
      outcome: "unknown_product",
    });
    logBillingEvent("warn", "Unknown Voice product on verified event", {
      surface: "apply-entitlement",
      eventId: event.eventId,
      paymentProviderRef: event.paymentProviderRef,
      code: "unknown_product",
    });
    return {
      ok: false,
      code: "unknown_product",
      reason: "Payment product could not be mapped to a Voice plan.",
      preserveEntitlement: true,
    };
  }

  const user = await resolveUser(event);
  if (!user.ok) {
    await store.markProcessed({
      eventId: event.eventId,
      paymentProviderRef: event.paymentProviderRef,
      processedAt: now,
      userId: null,
      outcome: "user_match_failed",
    });
    logBillingEvent("warn", "User match failed for Voice payment", {
      surface: "apply-entitlement",
      eventId: event.eventId,
      paymentProviderRef: event.paymentProviderRef,
      code: "user_match_failed",
      detail: user.reason,
    });
    return {
      ok: false,
      code: "user_match_failed",
      reason: user.reason,
      preserveEntitlement: true,
    };
  }

  try {
    const current = await store.getByUserId(user.userId);
    const next = nextEntitlementFromVerifiedEvent({
      current,
      userId: user.userId,
      email: user.email,
      mappedPlan,
      event,
      productId: event.productCandidates[0] ?? null,
      now,
    });

    if (!next) {
      await store.markProcessed({
        eventId: event.eventId,
        paymentProviderRef: event.paymentProviderRef,
        processedAt: now,
        userId: user.userId,
        outcome: "ignored_unknown_lifecycle",
      });
      return {
        ok: true,
        applied: false,
        duplicate: false,
        record: current,
        reason: "Lifecycle did not authorize an entitlement change.",
      };
    }

    const unchanged =
      current &&
      current.plan === next.plan &&
      current.entitlementStatus === next.entitlementStatus &&
      current.subscriptionStatus === next.subscriptionStatus &&
      current.paymentProviderRef === next.paymentProviderRef;

    await store.upsert(next);
    await store.markProcessed({
      eventId: event.eventId,
      paymentProviderRef: event.paymentProviderRef,
      processedAt: now,
      userId: user.userId,
      outcome: unchanged ? "idempotent_noop" : "applied",
    });

    logBillingEvent("info", "Voice entitlement sync result", {
      surface: "apply-entitlement",
      eventId: event.eventId,
      paymentProviderRef: event.paymentProviderRef,
      userId: user.userId,
      plan: next.plan,
      code: unchanged ? "idempotent" : "applied",
    });

    return {
      ok: true,
      applied: !unchanged,
      duplicate: false,
      record: next,
      reason: unchanged
        ? "Entitlement already matched verified payment."
        : "Entitlement updated from verified payment.",
    };
  } catch (err) {
    const detail = err instanceof Error ? err.message : "store_error";
    logBillingEvent("error", "Voice entitlement store failure", {
      surface: "apply-entitlement",
      eventId: event.eventId,
      paymentProviderRef: event.paymentProviderRef,
      userId: user.userId,
      code: "store_error",
      detail,
    });
    return {
      ok: false,
      code: "store_error",
      reason: "Could not persist entitlement.",
      preserveEntitlement: true,
    };
  }
}
