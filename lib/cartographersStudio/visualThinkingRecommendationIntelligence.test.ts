/**
 * Visual Thinking Recommendation Intelligence (Build 8)
 * @vitest-environment node
 */
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  acceptVisualThinkingRecommendation,
  assessVisualThinkingRecommendation,
  assessVisualThinkingRecommendationReadiness,
  buildVisualThinkingFailureRecovery,
  clearVisualThinkingRecommendationSession,
  declineVisualThinkingRecommendation,
  detectsExplicitVisualThinkingIntent,
  inferRecommendedVisualPurpose,
  projectVisualThinkingRecommendationAudit,
  projectVisualThinkingRecommendationInvitation,
  type VisualThinkingRecommendationContext,
} from "@/lib/cartographersStudio/visualThinkingRecommendationIntelligence";

function ctx(
  overrides: Partial<VisualThinkingRecommendationContext> & {
    userRequest: string;
  },
): VisualThinkingRecommendationContext {
  return {
    sourceExperience: "general_chat",
    sourceConversationId: "c1",
    sourceSessionId: "s1",
    hasProvidedInitialValue: true,
    ...overrides,
  };
}

function installSessionStorage() {
  const store = new Map<string, string>();
  (globalThis as { window: unknown }).window = {
    sessionStorage: {
      getItem: (k: string) => store.get(k) ?? null,
      setItem: (k: string, v: string) => {
        store.set(k, v);
      },
      removeItem: (k: string) => {
        store.delete(k);
      },
    },
  };
}

