/**
 * Visual Thinking Recommendation Intelligence (Build 8).
 * Decides when a visual/structured representation would materially help —
 * optional, calm, dismissible, never promotional, never keyword-only.
 *
 * Does not launch Visual Thinking unless the member explicitly asks or accepts.
 * Routes into the existing Visual Thinking pipeline via integration request.
 */

import type { VisualThinkingCallerId } from "@/lib/cartographersStudio/visualThinkingService";
import {
  getVisualThinkingPreference,
  recordVisualThinkingPreferenceEvent,
  requestVisualThinkingHandoff,
  type VisualThinkingCapability,
  type VisualThinkingRequestContext,
  type VisualThinkingServiceHandoff,
} from "@/lib/cartographersStudio/visualThinkingService";
import type { VisualThinkingPresentationType } from "@/lib/cartographersStudio/visualThinkingPresentationIntelligence";

// ─── Purposes ───────────────────────────────────────────────────────────────

export type VisualThinkingRecommendedPurpose =
  | "understand_relationships"
  | "understand_sequence"
  | "understand_hierarchy"
  | "understand_chronology"
  | "compare_options"
  | "understand_a_system"
  | "see_the_whole"
  | "clarify_dependencies"
  | "explore_cause_and_effect"
  | "support_a_decision"
  | "plan_execution"
  | "reinforce_learning"
  | "organize_complex_information"
  | "identify_gaps"
  | "review_progress"
  | "communicate_to_others";

export type VisualThinkingRecommendationConfidence =
  | "none"
  | "low"
  | "medium"
  | "high"
  | "very_high";

export type VisualThinkingRecommendationTiming =
  | "immediate_explicit"
  | "after_initial_value"
  | "after_structure_emerges"
  | "after_confusion_signal"
  | "before_complex_detail"
  | "during_review"
  | "secondary_action_only"
  | "do_not_offer";

export type VisualThinkingRecommendationStatus =
  | "assessed"
  | "not_recommended"
  | "ready_to_offer"
  | "offered"
  | "accepted"
  | "declined"
  | "suppressed"
  | "expired"
  | "failed";

export type VisualThinkingRecommendationActionId =
  | "show_me_visually"
  | "keep_going_here"
  | "not_during_this_topic";

// ─── Contracts ──────────────────────────────────────────────────────────────

export type VisualThinkingUsefulnessScore = {
  understandingBenefit: number;
  cognitiveLoadReduction: number;
  actionabilityBenefit: number;
  memoryBenefit: number;
  comparisonBenefit: number;
  communicationBenefit: number;
  representationFit: number;
  interruptionCost: number;
  visualComplexityCost: number;
  sourceReadiness: number;
  contentReadiness: number;
  /** Weighted net score 0–100 (internal only). */
  net: number;
};

export type VisualThinkingRecommendationReadiness = {
  eligible: boolean;
  substantiveContentAvailable: boolean;
  knowledgeSufficient: boolean;
  structureSufficient: boolean;
  researchNeeded: boolean;
  safePartialAvailable: boolean;
  likelyPresentation: VisualThinkingPresentationType | null;
  blockedReasons: string[];
};

export type VisualThinkingRecommendationReturnContext = {
  sourceExperience: VisualThinkingCallerId | string;
  sourceConversationId: string | null;
  sourceSessionId: string | null;
  sourceEntityId: string | null;
  resumePrompt: string | null;
  lessonOrStepPosition: string | null;
  returnRoute: string;
};

export type VisualThinkingRecommendationContext = {
  sourceExperience: VisualThinkingCallerId | string;
  sourceConversationId?: string | null;
  sourceSessionId?: string | null;
  sourceEntityId?: string | null;
  userRequest: string;
  requestSummary?: string | null;
  primaryGoal?: string | null;
  cognitiveTask?: string | null;
  currentResponseSummary?: string | null;
  /** Has the source already offered useful written help? */
  hasProvidedInitialValue: boolean;
  approvedKnowledgeItemIds?: string[];
  sourceReferences?: string[];
  conceptCount?: number;
  relationshipSignals?: string[];
  sequenceSignals?: string[];
  chronologySignals?: string[];
  comparisonSignals?: string[];
  decisionSignals?: string[];
  dependencySignals?: string[];
  informationVolume?: "low" | "medium" | "high";
  userConfusionSignals?: boolean;
  currentInteractionState?:
    | "answering"
    | "supporting"
    | "quick_action"
    | "emotional_support"
    | "reviewing"
    | "planning"
    | "unknown";
  availableVisualPresentations?: VisualThinkingPresentationType[];
  resultReadiness?: Partial<VisualThinkingRecommendationReadiness> | null;
  adaptivePreferences?: {
    declineVisualRecommendations?: boolean;
    prefersWritten?: boolean;
    oftenAcceptsVisuals?: boolean;
    stopSuggestingVisuals?: boolean;
  } | null;
  returnContext?: Partial<VisualThinkingRecommendationReturnContext> | null;
  /** Already inside Visual Thinking Studio */
  alreadyInVisualThinkingStudio?: boolean;
  deviceNarrow?: boolean;
};

/** Canonical Build 8 recommendation decision (not the lighter service projection). */
export type VisualThinkingRecommendationDecision = {
  id: string;
  sourceExperience: string;
  sourceConversationId: string | null;
  sourceSessionId: string | null;
  sourceEntityId: string | null;
  topicKey: string;
  requestSummary: string;
  currentGoal: string | null;
  cognitiveTask: string | null;
  recommended: boolean;
  confidence: VisualThinkingRecommendationConfidence;
  usefulnessScore: number;
  usefulness: VisualThinkingUsefulnessScore;
  suggestedPurpose: VisualThinkingRecommendedPurpose | null;
  preferredPresentation: VisualThinkingPresentationType | null;
  eligibleAlternatePresentations: VisualThinkingPresentationType[];
  factors: string[];
  reasons: string[];
  cautions: string[];
  timing: VisualThinkingRecommendationTiming;
  userFacingMessage: string;
  actions: Array<{
    id: VisualThinkingRecommendationActionId;
    label: string;
    primary: boolean;
  }>;
  explicitlyRequested: boolean;
  userAccepted: boolean;
  userDeclined: boolean;
  suppressForTopic: boolean;
  suppressForSession: boolean;
  status: VisualThinkingRecommendationStatus;
  readiness: VisualThinkingRecommendationReadiness;
  createdAt: string;
  updatedAt: string;
  assessedBy: "visual_thinking_recommendation_intelligence";
  assessmentVersion: "vt-rec-1";
};

