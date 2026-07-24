/**
 * Visual Thinking platform integration tests (Build 8 integration).
 * @vitest-environment node
 */
import { beforeEach, describe, expect, it } from "vitest";
import {
  VISUAL_THINKING_SUPPORTED_CALLERS,
  VisualThinkingService,
  assertNoDuplicateVisualThinkingEngines,
  buildVisualThinkingInvitation,
  getVisualThinkingPreference,
  isSupportedVisualThinkingCaller,
  recordVisualThinkingPreferenceEvent,
  requestVisualThinkingHandoff,
  shouldRecommendVisualThinking,
  type VisualThinkingCallerId,
  type VisualThinkingRequestContext,
} from "@/lib/cartographersStudio/visualThinkingService";
import {
  __resetAdaptiveCompanionExplicitPrefsForTests,
  __resetAdaptiveSessionOverrideForTests,
} from "@/lib/adaptiveCompanionIntelligence";

function ctx(
  partial: Partial<VisualThinkingRequestContext> & {
    sourceExperience: VisualThinkingCallerId;
  },
): VisualThinkingRequestContext {
  return {
    sourceCompanion: null,
    conversationSummary: null,
    primaryGoal: null,
    currentTask: null,
    knowledgePackage: null,
    generatedDeliverable: null,
    presentationPlan: null,
    preferredPresentation: null,
    userPreferences: null,
    reasonForRecommendation: null,
    signalText: null,
    ...partial,
  };
}

