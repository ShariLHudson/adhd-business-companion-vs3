import { describe, expect, it } from "vitest";
import {
  evaluateAdhdDesignFilter,
  evaluateCompanionNeedsIntelligence,
} from "./companionNeedsIntelligence";

describe("evaluateCompanionNeedsIntelligence", () => {
  it("defaults to clarity when signals are quiet", () => {
    const result = evaluateCompanionNeedsIntelligence({});
    expect(result.primaryNeed).toBe("clarity");
    expect(result.recommendedPlaceId).toBe("planning-table");
    expect(result.confidence).toBe("low");
  });

  it("defaults to restoration when energy is low", () => {
    const result = evaluateCompanionNeedsIntelligence({ lowEnergy: true });
    expect(result.primaryNeed).toBe("restoration");
    expect(result.recommendedPlaceId).toBe("garden");
    expect(result.executiveFunction.needsBeauty).toBe(true);
  });

  it("detects relief from overwhelm language", () => {
    const result = evaluateCompanionNeedsIntelligence({
      text: "I'm overwhelmed and my brain is spinning",
      emotionalState: "overwhelmed",
    });
    expect(result.primaryNeed).toBe("relief");
    expect(result.recommendedPlaceId).toBe("window-seat");
    expect(result.restorationOutcome).toBe("lighter");
    expect(result.confidence).toBe("high");
  });

  it("detects focus need when user knows the task", () => {
    const result = evaluateCompanionNeedsIntelligence({
      text: "I need body doubling and a focus timer to start",
      emotionalState: "focused",
      userIntent: "do",
    });
    expect(result.primaryNeed).toBe("focus");
    expect(result.recommendedPlaceId).toBe("focus-studio");
    expect(result.executiveFunction.needsBodyDoubling).toBe(true);
  });

  it("detects strategy from business language", () => {
    const result = evaluateCompanionNeedsIntelligence({
      text: "I need to rethink my offer and pricing for ideal clients",
      userIntent: "organize",
    });
    expect(result.primaryNeed).toBe("strategy");
    expect(result.recommendedPlaceId).toBe("business-office");
  });

  it("respects locked place from navigation", () => {
    const result = evaluateCompanionNeedsIntelligence({
      text: "I'm overwhelmed",
      lockedPlaceId: "living-room",
    });
    expect(result.primaryNeed).toBe("relief");
    expect(result.recommendedPlaceId).toBe("living-room");
  });

  it("honors explicit need override", () => {
    const result = evaluateCompanionNeedsIntelligence({
      text: "pricing and revenue",
      explicitNeed: "restoration",
    });
    expect(result.primaryNeed).toBe("restoration");
    expect(result.confidence).toBe("high");
  });
});

describe("evaluateAdhdDesignFilter", () => {
  it("flags reconsider when strategy meets flooded overwhelm", () => {
    const result = evaluateAdhdDesignFilter({
      needId: "strategy",
      placeId: "business-office",
      executiveFunction: {
        availableExecutiveFunction: "low",
        overwhelm: "flooded",
        energy: "low",
        needsMomentum: false,
        needsPermission: true,
        needsEncouragement: true,
        needsFewerDecisions: true,
        needsBodyDoubling: false,
        needsBeauty: false,
      },
    });
    expect(result.reconsider).toBe(true);
    expect(result.passed).toBe(false);
  });

  it("passes for relief at window seat", () => {
    const result = evaluateAdhdDesignFilter({
      needId: "relief",
      placeId: "window-seat",
      executiveFunction: {
        availableExecutiveFunction: "low",
        overwhelm: "flooded",
        energy: "depleted",
        needsMomentum: false,
        needsPermission: true,
        needsEncouragement: false,
        needsFewerDecisions: true,
        needsBodyDoubling: false,
        needsBeauty: false,
      },
    });
    expect(result.passed).toBe(true);
    expect(result.reconsider).toBe(false);
  });
});