export type VisualThinkingIntegrationRequest = {
  id: string;
  sourceExperience: string;
  sourceConversationId: string | null;
  sourceSessionId: string | null;
  sourceEntityId: string | null;
  originalUserRequest: string;
  currentGoal: string | null;
  cognitiveTask: string | null;
  requestedVisualPurpose: VisualThinkingRecommendedPurpose | null;
  preferredPresentation: VisualThinkingPresentationType | null;
  approvedKnowledgeItemIds: string[];
  sourceReferences: string[];
  explicitlyRequested: boolean;
  recommendationId: string | null;
  userAcceptedRecommendation: boolean;
  currentProgressContext: string | null;
  returnContext: VisualThinkingRecommendationReturnContext;
  createdAt: string;
  integrationVersion: "vt-rec-integration-1";
};

export type VisualThinkingRecommendationInvitation = {
  visible: boolean;
  mode: "primary_card" | "secondary_action" | "hidden";
  message: string;
  statusText: string;
  actions: VisualThinkingRecommendationDecision["actions"];
  role: "region";
  ariaLabel: string;
};

export type VisualThinkingRecommendationAudit = {
  recommended: boolean;
  confidence: VisualThinkingRecommendationConfidence;
  suggestedPurpose: VisualThinkingRecommendedPurpose | null;
  timing: VisualThinkingRecommendationTiming;
  factors: string[];
  suppressionReason: string | null;
  readiness: VisualThinkingRecommendationReadiness;
  blockedReasons: string[];
  usefulnessNet: number;
  explicitlyRequested: boolean;
};

type SuppressionState = {
  topicKeys: string[];
  sessionSuppress: boolean;
  stopSuggesting: boolean;
  updatedAt: string;
};

const SESSION_KEY = "companion-vt-recommendation-session-v1";
const OBS_KEY = "companion-vt-recommendation-observability-v1";
const ASSESSMENT_VERSION = "vt-rec-1" as const;

export type VisualThinkingRecommendationEvent =
  | "visual_recommendation_assessed"
  | "visual_recommendation_offered"
  | "visual_recommendation_accepted"
  | "visual_recommendation_declined"
  | "visual_recommendation_suppressed"
  | "visual_explicitly_requested"
  | "visual_workspace_opened"
  | "visual_workspace_abandoned"
  | "visual_helpful_confirmed"
  | "visual_not_helpful"
  | "visual_returned_to_source"
  | "visual_alternate_view_used";

// ─── Explicit intent ────────────────────────────────────────────────────────

const EXPLICIT_VISUAL =
  /\b(show\s+me\s+visually|make\s+a\s+visual|create\s+a\s+(?:visual|map|timeline|process\s+flow|comparison)|map\s+this|diagram\s+this|show\s+how\s+these\s+connect|turn\s+this\s+into\s+a\s+timeline|create\s+a\s+process\s+flow|make\s+a\s+comparison\s+view|open\s+visual\s+thinking(?:\s+studio)?|take\s+(?:this|me)\s+to\s+visual\s+thinking(?:\s+studio)?|lay\s+this\s+out\s+visually|help\s+me\s+see\s+the\s+(?:whole|big)\s+picture|visualize\s+this)\b/i;

/**
 * "Show me" alone is not always explicit visual intent.
 * "Show me the steps…" is instructional, not a Visual Thinking authorization.
 */
export function detectsExplicitVisualThinkingIntent(text: string): boolean {
  const t = text.trim();
  if (!t) return false;
  if (EXPLICIT_VISUAL.test(t)) return true;
  if (/\b(make|create|open)\b.+\b(visual|diagram|timeline|process flow)\b/i.test(t)) {
    return true;
  }
  if (/\bmap\b.+\b(connect|relationship|system|business|offers)\b/i.test(t)) {
    return true;
  }
  // "Show me" alone / "show me the steps" — not automatic visual authorization
  if (/^show me\b/i.test(t) && !/\b(visual|map|diagram|timeline|connect)\b/i.test(t)) {
    return false;
  }
  return false;
}

// ─── Simple / emotional / quick-action gates ────────────────────────────────

const SIMPLE_FACT =
  /^(what is|what are|what does|how do you spell|define|give me one example)\b/i;
const QUICK_HOWTO =
  /^how do i\b.+\b(add|change|click|set|edit|update|turn on|turn off)\b/i;
