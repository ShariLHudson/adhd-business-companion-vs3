/**
 * Visual Thinking Intelligence Integration — platform service (Build 8 integration).
 * Any Estate experience may request visual thinking without implementing maps/diagrams.
 * Recommendations are optional. The member remains in control.
 *
 * Does not regenerate Knowledge Packages or reinvent visual engines.
 * Handoff: Knowledge Package → Presentation Plan → Thinking Workspace (existing pipeline).
 */

import { resolveAdaptivePresentation } from "@/lib/adaptiveCompanionIntelligence";
import type { VisualThinkingKnowledgePackage } from "@/lib/cartographersStudio/visualThinkingKnowledgeIntelligence";
import type { VisualThinkingGeneratedDeliverable } from "@/lib/cartographersStudio/visualThinkingGenerationEngine";
import type {
  VisualThinkingPresentationPlan,
  VisualThinkingPresentationType,
} from "@/lib/cartographersStudio/visualThinkingPresentationIntelligence";

// ─── Callers ────────────────────────────────────────────────────────────────

export const VISUAL_THINKING_SUPPORTED_CALLERS = [
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
] as const;

export type VisualThinkingCallerId =
  (typeof VISUAL_THINKING_SUPPORTED_CALLERS)[number];

export type VisualThinkingCapability =
  | "visual_explanation"
  | "process_visualization"
  | "comparison_visualization"
  | "relationship_visualization"
  | "timeline_visualization"
  | "learning_visualization"
  | "decision_visualization"
  | "execution_visualization";

export type VisualThinkingPreferenceProfile =
  | "likes_visual"
  | "rarely_uses_visuals"
  | "prefers_written"
  | "often_opens_checklist"
  | "neutral"
  | "unknown";

// ─── Contracts ──────────────────────────────────────────────────────────────

export type VisualThinkingRequestContext = {
  sourceExperience: VisualThinkingCallerId;
  sourceCompanion?: string | null;
  conversationSummary?: string | null;
  primaryGoal?: string | null;
  currentTask?: string | null;
  knowledgePackage?: VisualThinkingKnowledgePackage | null;
  generatedDeliverable?: VisualThinkingGeneratedDeliverable | null;
  presentationPlan?: VisualThinkingPresentationPlan | null;
  preferredPresentation?: VisualThinkingPresentationType | null;
  preferredCapability?: VisualThinkingCapability | null;
  userPreferences?: {
    visualPreference?: VisualThinkingPreferenceProfile;
    declineVisualRecommendations?: boolean;
  } | null;
  reasonForRecommendation?: string | null;
  /** Free text used for trigger / complexity signals. */
  signalText?: string | null;
  conceptCount?: number | null;
  relationshipCount?: number | null;
  processStepCount?: number | null;
  optionCount?: number | null;
  criterionCount?: number | null;
};

export type VisualThinkingRecommendation = {
  shouldRecommend: boolean;
  confidence: "low" | "medium" | "high";
  capability: VisualThinkingCapability | null;
  preferredPresentation: VisualThinkingPresentationType | null;
  reason: string;
  invitation: string;
  primaryActionLabel: string;
  keepActionLabel: string;
  optional: true;
  dismissible: true;
  factors: string[];
};

export type VisualThinkingServiceHandoff = {
  caller: VisualThinkingCallerId;
  capability: VisualThinkingCapability;
  preferredPresentation: VisualThinkingPresentationType | null;
  knowledgePackageId: string | null;
  generationRunId: string | null;
  presentationPlanId: string | null;
  primaryDeliverableId: string | null;
  seedRequestText: string;
  reasonForRecommendation: string | null;
  optional: true;
  destination: "visual_thinking_studio";
  /** Existing artifacts travel with the handoff — never recreated here. */
  preservesKnowledgePackage: boolean;
  preservesPresentationPlan: boolean;
  createdAt: string;
};

export type VisualThinkingPreferenceRecord = {
  profile: VisualThinkingPreferenceProfile;
  openCount: number;
  dismissCount: number;
  checklistOpenCount: number;
  updatedAt: string;
};

