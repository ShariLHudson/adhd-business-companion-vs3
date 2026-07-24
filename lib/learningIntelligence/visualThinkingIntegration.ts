/**
 * Learning → Visual Thinking pilot integration.
 * Learning owns pedagogy. Visual Thinking owns representation & workspace.
 * Routes through VisualThinkingService — never a Learning-local map engine.
 */

import {
  VisualThinkingService,
  requestVisualThinkingHandoff,
  shouldRecommendVisualThinking,
  type VisualThinkingCapability,
  type VisualThinkingRequestContext,
  type VisualThinkingServiceHandoff,
} from "@/lib/cartographersStudio/visualThinkingService";
import type { VisualThinkingPresentationType } from "@/lib/cartographersStudio/visualThinkingPresentationIntelligence";
import {
  assessLearningPilotRecommendation,
  buildLearningIntegrationRequestV2,
  buildWorkspaceLearningContext,
  getSupportingWrittenLearningView,
  type LearningVisualThinkingIntegrationRequestV2,
} from "@/lib/learningIntelligence/learningVisualThinkingPilot";
import type {
  LearningApprovedKnowledgeItem,
  LearningReturnContext,
  LearningSessionSnapshot,
  LearningVisualPurpose,
} from "@/lib/learningIntelligence/types";

// ─── Integration contracts ──────────────────────────────────────────────────

export type LearningVisualThinkingIntegrationRequest = {
  id: string;
  sourceExperience: "learning";
  sourceConversationId: string | null;
  sourceLearningSessionId: string;
  userRequest: string;
  learningTopic: string;
  learningGoal: string;
  successDefinition: string | null;
  learnerKnowledgeLevel: LearningSessionSnapshot["learnerKnowledgeLevel"];
  requestedDepth: LearningSessionSnapshot["requestedDepth"];
  learningStage: LearningSessionSnapshot["learningStage"];
  learningMode: LearningSessionSnapshot["learningMode"];
  currentExplanation: string | null;
  approvedKnowledgeItemIds: string[];
  /** Scoped knowledge payload for VT — not the full library. */
  scopedKnowledgeItems: LearningApprovedKnowledgeItem[];
  sourceReferences: string[];
  suggestedVisualPurpose: LearningVisualPurpose;
  suggestedPresentation: VisualThinkingPresentationType | null;
  recommendationReason: string | null;
  explicitlyRequested: boolean;
  userAcceptedRecommendation: boolean;
  returnContext: LearningReturnContext;
  createdAt: string;
  integrationVersion: "learning-vt-pilot-1";
};

export type LearningVisualThinkingRecommendation = {
  recommended: boolean;
  confidence: "low" | "medium" | "high";
  reason: string;
  suggestedPurpose: LearningVisualPurpose | null;
  preferredPresentation: VisualThinkingPresentationType | null;
  alternativePresentations: VisualThinkingPresentationType[];
  recommendationTiming:
    | "after_initial_explanation"
    | "on_confusion"
    | "before_long_sequence"
    | "on_complex_comparison"
    | "on_review"
    | "explicit_request"
    | "none";
  userFacingMessage: string;
  primaryActionLabel: "Show Me Visually";
  keepActionLabel: "Keep Learning Here";
  suppressActionLabel: "Not During This Lesson";
  suppressForSession: boolean;
  factors: string[];
};

export type VisualThinkingLearningReturn = {
  sourceLearningSessionId: string;
  visualThinkingWorkspaceId: string | null;
  completed: boolean;
  activePresentation: string | null;
  reviewedKnowledgeItemIds: string[];
  userCreatedInsightIds: string[];
  userQuestions: string[];
  unresolvedAreas: string[];
  suggestedLearningResumePoint: string | null;
  optionalSummary: string | null;
  userApprovedWritebacks: string[];
  resumeMessage: string;
};

export type LearningVisualInsightWritebackOffer = {
  insightId: string;
  kind: "note" | "question" | "connection" | "gap" | "example" | "confusion";
  content: string;
  choices: Array<
    | "add_to_learning_notes"
    | "ask_in_learning"
    | "use_as_next_question"
    | "keep_only_in_visual"
  >;
  requiresApproval: true;
};