const EMOTIONAL =
  /\b(defeated|hopeless|overwhelmed emotionally|i feel (?:so )?(?:sad|alone|broken|lost)|don't know what to do with (?:my )?life)\b/i;

function isSimpleDefinition(text: string): boolean {
  const t = text.trim();
  return SIMPLE_FACT.test(t) && t.split(/\s+/).length <= 14;
}

function isQuickAction(text: string): boolean {
  return QUICK_HOWTO.test(text.trim()) && text.split(/\s+/).length <= 18;
}

function isEmotionalSupportContext(
  ctx: VisualThinkingRecommendationContext,
): boolean {
  if (ctx.currentInteractionState === "emotional_support") return true;
  if (ctx.currentInteractionState === "quick_action") return true;
  const blob = `${ctx.userRequest} ${ctx.requestSummary ?? ""}`;
  return EMOTIONAL.test(blob);
}

// ─── Purpose inference (structure-first) ────────────────────────────────────

export function inferRecommendedVisualPurpose(
  ctx: VisualThinkingRecommendationContext,
): VisualThinkingRecommendedPurpose {
  const rel = ctx.relationshipSignals?.length ?? 0;
  const seq = ctx.sequenceSignals?.length ?? 0;
  const chron = ctx.chronologySignals?.length ?? 0;
  const cmp = ctx.comparisonSignals?.length ?? 0;
  const dep = ctx.dependencySignals?.length ?? 0;
  const dec = ctx.decisionSignals?.length ?? 0;
  const concepts = ctx.conceptCount ?? 0;
  const blob = [
    ctx.userRequest,
    ctx.primaryGoal,
    ctx.cognitiveTask,
    ...(ctx.relationshipSignals ?? []),
    ...(ctx.sequenceSignals ?? []),
  ]
    .filter(Boolean)
    .join(" ");

  if (cmp >= 2 || (/\b(compare|versus|vs\.?|trade.?off)\b/i.test(blob) && cmp >= 1)) {
    return "compare_options";
  }
  if (chron >= 2 || /\b(timeline|chronolog|history|over time)\b/i.test(blob)) {
    return "understand_chronology";
  }
  if (dep >= 2 || /\b(block|dependency|dependencies|blocking)\b/i.test(blob)) {
    return "clarify_dependencies";
  }
  if (dec >= 2 || /\b(decide|decision|choose between)\b/i.test(blob)) {
    return "support_a_decision";
  }
  if (seq >= 3 || /\b(process|stages|steps|workflow|sequence)\b/i.test(blob)) {
    return "understand_sequence";
  }
  if (rel >= 2 || concepts >= 4 || /\b(connect|relate|together|system)\b/i.test(blob)) {
    return "understand_relationships";
  }
  if (/\b(teach|explain to|communicate)\b/i.test(blob)) {
    return "communicate_to_others";
  }
  if (ctx.userConfusionSignals) return "organize_complex_information";
  return "see_the_whole";
}

function purposeToPresentation(
  purpose: VisualThinkingRecommendedPurpose,
): VisualThinkingPresentationType {
  switch (purpose) {
    case "compare_options":
      return "comparison_view";
    case "understand_chronology":
      return "timeline";
    case "understand_sequence":
    case "plan_execution":
      return "process_flow";
    case "support_a_decision":
      return "decision_tree";
    case "clarify_dependencies":
    case "understand_relationships":
    case "understand_a_system":
    case "see_the_whole":
    case "explore_cause_and_effect":
      return "relationship_view";
    case "reinforce_learning":
      return "training_guide";
    default:
      return "guided_reading";
  }
}

function purposeToCapability(
  purpose: VisualThinkingRecommendedPurpose,
): VisualThinkingCapability {
  switch (purpose) {
    case "compare_options":
      return "comparison_visualization";
    case "understand_chronology":
      return "timeline_visualization";
    case "understand_sequence":
    case "plan_execution":
      return "process_visualization";
    case "support_a_decision":
      return "decision_visualization";
    case "clarify_dependencies":
      return "execution_visualization";
    case "reinforce_learning":
      return "learning_visualization";
    default:
      return "relationship_visualization";
  }
}

// ─── Readiness ──────────────────────────────────────────────────────────────

export function assessVisualThinkingRecommendationReadiness(
  ctx: VisualThinkingRecommendationContext,
  purpose: VisualThinkingRecommendedPurpose,
): VisualThinkingRecommendationReadiness {
  const blocked: string[] = [];
  const concepts = ctx.conceptCount ?? 0;
  const rel = ctx.relationshipSignals?.length ?? 0;
  const seq = ctx.sequenceSignals?.length ?? 0;
  const chron = ctx.chronologySignals?.length ?? 0;
  const cmp = ctx.comparisonSignals?.length ?? 0;
  const dep = ctx.dependencySignals?.length ?? 0;
  const knowledgeIds = ctx.approvedKnowledgeItemIds?.length ?? 0;
  const override = ctx.resultReadiness;

  const structureSufficient =
    concepts >= 3 ||
    rel >= 2 ||
    seq >= 3 ||
    chron >= 2 ||
    cmp >= 2 ||
    dep >= 2 ||
    Boolean(override?.structureSufficient);

  const knowledgeSufficient =
    knowledgeIds >= 2 ||
    structureSufficient ||
    Boolean(override?.knowledgeSufficient);

  const researchNeeded = Boolean(
    override?.researchNeeded ||
      /\b(research|current|latest|best .+ for)\b/i.test(ctx.userRequest),
  );

  // Empty / central-node-only / request-echo cannot be recommended as optional.
  if (!structureSufficient) {
    blocked.push("insufficient_structure");
  }
  if (concepts === 1 && rel === 0 && seq === 0 && cmp === 0) {
    blocked.push("central_node_only_risk");
  }
  if (!knowledgeSufficient && !researchNeeded) {
    blocked.push("knowledge_insufficient");
  }

  const cleanedBlocked = researchNeeded
    ? blocked.filter((b) => b !== "knowledge_insufficient")
    : blocked;

  const substantiveContentAvailable =
    structureSufficient &&
    (knowledgeSufficient || researchNeeded) &&
    !cleanedBlocked.includes("central_node_only_risk");

  const eligible =
    Boolean(override?.eligible ?? true) &&
    substantiveContentAvailable &&
    cleanedBlocked.length === 0;

  return {
    eligible,
    substantiveContentAvailable,
    knowledgeSufficient,
    structureSufficient,
    researchNeeded,
    safePartialAvailable:
      Boolean(override?.safePartialAvailable) ||
      (researchNeeded && structureSufficient),
    likelyPresentation: purposeToPresentation(purpose),
    blockedReasons: cleanedBlocked,
  };
}

// ─── Usefulness scoring ─────────────────────────────────────────────────────

function clamp01(n: number): number {
  return Math.max(0, Math.min(10, n));
}

export function scoreVisualThinkingUsefulness(
  ctx: VisualThinkingRecommendationContext,
  purpose: VisualThinkingRecommendedPurpose,
  readiness: VisualThinkingRecommendationReadiness,
): VisualThinkingUsefulnessScore {
  const concepts = ctx.conceptCount ?? 0;
  const rel = ctx.relationshipSignals?.length ?? 0;
  const seq = ctx.sequenceSignals?.length ?? 0;
  const chron = ctx.chronologySignals?.length ?? 0;
  const cmp = ctx.comparisonSignals?.length ?? 0;
  const dep = ctx.dependencySignals?.length ?? 0;
  const vol = ctx.informationVolume ?? "medium";

  const understandingBenefit = clamp01(
    (concepts >= 4 ? 4 : concepts >= 3 ? 3 : 0) +
      (rel >= 2 ? 4 : 0) +
      (seq >= 3 ? 3 : 0) +
      (chron >= 2 ? 3 : 0) +
      (ctx.userConfusionSignals ? 2 : 0),
  );
  const cognitiveLoadReduction = clamp01(
    (vol === "high" ? 4 : vol === "medium" ? 2 : 0) +
      (concepts + seq + cmp >= 8 ? 4 : concepts + seq >= 5 ? 3 : 0) +
      (dep >= 2 ? 3 : 0),
  );
  const actionabilityBenefit = clamp01(
    purpose === "plan_execution" || purpose === "clarify_dependencies"
      ? 4
      : purpose === "support_a_decision"
        ? 3
        : seq >= 3
          ? 3
          : 1,
  );
  const memoryBenefit = clamp01(
    purpose === "reinforce_learning" || purpose === "understand_relationships"
      ? 4
      : concepts >= 4
        ? 3
        : 1,
  );
  const comparisonBenefit = clamp01(cmp >= 2 ? 6 : cmp === 1 ? 2 : 0);
  const communicationBenefit = clamp01(
    purpose === "communicate_to_others" ? 4 : 2,
  );
  const representationFit = clamp01(
    readiness.structureSufficient ? 7 : readiness.safePartialAvailable ? 3 : 0,
  );
  const interruptionCost = clamp01(
    !ctx.hasProvidedInitialValue
      ? 5
      : ctx.currentInteractionState === "quick_action"
        ? 7
        : ctx.deviceNarrow
          ? 2
          : 1,
  );
  const visualComplexityCost = clamp01(
    concepts + seq + cmp > 14 ? 3 : concepts + seq > 10 ? 2 : 0,
  );
  const sourceReadiness = clamp01(ctx.hasProvidedInitialValue ? 7 : 2);
  const contentReadiness = clamp01(
    readiness.eligible || readiness.structureSufficient
      ? 7
      : readiness.safePartialAvailable
        ? 3
        : 0,
  );

  const benefits =
    understandingBenefit +
    cognitiveLoadReduction +
    actionabilityBenefit +
    memoryBenefit +
    comparisonBenefit +
    communicationBenefit +
    representationFit +
    sourceReadiness +
    contentReadiness;
  const costs = interruptionCost + visualComplexityCost;
  // Structured multi-piece content should clear the high-confidence band.
  const net = Math.max(
    0,
    Math.min(100, Math.round(((benefits - costs) / 70) * 100)),
  );

  return {
    understandingBenefit,
    cognitiveLoadReduction,
    actionabilityBenefit,
    memoryBenefit,
    comparisonBenefit,
    communicationBenefit,
    representationFit,
    interruptionCost,
    visualComplexityCost,
    sourceReadiness,
    contentReadiness,
    net,
  };
}

function confidenceFromScore(
  net: number,
  factors: string[],
): VisualThinkingRecommendationConfidence {
  if (factors.includes("explicit_visual_request")) return "very_high";
  if (net >= 68) return "very_high";
  if (net >= 48) return "high";
  if (net >= 32) return "medium";
  if (net >= 16) return "low";
  return "none";
}

// ─── Topic key + suppression ────────────────────────────────────────────────

export function buildVisualThinkingTopicKey(
  ctx: VisualThinkingRecommendationContext,
  purpose: VisualThinkingRecommendedPurpose | null,
): string {
  const parts = [
    ctx.sourceExperience,
    ctx.sourceSessionId ?? "session",
    ctx.sourceEntityId ?? "entity",
    (ctx.primaryGoal ?? ctx.requestSummary ?? ctx.userRequest)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .slice(0, 48),
    purpose ?? "none",
  ];
  return parts.join(":");
}

function loadSuppression(): SuppressionState {
  if (typeof window === "undefined") {
    return {
      topicKeys: [],
      sessionSuppress: false,
      stopSuggesting: false,
      updatedAt: new Date(0).toISOString(),
    };
  }
  try {
    const raw = window.sessionStorage.getItem(SESSION_KEY);
    return raw
      ? (JSON.parse(raw) as SuppressionState)
      : {
          topicKeys: [],
          sessionSuppress: false,
          stopSuggesting: false,
          updatedAt: new Date(0).toISOString(),
        };
  } catch {
    return {
      topicKeys: [],
      sessionSuppress: false,
      stopSuggesting: false,
      updatedAt: new Date(0).toISOString(),
    };
  }
}

function saveSuppression(next: SuppressionState): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(SESSION_KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
}

export function declineVisualThinkingRecommendation(input: {
  topicKey: string;
  notDuringTopic?: boolean;
  stopSuggesting?: boolean;
}): SuppressionState {
  const prev = loadSuppression();
  const next: SuppressionState = {
    topicKeys: input.notDuringTopic
      ? Array.from(new Set([...prev.topicKeys, input.topicKey]))
      : Array.from(new Set([...prev.topicKeys, input.topicKey])),
    sessionSuppress: input.stopSuggesting ? true : prev.sessionSuppress,
    stopSuggesting: input.stopSuggesting ? true : prev.stopSuggesting,
    updatedAt: new Date().toISOString(),
  };
  saveSuppression(next);
  recordVisualThinkingPreferenceEvent("dismiss");
  recordRecommendationEvent({
    type: input.stopSuggesting
      ? "visual_recommendation_suppressed"
      : "visual_recommendation_declined",
    topicKey: input.topicKey,
  });
  return next;
}

export function clearVisualThinkingRecommendationSession(): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(SESSION_KEY);
    window.sessionStorage.removeItem(OBS_KEY);
  } catch {
    /* ignore */
  }
}

