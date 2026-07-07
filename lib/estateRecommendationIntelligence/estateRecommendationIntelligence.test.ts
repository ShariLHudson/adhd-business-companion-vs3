import { describe, expect, it } from "vitest";
import { matchMemberNeedSignal } from "./memberNeedSignals";
import { buildRecommendationChoices } from "./recommendationReasons";
import {
  isResolvedEstateRecommendation,
  resolveEstateRecommendation,
} from "./resolveEstateRecommendation";

describe("Estate Recommendation Intelligence™", () => {
  it("detects mental overload signal", () => {
    const match = matchMemberNeedSignal("I'm so overwhelmed right now");
    expect(match?.signal.signalId).toBe("mental-overload");
  });

  it("explains why Clear My Mind fits right now — not just that it exists", () => {
    const decision = resolveEstateRecommendation("I'm overwhelmed");
    expect(isResolvedEstateRecommendation(decision)).toBe(true);
    expect(decision.primary?.locationId).toBe("clear-my-mind");
    expect(decision.primary?.whyNow).toContain("relief");
    expect(decision.memberFacingInvitation).toContain("Clear My Mind");
    expect(decision.memberFacingInvitation).toContain("stay right here");
  });

  it("offers alternatives with distinct why-now reasoning", () => {
    const decision = resolveEstateRecommendation("I need somewhere quiet");
    expect(decision.kind).toBe("invitation");
    expect(decision.alternatives?.length).toBeGreaterThanOrEqual(1);
    expect(decision.primary?.whyNow).not.toBe(decision.alternatives?.[0]?.whyNow);
  });

  it("deprioritizes current location from recommendations", () => {
    const choices = buildRecommendationChoices("need-quiet", {
      currentLocationId: "reflection-pond",
    });
    expect(choices[0]?.locationId).not.toBe("reflection-pond");
  });

  it("skips explicit navigation commands — navigation layer handles those", () => {
    const decision = resolveEstateRecommendation("Take me to the greenhouse");
    expect(decision.kind).toBe("unresolved");
  });

  it("matches need-focus to music room with focus reasoning", () => {
    const decision = resolveEstateRecommendation("I can't concentrate at all");
    expect(decision.signalId).toBe("need-focus");
    expect(decision.primary?.locationId).toBe("music-room");
    expect(decision.primary?.whyNow).toMatch(/focus|company/i);
  });

  it("honors celebration signal with quiet honor language", () => {
    const decision = resolveEstateRecommendation("I have something to celebrate");
    expect(decision.signalId).toBe("want-celebration");
    expect(decision.memberFacingInvitation).not.toMatch(/confetti|achievement/i);
  });

  it("returns unresolved for unrelated business chat", () => {
    const decision = resolveEstateRecommendation(
      "What should I charge for my coaching package?",
    );
    expect(decision.kind).toBe("unresolved");
  });
});