export type LearningVtPilotEvent =
  | "recommendation_assessed"
  | "recommendation_shown"
  | "recommendation_accepted"
  | "recommendation_declined"
  | "visual_explicitly_requested"
  | "handoff_created"
  | "workspace_opened"
  | "workspace_failed"
  | "returned_to_learning"
  | "insight_writeback_offered"
  | "insight_writeback_approved"
  | "repeated_recommendation_suppressed"
  | "lesson_suppress_visuals";

export type LearningVtObservabilityEvent = {
  type: LearningVtPilotEvent;
  learningSessionId: string;
  topic: string | null;
  at: string;
  meta?: Record<string, string | number | boolean | null>;
};

type SessionSuppression = {
  learningSessionId: string;
  topicDeclines: string[];
  suppressLesson: boolean;
  updatedAt: string;
};

const SESSION_KEY = "companion-learning-vt-session-v1";
const RETURN_KEY = "companion-learning-vt-return-v1";
const OBS_KEY = "companion-learning-vt-observability-v1";

// ─── Explicit visual request detection ──────────────────────────────────────

const EXPLICIT_VISUAL =
  /\b(show\s+me\s+visually|create\s+a\s+visual|make\s+a\s+visual|map\s+this|diagram\s+this|show\s+how\s+these\s+connect|turn\s+this\s+into\s+a\s+timeline|show\s+me\s+the\s+process|help\s+me\s+see\s+the\s+big\s+picture|visualize\s+this|open\s+a\s+visual|take\s+this\s+to\s+visual\s+thinking|open\s+visual\s+thinking\s+studio|lay\s+this\s+out\s+side\s+by\s+side|show\s+me\s+the\s+big\s+picture)\b/i;

/** "Show me the steps" alone is NOT an explicit visual request (Scenario C). */
export function detectsExplicitLearningVisualRequest(text: string): boolean {
  const t = text.trim();
  if (!t) return false;
  if (EXPLICIT_VISUAL.test(t)) return true;
  // "Make a visual showing…" / "map how … connect"
  if (/\b(make|create|open)\b.+\bvisual\b/i.test(t)) return true;
  if (/\bmap\b.+\b(connect|relationship|funnel|stages)\b/i.test(t)) return true;
  if (/\bshow\s+this\s+visually\b/i.test(t)) return true;
  return false;
}

// ─── Simple / no-recommend heuristics ───────────────────────────────────────

const SIMPLE_FACT =
  /^(what is|what are|what does|how do you spell|define|give me one example|one example of)\b/i;

function isSimpleLearningQuestion(text: string): boolean {
  const t = text.trim();
  if (!t) return false;
  if (SIMPLE_FACT.test(t) && t.split(/\s+/).length <= 14) return true;
  if (/^how do you spell\b/i.test(t)) return true;
  if (/^give me one example\b/i.test(t)) return true;
  return false;
}

function inferPurpose(
  session: LearningSessionSnapshot,
  userRequest: string,
): LearningVisualPurpose {
  const blob = [
    userRequest,
    session.learningGoal,
    session.topic,
    session.relationshipHints.join(" "),
    session.sequenceHints.join(" "),
    session.comparisonHints.join(" "),
  ].join(" ");

  if (/\b(compare|versus|vs\.?|types of|difference)\b/i.test(blob)) {
    return "compare_concepts";
  }
  if (/\b(timeline|chronolog|history|over time)\b/i.test(blob)) {
    return "understand_chronology";
  }
  if (/\b(hierarch|categor|parts of|levels)\b/i.test(blob)) {
    return "understand_hierarchy";
  }
  if (
    /\b(process|stages|steps|launch|sequence|workflow)\b/i.test(blob) ||
    session.sequenceHints.length >= 3
  ) {
    return "learn_a_process";
  }
  if (
    /\b(relate|together|connect|relationship|how .+ work together)\b/i.test(
      blob,
    ) ||
    session.relationshipHints.length >= 2 ||
    session.keyConcepts.length >= 4
  ) {
    return "understand_relationships";
  }
  if (session.learningStage === "reviewing") return "review_key_ideas";
  if (session.incompleteQuestions.length > 0) return "identify_gaps";
  return "see_the_whole";
}