const PREF_KEY = "companion-visual-thinking-preference-v1";

// ─── Triggers & scoring ─────────────────────────────────────────────────────

const TRIGGER_PATTERNS: Array<{
  re: RegExp;
  capability: VisualThinkingCapability;
  weight: number;
}> = [
  { re: /\b(compare|comparison|versus|vs\.?|trade.?off)\b/i, capability: "comparison_visualization", weight: 3 },
  { re: /\b(relationship|related|connected|system|ecosystem|network)\b/i, capability: "relationship_visualization", weight: 3 },
  { re: /\b(timeline|milestone|schedule|roadmap|chronolog)\b/i, capability: "timeline_visualization", weight: 3 },
  { re: /\b(decision|decide|choose between|options|tradeoffs)\b/i, capability: "decision_visualization", weight: 3 },
  { re: /\b(process|workflow|how does this work|walk me through|step by step|steps)\b/i, capability: "process_visualization", weight: 3 },
  { re: /\b(execute|execution|critical path|dependencies|project plan)\b/i, capability: "execution_visualization", weight: 3 },
  { re: /\b(learn|lesson|concept map|teach|training|remember)\b/i, capability: "learning_visualization", weight: 2 },
  { re: /\b(map|show me|help me understand|explain|visualize|visual)\b/i, capability: "visual_explanation", weight: 2 },
];

const SIMPLE_QUESTION =
  /^(what is|who is|when is|where is|yes|no|ok|thanks|thank you)\b/i;
const LEGAL_DEFINITION =
  /\b(define|definition of|what does .+ mean|legal definition)\b/i;
const CHECKLIST_ONLY =
  /\b(checklist|just a list|bullet list|to-?do list)\b/i;

function signalBlob(ctx: VisualThinkingRequestContext): string {
  return [
    ctx.signalText,
    ctx.conversationSummary,
    ctx.primaryGoal,
    ctx.currentTask,
    ctx.reasonForRecommendation,
  ]
    .filter(Boolean)
    .join("\n");
}

function capabilityToPresentation(
  capability: VisualThinkingCapability,
): VisualThinkingPresentationType {
  switch (capability) {
    case "comparison_visualization":
      return "comparison_view";
    case "relationship_visualization":
      return "relationship_view";
    case "timeline_visualization":
      return "timeline";
    case "decision_visualization":
      return "decision_tree";
    case "process_visualization":
    case "execution_visualization":
      return "process_flow";
    case "learning_visualization":
      return "training_guide";
    case "visual_explanation":
    default:
      return "step_by_step";
  }
}

function callerDefaultCapability(
  caller: VisualThinkingCallerId,
): VisualThinkingCapability {
  switch (caller) {
    case "board_of_directors":
    case "executive_office":
    case "strategy":
      return "decision_visualization";
    case "projects":
    case "momentum":
      return "execution_visualization";
    case "business_estate":
    case "innovation":
      return "relationship_visualization";
    case "marketing":
    case "events":
      return "process_visualization";
    case "learning":
      return "learning_visualization";
    case "finance":
      return "comparison_visualization";
    case "leadership":
    case "founder_studio":
      return "decision_visualization";
    default:
      return "visual_explanation";
  }
}

export function isSupportedVisualThinkingCaller(
  caller: string,
): caller is VisualThinkingCallerId {
  return (VISUAL_THINKING_SUPPORTED_CALLERS as readonly string[]).includes(
    caller,
  );
}

/**
 * Pure recommendation: would a visual experience materially improve understanding?
 * Never auto-launches — callers surface an optional invitation.
 */
