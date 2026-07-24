/**
 * Learning Intelligence Pilot Integration (Build 10)
 * Bridges Learning pedagogy ↔ shared Visual Thinking Recommendation + Workspace Editing.
 * Does not duplicate VT generation, research, or map engines.
 */

import {
  assessVisualThinkingRecommendation,
  detectsExplicitVisualThinkingIntent,
  type VisualThinkingRecommendationContext,
  type VisualThinkingRecommendationDecision,
  type VisualThinkingRecommendedPurpose,
} from "@/lib/cartographersStudio/visualThinkingRecommendationIntelligence";
import type { VisualThinkingPresentationType } from "@/lib/cartographersStudio/visualThinkingPresentationIntelligence";
import type {
  CoCreationActionId,
} from "@/lib/cartographersStudio/visualThinkingWorkspaceEditing";
import type {
  LearningApprovedKnowledgeItem,
  LearningReturnContext,
  LearningSessionSnapshot,
  LearningVisualPurpose,
} from "@/lib/learningIntelligence/types";

// ─── Expanded pilot contracts ───────────────────────────────────────────────

export type LearningVisualThinkingIntegrationRequestV2 = {
  id: string;
  sourceExperience: "learning";
  sourceConversationId: string | null;
  sourceLearningSessionId: string;
  sourceLessonId: string | null;
  sourceTopicId: string | null;
  originalUserRequest: string;
  learningTopic: string;
  learningGoal: string;
  learnerQuestion: string | null;
  successDefinition: string | null;
  learnerKnowledgeLevel: LearningSessionSnapshot["learnerKnowledgeLevel"];
  requestedDepth: LearningSessionSnapshot["requestedDepth"];
  learningStage: LearningSessionSnapshot["learningStage"];
  learningMode: LearningSessionSnapshot["learningMode"];
  currentTeachingSummary: string | null;
  conceptsAlreadyIntroduced: string[];
  examplesAlreadyUsed: string[];
  questionsAlreadyAnswered: string[];
  unresolvedConfusion: string[];
  approvedKnowledgeItemIds: string[];
  scopedKnowledgeItems: LearningApprovedKnowledgeItem[];
  sourceReferences: string[];
  confidenceSignals: string[];
  freshnessRequirements: string[];
  requestedVisualPurpose: LearningVisualPurpose;
  preferredPresentation: VisualThinkingPresentationType | null;
  eligibleAlternatePresentations: VisualThinkingPresentationType[];
  explicitlyRequested: boolean;
  recommendationId: string | null;
  userAcceptedRecommendation: boolean;
  currentLearningPosition: string | null;
  learningProgressContext: {
    progressState: LearningSessionSnapshot["progressState"];
    completedLearningSteps: string[];
    lessonPosition: string | null;
  };
  returnContext: LearningReturnContext;
  supportingWrittenExplanation: string | null;
  createdAt: string;
  updatedAt: string;
  integrationVersion: "learning-vt-pilot-2";
};

export type WorkspaceLearningContext = {
  sourceLearningSessionId: string;
  learningTopic: string;
  learningGoal: string;
  learnerKnowledgeLevel: LearningSessionSnapshot["learnerKnowledgeLevel"];
  currentLearningStage: LearningSessionSnapshot["learningStage"];
  selectedConcepts: string[];
  unresolvedQuestions: string[];
  approvedKnowledgeItemIds: string[];
  currentPresentation: string | null;
  supportingWrittenExplanation: string | null;
  returnContext: LearningReturnContext;
};

export type VisualThinkingLearningQuestionHandoff = {
  id: string;
  sourceLearningSessionId: string;
  visualThinkingWorkspaceId: string | null;
  question: string;
  selectedObjectIds: string[];
  selectedObjectSummaries: string[];
  relevantKnowledgeItemIds: string[];
  currentPresentation: string | null;
  userNotes: string[];
  returnToVisualAvailable: boolean;
  createdAt: string;
  handoffVersion: "learning-ask-vt-1";
};