function purposeToCapability(
  purpose: LearningVisualPurpose,
): VisualThinkingCapability {
  switch (purpose) {
    case "compare_concepts":
      return "comparison_visualization";
    case "understand_chronology":
      return "timeline_visualization";
    case "learn_a_process":
    case "understand_sequence":
      return "process_visualization";
    case "understand_relationships":
    case "understand_hierarchy":
    case "see_the_whole":
      return "relationship_visualization";
    case "follow_learning_progression":
    case "reinforce_memory":
    case "review_key_ideas":
    case "identify_gaps":
    default:
      return "learning_visualization";
  }
}

function purposeToPresentation(
  purpose: LearningVisualPurpose,
): VisualThinkingPresentationType {
  switch (purpose) {
    case "compare_concepts":
      return "comparison_view";
    case "understand_chronology":
      return "timeline";
    case "learn_a_process":
    case "understand_sequence":
      return "process_flow";
    case "understand_relationships":
    case "understand_hierarchy":
    case "see_the_whole":
      return "relationship_view";
    default:
      return "training_guide";
  }
}

function userFacingRecommendation(
  purpose: LearningVisualPurpose,
  topic: string,
): string {
  switch (purpose) {
    case "understand_relationships":
      return `There are several ideas in ${topic || "this lesson"} that connect to each other. Seeing those connections may make this easier to understand.`;
    case "learn_a_process":
    case "understand_sequence":
      return "This has a clear sequence. I can lay it out visually so you can see the whole process without holding every step in your head.";
    case "compare_concepts":
      return "These options are easier to hold when you can see them side by side. Would a visual comparison help?";
    default:
      return "You can keep learning here, or I can open a visual view of how these pieces fit together.";
  }
}

// ─── Session suppression ────────────────────────────────────────────────────

function loadSuppression(): SessionSuppression | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as SessionSuppression) : null;
  } catch {
    return null;
  }
}

function saveSuppression(next: SessionSuppression): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(SESSION_KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
}

export function getLearningVisualSuppression(
  learningSessionId: string,
): SessionSuppression {
  const existing = loadSuppression();
  if (existing?.learningSessionId === learningSessionId) return existing;
  return {
    learningSessionId,
    topicDeclines: [],
    suppressLesson: false,
    updatedAt: new Date().toISOString(),
  };
}

export function declineLearningVisualRecommendation(input: {
  learningSessionId: string;
  topic: string;
  notDuringLesson?: boolean;
}): SessionSuppression {
  const prev = getLearningVisualSuppression(input.learningSessionId);
  const topicKey = input.topic.trim().toLowerCase();
  const next: SessionSuppression = {
    ...prev,
    learningSessionId: input.learningSessionId,
    topicDeclines: topicKey
      ? Array.from(new Set([...prev.topicDeclines, topicKey]))
      : prev.topicDeclines,
    suppressLesson: input.notDuringLesson ? true : prev.suppressLesson,
    updatedAt: new Date().toISOString(),
  };
  saveSuppression(next);
  recordLearningVtEvent({
    type: input.notDuringLesson
      ? "lesson_suppress_visuals"
      : "recommendation_declined",
    learningSessionId: input.learningSessionId,
    topic: input.topic,
  });
  // Soft VT preference signal — not a permanent anti-visual preference.
  VisualThinkingService.recordDismiss();
  return next;
}

// ─── Recommendation assessment ──────────────────────────────────────────────