describe("Visual Thinking Service (platform integration)", () => {
  beforeEach(() => {
    __resetAdaptiveCompanionExplicitPrefsForTests();
    __resetAdaptiveSessionOverrideForTests();
  });

  it("lists all supported Estate callers", () => {
    expect(VISUAL_THINKING_SUPPORTED_CALLERS).toEqual(
      expect.arrayContaining([
        "business_estate",
        "projects",
        "learning",
        "marketing",
        "leadership",
        "momentum",
        "innovation",
        "events",
        "strategy",
        "finance",
        "board_of_directors",
        "executive_office",
        "founder_studio",
        "general_chat",
        "chamber_member",
      ]),
    );
    for (const caller of VISUAL_THINKING_SUPPORTED_CALLERS) {
      expect(isSupportedVisualThinkingCaller(caller)).toBe(true);
      expect(VisualThinkingService.isSupportedCaller(caller)).toBe(true);
    }
  });

  it("every supported caller can invoke the service", () => {
    for (const caller of VISUAL_THINKING_SUPPORTED_CALLERS) {
      const recommendation = VisualThinkingService.shouldRecommend(
        ctx({
          sourceExperience: caller,
          signalText:
            "Help me understand how these systems relate and map the process.",
          conceptCount: 5,
          relationshipCount: 4,
        }),
      );
      expect(recommendation.optional).toBe(true);
      expect(recommendation.dismissible).toBe(true);
      const handoff = VisualThinkingService.requestHandoff(
        ctx({
          sourceExperience: caller,
          primaryGoal: "Understand the system",
          signalText: "Map how these pieces relate",
          conceptCount: 5,
          relationshipCount: 3,
        }),
      );
      expect(handoff.destination).toBe("visual_thinking_studio");
      expect(handoff.caller).toBe(caller);
      expect(handoff.optional).toBe(true);
    }
  });

  it("recommends visuals for complex process / relationships / decisions", () => {
    const process = shouldRecommendVisualThinking(
      ctx({
        sourceExperience: "business_estate",
        signalText: "Walk me through how this workflow works end to end",
        processStepCount: 8,
      }),
    );
    expect(process.shouldRecommend).toBe(true);
    expect(process.capability).toBe("process_visualization");

    const relationships = shouldRecommendVisualThinking(
      ctx({
        sourceExperience: "learning",
        signalText: "Explain the relationships between these concepts",
        conceptCount: 6,
        relationshipCount: 5,
      }),
    );
    expect(relationships.shouldRecommend).toBe(true);

    const decision = shouldRecommendVisualThinking(
      ctx({
        sourceExperience: "board_of_directors",
        signalText: "Help us decide between these strategic options and tradeoffs",
        optionCount: 3,
        criterionCount: 4,
      }),
    );
    expect(decision.shouldRecommend).toBe(true);
  });

  it("does not recommend for simple questions, definitions, or checklist-only", () => {
    expect(
      shouldRecommendVisualThinking(
        ctx({
          sourceExperience: "general_chat",
          signalText: "What is Medicare?",
        }),
      ).shouldRecommend,
    ).toBe(false);

    expect(
      shouldRecommendVisualThinking(
        ctx({
          sourceExperience: "general_chat",
          signalText: "What does force majeure mean — legal definition",
        }),
      ).shouldRecommend,
    ).toBe(false);

    expect(
      shouldRecommendVisualThinking(
        ctx({
          sourceExperience: "projects",
          signalText: "Just give me a checklist",
        }),
      ).shouldRecommend,
    ).toBe(false);
  });

  it("recommendations remain optional and never force transition", () => {
    const rec = shouldRecommendVisualThinking(
      ctx({
        sourceExperience: "learning",
        signalText: "Show me how these lesson ideas connect",
        conceptCount: 5,
        relationshipCount: 3,
      }),
    );
    expect(rec.shouldRecommend).toBe(true);
    expect(rec.optional).toBe(true);
    expect(rec.dismissible).toBe(true);
    expect(rec.primaryActionLabel).toBe("Open Visual Thinking");
    expect(rec.keepActionLabel).toBe("Keep Reading");
    expect(rec.invitation.length).toBeGreaterThan(10);
  });

  it("respects prefers_written and decline preferences", () => {
    const declined = shouldRecommendVisualThinking(
      ctx({
        sourceExperience: "marketing",
        signalText: "Map the campaign funnel and customer journey",
        processStepCount: 7,
        userPreferences: {
          visualPreference: "prefers_written",
          declineVisualRecommendations: true,
        },
      }),
    );
    expect(declined.shouldRecommend).toBe(false);
  });

  it("handoff preserves Knowledge Package and Presentation Plan ids", () => {
    const handoff = requestVisualThinkingHandoff(
      ctx({
        sourceExperience: "projects",
        primaryGoal: "Show execution dependencies",
        signalText: "Map the critical path",
        processStepCount: 6,
        knowledgePackage: { id: "kp_123" } as never,
        presentationPlan: {
          id: "pp_456",
          primaryDeliverableId: "d_789",
        } as never,
        generatedDeliverable: { id: "d_789" } as never,
      }),
    );
    expect(handoff.knowledgePackageId).toBe("kp_123");
    expect(handoff.presentationPlanId).toBe("pp_456");
    expect(handoff.primaryDeliverableId).toBe("d_789");
    expect(handoff.preservesKnowledgePackage).toBe(true);
    expect(handoff.preservesPresentationPlan).toBe(true);
    expect(handoff.destination).toBe("visual_thinking_studio");
  });

  it("Board, Projects, Business Estate, Learning, Marketing, Chat can call service", () => {
    const callers: VisualThinkingCallerId[] = [
      "board_of_directors",
      "projects",
      "business_estate",
      "learning",
      "marketing",
      "general_chat",
    ];
    for (const caller of callers) {
      const handoff = requestVisualThinkingHandoff(
        ctx({
          sourceExperience: caller,
          signalText: "Compare options and map the decision relationships",
          optionCount: 3,
          criterionCount: 3,
          conceptCount: 4,
        }),
      );
      expect(handoff.caller).toBe(caller);
      expect(handoff.capability).toBeTruthy();
    }
  });

  it("learning invitation copy is calm and optional", () => {
    const line = buildVisualThinkingInvitation({
      caller: "learning",
      capability: "learning_visualization",
    });
    expect(line).toMatch(/visually help/i);
  });

  it("forbids duplicate independent visual engines", () => {
    const rule = assertNoDuplicateVisualThinkingEngines();
    expect(rule.canonicalService).toBe("VisualThinkingService");
    expect(rule.forbiddenIndependentEngines.length).toBeGreaterThan(3);
    expect(rule.rule).toMatch(/routes through Visual Thinking/i);
  });

  it("records visual preference events for Adaptive Companion later", () => {
    const prevWindow = (globalThis as { window?: unknown }).window;
    const store = new Map<string, string>();
    (globalThis as { window: unknown }).window = {
      sessionStorage: {
        getItem: (k: string) => store.get(k) ?? null,
        setItem: (k: string, v: string) => store.set(k, v),
        removeItem: (k: string) => store.delete(k),
      },
    };
    try {
      recordVisualThinkingPreferenceEvent("open");
      recordVisualThinkingPreferenceEvent("open");
      recordVisualThinkingPreferenceEvent("open");
      const pref = getVisualThinkingPreference();
      expect(pref.openCount).toBe(3);
      expect(pref.profile).toBe("likes_visual");
    } finally {
      if (prevWindow === undefined) {
        delete (globalThis as { window?: unknown }).window;
      } else {
        (globalThis as { window: unknown }).window = prevWindow;
      }
    }
  });
});