export type VisualThinkingLearningReturnV2 = {
  id: string;
  sourceLearningSessionId: string;
  sourceLessonId: string | null;
  visualThinkingWorkspaceId: string | null;
  activePresentation: string | null;
  reviewedObjectIds: string[];
  expandedObjectIds: string[];
  userQuestionIds: string[];
  userNoteIds: string[];
  unresolvedAreaIds: string[];
  markedConfusingObjectIds: string[];
  optionalSummary: string | null;
  approvedLearningNoteWritebacks: string[];
  requestedResumeAction:
    | "continue_where_i_was"
    | "ask_my_visual_question"
    | "review_a_concept"
    | "continue_next_part"
    | "return_to_visual";
  suggestedLearningResumePoint: string | null;
  resumeMessage: string;
  returnContext: LearningReturnContext;
  completed: false;
  createdAt: string;
  returnVersion: "learning-vt-return-2";
};

export type LearningSelectedObjectAction = {
  id:
    | "explain_this"
    | "simplify_this"
    | "give_example"
    | "show_connections"
    | "compare_this"
    | "teach_this_step"
    | "ask_me_a_question"
    | "research_this"
    | "what_am_i_missing"
    | "add_to_learning_notes"
    | "ask_in_learning";
  label: string;
  coCreationAction?: CoCreationActionId;
  requiresApproval?: boolean;
};

export type LearningNoteWritebackOffer = {
  insightId: string;
  kind: "personal_note" | "question" | "example" | "insight" | "connection" | "confusion";
  content: string;
  provenance: "user_created" | "user_edited" | "platform_generated" | "research_generated";
  choices: Array<
    | "add_to_learning_notes"
    | "ask_about_this_in_learning"
    | "keep_only_in_visual"
    | "review_before_adding"
  >;
  requiresApproval: true;
};

const INTEGRATION_KEY = "companion-learning-vt-integration-v2";
const ASK_KEY = "companion-learning-vt-ask-handoff-v1";
const WORKSPACE_CTX_KEY = "companion-learning-vt-workspace-ctx-v1";

function nowIso(): string {
  return new Date().toISOString();
}

function newId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function mapPurposeToRecommended(
  purpose: LearningVisualPurpose,
): VisualThinkingRecommendedPurpose {
  switch (purpose) {
    case "compare_concepts":
      return "compare_options";
    case "understand_chronology":
      return "understand_chronology";
    case "learn_a_process":
    case "understand_sequence":
      return "understand_sequence";
    case "understand_hierarchy":
      return "understand_hierarchy";
    case "understand_relationships":
      return "understand_relationships";
    case "see_the_whole":
      return "see_the_whole";
    case "identify_gaps":
      return "identify_gaps";
    case "reinforce_memory":
      return "reinforce_learning";
    case "review_key_ideas":
      return "review_progress";
    case "follow_learning_progression":
      return "organize_complex_information";
    default:
      return "reinforce_learning";
  }
}

export function inferLearningVisualPurpose(
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
    /\b(relate|together|connect|relationship|how .+ work together)\b/i.test(blob) ||
    session.relationshipHints.length >= 2 ||
    session.keyConcepts.length >= 4
  ) {
    return "understand_relationships";
  }
  if (session.learningStage === "reviewing") return "review_key_ideas";
  if (session.incompleteQuestions.length > 0) return "identify_gaps";
  return "see_the_whole";
}

/**
 * Build shared Recommendation Intelligence context from Learning state.
 * Scoped — never the entire Learning library.
 */