export function assessLearningVisualThinkingRecommendation(input: {
  session: LearningSessionSnapshot;
  userRequest: string;
  /** Has Learning already offered a useful explanation? */
  hasProvidedInitialValue: boolean;
  learnerConfused?: boolean;
}): LearningVisualThinkingRecommendation {
  const { session, userRequest } = input;
  const suppression = getLearningVisualSuppression(session.learningSessionId);
  const topicKey = session.topic.trim().toLowerCase();

  // Shared Recommendation Intelligence owns usefulness; Learning owns pedagogy + lesson suppression.
  const pilot = assessLearningPilotRecommendation({
    session,
    userRequest,
    hasProvidedInitialValue: input.hasProvidedInitialValue,
    learnerConfused: input.learnerConfused,
    lessonSuppressed: suppression.suppressLesson,
    topicDeclined: Boolean(topicKey && suppression.topicDeclines.includes(topicKey)),
  });

  if (detectsExplicitLearningVisualRequest(userRequest) || pilot.shared.explicitlyRequested) {
    const purpose = pilot.learningPurpose;
    return {
      recommended: true,
      confidence: "high",
      reason: "Member explicitly asked for a visual.",
      suggestedPurpose: purpose,
      preferredPresentation: purposeToPresentation(purpose),
      alternativePresentations: ["training_guide", "step_by_step"],
      recommendationTiming: "explicit_request",
      userFacingMessage: "",
      primaryActionLabel: "Show Me Visually",
      keepActionLabel: "Keep Learning Here",
      suppressActionLabel: "Not During This Lesson",
      suppressForSession: false,
      factors: ["explicit_visual_request", ...pilot.shared.factors],
    };
  }

  if (pilot.shared.factors.includes("lesson_suppress")) {
    recordLearningVtEvent({
      type: "repeated_recommendation_suppressed",
      learningSessionId: session.learningSessionId,
      topic: session.topic,
      meta: { reason: "lesson_suppress" },
    });
    return noRecommend("Suppressed for this lesson.", ["lesson_suppress"]);
  }

  if (pilot.shared.factors.includes("topic_declined")) {
    recordLearningVtEvent({
      type: "repeated_recommendation_suppressed",
      learningSessionId: session.learningSessionId,
      topic: session.topic,
      meta: { reason: "topic_declined" },
    });
    return noRecommend("Already declined for this topic.", ["topic_declined"]);
  }

  if (isSimpleLearningQuestion(userRequest)) {
    return noRecommend(
      "A short written answer is clearer than a visual here.",
      ["simple_factual"],
    );
  }

  if (!input.hasProvidedInitialValue && !input.learnerConfused) {
    return noRecommend(
      "Wait until a short explanation is available.",
      ["timing_before_value"],
    );
  }

  // Keyword alone is not enough — require structural signal (Learning + shared readiness).
  const structural =
    session.keyConcepts.length >= 3 ||
    session.relationshipHints.length >= 2 ||
    session.sequenceHints.length >= 3 ||
    session.comparisonHints.length >= 2;
  if (!structural || !pilot.shared.readiness.structureSufficient) {
    return noRecommend(
      "Not enough structure to make a visual helpful yet.",
      ["insufficient_structure", ...pilot.shared.factors],
    );
  }

  // Keep a light platform service signal for compatibility with existing callers.
  const platform = shouldRecommendVisualThinking({
    sourceExperience: "learning",
    primaryGoal: session.learningGoal,
    signalText: userRequest,
    conversationSummary: session.currentExplanation,
    conceptCount: session.keyConcepts.length,
    relationshipCount: session.relationshipHints.length,
    processStepCount: session.sequenceHints.length,
    optionCount: session.comparisonHints.length,
    reasonForRecommendation: userFacingRecommendation(
      pilot.learningPurpose,
      session.topic,
    ),
  });

  const recommended =
    pilot.shared.recommended &&
    (pilot.shared.confidence === "high" ||
      pilot.shared.confidence === "very_high" ||
      platform.shouldRecommend);

  const timing: LearningVisualThinkingRecommendation["recommendationTiming"] =
    !recommended
      ? "none"
      : input.learnerConfused
        ? "on_confusion"
        : session.comparisonHints.length >= 2
          ? "on_complex_comparison"
          : session.sequenceHints.length >= 4
            ? "before_long_sequence"
            : session.learningStage === "reviewing"
              ? "on_review"
              : "after_initial_explanation";

  const purpose = pilot.learningPurpose;
  const result: LearningVisualThinkingRecommendation = {
    recommended,
    confidence:
      pilot.shared.confidence === "very_high" || pilot.shared.confidence === "high"
        ? "high"
        : pilot.shared.confidence === "medium"
          ? "medium"
          : "low",
    reason: recommended
      ? pilot.shared.reasons[0] ??
        "A visual is likely to improve understanding of connected learning content."
      : pilot.shared.cautions[0] ??
        "A visual is unlikely to improve learning right now.",
    suggestedPurpose: recommended ? purpose : null,
    preferredPresentation: recommended
      ? pilot.shared.preferredPresentation ?? purposeToPresentation(purpose)
      : null,
    alternativePresentations: recommended
      ? pilot.shared.eligibleAlternatePresentations.length
        ? pilot.shared.eligibleAlternatePresentations
        : ["training_guide", "step_by_step", "checklist"]
      : [],
    recommendationTiming: timing,
    userFacingMessage: recommended
      ? pilot.shared.userFacingMessage ||
        userFacingRecommendation(purpose, session.topic)
      : "",
    primaryActionLabel: "Show Me Visually",
    keepActionLabel: "Keep Learning Here",
    suppressActionLabel: "Not During This Lesson",
    suppressForSession: false,
    factors: [...pilot.shared.factors, ...platform.factors],
  };

  recordLearningVtEvent({
    type: "recommendation_assessed",
    learningSessionId: session.learningSessionId,
    topic: session.topic,
    meta: {
      recommended,
      sharedConfidence: pilot.shared.confidence,
    },
  });

  return result;
}