export function shouldRecommendVisualThinking(
  ctx: VisualThinkingRequestContext,
): VisualThinkingRecommendation {
  const text = signalBlob(ctx).trim();
  const factors: string[] = [];
  let score = 0;
  let capability: VisualThinkingCapability | null =
    ctx.preferredCapability ?? null;

  const prefs = ctx.userPreferences;
  const stored = getVisualThinkingPreference();
  const profile = prefs?.visualPreference ?? stored.profile;

  if (prefs?.declineVisualRecommendations || profile === "prefers_written") {
    return {
      shouldRecommend: false,
      confidence: "high",
      capability: null,
      preferredPresentation: null,
      reason: "Member prefers written results.",
      invitation: "",
      primaryActionLabel: "Open Visual Thinking",
      keepActionLabel: "Keep Reading",
      optional: true,
      dismissible: true,
      factors: ["user_prefers_written"],
    };
  }

  if (profile === "rarely_uses_visuals" && stored.dismissCount >= 3) {
    factors.push("rarely_uses_visuals");
    score -= 2;
  }
  if (profile === "likes_visual") {
    factors.push("likes_visual");
    score += 1;
  }

  if (!text && !ctx.conceptCount && !ctx.processStepCount && !ctx.optionCount) {
    return {
      shouldRecommend: false,
      confidence: "low",
      capability: null,
      preferredPresentation: null,
      reason: "Not enough signal to recommend a visual.",
      invitation: "",
      primaryActionLabel: "Open Visual Thinking",
      keepActionLabel: "Keep Reading",
      optional: true,
      dismissible: true,
      factors: ["insufficient_signal"],
    };
  }

  if (text && SIMPLE_QUESTION.test(text) && text.split(/\s+/).length < 12) {
    return {
      shouldRecommend: false,
      confidence: "high",
      capability: null,
      preferredPresentation: null,
      reason: "Simple questions rarely need a visual workspace.",
      invitation: "",
      primaryActionLabel: "Open Visual Thinking",
      keepActionLabel: "Keep Reading",
      optional: true,
      dismissible: true,
      factors: ["simple_question"],
    };
  }

  if (text && LEGAL_DEFINITION.test(text) && !/\b(process|system|compare)\b/i.test(text)) {
    return {
      shouldRecommend: false,
      confidence: "medium",
      capability: null,
      preferredPresentation: null,
      reason: "Definitions are usually clearer in writing.",
      invitation: "",
      primaryActionLabel: "Open Visual Thinking",
      keepActionLabel: "Keep Reading",
      optional: true,
      dismissible: true,
      factors: ["legal_or_definition"],
    };
  }

  if (text && CHECKLIST_ONLY.test(text) && !/\b(process|map|system)\b/i.test(text)) {
    return {
      shouldRecommend: false,
      confidence: "medium",
      capability: null,
      preferredPresentation: null,
      reason: "A checklist usually does not need a visual canvas.",
      invitation: "",
      primaryActionLabel: "Open Visual Thinking",
      keepActionLabel: "Keep as checklist",
      optional: true,
      dismissible: true,
      factors: ["checklist_only"],
    };
  }

  for (const t of TRIGGER_PATTERNS) {
    if (text && t.re.test(text)) {
      score += t.weight;
      factors.push(`trigger:${t.capability}`);
      if (!capability) capability = t.capability;
    }
  }

  const concepts = ctx.conceptCount ?? 0;
  const relationships = ctx.relationshipCount ?? 0;
  const steps = ctx.processStepCount ?? 0;
  const options = ctx.optionCount ?? 0;
  const criteria = ctx.criterionCount ?? 0;

  if (concepts >= 4) {
    score += 2;
    factors.push("many_concepts");
    if (!capability) capability = "relationship_visualization";
  }
  if (relationships >= 3) {
    score += 3;
    factors.push("many_relationships");
    if (!capability) capability = "relationship_visualization";
  }
  if (steps >= 5) {
    score += 3;
    factors.push("long_process");
    if (!capability) capability = "process_visualization";
  }
  if (options >= 3 || (options >= 2 && criteria >= 2)) {
    score += 3;
    factors.push("comparison_complexity");
    if (!capability) capability = "comparison_visualization";
  }

  // Executive-function load heuristic
  if (concepts + steps + options >= 8) {
    score += 2;
    factors.push("executive_function_load");
  }

  const adaptive = resolveAdaptivePresentation({
    destinationHint: ctx.sourceExperience,
    conversationalText: text || undefined,
  });
  if (adaptive.summaryFirst) {
    score += 0;
    factors.push("adaptive_summary_first");
  } else if (!adaptive.summaryFirst && score >= 3) {
    score += 1;
    factors.push("adaptive_allows_depth");
  }

  if (!capability) {
    capability = callerDefaultCapability(ctx.sourceExperience);
  }

  const shouldRecommend = score >= 4;
  const confidence: VisualThinkingRecommendation["confidence"] =
    score >= 7 ? "high" : score >= 4 ? "medium" : "low";

  const invitation = buildVisualThinkingInvitation({
    caller: ctx.sourceExperience,
    capability,
    reason: ctx.reasonForRecommendation,
  });

  return {
    shouldRecommend,
    confidence,
    capability: shouldRecommend ? capability : null,
    preferredPresentation: shouldRecommend
      ? ctx.preferredPresentation ?? capabilityToPresentation(capability)
      : null,
    reason: shouldRecommend
      ? ctx.reasonForRecommendation?.trim() ||
        "Seeing this visually may make the relationships easier to hold."
      : "A visual is unlikely to improve understanding here.",
    invitation: shouldRecommend ? invitation : "",
    primaryActionLabel: "Open Visual Thinking",
    keepActionLabel:
      ctx.sourceExperience === "learning" ? "Keep Reading" : "Stay here",
    optional: true,
    dismissible: true,
    factors,
  };
}