export function buildLearningRecommendationContext(input: {
  session: LearningSessionSnapshot;
  userRequest: string;
  hasProvidedInitialValue: boolean;
  learnerConfused?: boolean;
}): VisualThinkingRecommendationContext {
  const { session, userRequest } = input;

  return {
    sourceExperience: "learning",
    sourceConversationId: session.conversationId,
    sourceSessionId: session.learningSessionId,
    sourceEntityId: session.learningSessionId,
    userRequest,
    requestSummary: session.topic,
    primaryGoal: session.learningGoal,
    cognitiveTask: "learn",
    currentResponseSummary: session.currentExplanation,
    hasProvidedInitialValue: input.hasProvidedInitialValue,
    approvedKnowledgeItemIds: session.approvedKnowledgeItems
      .slice(0, 16)
      .map((k) => k.id),
    sourceReferences: session.approvedKnowledgeItems
      .map((k) => k.sourceReference)
      .filter((s): s is string => Boolean(s))
      .slice(0, 16),
    conceptCount: Math.max(
      session.keyConcepts.length,
      session.approvedKnowledgeItems.filter((k) => k.kind === "concept").length,
    ),
    relationshipSignals: session.relationshipHints.slice(0, 12),
    sequenceSignals: session.sequenceHints.slice(0, 12),
    chronologySignals: /\b(timeline|history|over time)\b/i.test(userRequest)
      ? session.sequenceHints.slice(0, 8)
      : [],
    comparisonSignals: session.comparisonHints.slice(0, 12),
    decisionSignals: [],
    dependencySignals: [],
    informationVolume:
      session.keyConcepts.length >= 5 ||
      (session.currentExplanation?.length ?? 0) > 400
        ? "high"
        : session.keyConcepts.length >= 3
          ? "medium"
          : "low",
    userConfusionSignals: Boolean(
      input.learnerConfused || session.incompleteQuestions.length > 0,
    ),
    currentInteractionState: input.learnerConfused ? "supporting" : "answering",
    availableVisualPresentations: [
      "relationship_view",
      "process_flow",
      "timeline",
      "comparison_view",
      "training_guide",
      "checklist",
    ],
    adaptivePreferences: {
      stopSuggestingVisuals: false,
    },
    returnContext: {
      sourceExperience: "learning",
      sourceConversationId: session.conversationId,
      sourceSessionId: session.learningSessionId,
      sourceEntityId: session.learningSessionId,
      returnRoute: "learning_chamber",
      resumePrompt: session.incompleteQuestions[0] ?? session.lessonPosition,
      lessonOrStepPosition: session.lessonPosition,
    },
    resultReadiness: {
      eligible:
        session.approvedKnowledgeItems.length >= 2 ||
        session.keyConcepts.length >= 3,
      substantiveContentAvailable:
        session.approvedKnowledgeItems.length >= 2 ||
        session.keyConcepts.length >= 3,
      knowledgeSufficient:
        session.approvedKnowledgeItems.length >= 2 ||
        Boolean(session.currentExplanation),
      structureSufficient:
        session.relationshipHints.length >= 2 ||
        session.sequenceHints.length >= 3 ||
        session.comparisonHints.length >= 2 ||
        session.keyConcepts.length >= 4,
      researchNeeded: false,
      safePartialAvailable: Boolean(session.currentExplanation),
      likelyPresentation: null,
      blockedReasons: [],
    },
  };
}

/**
 * Assess via shared Recommendation Intelligence; Learning supplies pedagogy context only.
 */
export function assessLearningPilotRecommendation(input: {
  session: LearningSessionSnapshot;
  userRequest: string;
  hasProvidedInitialValue: boolean;
  learnerConfused?: boolean;
  lessonSuppressed?: boolean;
  topicDeclined?: boolean;
}): {
  shared: VisualThinkingRecommendationDecision;
  learningPurpose: LearningVisualPurpose;
  invitationVisible: boolean;
} {
  const purpose = inferLearningVisualPurpose(input.session, input.userRequest);
  const explicit =
    detectsExplicitVisualThinkingIntent(input.userRequest) ||
    /\b(take this to visual thinking|open visual thinking studio)\b/i.test(
      input.userRequest,
    );

  if (input.lessonSuppressed && !explicit) {
    const ctx = buildLearningRecommendationContext({
      ...input,
      hasProvidedInitialValue: true,
    });
    const shared = assessVisualThinkingRecommendation({
      ...ctx,
      userRequest: "simple definition only",
      conceptCount: 1,
      relationshipSignals: [],
      hasProvidedInitialValue: true,
    });
    return {
      shared: {
        ...shared,
        recommended: false,
        status: "suppressed",
        factors: [...shared.factors, "lesson_suppress"],
        userFacingMessage: "",
        timing: "do_not_offer",
      },
      learningPurpose: purpose,
      invitationVisible: false,
    };
  }

  if (input.topicDeclined && !explicit) {
    const ctx = buildLearningRecommendationContext(input);
    const shared = assessVisualThinkingRecommendation(ctx);
    return {
      shared: {
        ...shared,
        recommended: false,
        status: "suppressed",
        factors: [...shared.factors, "topic_declined"],
        userFacingMessage: "",
        timing: "do_not_offer",
      },
      learningPurpose: purpose,
      invitationVisible: false,
    };
  }

  const ctx = buildLearningRecommendationContext(input);
  const shared = assessVisualThinkingRecommendation({
    ...ctx,
    // Prefer learning purpose when structure matches
    cognitiveTask: mapPurposeToRecommended(purpose),
  });

  const invitationVisible =
    shared.recommended &&
    !shared.explicitlyRequested &&
    Boolean(shared.userFacingMessage) &&
    shared.timing !== "do_not_offer" &&
    shared.timing !== "immediate_explicit";

  return { shared, learningPurpose: purpose, invitationVisible };
}