function noRecommend(
  reason: string,
  factors: string[],
): LearningVisualThinkingRecommendation {
  return {
    recommended: false,
    confidence: "high",
    reason,
    suggestedPurpose: null,
    preferredPresentation: null,
    alternativePresentations: [],
    recommendationTiming: "none",
    userFacingMessage: "",
    primaryActionLabel: "Show Me Visually",
    keepActionLabel: "Keep Learning Here",
    suppressActionLabel: "Not During This Lesson",
    suppressForSession: false,
    factors,
  };
}

// ─── Adapter ────────────────────────────────────────────────────────────────

export type LearningToVisualThinkingAdapterResult = {
  integrationRequest: LearningVisualThinkingIntegrationRequest;
  /** Build 10 expanded contract — same handoff, richer Learning provenance. */
  integrationRequestV2: LearningVisualThinkingIntegrationRequestV2;
  visualThinkingContext: VisualThinkingRequestContext;
  handoff: VisualThinkingServiceHandoff;
  seedRequestText: string;
  supportingWrittenExplanation: string | null;
  workspaceLearningContext: ReturnType<typeof buildWorkspaceLearningContext>;
  /** Progress must not flip to complete solely because VT opened. */
  preservesLearningProgress: true;
  doesNotMarkLessonComplete: true;
};

/**
 * Prepare Visual Thinking inputs from Learning state.
 * Does not bypass the shared Visual Thinking pipeline.
 */
