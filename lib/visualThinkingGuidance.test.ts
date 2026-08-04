import { describe, expect, it } from "vitest";
import {
  followUpsForIntent,
  recommendVisualTool,
  VISUAL_THINKING_INTENTS,
} from "./visualThinkingGuidance";
import { getVisualThinkingHomeType } from "./visualThinkingHome";

describe("visualThinkingGuidance P0.51", () => {
  it("defines six entry intents", () => {
    expect(VISUAL_THINKING_INTENTS).toHaveLength(6);
  });

  it("asks marketing follow-ups before recommending", () => {
    const followUps = followUpsForIntent("marketing-help");
    expect(followUps.length).toBeGreaterThanOrEqual(2);
    const rec = recommendVisualTool({
      intent: "marketing-help",
      followUp: "marketing-clarify-offer",
    });
    expect(rec.homeTypeId).toBe("offer-canvas");
    expect(getVisualThinkingHomeType(rec.homeTypeId).title).toBe("Offer Canvas™");
  });

  it("recommends priority matrix when head feels full and user wants to organize", () => {
    const rec = recommendVisualTool({
      intent: "head-full",
      followUp: "head-organize",
    });
    expect(rec.homeTypeId).toBe("priority-matrix");
  });

  it("recommends content ecosystem for repurposing", () => {
    const rec = recommendVisualTool({
      intent: "organize-content",
      followUp: "content-repurpose",
    });
    expect(rec.homeTypeId).toBe("content-ecosystem");
  });
});