export function buildLearningIntegrationRequestV2(input: {
  session: LearningSessionSnapshot;
  userRequest: string;
  purpose: LearningVisualPurpose;
  preferredPresentation: VisualThinkingPresentationType | null;
  eligibleAlternates: VisualThinkingPresentationType[];
  explicitlyRequested: boolean;
  userAcceptedRecommendation: boolean;
  recommendationId: string | null;
  sourceLessonId?: string | null;
  sourceTopicId?: string | null;
}): LearningVisualThinkingIntegrationRequestV2 {
  const { session } = input;
  const scoped = scopeLearningKnowledge(session, input.purpose);
  const examples = session.approvedKnowledgeItems
    .filter((k) => k.kind === "example")
    .map((k) => k.title);
  const returnContext: LearningReturnContext = {
    learningSessionId: session.learningSessionId,
    conversationId: session.conversationId,
    topic: session.topic,
    lessonPosition: session.lessonPosition,
    resumePrompt:
      session.incompleteQuestions[0] ??
      (session.lessonPosition
        ? `Continue with ${session.lessonPosition}`
        : `Continue learning about ${session.topic}`),
    returnRoute: "learning_chamber",
  };

  const request: LearningVisualThinkingIntegrationRequestV2 = {
    id: newId("lvt2"),
    sourceExperience: "learning",
    sourceConversationId: session.conversationId,
    sourceLearningSessionId: session.learningSessionId,
    sourceLessonId: input.sourceLessonId ?? null,
    sourceTopicId: input.sourceTopicId ?? null,
    originalUserRequest: input.userRequest,
    learningTopic: session.topic,
    learningGoal: session.learningGoal,
    learnerQuestion: session.incompleteQuestions[0] ?? null,
    successDefinition: session.successDefinition,
    learnerKnowledgeLevel: session.learnerKnowledgeLevel,
    requestedDepth: session.requestedDepth,
    learningStage: session.learningStage,
    learningMode: session.learningMode,
    currentTeachingSummary: session.currentExplanation,
    conceptsAlreadyIntroduced: session.keyConcepts.slice(0, 20),
    examplesAlreadyUsed: examples.slice(0, 12),
    questionsAlreadyAnswered: session.completedLearningSteps.slice(0, 12),
    unresolvedConfusion: session.incompleteQuestions.slice(0, 8),
    approvedKnowledgeItemIds: scoped.map((k) => k.id),
    scopedKnowledgeItems: scoped,
    sourceReferences: scoped
      .map((k) => k.sourceReference)
      .filter((s): s is string => Boolean(s)),
    confidenceSignals: scoped.map(
      (k) => `${k.title}:${k.confidence ?? "unknown"}`,
    ),
    freshnessRequirements: [],
    requestedVisualPurpose: input.purpose,
    preferredPresentation: input.preferredPresentation,
    eligibleAlternatePresentations: input.eligibleAlternates,
    explicitlyRequested: input.explicitlyRequested,
    recommendationId: input.recommendationId,
    userAcceptedRecommendation: input.userAcceptedRecommendation,
    currentLearningPosition: session.lessonPosition,
    learningProgressContext: {
      progressState: session.progressState,
      completedLearningSteps: [...session.completedLearningSteps],
      lessonPosition: session.lessonPosition,
    },
    returnContext,
    supportingWrittenExplanation: session.currentExplanation,
    createdAt: nowIso(),
    updatedAt: nowIso(),
    integrationVersion: "learning-vt-pilot-2",
  };

  persistLearningIntegrationRequest(request);
  return request;
}

