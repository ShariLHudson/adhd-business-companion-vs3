import { describe, expect, it } from "vitest";
import {
  allowsTrustEvolution,
  buildTrustAttribution,
  validateTrustAttribution,
} from "./trustAttribution";

const base = {
  productId: "ecosystem" as const,
  sessionId: "session-abc",
  interventionBucket: "clear_mind" as const,
  causationType: "user_action" as const,
};

describe("trustAttribution", () => {
  it("validates complete user_action attribution and allows evolution", () => {
    const result = validateTrustAttribution(base);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.attribution.interventionBucket).toBe("clear_mind");
    expect(result.allowsEvolution).toBe(true);
    expect(allowsTrustEvolution(result)).toBe(true);
  });

  it("resolves offerKey aliases via intervention registry", () => {
    const result = validateTrustAttribution({
      productId: "ecosystem",
      sessionId: "session-abc",
      offerKey: "clear-mind",
      causationType: "user_action",
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.attribution.interventionBucket).toBe("clear_mind");
  });

  it("blocks evolution for missing required fields", () => {
    expect(validateTrustAttribution({ ...base, productId: "" }).ok).toBe(false);
    expect(validateTrustAttribution({ ...base, sessionId: "" }).ok).toBe(false);
    expect(
      validateTrustAttribution({
        productId: "ecosystem",
        sessionId: "s",
        causationType: "user_action",
      }).ok,
    ).toBe(false);
    expect(
      validateTrustAttribution({ ...base, causationType: undefined }).ok,
    ).toBe(false);
  });

  it("blocks unknown intervention buckets", () => {
    const result = validateTrustAttribution({
      ...base,
      interventionBucket: "not_a_real_bucket",
    });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.code).toBe("unknown_intervention_bucket");
    expect(allowsTrustEvolution(result)).toBe(false);
  });

  it("accepts system causation for diagnostics but blocks evolution", () => {
    const suppressed = validateTrustAttribution({
      ...base,
      causationType: "system_suppressed",
    });
    expect(suppressed.ok).toBe(true);
    if (!suppressed.ok) return;
    expect(suppressed.allowsEvolution).toBe(false);
    expect(allowsTrustEvolution(suppressed)).toBe(false);

    const blocked = validateTrustAttribution({
      ...base,
      causationType: "system_blocked",
    });
    expect(blocked.ok).toBe(true);
    if (!blocked.ok) return;
    expect(blocked.allowsEvolution).toBe(false);
  });

  it("buildTrustAttribution resolves offerKey and defaults productId", () => {
    const result = buildTrustAttribution({
      sessionId: "session-abc",
      offerKey: "plan-my-day",
      causationType: "user_action",
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.attribution.productId).toBe("ecosystem");
    expect(result.attribution.interventionBucket).toBe("plan_my_day");
    expect(result.allowsEvolution).toBe(true);
  });
});
