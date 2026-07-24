/**
 * Learning → Visual Thinking pilot integration tests.
 * @vitest-environment node
 */
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  approveLearningInsightWriteback,
  assessLearningVisualThinkingRecommendation,
  buildLearningReturnFromVisual,
  buildLearningVisualFailureRecovery,
  clearLearningVtPilotSessionState,
  createVisualThinkingContextFromLearning,
  declineLearningVisualRecommendation,
  detectsExplicitLearningVisualRequest,
  offerLearningInsightWriteback,
  visualActivityCountsAsLearningEvidence,
  type LearningSessionSnapshot,
} from "@/lib/learningIntelligence";

function medicareSession(
  overrides: Partial<LearningSessionSnapshot> = {},
): LearningSessionSnapshot {
  return {
    learningSessionId: "ls_medicare_1",
    conversationId: "conv_1",
    topic: "How Medicare Parts A, B, C, and D work together",
    learningGoal: "Understand how Medicare parts relate and when each applies",
    successDefinition: "Can explain how the four parts fit together",
    learnerKnowledgeLevel: "beginner",
    requestedDepth: "guided",
    learningStage: "explaining",
    learningMode: "relationship",
    currentExplanation:
      "Medicare has four main parts. Part A covers hospital care, Part B covers medical insurance, Part C is Medicare Advantage, and Part D covers prescription drugs. They connect in different ways depending on how someone enrolls.",
    approvedKnowledgeItems: [
      {
        id: "k_a",
        title: "Part A",
        content: "Hospital insurance",
        kind: "concept",
        sourceReference: "learning_explanation",
        confidence: "high",
        verified: true,
      },
      {
        id: "k_b",
        title: "Part B",
        content: "Medical insurance",
        kind: "concept",
        sourceReference: "learning_explanation",
        confidence: "high",
        verified: true,
      },
      {
        id: "k_c",
        title: "Part C",
        content: "Medicare Advantage plans",
        kind: "concept",
        sourceReference: "learning_explanation",
        confidence: "medium",
        verified: false,
      },
      {
        id: "k_d",
        title: "Part D",
        content: "Prescription drug coverage",
        kind: "concept",
        sourceReference: "learning_explanation",
        confidence: "high",
        verified: true,
      },
      {
        id: "k_rel",
        title: "How they connect",
        content:
          "Parts A and B are Original Medicare; C may bundle coverage; D adds drugs.",
        kind: "relationship",
        sourceReference: "learning_explanation",
        confidence: "medium",
        verified: false,
      },
    ],
    keyConcepts: ["Part A", "Part B", "Part C", "Part D"],
    relationshipHints: [
      "A and B form Original Medicare",
      "C may replace A/B packaging",
      "D adds prescriptions",
    ],
    sequenceHints: [],
    comparisonHints: [],
    incompleteQuestions: ["How does enrollment timing affect Part C?"],
    lessonPosition: "how the four parts relate",
    completedLearningSteps: ["introduced_parts"],
    learnerNotes: [],
    progressState: "in_progress",
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

describe("Learning Visual Thinking Integration Pilot", () => {
  beforeEach(() => {
    clearLearningVtPilotSessionState();
    installSessionStorage();
  });

  afterEach(() => {
    clearLearningVtPilotSessionState();
    delete (globalThis as { window?: unknown }).window;
  });

  it("1–5. Learning creates integration request with goal, level, scoped knowledge", () => {
    const session = medicareSession();
    const rec = assessLearningVisualThinkingRecommendation({
      session,
      userRequest:
        "Help me understand how Medicare Parts A, B, C, and D work together.",
      hasProvidedInitialValue: true,
    });
    expect(rec.recommended).toBe(true);
    const adapted = createVisualThinkingContextFromLearning({
      session,
      userRequest: session.topic,
      recommendation: rec,
      explicitlyRequested: false,
      userAcceptedRecommendation: true,
    });
    expect(adapted.integrationRequest.learningGoal).toContain("Medicare");
    expect(adapted.integrationRequest.learnerKnowledgeLevel).toBe("beginner");
    expect(adapted.integrationRequest.approvedKnowledgeItemIds.length).toBeGreaterThan(
      0,
    );
    expect(
      adapted.integrationRequest.approvedKnowledgeItemIds.length,
    ).toBeLessThanOrEqual(16);
    expect(
      adapted.integrationRequest.scopedKnowledgeItems.length,
    ).toBeLessThanOrEqual(16);
    expect(adapted.doesNotMarkLessonComplete).toBe(true);
    expect(adapted.handoff.destination).toBe("visual_thinking_studio");
    expect(adapted.seedRequestText).toContain(session.learningGoal);
  });

  it("6. Multi-concept relationship lesson recommends a visual", () => {
    const rec = assessLearningVisualThinkingRecommendation({
      session: medicareSession(),
      userRequest: "Help me understand how Medicare parts work together.",
      hasProvidedInitialValue: true,
    });
    expect(rec.recommended).toBe(true);
    expect(rec.suggestedPurpose).toBe("understand_relationships");
    expect(rec.userFacingMessage.length).toBeGreaterThan(20);
    expect(rec.primaryActionLabel).toBe("Show Me Visually");
  });

  it("7–8. Simple definition does not recommend; keyword alone is insufficient", () => {
    const simple = assessLearningVisualThinkingRecommendation({
      session: medicareSession({
        topic: "Deductible",
        learningGoal: "Know what a deductible is",
        keyConcepts: ["deductible"],
        relationshipHints: [],
        approvedKnowledgeItems: [
          {
            id: "d1",
            title: "Deductible",
            content: "Amount paid before insurance helps",
            kind: "definition",
          },
        ],
        currentExplanation:
          "A deductible is the amount you pay before insurance begins to help.",
      }),
      userRequest: "What is a deductible?",
      hasProvidedInitialValue: true,
    });
    expect(simple.recommended).toBe(false);

    const keywordOnly = assessLearningVisualThinkingRecommendation({
      session: medicareSession({
        keyConcepts: ["map"],
        relationshipHints: [],
        sequenceHints: [],
        comparisonHints: [],
        approvedKnowledgeItems: [],
      }),
      userRequest: "Can you map a simple idea?",
      hasProvidedInitialValue: true,
    });
    expect(keywordOnly.recommended).toBe(false);
  });

  it("9–11. Explicit visual request bypasses recommendation card and continues automatically", () => {
    expect(
      detectsExplicitLearningVisualRequest(
        "Make a visual showing how these marketing funnel stages connect.",
      ),
    ).toBe(true);
    const session = medicareSession({
      topic: "Marketing funnel stages",
      learningGoal: "See how funnel stages connect",
      keyConcepts: ["Awareness", "Interest", "Decision", "Action"],
      relationshipHints: ["stages connect in sequence"],
    });
    const rec = assessLearningVisualThinkingRecommendation({
      session,
      userRequest:
        "Make a visual showing how these marketing funnel stages connect.",
      hasProvidedInitialValue: false,
    });
    expect(rec.recommended).toBe(true);
    expect(rec.recommendationTiming).toBe("explicit_request");
    expect(rec.userFacingMessage).toBe("");
    const adapted = createVisualThinkingContextFromLearning({
      session,
      userRequest:
        "Make a visual showing how these marketing funnel stages connect.",
      recommendation: rec,
      explicitlyRequested: true,
      userAcceptedRecommendation: true,
    });
    expect(adapted.integrationRequest.explicitlyRequested).toBe(true);
    expect(adapted.integrationRequest.userAcceptedRecommendation).toBe(true);
  });

  it("12–15. Decline keeps Learning; no-repeat for topic; lesson suppress; not permanent preference", () => {
    const session = medicareSession();
    const first = assessLearningVisualThinkingRecommendation({
      session,
      userRequest: session.topic,
      hasProvidedInitialValue: true,
    });
    expect(first.recommended).toBe(true);

    declineLearningVisualRecommendation({
      learningSessionId: session.learningSessionId,
      topic: session.topic,
    });

    const second = assessLearningVisualThinkingRecommendation({
      session,
      userRequest: session.topic,
      hasProvidedInitialValue: true,
    });
    expect(second.recommended).toBe(false);
    expect(second.factors).toContain("topic_declined");

    declineLearningVisualRecommendation({
      learningSessionId: "ls_other",
      topic: "Podcast launch",
      notDuringLesson: true,
    });
    const lesson = assessLearningVisualThinkingRecommendation({
      session: medicareSession({
        learningSessionId: "ls_other",
        topic: "Podcast launch",
        keyConcepts: ["record", "edit", "publish", "promote"],
        sequenceHints: ["1", "2", "3", "4", "5"],
      }),
      userRequest: "Help me understand the stages of launching a podcast.",
      hasProvidedInitialValue: true,
    });
    expect(lesson.recommended).toBe(false);
    expect(lesson.factors).toContain("lesson_suppress");
  });

  it("16–17. Handoff does not force restating topic or detail", () => {
    const session = medicareSession({ requestedDepth: "detailed" });
    const rec = assessLearningVisualThinkingRecommendation({
      session,
      userRequest: session.topic,
      hasProvidedInitialValue: true,
    });
    const adapted = createVisualThinkingContextFromLearning({
      session,
      userRequest: session.topic,
      recommendation: rec,
      explicitlyRequested: false,
      userAcceptedRecommendation: true,
    });
    expect(adapted.integrationRequest.learningTopic).toBe(session.topic);
    expect(adapted.integrationRequest.requestedDepth).toBe("detailed");
    expect(adapted.seedRequestText).toContain(session.learningGoal);
    expect(adapted.seedRequestText).toMatch(/What we've covered|Key points/i);
  });

  it("18–20. Knowledge preserves sources; dedupes; insufficient structure avoids fake maps", () => {
    const session = medicareSession({
      approvedKnowledgeItems: [
        ...medicareSession().approvedKnowledgeItems,
        {
          id: "dup",
          title: "Part A",
          content: "Hospital insurance",
          kind: "concept",
          sourceReference: "learning_explanation",
        },
      ],
    });
    const rec = assessLearningVisualThinkingRecommendation({
      session,
      userRequest: session.topic,
      hasProvidedInitialValue: true,
    });
    const adapted = createVisualThinkingContextFromLearning({
      session,
      userRequest: session.topic,
      recommendation: rec,
      explicitlyRequested: false,
      userAcceptedRecommendation: true,
    });
    expect(
      adapted.integrationRequest.scopedKnowledgeItems.every(
        (k) => k.sourceReference || k.kind,
      ),
    ).toBe(true);
    const titles = adapted.integrationRequest.scopedKnowledgeItems.map(
      (k) => k.title,
    );
    expect(titles.filter((t) => t === "Part A").length).toBe(1);

    const thin = assessLearningVisualThinkingRecommendation({
      session: medicareSession({
        keyConcepts: ["one"],
        relationshipHints: [],
        sequenceHints: [],
        comparisonHints: [],
        approvedKnowledgeItems: [],
      }),
      userRequest: "Help me understand one idea",
      hasProvidedInitialValue: true,
    });
    expect(thin.recommended).toBe(false);
    expect(thin.factors).toContain("insufficient_structure");
  });

  it("21–24. Return restores session/position; opening VT does not complete lesson", () => {
    const session = medicareSession();
    const rec = assessLearningVisualThinkingRecommendation({
      session,
      userRequest: session.topic,
      hasProvidedInitialValue: true,
    });
    const adapted = createVisualThinkingContextFromLearning({
      session,
      userRequest: session.topic,
      recommendation: rec,
      explicitlyRequested: false,
      userAcceptedRecommendation: true,
    });
    expect(adapted.integrationRequest.currentExplanation).toBeTruthy();
    expect(session.progressState).toBe("in_progress");
    expect(adapted.doesNotMarkLessonComplete).toBe(true);

    const ret = buildLearningReturnFromVisual({
      sourceLearningSessionId: session.learningSessionId,
      visualThinkingWorkspaceId: "ws_1",
      topic: session.topic,
      lessonPosition: session.lessonPosition,
    });
    expect(ret.sourceLearningSessionId).toBe(session.learningSessionId);
    expect(ret.completed).toBe(false);
    expect(ret.suggestedLearningResumePoint).toContain("four parts");
    expect(ret.resumeMessage).toMatch(/Welcome back/i);
  });

  it("25. Moving visual objects does not count as mastery", () => {
    expect(visualActivityCountsAsLearningEvidence("moved_object")).toBe(false);
    expect(visualActivityCountsAsLearningEvidence("changed_zoom")).toBe(false);
    expect(visualActivityCountsAsLearningEvidence("opened_visual")).toBe(false);
    expect(
      visualActivityCountsAsLearningEvidence("reviewed_major_concepts"),
    ).toBe(true);
  });

  it("26–27. User questions can return; writebacks require approval", () => {
    const offer = offerLearningInsightWriteback({
      insightId: "ins_1",
      kind: "question",
      content: "How does Part C replace or combine the other parts?",
    });
    expect(offer.requiresApproval).toBe(true);
    expect(offer.choices).toContain("ask_in_learning");
    const keep = approveLearningInsightWriteback({
      offer,
      choice: "keep_only_in_visual",
    });
    expect(keep.writesToLearning).toBe(false);
    const ask = approveLearningInsightWriteback({
      offer,
      choice: "ask_in_learning",
    });
    expect(ask.writesToLearning).toBe(true);
  });

  it("28–29. Visual failure preserves Learning; recovery message is natural", () => {
    const recovery = buildLearningVisualFailureRecovery("Medicare parts");
    expect(recovery.stayInLearning).toBe(true);
    expect(recovery.message).toMatch(/lesson is still here/i);
    expect(recovery.message).not.toMatch(/error|stack|failed to fetch/i);
  });

  it("Scenario C: show me the steps is not automatically an explicit visual request", () => {
    expect(
      detectsExplicitLearningVisualRequest(
        "Show me the steps for launching a podcast.",
      ),
    ).toBe(false);
    const session = medicareSession({
      topic: "Launching a podcast",
      learningGoal: "Understand podcast launch stages",
      keyConcepts: ["plan", "record", "edit", "publish", "promote"],
      sequenceHints: ["plan", "record", "edit", "publish", "promote"],
      relationshipHints: [],
      learningMode: "process",
    });
    const rec = assessLearningVisualThinkingRecommendation({
      session,
      userRequest: "Show me the steps for launching a podcast.",
      hasProvidedInitialValue: true,
    });
    expect(rec.recommended).toBe(true);
    expect(rec.suggestedPurpose).toMatch(/process|sequence/);
  });
});