export function createVisualThinkingContextFromLearning(input: {
  session: LearningSessionSnapshot;
  userRequest: string;
  recommendation: LearningVisualThinkingRecommendation;
  explicitlyRequested: boolean;
  userAcceptedRecommendation: boolean;
}): LearningToVisualThinkingAdapterResult {
  const { session, recommendation } = input;
  const purpose =
    recommendation.suggestedPurpose ?? inferPurpose(session, input.userRequest);

  // Scope knowledge — never pass an unbounded library.
  const scoped = scopeLearningKnowledge(session, purpose);

  const seedRequestText = [
    session.learningGoal,
    session.currentExplanation
      ? `What we've covered so far:\n${session.currentExplanation.slice(0, 800)}`
      : null,
    scoped.length
      ? `Key points:\n${scoped
          .slice(0, 12)
          .map((k) => `- ${k.title}: ${k.content.slice(0, 160)}`)
          .join("\n")}`
      : null,
  ]
    .filter(Boolean)
    .join("\n\n");

  const returnContext: LearningReturnContext = {
    learningSessionId: session.learningSessionId,
    conversationId: session.conversationId,
    topic: session.topic,
    lessonPosition: session.lessonPosition,
    resumePrompt: buildResumePrompt(session),
    returnRoute: "learning_chamber",
  };

  const integrationRequest: LearningVisualThinkingIntegrationRequest = {
    id: newId("lvt"),
    sourceExperience: "learning",
    sourceConversationId: session.conversationId,
    sourceLearningSessionId: session.learningSessionId,
    userRequest: input.userRequest,
    learningTopic: session.topic,
    learningGoal: session.learningGoal,
    successDefinition: session.successDefinition,
    learnerKnowledgeLevel: session.learnerKnowledgeLevel,
    requestedDepth: session.requestedDepth,
    learningStage: session.learningStage,
    learningMode: session.learningMode,
    currentExplanation: session.currentExplanation,
    approvedKnowledgeItemIds: scoped.map((k) => k.id),
    scopedKnowledgeItems: scoped,
    sourceReferences: scoped
      .map((k) => k.sourceReference)
      .filter((s): s is string => Boolean(s)),
    suggestedVisualPurpose: purpose,
    suggestedPresentation:
      recommendation.preferredPresentation ?? purposeToPresentation(purpose),
    recommendationReason: recommendation.reason,
    explicitlyRequested: input.explicitlyRequested,
    userAcceptedRecommendation: input.userAcceptedRecommendation,
    returnContext,
    createdAt: new Date().toISOString(),
    integrationVersion: "learning-vt-pilot-1",
  };

  const visualThinkingContext: VisualThinkingRequestContext = {
    sourceExperience: "learning",
    sourceCompanion: "learning_chamber",
    conversationSummary: session.currentExplanation,
    primaryGoal: session.learningGoal,
    currentTask: session.lessonPosition,
    preferredPresentation: integrationRequest.suggestedPresentation,
    preferredCapability: purposeToCapability(purpose),
    reasonForRecommendation: recommendation.userFacingMessage || recommendation.reason,
    signalText: seedRequestText,
    conceptCount: session.keyConcepts.length,
    relationshipCount: session.relationshipHints.length,
    processStepCount: session.sequenceHints.length,
    optionCount: session.comparisonHints.length,
  };

  const handoff = requestVisualThinkingHandoff(visualThinkingContext, {
    shouldRecommend: true,
    confidence: recommendation.confidence,
    capability: purposeToCapability(purpose),
    preferredPresentation: integrationRequest.suggestedPresentation,
    reason: recommendation.reason,
    invitation: recommendation.userFacingMessage,
    primaryActionLabel: "Open Visual Thinking",
    keepActionLabel: "Keep Learning Here",
    optional: true,
    dismissible: true,
    factors: recommendation.factors,
  });

  // Attach seed that preserves Learning goal (no re-intake).
  const enrichedHandoff: VisualThinkingServiceHandoff = {
    ...handoff,
    seedRequestText,
  };

  const integrationRequestV2 = buildLearningIntegrationRequestV2({
    session,
    userRequest: input.userRequest,
    purpose,
    preferredPresentation: integrationRequest.suggestedPresentation,
    eligibleAlternates: recommendation.alternativePresentations,
    explicitlyRequested: input.explicitlyRequested,
    userAcceptedRecommendation: input.userAcceptedRecommendation,
    recommendationId: null,
  });

  const workspaceLearningContext = buildWorkspaceLearningContext(
    integrationRequestV2,
    session.keyConcepts.slice(0, 8),
    integrationRequest.suggestedPresentation,
  );

  saveReturnContext(returnContext, integrationRequest.id);

  recordLearningVtEvent({
    type: input.explicitlyRequested
      ? "visual_explicitly_requested"
      : "handoff_created",
    learningSessionId: session.learningSessionId,
    topic: session.topic,
    meta: {
      purpose,
      knowledgeItems: scoped.length,
    },
  });

  if (input.userAcceptedRecommendation || input.explicitlyRequested) {
    VisualThinkingService.recordOpen();
    recordLearningVtEvent({
      type: "recommendation_accepted",
      learningSessionId: session.learningSessionId,
      topic: session.topic,
    });
  }

  return {
    integrationRequest,
    integrationRequestV2,
    visualThinkingContext,
    handoff: enrichedHandoff,
    seedRequestText,
    supportingWrittenExplanation: session.currentExplanation,
    workspaceLearningContext,
    preservesLearningProgress: true,
    doesNotMarkLessonComplete: true,
  };
}

/** Supporting written Learning explanation available inside Visual Thinking. */
export function projectSupportingWrittenLearningView(
  adapted: LearningToVisualThinkingAdapterResult,
) {
  return getSupportingWrittenLearningView(adapted.integrationRequestV2);
}