// ─── User-facing messages ───────────────────────────────────────────────────

export function buildRecommendationUserFacingMessage(
  purpose: VisualThinkingRecommendedPurpose,
  ctx: VisualThinkingRecommendationContext,
): string {
  switch (purpose) {
    case "understand_sequence":
    case "plan_execution":
      return "This has several stages, and a few depend on what happens earlier. I can lay it out so you can see the whole process.";
    case "understand_relationships":
    case "understand_a_system":
    case "see_the_whole":
      return "These ideas connect in a few different ways. Seeing those connections may make the big picture clearer.";
    case "compare_options":
      return "There are several options and tradeoffs here. A side-by-side view may make the differences easier to weigh.";
    case "understand_chronology":
      return "This unfolds over time. I can place the events in order so the progression is easier to follow.";
    case "clarify_dependencies":
      return "A few pieces appear to be blocking others. A dependency view may help you see where things are getting stuck.";
    case "support_a_decision":
      return "This decision has several moving pieces. Seeing the tradeoffs side by side may make the choice clearer.";
    case "reinforce_learning":
    case "organize_complex_information":
      return "There are several parts here that interact in different ways. Seeing those relationships may make this much easier to understand.";
    default:
      return ctx.primaryGoal
        ? `Seeing ${ctx.primaryGoal} laid out visually may make it easier to hold.`
        : "Seeing this laid out visually may make it easier to understand.";
  }
}

