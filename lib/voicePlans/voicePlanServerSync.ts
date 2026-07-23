/**
 * Client refresh of verified Voice entitlement from the billing API.
 * Applies durable plan into local prefs only after server confirmation.
 */

import { getCompanionSupabase } from "@/lib/supabase/companionClient";
import { getPrefs, savePrefs, type Plan } from "@/lib/companionStore";
import {
  clearVoicePlanPaymentPending,
  readVoicePlanPaymentPending,
  resolveVoicePlanEntitlement,
  syncVoicePlanPendingWithEntitlement,
} from "@/lib/voicePlans/voicePlanEntitlement";
import { VOICE_PLAN_COPY } from "@/lib/voicePlans/voicePlanOffers";

export type VoiceEntitlementSyncResult =
  | {
      ok: true;
      plan: Plan;
      changed: boolean;
      entitlementStatus: string;
      activated: boolean;
      confirmationMessage: string | null;
      statusMessage: string | null;
    }
  | {
      ok: false;
      preserveEntitlement: true;
      statusMessage: string;
    };

export type FetchVoiceEntitlementResponse = {
  ok: boolean;
  plan?: Plan;
  entitlementStatus?: string;
  subscriptionStatus?: string | null;
  verifiedAt?: string | null;
  paymentProviderRef?: string | null;
  error?: string;
};

async function readAccessToken(): Promise<string | null> {
  try {
    const client = getCompanionSupabase();
    if (!client) return null;
    const { data } = await client.auth.getSession();
    return data.session?.access_token ?? null;
  } catch {
    return null;
  }
}

export async function fetchVerifiedVoiceEntitlement(
  fetchImpl: typeof fetch = fetch,
): Promise<FetchVoiceEntitlementResponse | null> {
  const token = await readAccessToken();
  if (!token) return null;

  const res = await fetchImpl("/api/billing/voice-entitlement", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
    cache: "no-store",
  });

  if (!res.ok) {
    return { ok: false, error: `http_${res.status}` };
  }

  return (await res.json()) as FetchVoiceEntitlementResponse;
}

/**
 * Pull server entitlement and mirror into companion prefs when verified active.
 */
export async function refreshVoicePlanEntitlementFromServer(
  fetchImpl: typeof fetch = fetch,
): Promise<VoiceEntitlementSyncResult> {
  const previous = getPrefs().plan;

  try {
    const payload = await fetchVerifiedVoiceEntitlement(fetchImpl);
    if (!payload) {
      // No session — keep local prefs; not an alarming failure.
      return {
        ok: true,
        plan: previous,
        changed: false,
        entitlementStatus: resolveVoicePlanEntitlement(previous),
        activated: false,
        confirmationMessage: null,
        statusMessage: null,
      };
    }

    if (!payload.ok || !payload.plan) {
      return {
        ok: false,
        preserveEntitlement: true,
        statusMessage: VOICE_PLAN_COPY.verifySoftFail,
      };
    }

    const nextPlan = payload.plan;
    const unlocked =
      payload.entitlementStatus === "active" &&
      (nextPlan === "voice-lite" || nextPlan === "voice-pro");

    if (unlocked && nextPlan !== previous) {
      savePrefs({ plan: nextPlan });
    } else if (
      payload.entitlementStatus === "canceled" ||
      payload.entitlementStatus === "expired"
    ) {
      if (previous !== "essential") {
        savePrefs({ plan: "essential" });
      }
    }

    const hadPending = Boolean(readVoicePlanPaymentPending());
    const current = getPrefs().plan;
    syncVoicePlanPendingWithEntitlement(current);
    if (
      unlocked &&
      (current === "voice-lite" || current === "voice-pro")
    ) {
      clearVoicePlanPaymentPending();
    }

    const changed = current !== previous;
    const activated =
      unlocked &&
      (changed || hadPending) &&
      (current === "voice-lite" || current === "voice-pro");

    const confirmationMessage = activated
      ? current === "voice-pro"
        ? VOICE_PLAN_COPY.activatedPro
        : VOICE_PLAN_COPY.activatedLite
      : null;

    return {
      ok: true,
      plan: current,
      changed,
      entitlementStatus: payload.entitlementStatus ?? "active",
      activated,
      confirmationMessage,
      statusMessage: null,
    };
  } catch {
    return {
      ok: false,
      preserveEntitlement: true,
      statusMessage: VOICE_PLAN_COPY.verifySoftFail,
    };
  }
}