function scopeLearningKnowledge(
  session: LearningSessionSnapshot,
  purpose: LearningVisualPurpose,
): LearningApprovedKnowledgeItem[] {
  const items = session.approvedKnowledgeItems;
  if (items.length === 0) {
    // Synthesize lightweight concept shells from keyConcepts — not a library dump.
    return session.keyConcepts.slice(0, 10).map((c, i) => ({
      id: `concept_${i}_${slug(c)}`,
      title: c,
      content: c,
      kind: "concept" as const,
      sourceReference: "learning_session",
      confidence: "medium" as const,
      verified: false,
    }));
  }

  const relevantKinds = new Set<LearningApprovedKnowledgeItem["kind"]>([
    "concept",
    "definition",
    "example",
  ]);
  if (
    purpose === "understand_relationships" ||
    purpose === "see_the_whole" ||
    purpose === "understand_hierarchy"
  ) {
    relevantKinds.add("relationship");
  }
  if (purpose === "learn_a_process" || purpose === "understand_sequence") {
    relevantKinds.add("step");
  }
  if (purpose === "identify_gaps") {
    relevantKinds.add("question");
    relevantKinds.add("warning");
  }

  const filtered = items.filter((i) => relevantKinds.has(i.kind));
  const deduped = dedupeKnowledge(filtered.length ? filtered : items);
  return deduped.slice(0, 16);
}