// ─── Core assessment ────────────────────────────────────────────────────────

function emptyUsefulness(): VisualThinkingUsefulnessScore {
  return {
    understandingBenefit: 0,
    cognitiveLoadReduction: 0,
    actionabilityBenefit: 0,
    memoryBenefit: 0,
    comparisonBenefit: 0,
    communicationBenefit: 0,
    representationFit: 0,
    interruptionCost: 0,
    visualComplexityCost: 0,
    sourceReadiness: 0,
    contentReadiness: 0,
    net: 0,
  };
}

function notRecommended(
  ctx: VisualThinkingRecommendationContext,
  partial: Partial<VisualThinkingRecommendationDecision> & {
    reasons: string[];
    factors: string[];
    status: VisualThinkingRecommendationStatus;
    timing?: VisualThinkingRecommendationTiming;
  },
): VisualThinkingRecommendationDecision {
  const purpose = inferRecommendedVisualPurpose(ctx);
  const topicKey = buildVisualThinkingTopicKey(ctx, purpose);
  const now = new Date().toISOString();
  return {
    id: newId("vtr"),
    sourceExperience: String(ctx.sourceExperience),
    sourceConversationId: ctx.sourceConversationId ?? null,
    sourceSessionId: ctx.sourceSessionId ?? null,
    sourceEntityId: ctx.sourceEntityId ?? null,
    topicKey,
    requestSummary: ctx.requestSummary ?? ctx.userRequest.slice(0, 160),
    currentGoal: ctx.primaryGoal ?? null,
    cognitiveTask: ctx.cognitiveTask ?? null,
    recommended: false,
    confidence: partial.confidence ?? "none",
    usefulnessScore: partial.usefulnessScore ?? 0,
    usefulness: partial.usefulness ?? emptyUsefulness(),
    suggestedPurpose: partial.suggestedPurpose ?? null,
    preferredPresentation: null,
    eligibleAlternatePresentations: [],
    factors: partial.factors,
    reasons: partial.reasons,
    cautions: partial.cautions ?? [],
    timing: partial.timing ?? "do_not_offer",
    userFacingMessage: "",
    actions: defaultActions(),
    explicitlyRequested: false,
    userAccepted: false,
    userDeclined: false,
    suppressForTopic: Boolean(partial.suppressForTopic),
    suppressForSession: Boolean(partial.suppressForSession),
    status: partial.status,
    readiness: partial.readiness ?? {
      eligible: false,
      substantiveContentAvailable: false,
      knowledgeSufficient: false,
      structureSufficient: false,
      researchNeeded: false,
      safePartialAvailable: false,
      likelyPresentation: null,
      blockedReasons: partial.reasons,
    },
    createdAt: now,
    updatedAt: now,
    assessedBy: "visual_thinking_recommendation_intelligence",
    assessmentVersion: ASSESSMENT_VERSION,
  };
}

function defaultActions(): VisualThinkingRecommendationDecision["actions"] {
  return [
    { id: "show_me_visually", label: "Show Me Visually", primary: true },
    { id: "keep_going_here", label: "Keep Going Here", primary: false },
    {
      id: "not_during_this_topic",
      label: "Not During This Topic",
      primary: false,
    },
  ];
}

/**
 * Canonical assessment: would Visual Thinking materially help?
 * Keywords may contribute evidence; they never control the decision alone.
 */
