/**
 * Resolve current Voice plan from existing prefs entitlement.
 * Does not invent billing status — payment confirmation is external.
 */

import { getPrefs, type Plan } from "@/lib/companionStore";

export type VoicePlanEntitlementState =
  | "essential"
  | "voice-lite"
  | "voice-pro"
  | "unknown";

const PENDING_KEY = "spark.voicePlanPaymentPending.v1";

export type VoicePlanPaymentPending = {
  plan: "voice-lite" | "voice-pro";
  openedAt: string;
};

export function resolveVoicePlanEntitlement(
  plan: Plan | null | undefined = getPrefs().plan,
): VoicePlanEntitlementState {
  if (plan === "essential" || plan === "voice-lite" || plan === "voice-pro") {
    return plan;
  }
  return "unknown";
}

export function isCurrentVoicePlan(
  entitlement: VoicePlanEntitlementState,
  offer: Plan,
): boolean {
  if (entitlement === "unknown") return false;
  return entitlement === offer;
}

export function readVoicePlanPaymentPending(): VoicePlanPaymentPending | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(PENDING_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as VoicePlanPaymentPending;
    if (
      parsed?.plan === "voice-lite" ||
      parsed?.plan === "voice-pro"
    ) {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

/** Record that the member opened a payment page — does not change entitlement. */
export function markVoicePlanPaymentPending(
  plan: "voice-lite" | "voice-pro",
): void {
  if (typeof window === "undefined") return;
  try {
    const payload: VoicePlanPaymentPending = {
      plan,
      openedAt: new Date().toISOString(),
    };
    localStorage.setItem(PENDING_KEY, JSON.stringify(payload));
  } catch {
    /* quota */
  }
}

export function clearVoicePlanPaymentPending(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(PENDING_KEY);
  } catch {
    /* ignore */
  }
}

/** Clear pending once prefs already match the paid tier (verified entitlement elsewhere). */
export function syncVoicePlanPendingWithEntitlement(plan: Plan): void {
  const pending = readVoicePlanPaymentPending();
  if (!pending) return;
  if (plan === pending.plan) {
    clearVoicePlanPaymentPending();
  }
}
