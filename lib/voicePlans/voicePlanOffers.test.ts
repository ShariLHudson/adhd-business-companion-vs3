import { describe, expect, it } from "vitest";
import {
  VOICE_PLAN_COPY,
  VOICE_PLAN_PAYMENT_LINKS,
  paymentLinkForVoicePlan,
} from "./voicePlanOffers";

describe("voicePlanOffers", () => {
  it("uses exact Voice Lite payment link", () => {
    expect(paymentLinkForVoicePlan("voice-lite")).toBe(
      "https://link.fastpaydirect.com/payment-link/69ff6b3034d67b041e7e886e",
    );
    expect(VOICE_PLAN_PAYMENT_LINKS["voice-lite"]).toBe(
      "https://link.fastpaydirect.com/payment-link/69ff6b3034d67b041e7e886e",
    );
  });

  it("uses exact Voice Pro payment link", () => {
    expect(paymentLinkForVoicePlan("voice-pro")).toBe(
      "https://link.fastpaydirect.com/payment-link/69ff6b81c43a7488828c26be",
    );
  });

  it("does not invent monthly prices in copy", () => {
    const blob = Object.values(VOICE_PLAN_COPY).join(" ");
    expect(blob).not.toMatch(/\$\d+/);
    expect(blob).not.toMatch(/per month|\/mo/i);
    expect(VOICE_PLAN_COPY.includedWithPlan).toBe("Included with your plan");
    expect(VOICE_PLAN_COPY.additionalMonthlyRequired).toBe(
      "Additional monthly subscription required",
    );
  });
});