export function buildVisualThinkingInvitation(input: {
  caller: VisualThinkingCallerId;
  capability: VisualThinkingCapability;
  reason?: string | null;
}): string {
  if (input.reason?.trim()) return input.reason.trim();
  switch (input.caller) {
    case "learning":
      return "This lesson has several connected ideas. Would seeing them visually help?";
    case "board_of_directors":
    case "executive_office":
      return "This decision has several moving pieces. Would a visual tradeoff view help?";
    case "projects":
      return "This work has dependencies and sequence. Would an execution map help?";
    case "business_estate":
      return "These business pieces connect. Would seeing the system visually help?";
    case "marketing":
      return "This campaign has a flow. Would a visual journey help?";
    case "strategy":
      return "These options interact. Would a decision or comparison view help?";
    default:
      return "I think seeing this visually would make it much easier to understand.";
  }
}

/**
 * Build a handoff into Visual Thinking Studio without recreating knowledge.
 */
export function requestVisualThinkingHandoff(
  ctx: VisualThinkingRequestContext,
  recommendation?: VisualThinkingRecommendation | null,
): VisualThinkingServiceHandoff {
  const rec = recommendation ?? shouldRecommendVisualThinking(ctx);
  const capability =
    rec.capability ??
    ctx.preferredCapability ??
    callerDefaultCapability(ctx.sourceExperience);
  const seed =
    ctx.primaryGoal?.trim() ||
    ctx.currentTask?.trim() ||
    ctx.conversationSummary?.trim() ||
    ctx.signalText?.trim() ||
    "Help me understand this visually.";

  return {
    caller: ctx.sourceExperience,
    capability,
    preferredPresentation:
      ctx.preferredPresentation ??
      rec.preferredPresentation ??
      capabilityToPresentation(capability),
    knowledgePackageId: ctx.knowledgePackage?.id ?? null,
    generationRunId: null,
    presentationPlanId: ctx.presentationPlan?.id ?? null,
    primaryDeliverableId:
      ctx.generatedDeliverable?.id ??
      ctx.presentationPlan?.primaryDeliverableId ??
      null,
    seedRequestText: seed,
    reasonForRecommendation: ctx.reasonForRecommendation ?? rec.reason,
    optional: true,
    destination: "visual_thinking_studio",
    preservesKnowledgePackage: Boolean(ctx.knowledgePackage?.id),
    preservesPresentationPlan: Boolean(ctx.presentationPlan?.id),
    createdAt: new Date().toISOString(),
  };
}