describe("Visual Thinking Recommendation Intelligence", () => {
  beforeEach(() => {
    installSessionStorage();
    clearVisualThinkingRecommendationSession();
  });
  afterEach(() => {
    clearVisualThinkingRecommendationSession();
    delete (globalThis as { window?: unknown }).window;
  });

  it("1–2. Simple definition / one-step answer do not recommend", () => {
    const def = assessVisualThinkingRecommendation(
      ctx({
        userRequest: "What is a deductible?",
        conceptCount: 1,
      }),
    );
    expect(def.recommended).toBe(false);
    expect(def.factors).toContain("simple_definition");

    const oneStep = assessVisualThinkingRecommendation(
      ctx({
        userRequest: "How do I add a title to a YouTube video?",
        conceptCount: 1,
        sequenceSignals: ["add title"],
      }),
    );
    expect(oneStep.recommended).toBe(false);
  });

  it("3–7. Structured situations may recommend appropriate purposes", () => {
    const process = assessVisualThinkingRecommendation(
      ctx({
        userRequest: "Help me understand the stages of launching a podcast.",
        primaryGoal: "Launch podcast stages",
        sequenceSignals: ["plan", "record", "edit", "publish", "promote"],
        conceptCount: 5,
        informationVolume: "high",
      }),
    );
    expect(process.recommended).toBe(true);
    expect(process.suggestedPurpose).toMatch(/sequence|plan_execution/);

    const relationships = assessVisualThinkingRecommendation(
      ctx({
        userRequest:
          "Help me understand how Medicare Parts A, B, C, and D work together.",
        primaryGoal: "Medicare parts relationships",
        conceptCount: 4,
        relationshipSignals: [
          "A and B Original Medicare",
          "C may bundle",
          "D adds drugs",
        ],
        approvedKnowledgeItemIds: ["a", "b", "c", "d"],
        currentResponseSummary:
          "Medicare has four main parts that connect in different ways depending on enrollment.",
      }),
    );
    expect(relationships.recommended).toBe(true);
    expect(relationships.suggestedPurpose).toBe("understand_relationships");
    expect(relationships.userFacingMessage.length).toBeGreaterThan(20);

    const timeline = assessVisualThinkingRecommendation(
      ctx({
        userRequest: "Show how the online coaching industry changed over time.",
        chronologySignals: ["2008", "2016", "2020", "2022"],
        conceptCount: 4,
      }),
    );
    expect(timeline.suggestedPurpose).toBe("understand_chronology");

    const comparison = assessVisualThinkingRecommendation(
      ctx({
        userRequest:
          "Compare HubSpot, HighLevel, and Salesforce for a small consulting business.",
        comparisonSignals: ["HubSpot", "HighLevel", "Salesforce", "price", "ease"],
        conceptCount: 3,
        informationVolume: "high",
      }),
    );
    expect(comparison.recommended).toBe(true);
    expect(comparison.suggestedPurpose).toBe("compare_options");

    const decision = assessVisualThinkingRecommendation(
      ctx({
        userRequest: "Help me decide between three pricing models with tradeoffs.",
        decisionSignals: ["pricing A", "pricing B", "pricing C", "tradeoff"],
        comparisonSignals: ["A", "B", "C"],
        conceptCount: 3,
      }),
    );
    expect(decision.suggestedPurpose).toMatch(/decision|compare/);
  });

  it("8. Keywords alone do not trigger a recommendation", () => {
    const keyword = assessVisualThinkingRecommendation(
      ctx({
        userRequest: "Compare these two sentences.",
        conceptCount: 2,
        comparisonSignals: [],
      }),
    );
    expect(keyword.recommended).toBe(false);
    expect(keyword.factors.join(" ")).toMatch(/keyword|simple|insufficient|structure/);
  });

  it("9–11. Substantive readiness blocks empty / central-node visuals", () => {
    const thin = assessVisualThinkingRecommendationReadiness(
      ctx({
        userRequest: "Map this one idea",
        conceptCount: 1,
        relationshipSignals: [],
      }),
      "understand_relationships",
    );
    expect(thin.eligible).toBe(false);
    expect(thin.blockedReasons.length).toBeGreaterThan(0);

    const empty = assessVisualThinkingRecommendation(
      ctx({
        userRequest: "Help me see how these connect",
        conceptCount: 1,
        relationshipSignals: [],
      }),
    );
    expect(empty.recommended).toBe(false);
  });

  it("12–13. Explicit visual request bypasses optional card; show me alone is not enough", () => {
    expect(
      detectsExplicitVisualThinkingIntent(
        "Take this to Visual Thinking Studio and create a timeline.",
      ),
    ).toBe(true);
    expect(
      detectsExplicitVisualThinkingIntent("Show me the steps for launching a podcast."),
    ).toBe(false);

    const explicit = assessVisualThinkingRecommendation(
      ctx({
        userRequest:
          "Take this to Visual Thinking Studio and create a timeline.",
        chronologySignals: ["2010", "2020"],
        hasProvidedInitialValue: false,
      }),
    );
    expect(explicit.explicitlyRequested).toBe(true);
    expect(explicit.timing).toBe("immediate_explicit");
    expect(explicit.userFacingMessage).toBe("");
    const invitation = projectVisualThinkingRecommendationInvitation(explicit);
    expect(invitation.visible).toBe(false);
  });

  it("14. Optional recommendations require initial value first", () => {
    const early = assessVisualThinkingRecommendation(
      ctx({
        userRequest:
          "Help me understand how my offers, audiences, marketing, and projects connect.",
        hasProvidedInitialValue: false,
        conceptCount: 4,
        relationshipSignals: ["offers→audiences", "marketing→offers", "projects→delivery"],
      }),
    );
    expect(early.recommended).toBe(false);
    expect(early.factors).toContain("timing_before_value");
  });

  it("15–17. Confidence gates offering behavior", () => {
    const high = assessVisualThinkingRecommendation(
      ctx({
        userRequest:
          "Help me understand how Medicare Parts A, B, C, and D work together.",
        conceptCount: 4,
        relationshipSignals: ["r1", "r2", "r3"],
        approvedKnowledgeItemIds: ["1", "2", "3", "4"],
        informationVolume: "high",
        currentResponseSummary: "Four parts interact…",
      }),
    );
    expect(high.recommended).toBe(true);
    expect(["high", "very_high"]).toContain(high.confidence);

    const low = assessVisualThinkingRecommendation(
      ctx({
        userRequest: "Tell me a bit about this idea",
        conceptCount: 2,
        relationshipSignals: ["maybe"],
      }),
    );
    expect(low.recommended).toBe(false);
  });

  it("18–20. Decline suppresses topic; not permanent; explicit still works", () => {
    const first = assessVisualThinkingRecommendation(
      ctx({
        userRequest: "Help me understand how these business areas connect.",
        primaryGoal: "business connections",
        conceptCount: 4,
        relationshipSignals: ["a", "b", "c"],
        approvedKnowledgeItemIds: ["1", "2", "3"],
      }),
    );
    expect(first.recommended).toBe(true);
    declineVisualThinkingRecommendation({ topicKey: first.topicKey });

    const second = assessVisualThinkingRecommendation(
      ctx({
        userRequest: "Help me understand how these business areas connect.",
        primaryGoal: "business connections",
        conceptCount: 4,
        relationshipSignals: ["a", "b", "c"],
        approvedKnowledgeItemIds: ["1", "2", "3"],
      }),
    );
    expect(second.recommended).toBe(false);
    expect(second.factors).toContain("topic_declined");

    const afterDeclineExplicit = assessVisualThinkingRecommendation(
      ctx({
        userRequest: "Make a visual showing how these business areas connect.",
        primaryGoal: "business connections",
        conceptCount: 4,
        relationshipSignals: ["a", "b", "c"],
      }),
    );
    expect(afterDeclineExplicit.recommended).toBe(true);
    expect(afterDeclineExplicit.explicitlyRequested).toBe(true);
  });

  it("21–26. Acceptance creates integration request without restating or map-type choice", () => {
    const recommendation = assessVisualThinkingRecommendation(
      ctx({
        userRequest:
          "Help me understand how Medicare Parts A, B, C, and D work together.",
        primaryGoal: "Understand Medicare part relationships",
        conceptCount: 4,
        relationshipSignals: ["A-B", "C", "D"],
        approvedKnowledgeItemIds: ["k1", "k2", "k3"],
        sourceReferences: ["learning_explanation"],
        currentResponseSummary: "Four parts…",
        returnContext: {
          returnRoute: "learning",
          resumePrompt: "Continue with enrollment timing",
        },
      }),
    );
    const accepted = acceptVisualThinkingRecommendation({
      context: ctx({
        userRequest:
          "Help me understand how Medicare Parts A, B, C, and D work together.",
        primaryGoal: "Understand Medicare part relationships",
        conceptCount: 4,
        relationshipSignals: ["A-B", "C", "D"],
        approvedKnowledgeItemIds: ["k1", "k2", "k3", "k4", "k5"],
        currentResponseSummary: "Four parts…",
        returnContext: {
          returnRoute: "learning",
          resumePrompt: "Continue with enrollment timing",
        },
      }),
      recommendation,
    });
    expect(accepted.integrationRequest.currentGoal).toContain("Medicare");
    expect(accepted.integrationRequest.approvedKnowledgeItemIds.length).toBeLessThanOrEqual(
      16,
    );
    expect(accepted.integrationRequest.userAcceptedRecommendation).toBe(true);
    expect(accepted.seedRequestText).toContain("Medicare");
    expect(accepted.handoff.destination).toBe("visual_thinking_studio");
    expect(accepted.integrationRequest.returnContext.returnRoute).toBe("learning");
    const invite = projectVisualThinkingRecommendationInvitation(recommendation);
    expect(invite.actions.every((a) => !/map type|eligibility/i.test(a.label))).toBe(
      true,
    );
  });

  it("27–29. Failure recovery; Adaptive Companion cannot force; stop-suggesting suppresses", () => {
    const recovery = buildVisualThinkingFailureRecovery();
    expect(recovery.stayInSource).toBe(true);
    expect(recovery.message).toMatch(/still here/i);

    const forced = assessVisualThinkingRecommendation(
      ctx({
        userRequest: "What is a deductible?",
        adaptivePreferences: { oftenAcceptsVisuals: true },
      }),
    );
    expect(forced.recommended).toBe(false);

    const stopped = assessVisualThinkingRecommendation(
      ctx({
        userRequest:
          "Help me understand how my offers, audiences, marketing, and projects connect.",
        conceptCount: 4,
        relationshipSignals: ["a", "b", "c"],
        adaptivePreferences: { stopSuggestingVisuals: true },
      }),
    );
    expect(stopped.recommended).toBe(false);
    expect(stopped.status).toBe("suppressed");
  });

  it("30 / J. Emotional support does not get an immediate visual recommendation", () => {
    const emotional = assessVisualThinkingRecommendation(
      ctx({
        userRequest: "I feel completely defeated and do not know what to do.",
        currentInteractionState: "emotional_support",
        conceptCount: 5,
        relationshipSignals: ["a", "b"],
      }),
    );
    expect(emotional.recommended).toBe(false);
    expect(emotional.factors).toContain("emotional_support");
  });

  it("Scenario A message explains why; Scenario I insufficient structure", () => {
    const medicare = assessVisualThinkingRecommendation(
      ctx({
        userRequest:
          "Help me understand how Medicare Parts A, B, C, and D work together.",
        conceptCount: 4,
        relationshipSignals: ["A", "B", "C"],
        approvedKnowledgeItemIds: ["1", "2", "3", "4"],
        currentResponseSummary: "Intro explanation of four parts.",
      }),
    );
    expect(medicare.recommended).toBe(true);
    expect(medicare.userFacingMessage).toMatch(/connect|relationship|easier/i);

    const purpose = inferRecommendedVisualPurpose(
      ctx({
        userRequest: "Create a relationship map of this single fact",
        conceptCount: 1,
      }),
    );
    const readiness = assessVisualThinkingRecommendationReadiness(
      ctx({
        userRequest: "Create a relationship map of this single fact",
        conceptCount: 1,
      }),
      purpose,
    );
    expect(readiness.eligible).toBe(false);

    const audit = projectVisualThinkingRecommendationAudit(medicare);
    expect(audit.recommended).toBe(true);
    expect(audit.usefulnessNet).toBeGreaterThan(0);
  });
});