export function assessVisualThinkingRecommendation(
  ctx: VisualThinkingRecommendationContext,
): VisualThinkingRecommendationDecision {
  const factors: string[] = [];
  const reasons: string[] = [];
  const cautions: string[] = [];
  const now = new Date().toISOString();
  const explicit = detectsExplicitVisualThinkingIntent(ctx.userRequest);
  const purpose = inferRecommendedVisualPurpose(ctx);
  const topicKey = buildVisualThinkingTopicKey(ctx, purpose);
  const suppression = loadSuppression();
  const prefs = getVisualThinkingPreference();
  const adaptive = ctx.adaptivePreferences;

  if (explicit) {
    const readiness = assessVisualThinkingRecommendationReadiness(ctx, purpose);
    const usefulness = scoreVisualThinkingUsefulness(ctx, purpose, readiness);
    const rec: VisualThinkingRecommendationDecision = {
      id: newId("vtr"),
      sourceExperience: String(ctx.sourceExperience),
      sourceConversationId: ctx.sourceConversationId ?? null,
      sourceSessionId: ctx.sourceSessionId ?? null,
      sourceEntityId: ctx.sourceEntityId ?? null,
      topicKey,
      requestSummary: ctx.requestSummary ?? ctx.userRequest.slice(0, 160),
      currentGoal: ctx.primaryGoal ?? null,
      cognitiveTask: ctx.cognitiveTask ?? null,
      recommended: true,
      confidence: "very_high",
      usefulnessScore: Math.max(usefulness.net, 80),
      usefulness,
      suggestedPurpose: purpose,
      preferredPresentation: purposeToPresentation(purpose),
      eligibleAlternatePresentations: [
        "guided_reading",
        "step_by_step",
        "checklist",
      ],
      factors: ["explicit_visual_request", ...readiness.blockedReasons],
      reasons: ["Member explicitly asked for a visual experience."],
      cautions: readiness.blockedReasons.length
        ? ["Structure may be partial — pipeline will recover honestly."]
        : [],
      timing: "immediate_explicit",
      userFacingMessage: "",
      actions: defaultActions(),
      explicitlyRequested: true,
      userAccepted: true,
      userDeclined: false,
      suppressForTopic: false,
      suppressForSession: false,
      status: "ready_to_offer",
      readiness: {
        ...readiness,
        // Explicit intent still proceeds; pipeline handles insufficient structure.
        eligible: true,
      },
      createdAt: now,
      updatedAt: now,
      assessedBy: "visual_thinking_recommendation_intelligence",
      assessmentVersion: ASSESSMENT_VERSION,
    };
    recordRecommendationEvent({
      type: "visual_explicitly_requested",
      topicKey,
    });
    return rec;
  }

  if (ctx.alreadyInVisualThinkingStudio) {
    return notRecommended(ctx, {
      reasons: ["Already in Visual Thinking Studio."],
      factors: ["already_in_studio"],
      status: "not_recommended",
    });
  }

  if (
    adaptive?.stopSuggestingVisuals ||
    adaptive?.declineVisualRecommendations ||
    suppression.stopSuggesting ||
    suppression.sessionSuppress
  ) {
    recordRecommendationEvent({
      type: "visual_recommendation_suppressed",
      topicKey,
      meta: { reason: "preference_or_session" },
    });
    return notRecommended(ctx, {
      reasons: ["Optional visuals are suppressed by preference or session."],
      factors: ["preference_suppress"],
      status: "suppressed",
    });
  }

  if (suppression.topicKeys.includes(topicKey)) {
    recordRecommendationEvent({
      type: "visual_recommendation_suppressed",
      topicKey,
      meta: { reason: "topic_declined" },
    });
    return notRecommended(ctx, {
      reasons: ["Already declined for this topic."],
      factors: ["topic_declined"],
      status: "suppressed",
      suppressForTopic: true,
    });
  }

  if (adaptive?.prefersWritten || prefs.profile === "prefers_written") {
    factors.push("prefers_written");
  }

  if (isEmotionalSupportContext(ctx)) {
    return notRecommended(ctx, {
      reasons: ["Emotional support is the priority — not information structure."],
      factors: ["emotional_support"],
      status: "not_recommended",
    });
  }

  if (isSimpleDefinition(ctx.userRequest)) {
    return notRecommended(ctx, {
      reasons: ["A short written definition is clearer than a visual."],
      factors: ["simple_definition"],
      status: "not_recommended",
    });
  }

  if (isQuickAction(ctx.userRequest) || ctx.currentInteractionState === "quick_action") {
    return notRecommended(ctx, {
      reasons: ["A quick action needs concise instructions, not a visual switch."],
      factors: ["quick_action"],
      status: "not_recommended",
    });
  }

  // Keyword-only trap: "compare" without comparison structure → no recommend
  const compareKeywordOnly =
    /\bcompare\b/i.test(ctx.userRequest) &&
    (ctx.comparisonSignals?.length ?? 0) < 2 &&
    (ctx.conceptCount ?? 0) < 3;

  const readiness = assessVisualThinkingRecommendationReadiness(ctx, purpose);
  const usefulness = scoreVisualThinkingUsefulness(ctx, purpose, readiness);

  if (ctx.conceptCount && ctx.conceptCount >= 4) factors.push("many_concepts");
  if ((ctx.relationshipSignals?.length ?? 0) >= 2) factors.push("relationships");
  if ((ctx.sequenceSignals?.length ?? 0) >= 3) factors.push("long_sequence");
  if ((ctx.comparisonSignals?.length ?? 0) >= 2) factors.push("comparison");
  if ((ctx.dependencySignals?.length ?? 0) >= 2) factors.push("dependencies");
  if ((ctx.chronologySignals?.length ?? 0) >= 2) factors.push("chronology");
  if (ctx.userConfusionSignals) factors.push("confusion");
  if (adaptive?.oftenAcceptsVisuals || prefs.profile === "likes_visual") {
    factors.push("prior_visual_acceptance");
    usefulness.net = Math.min(100, usefulness.net + 5);
  }
  if (compareKeywordOnly && !readiness.structureSufficient) {
    return notRecommended(ctx, {
      reasons: [
        "The word “compare” appeared, but there is not enough structure for a useful visual comparison.",
      ],
      factors: [...factors, "keyword_insufficient"],
      status: "not_recommended",
    });
  }

  if (!readiness.eligible && !readiness.safePartialAvailable) {
    return notRecommended(ctx, {
      reasons: readiness.blockedReasons.length
        ? readiness.blockedReasons
        : ["A substantive visual cannot be built from available content."],
      factors: [...factors, "readiness_blocked"],
      status: "not_recommended",
      readiness,
    });
  }

  // Initial value gate for optional recommendations
  if (!ctx.hasProvidedInitialValue && !ctx.userConfusionSignals) {
    return notRecommended(ctx, {
      reasons: ["Provide useful help before offering an optional visual."],
      factors: [...factors, "timing_before_value"],
      status: "assessed",
      timing: "after_initial_value",
      readiness,
      usefulness,
      usefulnessScore: usefulness.net,
      suggestedPurpose: purpose,
    });
  }

  const confidence = confidenceFromScore(usefulness.net, factors);
  let timing: VisualThinkingRecommendationTiming = "after_initial_value";
  if (ctx.userConfusionSignals) timing = "after_confusion_signal";
  else if ((ctx.sequenceSignals?.length ?? 0) >= 5) timing = "before_complex_detail";
  else if (ctx.currentInteractionState === "reviewing") timing = "during_review";
  else if (confidence === "medium") timing = "secondary_action_only";

  // Policy: medium → secondary only; low/none → do not recommend
  const mayOffer =
    confidence === "very_high" ||
    confidence === "high" ||
    (confidence === "medium" && timing === "secondary_action_only");

  if (confidence === "low" || confidence === "none" || !mayOffer) {
    return notRecommended(ctx, {
      reasons: ["Usefulness is not high enough to interrupt with a visual invitation."],
      factors: [...factors, `confidence:${confidence}`],
      status: "not_recommended",
      timing: "do_not_offer",
      readiness,
      usefulness,
      usefulnessScore: usefulness.net,
      confidence,
      suggestedPurpose: purpose,
    });
  }

  if (!readiness.structureSufficient) {
    cautions.push("Structure is limited — invitation withheld until more pieces exist.");
    return notRecommended(ctx, {
      reasons: ["Not enough connected structure for a meaningful visual."],
      factors: [...factors, "insufficient_structure"],
      status: "not_recommended",
      readiness,
    });
  }

  reasons.push(
    "A visual representation is likely to reduce cognitive effort for this content.",
  );

  const rec: VisualThinkingRecommendationDecision = {
    id: newId("vtr"),
    sourceExperience: String(ctx.sourceExperience),
    sourceConversationId: ctx.sourceConversationId ?? null,
    sourceSessionId: ctx.sourceSessionId ?? null,
    sourceEntityId: ctx.sourceEntityId ?? null,
    topicKey,
    requestSummary: ctx.requestSummary ?? ctx.userRequest.slice(0, 160),
    currentGoal: ctx.primaryGoal ?? null,
    cognitiveTask: ctx.cognitiveTask ?? null,
    recommended: true,
    confidence,
    usefulnessScore: usefulness.net,
    usefulness,
    suggestedPurpose: purpose,
    preferredPresentation: purposeToPresentation(purpose),
    eligibleAlternatePresentations: [
      "guided_reading",
      "step_by_step",
      "checklist",
    ],
    factors,
    reasons,
    cautions,
    timing,
    userFacingMessage: buildRecommendationUserFacingMessage(purpose, ctx),
    actions: defaultActions(),
    explicitlyRequested: false,
    userAccepted: false,
    userDeclined: false,
    suppressForTopic: false,
    suppressForSession: false,
    status: confidence === "medium" ? "ready_to_offer" : "ready_to_offer",
    readiness,
    createdAt: now,
    updatedAt: now,
    assessedBy: "visual_thinking_recommendation_intelligence",
    assessmentVersion: ASSESSMENT_VERSION,
  };

  recordRecommendationEvent({
    type: "visual_recommendation_assessed",
    topicKey,
    meta: { recommended: true, confidence, net: usefulness.net },
  });

  return rec;
}