function scopeLearningKnowledge(
  session: LearningSessionSnapshot,
  purpose: LearningVisualPurpose,
): LearningApprovedKnowledgeItem[] {
  const items = session.approvedKnowledgeItems;
  if (items.length === 0) {
    return session.keyConcepts.slice(0, 10).map((c, i) => ({
      id: `concept_${i}`,
      title: c,
      content: c,
      kind: "concept" as const,
      sourceReference: "learning_session",
      confidence: "medium" as const,
      verified: false,
    }));
  }
  const relevant = new Set<LearningApprovedKnowledgeItem["kind"]>([
    "concept",
    "definition",
    "example",
  ]);
  if (
    purpose === "understand_relationships" ||
    purpose === "see_the_whole" ||
    purpose === "understand_hierarchy"
  ) {
    relevant.add("relationship");
  }
  if (purpose === "learn_a_process" || purpose === "understand_sequence") {
    relevant.add("step");
  }
  if (purpose === "identify_gaps") {
    relevant.add("question");
    relevant.add("warning");
  }
  const filtered = items.filter((i) => relevant.has(i.kind));
  const seen = new Set<string>();
  const out: LearningApprovedKnowledgeItem[] = [];
  for (const item of filtered.length ? filtered : items) {
    const key = `${item.kind}:${item.title.trim().toLowerCase()}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(item);
  }
  return out.slice(0, 16);
}

export function buildWorkspaceLearningContext(
  request: LearningVisualThinkingIntegrationRequestV2,
  selectedConcepts: string[] = [],
  currentPresentation: string | null = null,
): WorkspaceLearningContext {
  const ctx: WorkspaceLearningContext = {
    sourceLearningSessionId: request.sourceLearningSessionId,
    learningTopic: request.learningTopic,
    learningGoal: request.learningGoal,
    learnerKnowledgeLevel: request.learnerKnowledgeLevel,
    currentLearningStage: request.learningStage,
    selectedConcepts:
      selectedConcepts.length > 0
        ? selectedConcepts
        : request.conceptsAlreadyIntroduced.slice(0, 8),
    unresolvedQuestions: request.unresolvedConfusion,
    approvedKnowledgeItemIds: request.approvedKnowledgeItemIds,
    currentPresentation,
    supportingWrittenExplanation: request.supportingWrittenExplanation,
    returnContext: request.returnContext,
  };
  persistWorkspaceLearningContext(ctx);
  return ctx;
}

export function projectSelectedLearningActions(): LearningSelectedObjectAction[] {
  return [
    { id: "explain_this", label: "Explain This", coCreationAction: "explain" },
    { id: "simplify_this", label: "Simplify This", coCreationAction: "simplify" },
    { id: "give_example", label: "Give Me an Example", coCreationAction: "show_example" },
    {
      id: "show_connections",
      label: "Show How This Connects",
      coCreationAction: "expand",
    },
    { id: "compare_this", label: "Compare This", coCreationAction: "compare" },
    {
      id: "teach_this_step",
      label: "Teach Me This Step",
      coCreationAction: "teach_me",
    },
    {
      id: "ask_me_a_question",
      label: "Ask Me a Question",
      coCreationAction: "annotate",
    },
    { id: "research_this", label: "Research This", coCreationAction: "research" },
    {
      id: "what_am_i_missing",
      label: "What Am I Missing?",
      coCreationAction: "find_missing_pieces",
    },
    {
      id: "add_to_learning_notes",
      label: "Add to My Learning Notes",
      requiresApproval: true,
    },
    {
      id: "ask_in_learning",
      label: "Ask in Learning",
      requiresApproval: false,
    },
  ];
}

export function createAskInLearningHandoff(input: {
  sourceLearningSessionId: string;
  visualThinkingWorkspaceId: string | null;
  question: string;
  selectedObjectIds: string[];
  selectedObjectSummaries: string[];
  relevantKnowledgeItemIds: string[];
  currentPresentation: string | null;
  userNotes?: string[];
}): VisualThinkingLearningQuestionHandoff {
  const handoff: VisualThinkingLearningQuestionHandoff = {
    id: newId("lask"),
    sourceLearningSessionId: input.sourceLearningSessionId,
    visualThinkingWorkspaceId: input.visualThinkingWorkspaceId,
    question: input.question.trim(),
    selectedObjectIds: input.selectedObjectIds,
    selectedObjectSummaries: input.selectedObjectSummaries,
    relevantKnowledgeItemIds: input.relevantKnowledgeItemIds,
    currentPresentation: input.currentPresentation,
    userNotes: input.userNotes ?? [],
    returnToVisualAvailable: Boolean(input.visualThinkingWorkspaceId),
    createdAt: nowIso(),
    handoffVersion: "learning-ask-vt-1",
  };
  if (typeof window !== "undefined") {
    try {
      window.sessionStorage.setItem(ASK_KEY, JSON.stringify(handoff));
    } catch {
      /* ignore */
    }
  }
  return handoff;
}

export function loadAskInLearningHandoff(): VisualThinkingLearningQuestionHandoff | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(ASK_KEY);
    return raw
      ? (JSON.parse(raw) as VisualThinkingLearningQuestionHandoff)
      : null;
  } catch {
    return null;
  }
}

export function clearAskInLearningHandoff(): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(ASK_KEY);
  } catch {
    /* ignore */
  }
}

export function offerLearningNoteWriteback(input: {
  insightId: string;
  kind: LearningNoteWritebackOffer["kind"];
  content: string;
  provenance: LearningNoteWritebackOffer["provenance"];
}): LearningNoteWritebackOffer {
  return {
    insightId: input.insightId,
    kind: input.kind,
    content: input.content,
    provenance: input.provenance,
    choices: [
      "add_to_learning_notes",
      "ask_about_this_in_learning",
      "keep_only_in_visual",
      "review_before_adding",
    ],
    requiresApproval: true,
  };
}

export function resolveLearningNoteWriteback(input: {
  offer: LearningNoteWritebackOffer;
  choice: LearningNoteWritebackOffer["choices"][number];
}): { writesToLearning: boolean; choice: string; approved: boolean } {
  const writes =
    input.choice === "add_to_learning_notes" ||
    input.choice === "ask_about_this_in_learning";
  return {
    writesToLearning: writes,
    choice: input.choice,
    approved: writes || input.choice === "review_before_adding",
  };
}

export function buildLearningReturnV2(input: {
  request: LearningVisualThinkingIntegrationRequestV2;
  visualThinkingWorkspaceId: string | null;
  activePresentation?: string | null;
  reviewedObjectIds?: string[];
  expandedObjectIds?: string[];
  userQuestionIds?: string[];
  userNoteIds?: string[];
  unresolvedAreaIds?: string[];
  markedConfusingObjectIds?: string[];
  approvedLearningNoteWritebacks?: string[];
  requestedResumeAction?: VisualThinkingLearningReturnV2["requestedResumeAction"];
  pendingQuestion?: string | null;
}): VisualThinkingLearningReturnV2 {
  const position =
    input.request.currentLearningPosition ??
    input.request.returnContext.lessonPosition ??
    "where you left off";
  const topic = input.request.learningTopic;
  const questionBit = input.pendingQuestion
    ? ` You added a question about ${input.pendingQuestion}. Let’s work through that next.`
    : "";

  return {
    id: newId("lvtr"),
    sourceLearningSessionId: input.request.sourceLearningSessionId,
    sourceLessonId: input.request.sourceLessonId,
    visualThinkingWorkspaceId: input.visualThinkingWorkspaceId,
    activePresentation: input.activePresentation ?? null,
    reviewedObjectIds: input.reviewedObjectIds ?? [],
    expandedObjectIds: input.expandedObjectIds ?? [],
    userQuestionIds: input.userQuestionIds ?? [],
    userNoteIds: input.userNoteIds ?? [],
    unresolvedAreaIds: input.unresolvedAreaIds ?? [],
    markedConfusingObjectIds: input.markedConfusingObjectIds ?? [],
    optionalSummary: null,
    approvedLearningNoteWritebacks: input.approvedLearningNoteWritebacks ?? [],
    requestedResumeAction: input.requestedResumeAction ?? "continue_where_i_was",
    suggestedLearningResumePoint: position,
    resumeMessage: `Welcome back. You were looking at ${topic}.${questionBit}`,
    returnContext: input.request.returnContext,
    completed: false,
    createdAt: nowIso(),
    returnVersion: "learning-vt-return-2",
  };
}

/** Opening VT must never mark lesson complete or create a duplicate session. */
export function assertLearningProgressPreserved(
  before: LearningSessionSnapshot,
  afterOpen: LearningSessionSnapshot,
): boolean {
  return (
    before.learningSessionId === afterOpen.learningSessionId &&
    afterOpen.progressState !== "complete" &&
    before.progressState === afterOpen.progressState
  );
}

export function getSupportingWrittenLearningView(
  request: LearningVisualThinkingIntegrationRequestV2,
): {
  available: boolean;
  title: string;
  body: string;
  actions: Array<
    | "open_written_explanation"
    | "return_to_lesson"
    | "review_key_ideas"
    | "ask_shari_about_this"
    | "continue_learning"
  >;
} {
  const body = request.supportingWrittenExplanation?.trim() ?? "";
  return {
    available: body.length > 0,
    title: `Written explanation — ${request.learningTopic}`,
    body,
    actions: [
      "open_written_explanation",
      "return_to_lesson",
      "review_key_ideas",
      "ask_shari_about_this",
      "continue_learning",
    ],
  };
}

export function persistLearningIntegrationRequest(
  request: LearningVisualThinkingIntegrationRequestV2,
): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(INTEGRATION_KEY, JSON.stringify(request));
  } catch {
    /* ignore */
  }
}

export function loadLearningIntegrationRequest(): LearningVisualThinkingIntegrationRequestV2 | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(INTEGRATION_KEY);
    return raw
      ? (JSON.parse(raw) as LearningVisualThinkingIntegrationRequestV2)
      : null;
  } catch {
    return null;
  }
}

export function persistWorkspaceLearningContext(
  ctx: WorkspaceLearningContext,
): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(WORKSPACE_CTX_KEY, JSON.stringify(ctx));
  } catch {
    /* ignore */
  }
}

export function loadWorkspaceLearningContext(): WorkspaceLearningContext | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(WORKSPACE_CTX_KEY);
    return raw ? (JSON.parse(raw) as WorkspaceLearningContext) : null;
  } catch {
    return null;
  }
}

export function clearLearningPilotV2State(): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(INTEGRATION_KEY);
    window.sessionStorage.removeItem(ASK_KEY);
    window.sessionStorage.removeItem(WORKSPACE_CTX_KEY);
  } catch {
    /* ignore */
  }
}

export function learningPilotFailureRecovery(topic: string): {
  stayInLearning: true;
  message: string;
  retryAvailable: true;
} {
  return {
    stayInLearning: true,
    message: `I wasn’t able to prepare the visual view, but your lesson about ${topic || "this topic"} is still here. We can keep working through it together.`,
    retryAvailable: true,
  };
}

export {
  INTEGRATION_KEY as LEARNING_VT_INTEGRATION_KEY,
  ASK_KEY as LEARNING_VT_ASK_KEY,
  WORKSPACE_CTX_KEY as LEARNING_VT_WORKSPACE_CTX_KEY,
};
