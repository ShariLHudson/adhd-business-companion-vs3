/**
 * @vitest-environment jsdom
 */
import { beforeEach, describe, expect, it } from "vitest";
import {
  clearVoicePlanPaymentPending,
  isCurrentVoicePlan,
  markVoicePlanPaymentPending,
  readVoicePlanPaymentPending,
  resolveVoicePlanEntitlement,
  syncVoicePlanPendingWithEntitlement,
} from "./voicePlanEntitlement";

describe("voicePlanEntitlement", () => {
  beforeEach(() => {
    clearVoicePlanPaymentPending();
  });

  it("resolves essential, lite, and pro from prefs plan", () => {
    expect(resolveVoicePlanEntitlement("essential")).toBe("essential");
    expect(resolveVoicePlanEntitlement("voice-lite")).toBe("voice-lite");
    expect(resolveVoicePlanEntitlement("voice-pro")).toBe("voice-pro");
  });

  it("marks current plan correctly", () => {
    expect(isCurrentVoicePlan("essential", "essential")).toBe(true);
    expect(isCurrentVoicePlan("voice-lite", "voice-pro")).toBe(false);
  });

  it("records payment pending without implying entitlement change", () => {
    markVoicePlanPaymentPending("voice-lite");
    expect(readVoicePlanPaymentPending()?.plan).toBe("voice-lite");
    // Entitlement resolution is independent of pending
    expect(resolveVoicePlanEntitlement("essential")).toBe("essential");
  });

  it("clears pending when entitlement matches", () => {
    markVoicePlanPaymentPending("voice-pro");
    syncVoicePlanPendingWithEntitlement("voice-pro");
    expect(readVoicePlanPaymentPending()).toBeNull();
  });
});