export function projectVisualThinkingRecommendationInvitation(
  recommendation: VisualThinkingRecommendationDecision,
): VisualThinkingRecommendationInvitation {
  if (
    !recommendation.recommended ||
    recommendation.explicitlyRequested ||
    !recommendation.userFacingMessage ||
    recommendation.timing === "do_not_offer"
  ) {
    return {
      visible: false,
      mode: "hidden",
      message: "",
      statusText: "",
      actions: [],
      role: "region",
      ariaLabel: "Visual thinking invitation",
    };
  }

  const mode =
    recommendation.timing === "secondary_action_only" ||
    recommendation.confidence === "medium"
      ? "secondary_action"
      : "primary_card";

  return {
    visible: true,
    mode,
    message: recommendation.userFacingMessage,
    statusText:
      "Optional visual view available. You can keep going here or open a visual.",
    actions:
      mode === "secondary_action"
        ? recommendation.actions.filter((a) => a.id !== "not_during_this_topic")
        : recommendation.actions,
    role: "region",
    ariaLabel: "Optional visual thinking invitation",
  };
}

export function projectVisualThinkingRecommendationAudit(
  recommendation: VisualThinkingRecommendationDecision,
): VisualThinkingRecommendationAudit {
  return {
    recommended: recommendation.recommended,
    confidence: recommendation.confidence,
    suggestedPurpose: recommendation.suggestedPurpose,
    timing: recommendation.timing,
    factors: recommendation.factors,
    suppressionReason: recommendation.factors.includes("topic_declined")
      ? "topic_declined"
      : recommendation.factors.includes("preference_suppress")
        ? "preference_suppress"
        : recommendation.status === "suppressed"
          ? "suppressed"
          : null,
    readiness: recommendation.readiness,
    blockedReasons: recommendation.readiness.blockedReasons,
    usefulnessNet: recommendation.usefulnessScore,
    explicitlyRequested: recommendation.explicitlyRequested,
  };
}

/**
 * Acceptance → integration request + shared service handoff (no second intake).
 */
