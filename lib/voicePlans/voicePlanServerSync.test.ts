/**
 * @vitest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getPrefs, savePrefs } from "@/lib/companionStore";
import {
  clearVoicePlanPaymentPending,
  markVoicePlanPaymentPending,
  readVoicePlanPaymentPending,
} from "@/lib/voicePlans/voicePlanEntitlement";
import { refreshVoicePlanEntitlementFromServer } from "@/lib/voicePlans/voicePlanServerSync";

vi.mock("@/lib/supabase/companionClient", () => ({
  getCompanionSupabase: () => ({
    auth: {
      getSession: async () => ({
        data: {
          session: {
            access_token: "test-token",
            user: { id: "user-1", email: "member@example.com" },
          },
        },
      }),
    },
  }),
}));

beforeEach(() => {
  clearVoicePlanPaymentPending();
  savePrefs({ plan: "essential" });
});

afterEach(() => {
  clearVoicePlanPaymentPending();
  vi.restoreAllMocks();
});

describe("refreshVoicePlanEntitlementFromServer", () => {
  it("applies verified Voice Lite and clears pending", async () => {
    markVoicePlanPaymentPending("voice-lite");
    const fetchImpl = vi.fn(async () =>
      Response.json({
        ok: true,
        plan: "voice-lite",
        entitlementStatus: "active",
        subscriptionStatus: "active",
        verifiedAt: "2026-07-23T12:00:00.000Z",
        paymentProviderRef: "pay_1",
      }),
    );

    const result = await refreshVoicePlanEntitlementFromServer(fetchImpl);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(getPrefs().plan).toBe("voice-lite");
    expect(result.activated).toBe(true);
    expect(result.confirmationMessage).toMatch(/Voice Lite plan is active/i);
    expect(readVoicePlanPaymentPending()).toBeNull();
  });

  it("applies verified Voice Pro", async () => {
    const fetchImpl = vi.fn(async () =>
      Response.json({
        ok: true,
        plan: "voice-pro",
        entitlementStatus: "active",
        subscriptionStatus: "active",
        verifiedAt: "2026-07-23T12:00:00.000Z",
        paymentProviderRef: "pay_2",
      }),
    );
    const result = await refreshVoicePlanEntitlementFromServer(fetchImpl);
    expect(result.ok).toBe(true);
    expect(getPrefs().plan).toBe("voice-pro");
  });

  it("preserves entitlement when verification fetch fails", async () => {
    savePrefs({ plan: "voice-lite" });
    const fetchImpl = vi.fn(async () =>
      Response.json({ ok: false, error: "unauthorized" }, { status: 401 }),
    );
    const result = await refreshVoicePlanEntitlementFromServer(fetchImpl);
    expect(result.ok).toBe(false);
    expect(getPrefs().plan).toBe("voice-lite");
    if (result.ok) return;
    expect(result.statusMessage).toMatch(/couldn’t confirm/i);
  });

  it("does not unlock paid plan while server reports pending", async () => {
    const fetchImpl = vi.fn(async () =>
      Response.json({
        ok: true,
        plan: "essential",
        entitlementStatus: "pending",
        subscriptionStatus: "pending",
        verifiedAt: null,
        paymentProviderRef: "pay_pending",
      }),
    );
    const result = await refreshVoicePlanEntitlementFromServer(fetchImpl);
    expect(result.ok).toBe(true);
    expect(getPrefs().plan).toBe("essential");
  });
});