function dedupeKnowledge(
  items: LearningApprovedKnowledgeItem[],
): LearningApprovedKnowledgeItem[] {
  const seen = new Set<string>();
  const out: LearningApprovedKnowledgeItem[] = [];
  for (const item of items) {
    const key = `${item.kind}:${item.title.trim().toLowerCase()}:${item.content
      .trim()
      .toLowerCase()
      .slice(0, 80)}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(item);
  }
  return out;
}

// ─── Return / writeback ─────────────────────────────────────────────────────

export function buildLearningReturnFromVisual(input: {
  sourceLearningSessionId: string;
  visualThinkingWorkspaceId: string | null;
  activePresentation?: string | null;
  reviewedKnowledgeItemIds?: string[];
  userCreatedInsightIds?: string[];
  userQuestions?: string[];
  unresolvedAreas?: string[];
  topic?: string | null;
  lessonPosition?: string | null;
}): VisualThinkingLearningReturn {
  const stored = loadReturnContext();
  const topic = input.topic ?? stored?.topic ?? "your lesson";
  const position =
    input.lessonPosition ?? stored?.lessonPosition ?? "where you left off";

  const resumeMessage = `Welcome back. You were looking at ${topic}. Would you like to continue from ${position}, or review one part first?`;

  const result: VisualThinkingLearningReturn = {
    sourceLearningSessionId: input.sourceLearningSessionId,
    visualThinkingWorkspaceId: input.visualThinkingWorkspaceId,
    completed: false,
    activePresentation: input.activePresentation ?? null,
    reviewedKnowledgeItemIds: input.reviewedKnowledgeItemIds ?? [],
    userCreatedInsightIds: input.userCreatedInsightIds ?? [],
    userQuestions: input.userQuestions ?? [],
    unresolvedAreas: input.unresolvedAreas ?? [],
    suggestedLearningResumePoint: position,
    optionalSummary: null,
    userApprovedWritebacks: [],
    resumeMessage,
  };

  recordLearningVtEvent({
    type: "returned_to_learning",
    learningSessionId: input.sourceLearningSessionId,
    topic: topic,
  });

  return result;
}

export function offerLearningInsightWriteback(input: {
  insightId: string;
  kind: LearningVisualInsightWritebackOffer["kind"];
  content: string;
}): LearningVisualInsightWritebackOffer {
  recordLearningVtEvent({
    type: "insight_writeback_offered",
    learningSessionId: loadReturnContext()?.learningSessionId ?? "unknown",
    topic: loadReturnContext()?.topic ?? null,
    meta: { kind: input.kind },
  });
  return {
    insightId: input.insightId,
    kind: input.kind,
    content: input.content,
    choices: [
      "add_to_learning_notes",
      "ask_in_learning",
      "use_as_next_question",
      "keep_only_in_visual",
    ],
    requiresApproval: true,
  };
}

export function approveLearningInsightWriteback(input: {
  offer: LearningVisualInsightWritebackOffer;
  choice: LearningVisualInsightWritebackOffer["choices"][number];
}): {
  approved: boolean;
  writesToLearning: boolean;
  choice: string;
} {
  const writes =
    input.choice === "add_to_learning_notes" ||
    input.choice === "ask_in_learning" ||
    input.choice === "use_as_next_question";
  if (writes) {
    recordLearningVtEvent({
      type: "insight_writeback_approved",
      learningSessionId: loadReturnContext()?.learningSessionId ?? "unknown",
      topic: loadReturnContext()?.topic ?? null,
      meta: { choice: input.choice },
    });
  }
  return {
    approved: writes,
    writesToLearning: writes,
    choice: input.choice,
  };
}

/** Moving nodes / zoom / presentation change never proves mastery. */
export function visualActivityCountsAsLearningEvidence(
  activity:
    | "opened_visual"
    | "moved_object"
    | "changed_zoom"
    | "changed_presentation"
    | "reviewed_major_concepts"
    | "completed_process_walkthrough"
    | "compared_required_options"
    | "answered_reflection",
): boolean {
  return (
    activity === "reviewed_major_concepts" ||
    activity === "completed_process_walkthrough" ||
    activity === "compared_required_options" ||
    activity === "answered_reflection"
  );
}

export function buildLearningVisualFailureRecovery(topic: string): {
  stayInLearning: true;
  message: string;
} {
  recordLearningVtEvent({
    type: "workspace_failed",
    learningSessionId: loadReturnContext()?.learningSessionId ?? "unknown",
    topic,
  });
  return {
    stayInLearning: true,
    message:
      "I wasn’t able to open the visual view, but your lesson is still here. Let’s keep working through it together.",
  };
}

// ─── Persistence helpers ────────────────────────────────────────────────────

function saveReturnContext(
  ctx: LearningReturnContext,
  integrationRequestId: string,
): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(
      RETURN_KEY,
      JSON.stringify({ ...ctx, integrationRequestId }),
    );
  } catch {
    /* ignore */
  }
}

export function loadReturnContext():
  | (LearningReturnContext & { integrationRequestId?: string })
  | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(RETURN_KEY);
    return raw
      ? (JSON.parse(raw) as LearningReturnContext & {
          integrationRequestId?: string;
        })
      : null;
  } catch {
    return null;
  }
}

export function recordLearningVtEvent(
  event: Omit<LearningVtObservabilityEvent, "at"> & { at?: string },
): LearningVtObservabilityEvent {
  const full: LearningVtObservabilityEvent = {
    ...event,
    at: event.at ?? new Date().toISOString(),
  };
  if (typeof window === "undefined") return full;
  try {
    const raw = window.sessionStorage.getItem(OBS_KEY);
    const list: LearningVtObservabilityEvent[] = raw ? JSON.parse(raw) : [];
    list.push(full);
    window.sessionStorage.setItem(
      OBS_KEY,
      JSON.stringify(list.slice(-80)),
    );
  } catch {
    /* ignore */
  }
  return full;
}

export function listLearningVtObservabilityEvents(): LearningVtObservabilityEvent[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.sessionStorage.getItem(OBS_KEY);
    return raw ? (JSON.parse(raw) as LearningVtObservabilityEvent[]) : [];
  } catch {
    return [];
  }
}

export function clearLearningVtPilotSessionState(): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(SESSION_KEY);
    window.sessionStorage.removeItem(RETURN_KEY);
    window.sessionStorage.removeItem(OBS_KEY);
  } catch {
    /* ignore */
  }
}

function buildResumePrompt(session: LearningSessionSnapshot): string {
  if (session.incompleteQuestions[0]) {
    return session.incompleteQuestions[0];
  }
  if (session.lessonPosition) {
    return `Continue with ${session.lessonPosition}`;
  }
  return `Continue learning about ${session.topic}`;
}

function newId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random()
    .toString(36)
    .slice(2, 8)}`;
}

function slug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .slice(0, 32);
}

export {
  SESSION_KEY as LEARNING_VT_SESSION_KEY,
  RETURN_KEY as LEARNING_VT_RETURN_KEY,
  purposeToPresentation,
  purposeToCapability,
  inferPurpose,
};