export function acceptVisualThinkingRecommendation(input: {
  context: VisualThinkingRecommendationContext;
  recommendation: VisualThinkingRecommendationDecision;
}): {
  integrationRequest: VisualThinkingIntegrationRequest;
  handoff: VisualThinkingServiceHandoff;
  seedRequestText: string;
} {
  const { context: ctx, recommendation } = input;
  const returnContext: VisualThinkingRecommendationReturnContext = {
    sourceExperience: ctx.sourceExperience,
    sourceConversationId: ctx.sourceConversationId ?? null,
    sourceSessionId: ctx.sourceSessionId ?? null,
    sourceEntityId: ctx.sourceEntityId ?? null,
    resumePrompt:
      ctx.returnContext?.resumePrompt ??
      ctx.primaryGoal ??
      "Continue where you left off",
    lessonOrStepPosition: ctx.returnContext?.lessonOrStepPosition ?? null,
    returnRoute:
      ctx.returnContext?.returnRoute ?? String(ctx.sourceExperience),
  };

  const seedRequestText = [
    ctx.primaryGoal ?? ctx.userRequest,
    ctx.currentResponseSummary
      ? `What we've covered:\n${ctx.currentResponseSummary.slice(0, 800)}`
      : null,
    ctx.relationshipSignals?.length
      ? `Relationships:\n${ctx.relationshipSignals.slice(0, 8).join("\n")}`
      : null,
    ctx.sequenceSignals?.length
      ? `Sequence:\n${ctx.sequenceSignals.slice(0, 8).join("\n")}`
      : null,
  ]
    .filter(Boolean)
    .join("\n\n");

  const integrationRequest: VisualThinkingIntegrationRequest = {
    id: newId("vti"),
    sourceExperience: String(ctx.sourceExperience),
    sourceConversationId: ctx.sourceConversationId ?? null,
    sourceSessionId: ctx.sourceSessionId ?? null,
    sourceEntityId: ctx.sourceEntityId ?? null,
    originalUserRequest: ctx.userRequest,
    currentGoal: ctx.primaryGoal ?? null,
    cognitiveTask: ctx.cognitiveTask ?? null,
    requestedVisualPurpose: recommendation.suggestedPurpose,
    preferredPresentation: recommendation.preferredPresentation,
    approvedKnowledgeItemIds: (ctx.approvedKnowledgeItemIds ?? []).slice(0, 16),
    sourceReferences: (ctx.sourceReferences ?? []).slice(0, 16),
    explicitlyRequested: recommendation.explicitlyRequested,
    recommendationId: recommendation.id,
    userAcceptedRecommendation: true,
    currentProgressContext: ctx.currentResponseSummary?.slice(0, 400) ?? null,
    returnContext,
    createdAt: new Date().toISOString(),
    integrationVersion: "vt-rec-integration-1",
  };

  const purpose = recommendation.suggestedPurpose ?? "see_the_whole";
  const serviceCtx: VisualThinkingRequestContext = {
    sourceExperience: (isCaller(ctx.sourceExperience)
      ? ctx.sourceExperience
      : "general_chat") as VisualThinkingCallerId,
    conversationSummary: ctx.currentResponseSummary,
    primaryGoal: ctx.primaryGoal,
    currentTask: ctx.cognitiveTask,
    preferredPresentation: recommendation.preferredPresentation,
    preferredCapability: purposeToCapability(purpose),
    reasonForRecommendation: recommendation.userFacingMessage || recommendation.reasons[0],
    signalText: seedRequestText,
    conceptCount: ctx.conceptCount,
    relationshipCount: ctx.relationshipSignals?.length,
    processStepCount: ctx.sequenceSignals?.length,
    optionCount: ctx.comparisonSignals?.length,
  };

  const handoff = requestVisualThinkingHandoff(serviceCtx, {
    shouldRecommend: true,
    confidence:
      recommendation.confidence === "very_high" ||
      recommendation.confidence === "high"
        ? "high"
        : recommendation.confidence === "medium"
          ? "medium"
          : "low",
    capability: purposeToCapability(purpose),
    preferredPresentation: recommendation.preferredPresentation,
    reason: recommendation.reasons[0] ?? "Accepted visual recommendation.",
    invitation: recommendation.userFacingMessage,
    primaryActionLabel: "Show Me Visually",
    keepActionLabel: "Keep Going Here",
    optional: true,
    dismissible: true,
    factors: recommendation.factors,
  });

  const enriched: VisualThinkingServiceHandoff = {
    ...handoff,
    seedRequestText,
  };

  recordVisualThinkingPreferenceEvent("open");
  recordRecommendationEvent({
    type: recommendation.explicitlyRequested
      ? "visual_explicitly_requested"
      : "visual_recommendation_accepted",
    topicKey: recommendation.topicKey,
  });

  return { integrationRequest, handoff: enriched, seedRequestText };
}

function isCaller(v: string): v is VisualThinkingCallerId {
  return [
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
    "visual_thinking_studio",
  ].includes(v);
}

export function buildVisualThinkingFailureRecovery(): {
  stayInSource: true;
  message: string;
} {
  return {
    stayInSource: true,
    message:
      "I wasn’t able to open the visual view, but everything we were working on is still here.",
  };
}

export function markRecommendationOffered(
  recommendation: VisualThinkingRecommendationDecision,
): VisualThinkingRecommendationDecision {
  recordRecommendationEvent({
    type: "visual_recommendation_offered",
    topicKey: recommendation.topicKey,
  });
  return {
    ...recommendation,
    status: "offered",
    updatedAt: new Date().toISOString(),
  };
}

// ─── Observability ──────────────────────────────────────────────────────────

export type VisualThinkingRecommendationObsEvent = {
  type: VisualThinkingRecommendationEvent;
  topicKey: string;
  at: string;
  meta?: Record<string, string | number | boolean | null>;
};

export function recordRecommendationEvent(
  event: Omit<VisualThinkingRecommendationObsEvent, "at"> & { at?: string },
): VisualThinkingRecommendationObsEvent {
  const full: VisualThinkingRecommendationObsEvent = {
    ...event,
    at: event.at ?? new Date().toISOString(),
  };
  if (typeof window === "undefined") return full;
  try {
    const raw = window.sessionStorage.getItem(OBS_KEY);
    const list: VisualThinkingRecommendationObsEvent[] = raw
      ? JSON.parse(raw)
      : [];
    list.push(full);
    window.sessionStorage.setItem(OBS_KEY, JSON.stringify(list.slice(-100)));
  } catch {
    /* ignore */
  }
  return full;
}

export function listRecommendationObservabilityEvents(): VisualThinkingRecommendationObsEvent[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.sessionStorage.getItem(OBS_KEY);
    return raw ? (JSON.parse(raw) as VisualThinkingRecommendationObsEvent[]) : [];
  } catch {
    return [];
  }
}

function newId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random()
    .toString(36)
    .slice(2, 8)}`;
}

export {
  SESSION_KEY as VISUAL_THINKING_RECOMMENDATION_SESSION_KEY,
  purposeToPresentation,
  purposeToCapability,
};
