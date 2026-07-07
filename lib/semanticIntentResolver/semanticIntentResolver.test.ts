import { describe, expect, it } from "vitest";
import { runConversationRoutingPipeline } from "@/lib/conversationStabilization";
import { executeEstateIntelligence } from "@/lib/estateIntelligenceRuntime";
import {
  executeSemanticIntent,
  resolveSemanticMemberIntent,
} from "@/lib/semanticIntentResolver";

const stubRouting = { category: "chat", learnFastPath: false };

describe("Semantic Intent Resolver™", () => {
  const treehousePhrases = [
    "I'd like to see the treehouse.",
    "Can we visit the house in the trees?",
    "Where's that treehouse place?",
    "Take me to the treehouse",
  ];

  it.each(treehousePhrases)(
    "resolves treehouse meaning — %s",
    (userText) => {
      const intent = resolveSemanticMemberIntent({ userText });
      expect(intent.target.locationId).toBe("house-possibility-outside");
      expect(intent.confidence).not.toBe("low");
      expect(["navigate", "ask_knowledge"]).toContain(intent.action);
    },
  );

  it("navigates on soft see phrasing", () => {
    const userText = "I'd like to see the treehouse.";
    const intent = resolveSemanticMemberIntent({ userText });
    expect(intent.action).toBe("navigate");
    expect(intent.nextStep).toBe("navigate");

    const pipeline = runConversationRoutingPipeline({ userText }, stubRouting);
    expect(pipeline.arbitration.goal).toBe("explicit_navigation");
    expect(pipeline.arbitration.estateIntelligenceNeeded).toBe(true);
    expect(pipeline.winningCapability).toBe("navigation");

    const runtime = executeSemanticIntent(intent, userText, {});
    expect(runtime?.capability).toBe("navigation");
    expect(runtime?.localReply).toMatch(/Possibility House/i);
    expect(runtime?.immediateEstatePlaceNavigate?.placeId).toBeTruthy();
  });

  it("answers where-is without forcing navigation", () => {
    const userText = "Where's that treehouse place?";
    const intent = resolveSemanticMemberIntent({ userText });
    expect(intent.action).toBe("ask_knowledge");
    expect(intent.nextStep).toBe("answer_from_kb");

    const runtime = executeSemanticIntent(intent, userText, {});
    expect(runtime?.capability).toBe("room");
    expect(runtime?.localReply).toMatch(/Would you like me to take you there/i);
    expect(runtime?.immediateEstatePlaceNavigate).toBeUndefined();
  });

  it("resolves Who is Kinsey from object KB", () => {
    const userText = "Who is Kinsey?";
    const intent = resolveSemanticMemberIntent({ userText });
    expect(intent.target.kind).toBe("object");
    expect(intent.target.id).toBe("kinsey");

    const pipeline = runConversationRoutingPipeline({ userText }, stubRouting);
    expect(pipeline.arbitration.estateIntelligenceNeeded).toBe(true);

    const runtime = executeEstateIntelligence({
      pipeline,
      userText,
      helpContext: {},
      routing: stubRouting,
    });
    expect(runtime?.capability).toBe("object");
    expect(runtime?.localReply).toMatch(/Kinsey/i);
  });

  it("opens reminders semantically — not navigation", () => {
    const userText = "Open Reminders.";
    const intent = resolveSemanticMemberIntent({ userText });
    expect(intent.action).toBe("open_feature");
    expect(intent.target.kind).toBe("feature");
    expect(intent.target.id).toBe("reminders");

    const pipeline = runConversationRoutingPipeline({ userText }, stubRouting);
    expect(pipeline.arbitration.goal).not.toBe("explicit_navigation");
  });

  it("routes discovery before show-me navigation collision", () => {
    const userText = "Show me something I haven't discovered yet.";
    const intent = resolveSemanticMemberIntent({ userText });
    expect(intent.action).toBe("discovery");

    const pipeline = runConversationRoutingPipeline({ userText }, stubRouting);
    expect(pipeline.arbitration.goal).toBe("discovery_estate");
    expect(pipeline.winningCapability).toBe("discovery");
  });

  it("still fast-paths research", () => {
    const userText = "Research pricing for a premium audio library for my app.";
    const intent = resolveSemanticMemberIntent({ userText });
    expect(intent.action).toBe("research");
    expect(intent.source).toBe("regex_fast_path");
  });
});