/** Facade used by Estate experiences — one shared cognitive ability. */
export const VisualThinkingService = {
  supportedCallers: VISUAL_THINKING_SUPPORTED_CALLERS,
  isSupportedCaller: isSupportedVisualThinkingCaller,
  shouldRecommend: shouldRecommendVisualThinking,
  recommend: shouldRecommendVisualThinking,
  buildInvitation: buildVisualThinkingInvitation,
  requestHandoff: requestVisualThinkingHandoff,
  recordOpen: () => recordVisualThinkingPreferenceEvent("open"),
  recordDismiss: () => recordVisualThinkingPreferenceEvent("dismiss"),
  recordChecklistOpen: () =>
    recordVisualThinkingPreferenceEvent("checklist_open"),
  getPreference: getVisualThinkingPreference,
} as const;

// ─── Preference persistence (Adaptive Companion may consume later) ───────────

export function getVisualThinkingPreference(): VisualThinkingPreferenceRecord {
  if (typeof window === "undefined") {
    return {
      profile: "unknown",
      openCount: 0,
      dismissCount: 0,
      checklistOpenCount: 0,
      updatedAt: new Date(0).toISOString(),
    };
  }
  try {
    const raw = window.sessionStorage.getItem(PREF_KEY);
    if (!raw) {
      return {
        profile: "unknown",
        openCount: 0,
        dismissCount: 0,
        checklistOpenCount: 0,
        updatedAt: new Date(0).toISOString(),
      };
    }
    return JSON.parse(raw) as VisualThinkingPreferenceRecord;
  } catch {
    return {
      profile: "unknown",
      openCount: 0,
      dismissCount: 0,
      checklistOpenCount: 0,
      updatedAt: new Date(0).toISOString(),
    };
  }
}

export function recordVisualThinkingPreferenceEvent(
  event: "open" | "dismiss" | "checklist_open",
): VisualThinkingPreferenceRecord {
  const prev = getVisualThinkingPreference();
  const next: VisualThinkingPreferenceRecord = {
    ...prev,
    openCount: prev.openCount + (event === "open" ? 1 : 0),
    dismissCount: prev.dismissCount + (event === "dismiss" ? 1 : 0),
    checklistOpenCount:
      prev.checklistOpenCount + (event === "checklist_open" ? 1 : 0),
    updatedAt: new Date().toISOString(),
    profile: prev.profile,
  };

  if (next.openCount >= 3 && next.dismissCount === 0) {
    next.profile = "likes_visual";
  } else if (next.dismissCount >= 3 && next.openCount === 0) {
    next.profile = "rarely_uses_visuals";
  } else if (next.checklistOpenCount >= 3 && next.openCount <= 1) {
    next.profile = "often_opens_checklist";
  } else if (next.dismissCount > next.openCount + 2) {
    next.profile = "prefers_written";
  } else if (next.openCount > 0) {
    next.profile = "likes_visual";
  }

  if (typeof window !== "undefined") {
    try {
      window.sessionStorage.setItem(PREF_KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  }
  return next;
}

/**
 * Platform rule: Visual Thinking is the only visual engine.
 * Callers must not invent chamber-local mind/process/relationship engines.
 */
export function assertNoDuplicateVisualThinkingEngines(): {
  canonicalService: "VisualThinkingService";
  forbiddenIndependentEngines: string[];
  rule: string;
} {
  return {
    canonicalService: "VisualThinkingService",
    forbiddenIndependentEngines: [
      "chamber_local_mind_map_engine",
      "chamber_local_process_diagram_engine",
      "chamber_local_relationship_map_engine",
      "chamber_local_comparison_engine",
      "chamber_local_timeline_engine",
    ],
    rule: "Everything routes through Visual Thinking. No Chamber Member implements visual thinking independently.",
  };
}

export { PREF_KEY as VISUAL_THINKING_PREFERENCE_KEY };
