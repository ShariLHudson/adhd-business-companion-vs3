/**
 * Learning Intelligence Pilot Integration (Build 10) tests.
 * @vitest-environment node
 */
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  assessLearningVisualThinkingRecommendation,
  assertLearningProgressPreserved,
  buildLearningRecommendationContext,
  buildLearningReturnV2,
  buildWorkspaceLearningContext,
  clearLearningPilotV2State,
  clearLearningVtPilotSessionState,
  createAskInLearningHandoff,
  createVisualThinkingContextFromLearning,
  declineLearningVisualRecommendation,
  detectsExplicitLearningVisualRequest,
  getSupportingWrittenLearningView,
  loadAskInLearningHandoff,
  offerLearningNoteWriteback,
  projectSelectedLearningActions,
  projectSupportingWrittenLearningView,
  resolveLearningNoteWriteback,
  visualActivityCountsAsLearningEvidence,
  type LearningSessionSnapshot,
} from "@/lib/learningIntelligence";

function medicareSession(
  overrides: Partial<LearningSessionSnapshot> = {},
): LearningSessionSnapshot {
  return {
    learningSessionId: "ls_medicare_pilot",
    conversationId: "conv_pilot",
    topic: "How Medicare Parts A, B, C, and D work together",
    learningGoal: "Understand how Medicare parts relate and when each applies",
    successDefinition: "Can explain how the four parts fit together",
    learnerKnowledgeLevel: "beginner",
    requestedDepth: "guided",
    learningStage: "explaining",
    learningMode: "relationship",
    currentExplanation:
      "Medicare has four main parts. Part A covers hospital care, Part B covers medical insurance, Part C is Medicare Advantage, and Part D covers prescription drugs.",
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
        content: "Medicare Advantage",
        kind: "concept",
        sourceReference: "learning_explanation",
        confidence: "medium",
        verified: false,
      },
      {
        id: "k_d",
        title: "Part D",
        content: "Prescription drugs",
        kind: "concept",
        sourceReference: "learning_explanation",
        confidence: "high",
        verified: true,
      },
      {
        id: "k_rel",
        title: "How they connect",
        content: "A and B are Original Medicare; C may bundle; D adds drugs.",
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

describe("Learning Visual Thinking Pilot Integration (Build 10)", () => {
  beforeEach(() => {
    clearLearningVtPilotSessionState();
    clearLearningPilotV2State();
    installSessionStorage();
  });
  afterEach(() => {
    clearLearningVtPilotSessionState();
    clearLearningPilotV2State();
    delete (globalThis as { window?: unknown }).window;
  });

  it("recommendation context includes goal, level, explained content, scoped knowledge", () => {
    const session = medicareSession();
    const ctx = buildLearningRecommendationContext({
      session,
      userRequest: session.topic,
      hasProvidedInitialValue: true,
    });
    expect(ctx.primaryGoal).toContain("Medicare");
    expect(ctx.sourceSessionId).toBe(session.learningSessionId);
    expect(ctx.currentResponseSummary).toMatch(/four main parts/i);
    expect(ctx.approvedKnowledgeItemIds.length).toBeGreaterThan(0);
    expect(ctx.approvedKnowledgeItemIds.length).toBeLessThanOrEqual(16);
    expect(ctx.hasProvidedInitialValue).toBe(true);
  });

  it("complex relationship recommends; simple definition does not; keywords alone do not", () => {
    const complex = assessLearningVisualThinkingRecommendation({
      session: medicareSession(),
      userRequest: "Help me understand how Medicare parts work together.",
      hasProvidedInitialValue: true,
    });
    expect(complex.recommended).toBe(true);

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
      }),
      userRequest: "What is a deductible?",
      hasProvidedInitialValue: true,
    });
    expect(simple.recommended).toBe(false);

    const keyword = assessLearningVisualThinkingRecommendation({
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
    expect(keyword.recommended).toBe(false);
  });

  it("optional recommendations require initial value; explicit bypasses card", () => {
    const early = assessLearningVisualThinkingRecommendation({
      session: medicareSession(),
      userRequest: "Help me understand how Medicare parts work together.",
      hasProvidedInitialValue: false,
    });
    expect(early.recommended).toBe(false);
    expect(early.factors).toContain("timing_before_value");

    expect(
      detectsExplicitLearningVisualRequest(
        "Show me visually how photosynthesis works.",
      ),
    ).toBe(true);
    const explicit = assessLearningVisualThinkingRecommendation({
      session: medicareSession({
        topic: "Photosynthesis",
        learningGoal: "See how photosynthesis works",
        keyConcepts: ["light", "water", "CO2", "glucose"],
        relationshipHints: ["inputs become outputs"],
      }),
      userRequest: "Show me visually how photosynthesis works.",
      hasProvidedInitialValue: false,
    });
    expect(explicit.recommended).toBe(true);
    expect(explicit.recommendationTiming).toBe("explicit_request");
    expect(explicit.userFacingMessage).toBe("");
  });

  it("acceptance creates V2 integration without restating or map-type choice", () => {
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
    expect(adapted.integrationRequestV2.learningGoal).toContain("Medicare");
    expect(adapted.integrationRequestV2.conceptsAlreadyIntroduced).toContain(
      "Part A",
    );
    expect(adapted.integrationRequestV2.scopedKnowledgeItems.length).toBeLessThanOrEqual(
      16,
    );
    expect(adapted.supportingWrittenExplanation).toBeTruthy();
    expect(adapted.workspaceLearningContext.sourceLearningSessionId).toBe(
      session.learningSessionId,
    );
    expect(adapted.doesNotMarkLessonComplete).toBe(true);
    expect(adapted.handoff.destination).toBe("visual_thinking_studio");
    expect(adapted.seedRequestText).toContain(session.learningGoal);
  });

  it("supporting written view remains available", () => {
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
    const written = projectSupportingWrittenLearningView(adapted);
    expect(written.available).toBe(true);
    expect(written.body).toMatch(/Medicare/i);
    expect(written.actions).toContain("return_to_lesson");
  });

  it("Ask in Learning preserves question and session; notes require approval", () => {
    const ask = createAskInLearningHandoff({
      sourceLearningSessionId: "ls_medicare_pilot",
      visualThinkingWorkspaceId: "ws_1",
      question: "Why does Part C sometimes replace how Parts A and B are received?",
      selectedObjectIds: ["obj_c"],
      selectedObjectSummaries: ["Part C — Medicare Advantage"],
      relevantKnowledgeItemIds: ["k_c"],
      currentPresentation: "relationship_view",
    });
    expect(ask.question).toMatch(/Part C/);
    expect(loadAskInLearningHandoff()?.id).toBe(ask.id);

    const offer = offerLearningNoteWriteback({
      insightId: "n1",
      kind: "question",
      content: ask.question,
      provenance: "user_created",
    });
    expect(offer.requiresApproval).toBe(true);
    const keep = resolveLearningNoteWriteback({
      offer,
      choice: "keep_only_in_visual",
    });
    expect(keep.writesToLearning).toBe(false);
    const add = resolveLearningNoteWriteback({
      offer,
      choice: "add_to_learning_notes",
    });
    expect(add.writesToLearning).toBe(true);
  });

  it("return restores session position; progress preserved; visual activity ≠ mastery", () => {
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
    const afterOpen = { ...session, progressState: "in_progress" as const };
    expect(assertLearningProgressPreserved(session, afterOpen)).toBe(true);

    const ret = buildLearningReturnV2({
      request: adapted.integrationRequestV2,
      visualThinkingWorkspaceId: "ws_1",
      pendingQuestion: "Part C packaging",
    });
    expect(ret.completed).toBe(false);
    expect(ret.sourceLearningSessionId).toBe(session.learningSessionId);
    expect(ret.suggestedLearningResumePoint).toContain("four parts");
    expect(ret.resumeMessage).toMatch(/Welcome back/i);
    expect(ret.resumeMessage).toMatch(/Part C/i);

    expect(visualActivityCountsAsLearningEvidence("moved_object")).toBe(false);
    expect(visualActivityCountsAsLearningEvidence("opened_visual")).toBe(false);
  });

  it("selected learning actions are scoped; decline suppresses topic", () => {
    const actions = projectSelectedLearningActions();
    expect(actions.some((a) => a.id === "ask_in_learning")).toBe(true);
    expect(actions.some((a) => a.id === "research_this")).toBe(true);

    const session = medicareSession();
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
  });

  it("workspace learning context + written view helpers", () => {
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
    const wsCtx = buildWorkspaceLearningContext(adapted.integrationRequestV2);
    expect(wsCtx.learningGoal).toContain("Medicare");
    expect(wsCtx.returnContext.returnRoute).toBe("learning_chamber");
    const written = getSupportingWrittenLearningView(adapted.integrationRequestV2);
    expect(written.available).toBe(true);
  });
});
