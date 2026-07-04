import { describe, expect, it } from "vitest";
import { classifySparkPrimaryIntent } from "./classifyIntent";
import {
  evaluateSparkDecisionEngine,
  mapDecisionToDynamicCompanionRole,
} from "./evaluateDecisionEngine";
import { identifySparkFriction } from "./friction";
import { sparkDecisionEngineHintForChat } from "./sparkDecisionEngineHintForChat";
import { SPARK_DECISION_MISSION } from "./types";

describe("sparkDecisionEngine", () => {
  it("classifies CREATE on clear build request", () => {
    const c = classifySparkPrimaryIntent({
      userText: "Help me write an SOP for client onboarding",
    });
    expect(c.intent).toBe("CREATE");
    expect(c.confidence).toBe("high");
  });

  it("classifies SUPPORT on overwhelm", () => {
    const c = classifySparkPrimaryIntent({
      userText: "I'm overwhelmed and can't start anything",
      overwhelmed: true,
    });
    expect(c.intent).toBe("SUPPORT");
  });

  it("classifies LEARN on teach request", () => {
    const c = classifySparkPrimaryIntent({
      userText: "Teach me SEO basics",
    });
    expect(c.intent).toBe("LEARN");
  });

  it("suppresses emotional coaching on high-confidence CREATE", () => {
    const d = evaluateSparkDecisionEngine({
      userText: "Create a marketing plan for my coaching business",
    });
    expect(d.intent).toBe("CREATE");
    expect(d.suppressEmotionalCoaching).toBe(true);
    expect(d.companionRole).toBe("builder");
    expect(mapDecisionToDynamicCompanionRole(d)).toBe("create_do");
  });

  it("identifies capacity friction and suggests pool", () => {
    const d = evaluateSparkDecisionEngine({
      userText: "I'm exhausted and burned out",
      overwhelmed: true,
    });
    expect(d.friction).toBe("capacity");
    expect(d.intent).toBe("SUPPORT");
    expect(["pool", "peaceful-places"]).toContain(d.estateRoute?.placeId);
  });

  it("hint includes mission and seven questions", () => {
    const hint = sparkDecisionEngineHintForChat({
      userText: "Help me decide between two offers",
    });
    expect(hint).toContain(SPARK_DECISION_MISSION);
    expect(hint).toContain("Step 1 INTENT");
    expect(hint).toContain("Seven questions");
  });

  it("maps prioritization to guide role", () => {
    const friction = identifySparkFriction({
      userText: "I have too many options and can't prioritize",
      intent: "THINK",
    });
    expect(friction).toBe("prioritization");
    const d = evaluateSparkDecisionEngine({
      userText: "I have too many options and can't prioritize",
    });
    expect(d.companionRole).toBe("guide");
  });
});
