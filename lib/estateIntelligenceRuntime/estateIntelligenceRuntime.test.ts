import { describe, expect, it } from "vitest";
import type { IntentRoutingDecision } from "@/lib/intentRoutingIntelligence";
import {
  arbitrateConversationRouting,
  evaluateEstateIntelligenceCandidates,
  runConversationRoutingPipeline,
  selectWinningCapability,
} from "@/lib/conversationStabilization";
import { executeEstateIntelligence } from "./executeEstateIntelligence";

const stubRouting = {
  category: "chat",
  learnFastPath: false,
} as IntentRoutingDecision;

describe("Estate Intelligence Runtime™", () => {
  it("navigates immediately for explicit take-me-to requests", () => {
    const pipeline = runConversationRoutingPipeline(
      { userText: "Take me to the treehouse" },
      stubRouting,
    );
    const result = executeEstateIntelligence({
      pipeline,
      userText: "Take me to the treehouse",
      helpContext: {},
      routing: stubRouting,
    });
    expect(result?.capability).toBe("navigation");
    expect(result?.localReply).toMatch(/Taking you to/i);
    expect(result?.knowledgeSource).toMatch(/estate-(?:locations|aliases)\.json/);
  });

  it("describes room for where-is without auto-navigation", () => {
    const userText = "Where is the treehouse?";
    const arbitration = arbitrateConversationRouting({ userText });
    const candidates = evaluateEstateIntelligenceCandidates({
      userText,
      arbitration,
    });
    expect(selectWinningCapability(arbitration, candidates, userText)).toBe(
      "room",
    );

    const pipeline = runConversationRoutingPipeline(
      { userText },
      stubRouting,
    );
    const result = executeEstateIntelligence({
      pipeline,
      userText,
      helpContext: {},
      routing: stubRouting,
    });
    expect(result?.capability).toBe("room");
    expect(result?.immediateEstatePlaceNavigate).toBeUndefined();
    expect(result?.localReply).toMatch(/would you like me to take you there/i);
  });

  it("grounds research in estate brain — not room suggestions", () => {
    const userText = "Research pricing for my music/audio library";
    const pipeline = runConversationRoutingPipeline(
      { userText },
      stubRouting,
    );
    const result = executeEstateIntelligence({
      pipeline,
      userText,
      helpContext: {},
      routing: stubRouting,
    });
    expect(result?.capability).toBe("research");
    expect(result?.immediateResearchOpen).toBeTruthy();
  });

  it("retrieves snippets from estate brain — not estate guide", () => {
    const userText = "Find me a snippet about my ADHD Business Ecosystem";
    const pipeline = runConversationRoutingPipeline(
      { userText },
      stubRouting,
    );
    const result = executeEstateIntelligence({
      pipeline,
      userText,
      helpContext: {},
      routing: stubRouting,
    });
    expect(result?.capability).toBe("retrieval");
    expect(result?.knowledgeSource).toBe("estate-brain");
  });
});
