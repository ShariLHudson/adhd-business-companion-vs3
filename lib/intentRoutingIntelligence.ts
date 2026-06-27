/**
 * Intent Routing Intelligence + Feature Navigation Intelligence (P0.7)
 * Understand before routing. Route before explaining. Help before reflecting.
 *
 * Always Available / Not Always Visible: routing intelligence and feature fit
 * run on every turn (API hints, continuity, suppress rules). Workspace cards
 * and clarification menus surface only on high-confidence, explicit requests.
 */

import { isAdaptMyDayIntent, adaptMyDayOfferLine } from "./adaptMyDayChatRouting";
import { shouldDeferKeywordWorkspaceOffer } from "./companionEntry/entryLayerGate";
import type { AppSection } from "./companionUi";
import {
  detectEcosystemProblemIntent,
  ecosystemIntentToWorkspaceOffer,
} from "./companionEcosystemIntent";
import { isDecisionCompassOfferSignal } from "./decisionCompassRouting";
import {
  buildOverwhelmTodayOffers,
  detectOverwhelmTodayRoute,
  featureMatchForRoute,
  isOverwhelmTodayRoutingExempt,
  overwhelmTodayGoalTags,
  overwhelmTodayRoutingHint,
  OVERWHELM_TODAY_STAY_HERE_GUIDANCE,
  secondaryFeatureMatchForRoute,
  type OverwhelmTodayRoute,
} from "./overwhelmTodayRouting";
import {
  buildRegistryArtifactOfferLine,
  detectRegistryArtifact,
  isRegistryArtifactExecution,
  type RegistryArtifactKind,
} from "./artifactRegistry";
import { isKnowledgeQuestion } from "./knowledgeIntelligence";
import { shouldSuppressRelationshipIntelligenceForUserText } from "./relationshipIntelligenceBoundaries";
import {
  evaluateHonorTheirIntent,
  honorTheirIntentHintForChat,
  shouldSuppressReflectionForHonorIntent,
  type HonorTheirIntentVerdict,
} from "@/lib/honorTheirIntent";
import {
  containsVisualStructurePhrase,
  isVisualStructureExecution,
  resolveDecisionStructureWorkspaceOffer,
  resolveVisualStructureWorkspaceOffer,
  visualStructureRoutingHintForChat,
} from "./visualStructureRouting";
import { visualThinkingStudioHintForChat } from "./visualThinkingStudio";
import { visualThinkingOverreachHintForChat } from "./visualThinkingOverreach";
import { visualRecommendationEngineHintForChat } from "./visualRecommendationEngine";
import { isHowToLearningQuestion, howToLearningHintForChat } from "./howToLearningIntelligence";
import { visualLearnBoundaryHintForChat } from "./visualLearnBoundary";
import { visualThinkingGuardsHintForChat } from "./visualThinkingGuards";
import { visualTypeAvailabilityHintForChat } from "./visualTypeAvailability";
import {
  detectDoingIntent,
  type WorkspaceOffer,
  workspaceTitle,
} from "./workspaceMode";
import { isCompanionFirstQuestion } from "./companionFirstWorkflow";
import {
  detectVisualTypeInText,
  isVisualCreateIntent,
} from "./visualTypeAvailability";

const FEATURE_DISCOVERY_RE =
  /\b(?:is there a feature|does this app|can this app help)\b/i;

export type IntentCategory =
  | "understand"
  | "decide"
  | "plan"
  | "organize"
  | "build"
  | "execute"
  | "learn"
  | "clarify"
  | "conversation";

export type RouteMode =
  | "conversation"
  | "feature_offer"
  | "execute_inline"
  | "clarify";

export type RoutingSupportStyle =
  | "direct"
  | "guided"
  | "reflective"
  | "strategic";

export type IntentRoutingGoal = {
  summary: string;
  tags: string[];
};

export type WorkspaceContinuityContext = {
  section: AppSection;
  projectType?: string;
  initialPrompt: string;
  goalSummary: string;
};

export type IntentRoutingDecision = {
  category: IntentCategory;
  routeMode: RouteMode;
  goal: IntentRoutingGoal;
  /** Feature fit detected — always populated when routing finds a match */
  workspaceOffer: WorkspaceOffer | null;
  secondaryWorkspaceOffer: WorkspaceOffer | null;
  featureMatch: AppSection | null;
  secondaryFeatureMatch: AppSection | null;
  overwhelmTodayRoute: OverwhelmTodayRoute | null;
  /** Show workspace offer card / short-circuit with navigation message */
  surfaceOfferUi: boolean;
  /** Post clarification menu as immediate assistant message (rare) */
  surfaceClarificationUi: boolean;
  decisionCompassRecommended: boolean;
  clarifyPrompt: string | null;
  artifactDetected: boolean;
  artifactKind: ArtifactKind | null;
  /** P0.7.3 — hard suppress relationship intelligence + observation engine */
  suppressRelationshipIntelligence: boolean;
  suppressRelationshipLead: boolean;
  suppressReflectionFirst: boolean;
  suppressConversationSummary: boolean;
  /** P0.10 — concept question fast path */
  learnFastPath: boolean;
  suppressWisdomIntelligence: boolean;
  suppressTransformationIntelligence: boolean;
  suppressObservationEngine: boolean;
  stayHereChatGuidance: string | null;
  supportStyle: RoutingSupportStyle;
  supportStyleGuidance: string | null;
  adaptMyDayRecommended: boolean;
  continuity: WorkspaceContinuityContext | null;
  navigationLine: string | null;
  stayHereLabel: string;
  featureLabel: string | null;
  /** Honor Their Intent — constitutional arrival mode */
  honorTheirIntent: HonorTheirIntentVerdict;
};

export type ArtifactKind = RegistryArtifactKind;

const CREATE_ARTIFACT_SECTION: AppSection = "content-generator";

export type IntentRoutingInput = {
  userText: string;
  workspace?: AppSection | null;
  supportStyle?: string | null;
  emotionalState?: string | null;
  energyLevel?: string | null;
  overwhelmed?: boolean;
};

const STAY_HERE_LABEL = "Stay Here";

const UNDERSTAND_RE =
  /\b(?:why do i|what patterns|patterns have you noticed|how have i changed|how have i grown|why am i stuck|what have you noticed|what do you notice about me|how do i usually|what'?s my pattern)\b/i;

const LEARN_RE =
  /\b(?:teach me|explain (?:how|what|why)|how does (?:this|it) work|walk me through|what is a[n]?)\b/i;

function isLearnIntent(text: string): boolean {
  return (
    isHowToLearningQuestion(text) ||
    isKnowledgeQuestion(text) ||
    LEARN_RE.test(text.trim())
  );
}

const DECIDE_RE =
  /\b(?:help me decide|help me choose|which (?:offer|option|one) should|should i (?:add|launch|keep)|what should i do first|can'?t decide|stuck between|torn between|compare (?:these|two) options)\b/i;

const PLAN_RE =
  /\b(?:plan my day|help me plan(?: my day)?|what should i work on|what should i focus on|what to work on today|prioritize my day|adapt my day|adjust my day)\b/i;

const ORGANIZE_RE =
  /\b(?:brain is (?:spinning|full|noisy)|my brain is|too many ideas|all over the place|everything (?:is )?in my (?:head|mind)|head is (?:full|crowded)|clear my (?:head|mind)|get (?:it|these thoughts) out|dump (?:everything|my thoughts)|mental clutter)\b/i;

const BUILD_RE =
  /\b(?:help me (?:create|build|make|write|draft|design|develop|generate)|(?:create|build|design|develop|draft|write|generate|make) (?:an? )?(?:sop|marketing plan|content plan|funnel|strategy|checklist|template|email|proposal|landing page|lead magnet|sales page|sales script|social post|offer|client avatar|(?:follow-?up|nurture|sales|email) sequence))\b/i;

const EXECUTE_RE =
  /\b(?:write|draft|create|build|make|design|develop|generate)\s+(?:an?|the|my)?\s*(?:email|sop|marketing plan|content plan|proposal|checklist|workflow|content|landing page|lead magnet|sales page|sales script|social post|offer|client avatar|(?:\w+\s+)*funnel|(?:follow-?up|nurture|sales|email) sequence)\b/i;

const FUNNEL_ARTIFACT_RE =
  /\b(?:sales funnel|marketing funnel|lead generation funnel|lead funnel|email funnel|webinar funnel|workshop funnel|launch funnel|course funnel|membership funnel|automation funnel|customer journey|(?:lead magnet|product sale|membership|webinar|workshop)\s+funnel|funnel)\b/i;

/** Detect concrete artifact the user wants to produce (email, SOP, funnel, etc.). */
export function detectArtifactRequest(text: string): ArtifactKind | null {
  return detectRegistryArtifact(text);
}

/** User wants to produce the artifact now — not just discuss it. */
export function isArtifactExecutionIntent(text: string): boolean {
  return isRegistryArtifactExecution(text);
}

/** P0.7.3 hard override — skip all relationship layers during artifact execution. */
export function isExecuteArtifactOverride(decision: IntentRoutingDecision): boolean {
  return decision.suppressRelationshipIntelligence;
}

export function shouldSuppressRelationshipIntelligenceForRouting(
  decision: IntentRoutingDecision,
): boolean {
  if (decision.suppressRelationshipIntelligence) return true;
  return shouldSuppressRelationshipLeadForRouting(decision);
}

function createSectionForArtifact(kind: ArtifactKind): AppSection {
  if (kind === "client_avatar") return "client-avatars";
  return CREATE_ARTIFACT_SECTION;
}

function buildCreateArtifactOffer(
  kind: ArtifactKind,
  category: IntentCategory,
): WorkspaceOffer {
  const execCategory = category === "build" ? "build" : "execute";
  const section = createSectionForArtifact(kind);
  return {
    section,
    buttonLabel: section === "client-avatars" ? "Open Client Avatar" : "Open Create",
    line: buildRegistryArtifactOfferLine(kind, execCategory),
  };
}

const VAGUE_HELP_RE =
  /^(?:help(?: me)?|i need help|not sure what i need)\.?$/i;

const EXPLICIT_OPEN_RE =
  /\b(?:open|take me to|launch|start|go to)\b/i;

const EXPLICIT_FEATURE_NAME_RE =
  /\b(?:clear my mind|decision compass|plan my day|adapt my day|projects|create mode)\b/i;

const MARKETING_BUILD_RE =
  /\b(?:marketing plan|marketing strategy|content plan|(?:sales|marketing|lead(?:\s+generation)?|email|webinar|workshop|launch|course|membership|automation)\s+funnel|customer journey|funnel|(?:follow-?up|nurture|sales|email) sequence)\b/i;
const SOP_BUILD_RE = /\b(?:sop|standard operating|operating procedure|checklist|workflow doc)\b/i;
const STRENGTH_UNDERSTAND_RE =
  /\b(?:biggest strength|my strength|what am i good at|what i'?m good at)\b/i;

function detectIntentCategory(text: string): IntentCategory {
  const t = text.trim();
  if (!t) return "clarify";
  if (VAGUE_HELP_RE.test(t)) return "clarify";
  if (FEATURE_DISCOVERY_RE.test(t)) {
    if (/\bdecision\b/i.test(t)) return "decide";
    if (/\b(?:sop|standard operating|write an sop)\b/i.test(t)) return "conversation";
    return "conversation";
  }
  if (isCompanionFirstQuestion(t)) return "conversation";
  if (STRENGTH_UNDERSTAND_RE.test(t) || UNDERSTAND_RE.test(t)) return "understand";

  if (isRegistryArtifactExecution(t)) {
    return /\bhelp me\b/i.test(t) ? "build" : "execute";
  }

  if (isLearnIntent(t)) return "learn";

  if (isVisualCreateIntent(t) && detectVisualTypeInText(t)) {
    return /\bhelp me\b/i.test(t) ? "build" : "execute";
  }

  if (isVisualStructureExecution(t)) {
    return /\bhelp me\b/i.test(t) ? "build" : "execute";
  }

  const overwhelmRoute = detectOverwhelmTodayRoute(t);
  if (overwhelmRoute === "brain_dump_primary") return "organize";
  if (overwhelmRoute === "adapt_primary" || overwhelmRoute === "plan_primary") {
    return "plan";
  }
  if (DECIDE_RE.test(t) || isDecisionCompassOfferSignal(t)) return "decide";
  if (ORGANIZE_RE.test(t)) return "organize";
  if (PLAN_RE.test(t) || isAdaptMyDayIntent(t)) return "plan";

  const artifactKind = detectArtifactRequest(t);
  if (artifactKind && isArtifactExecutionIntent(t)) {
    return /\bhelp me\b/i.test(t) ? "build" : "execute";
  }

  if (EXECUTE_RE.test(t)) return "execute";
  if (BUILD_RE.test(t) || detectDoingIntent(t)) return "build";
  return "conversation";
}

function detectGoal(
  text: string,
  category: IntentCategory,
  overwhelmRoute?: OverwhelmTodayRoute | null,
): IntentRoutingGoal {
  const t = text.trim();
  const tags: string[] = [category];

  if (overwhelmRoute) tags.push(...overwhelmTodayGoalTags(overwhelmRoute));
  if (MARKETING_BUILD_RE.test(t)) tags.push("marketing", "business_building", "content");
  if (SOP_BUILD_RE.test(t)) tags.push("systems", "operations", "process");
  if (STRENGTH_UNDERSTAND_RE.test(t)) tags.push("strengths", "identity");
  if (/\boverwhelm/i.test(t)) tags.push("overwhelm", "energy");
  if (/\bdecision/i.test(t)) tags.push("decision");

  let summary = "Continue in conversation";
  switch (category) {
    case "understand":
      summary = "Gain insight about patterns, strengths, or change over time";
      break;
    case "decide":
      summary = "Choose a direction or next move";
      break;
    case "plan":
      summary = overwhelmRoute
        ? "Pick one place to start today without more overwhelm"
        : "Shape what to focus on today or this week";
      break;
    case "organize":
      summary = "Unload and organize mental load";
      break;
    case "build":
      summary = "Create or build a tangible artifact";
      break;
    case "execute":
      summary = "Produce output now with minimal friction";
      break;
    case "learn":
      summary = "Answer the concept directly — educational, not personal";
      break;
    case "clarify":
      summary = "Clarify what kind of help is needed";
      break;
    default:
      summary = "Talk it through together";
  }

  return { summary, tags: [...new Set(tags)] };
}

function resolveSupportStyle(
  pref?: string | null,
  category?: IntentCategory,
): RoutingSupportStyle {
  if (pref === "solutions") return "direct";
  if (pref === "understand") return "reflective";
  if (category === "build" || category === "execute") return "direct";
  if (category === "learn") return "direct";
  if (category === "understand") return "reflective";
  if (category === "decide" && pref === "balanced") return "strategic";
  return "guided";
}

function supportStyleGuidance(
  style: RoutingSupportStyle,
  category: IntentCategory,
): string | null {
  if (style === "direct" && (category === "build" || category === "execute")) {
    return "Prioritize action. Offer navigation or creation. Minimal reflection before helping.";
  }
  if (style === "reflective" && category === "understand") {
    return "Use relationship observations and wisdom. Stay in conversation.";
  }
  if (style === "strategic" && category === "decide") {
    return "Use business and decision intelligence. Offer Decision Compass when appropriate.";
  }
  if (style === "guided") {
    return "Ask only enough questions to route well, then help.";
  }
  return null;
}

function featureLabelForSection(section: AppSection): string {
  if (section === "brain-dump") return "Clear My Mind";
  if (section === "content-generator") return "Create";
  if (section === "projects") return "Projects";
  if (section === "plan-my-day") return "Plan My Day";
  if (section === "decision-compass") return "Decision Compass";
  return workspaceTitle(section);
}

function buildNavigationLine(
  section: AppSection,
  userText: string,
  category: IntentCategory,
): string {
  const label = featureLabelForSection(section);

  if (section === "brain-dump" || category === "organize") {
    return `${label} may help with this. Would you like to open it?`;
  }
  if (section === "decision-compass" || category === "decide") {
    return `This sounds like a ${label} conversation. Would you like to open ${label}?`;
  }
  if (section === "plan-my-day" || category === "plan") {
    return `We can do this here, or I can open ${label}. Would you like to open ${label}?`;
  }
  if (section === "projects" && SOP_BUILD_RE.test(userText)) {
    return `Let's build the SOP in Create. Would you like to open Create?`;
  }
  if (section === "projects") {
    return `This may be easier in ${label}. Would you like to open it?`;
  }
  if (section === "content-generator" || section === CREATE_ARTIFACT_SECTION) {
    if (containsVisualStructurePhrase(userText)) {
      return resolveVisualStructureWorkspaceOffer(userText)?.line ?? "";
    }
    if (detectArtifactRequest(userText)) {
      const kind = detectArtifactRequest(userText)!;
      return buildCreateArtifactOffer(kind, category).line;
    }
    return `Let's work on this together. Create may be the best place to build it. Would you like to open Create?`;
  }
  return `Would you like to open ${label}?`;
}

function buildClarificationPrompt(): string {
  return [
    "What would help most right now?",
    "",
    "- Make a decision",
    "- Create something",
    "- Plan something",
    "- Understand something",
    "- Organize my thoughts",
  ].join("\n");
}

function buildWorkspaceContinuity(
  section: AppSection,
  userText: string,
  goal: IntentRoutingGoal,
): WorkspaceContinuityContext | null {
  const t = userText.trim();
  if (!t) return null;

  if (section === CREATE_ARTIFACT_SECTION && SOP_BUILD_RE.test(t)) {
    return {
      section,
      projectType: "SOP",
      initialPrompt: t,
      goalSummary: goal.summary,
    };
  }
  if (section === CREATE_ARTIFACT_SECTION && FUNNEL_ARTIFACT_RE.test(t)) {
    return {
      section,
      projectType: "Sales Funnel",
      initialPrompt: t,
      goalSummary: goal.summary,
    };
  }
  if (section === CREATE_ARTIFACT_SECTION && MARKETING_BUILD_RE.test(t)) {
    return {
      section,
      projectType: "Marketing Plan",
      initialPrompt: t,
      goalSummary: goal.summary,
    };
  }
  if (section === "decision-compass") {
    return {
      section,
      initialPrompt: t,
      goalSummary: goal.summary,
    };
  }
  if (section === "brain-dump") {
    return {
      section,
      initialPrompt: t,
      goalSummary: goal.summary,
    };
  }
  if (section === "plan-my-day") {
    return {
      section,
      initialPrompt: t,
      goalSummary: goal.summary,
    };
  }
  return {
    section,
    initialPrompt: t,
    goalSummary: goal.summary,
  };
}

function detectFeatureOffer(
  text: string,
  category: IntentCategory,
  overwhelmRoute?: OverwhelmTodayRoute | null,
  artifactKind?: ArtifactKind | null,
): WorkspaceOffer | null {
  const visualOffer = resolveVisualStructureWorkspaceOffer(text);
  if (visualOffer) return visualOffer;

  const decisionOffer = resolveDecisionStructureWorkspaceOffer(text);
  if (decisionOffer && category === "decide") return decisionOffer;

  if (category === "understand" || category === "learn" || category === "clarify") {
    return null;
  }

  if (artifactKind && isRegistryArtifactExecution(text)) {
    const execCategory: "build" | "execute" =
      category === "build" ? "build" : "execute";
    return buildCreateArtifactOffer(artifactKind, execCategory);
  }

  if (
    artifactKind &&
    (category === "build" || category === "execute")
  ) {
    return buildCreateArtifactOffer(artifactKind, category);
  }

  if (overwhelmRoute) {
    return buildOverwhelmTodayOffers(text, overwhelmRoute).primary;
  }

  if (isAdaptMyDayIntent(text) && category === "plan") {
    return {
      section: "energy",
      buttonLabel: "Open Today's Reality",
      line: adaptMyDayOfferLine(),
    };
  }

  const ecosystem = detectEcosystemProblemIntent(text);
  if (ecosystem) {
    const offer = ecosystemIntentToWorkspaceOffer(ecosystem);
    return {
      ...offer,
      line: buildNavigationLine(offer.section, text, category),
    };
  }

  if (category === "plan" && /\bplan my day\b/i.test(text)) {
    return {
      section: "plan-my-day",
      buttonLabel: "Open Plan My Day",
      line: buildNavigationLine("plan-my-day", text, category),
    };
  }

  if (category === "decide") {
    return {
      section: "decision-compass",
      buttonLabel: "Open Decision Compass",
      line: buildNavigationLine("decision-compass", text, category),
    };
  }

  if (category === "organize") {
    return {
      section: "brain-dump",
      buttonLabel: "Open Clear My Mind",
      line: buildNavigationLine("brain-dump", text, category),
    };
  }

  if (SOP_BUILD_RE.test(text)) {
    return buildCreateArtifactOffer("sop", category);
  }

  const doing = detectDoingIntent(text);
  if (!doing) return null;

  return {
    ...doing,
    line: buildNavigationLine(doing.section, text, category),
  };
}

function resolveRouteMode(
  category: IntentCategory,
  offer: WorkspaceOffer | null,
  artifactKind?: ArtifactKind | null,
): RouteMode {
  if (category === "clarify") return "clarify";
  if (category === "understand" || category === "learn") return "conversation";
  if (
    artifactKind &&
    (category === "execute" || category === "build") &&
    offer
  ) {
    return "feature_offer";
  }
  if (category === "execute") return "execute_inline";
  if (offer) return "feature_offer";
  return "conversation";
}

/** High-confidence requests that may show workspace offer UI immediately. */
export function shouldSurfaceRoutingOfferUi(
  text: string,
  category: IntentCategory,
  offer: WorkspaceOffer | null,
): boolean {
  if (!offer) return false;
  const t = text.trim();
  if (!t) return false;
  if (detectOverwhelmTodayRoute(t)) return true;
  if (!isOverwhelmTodayRoutingExempt(t) && shouldDeferKeywordWorkspaceOffer(t)) {
    return false;
  }

  if (EXPLICIT_OPEN_RE.test(t) && EXPLICIT_FEATURE_NAME_RE.test(t)) return true;
  if (/\bplan my day\b/i.test(t)) return true;
  if (/\b(?:adapt my day|adjust my day)\b/i.test(t)) return true;

  if (category === "organize" && ORGANIZE_RE.test(t)) return true;
  if (category === "decide" && DECIDE_RE.test(t)) return true;

  if (
    category === "build" &&
    /\b(?:create|build|write|draft|help me (?:create|build|make|write))\b/i.test(t) &&
    (SOP_BUILD_RE.test(t) || MARKETING_BUILD_RE.test(t))
  ) {
    return true;
  }

  if (category === "execute" && EXECUTE_RE.test(t)) return true;

  if (
    (category === "execute" || category === "build") &&
    detectArtifactRequest(t) &&
    isArtifactExecutionIntent(t)
  ) {
    return true;
  }

  return false;
}

/** Clarification is available in hints; UI menu only for bare vague help. */
export function shouldSurfaceClarificationUi(text: string): boolean {
  return VAGUE_HELP_RE.test(text.trim());
}

export function shouldSuppressRelationshipLeadForRouting(
  decision: IntentRoutingDecision,
): boolean {
  if (decision.suppressRelationshipIntelligence) return true;
  if (decision.overwhelmTodayRoute) return true;
  if (decision.suppressConversationSummary) return true;
  if (decision.routeMode === "feature_offer") return true;
  if (decision.routeMode === "execute_inline") return true;
  if (decision.routeMode === "clarify") return true;
  if (decision.category === "build" || decision.category === "organize") return true;
  if (decision.category === "plan" && decision.workspaceOffer) return true;
  if (decision.category === "decide" && decision.decisionCompassRecommended) return true;
  return false;
}

export function resolveIntentRouting(input: IntentRoutingInput): IntentRoutingDecision {
  const text = input.userText.trim();
  const artifactKind = detectArtifactRequest(text);
  const artifactDetected = artifactKind !== null;
  const artifactExecution = isRegistryArtifactExecution(text);
  const overwhelmTodayRoute = detectOverwhelmTodayRoute(text);
  let category = detectIntentCategory(text);
  if (artifactExecution) {
    category = /\bhelp me\b/i.test(text) ? "build" : "execute";
  }
  const goal = detectGoal(text, category, overwhelmTodayRoute);
  const supportStyle = resolveSupportStyle(input.supportStyle, category);
  const overwhelmed = Boolean(
    input.overwhelmed || /\boverwhelm/i.test(text) || input.emotionalState === "overwhelmed",
  );
  const lowEnergy =
    input.energyLevel === "low" ||
    /\b(?:low energy|no energy|exhausted|drained|tired)\b/i.test(text);

  const workspaceOffer = detectFeatureOffer(
    text,
    category,
    overwhelmTodayRoute,
    artifactKind,
  );
  const overwhelmOffers = overwhelmTodayRoute
    ? buildOverwhelmTodayOffers(text, overwhelmTodayRoute)
    : null;
  const secondaryWorkspaceOffer = overwhelmOffers?.secondary ?? null;
  const decisionCompassRecommended =
    category === "decide" || isDecisionCompassOfferSignal(text);
  const adaptMyDayRecommended =
    isAdaptMyDayIntent(text) ||
    (category === "plan" && (lowEnergy || overwhelmed)) ||
    overwhelmTodayRoute === "plan_primary" ||
    overwhelmTodayRoute === "adapt_primary";

  let offer = workspaceOffer;
  if (!offer && artifactExecution && artifactKind) {
    offer = buildCreateArtifactOffer(
      artifactKind,
      category === "build" ? "build" : "execute",
    );
  }
  if (overwhelmed && category === "organize" && !offer && !overwhelmTodayRoute) {
    offer = {
      section: "brain-dump",
      buttonLabel: "Open Clear My Mind",
      line: buildNavigationLine("brain-dump", text, "organize"),
    };
  }
  if (
    adaptMyDayRecommended &&
    category === "plan" &&
    !/\bplan my day\b/i.test(text) &&
    !overwhelmTodayRoute
  ) {
    offer = {
      section: "energy",
      buttonLabel: "Open Today's Reality",
      line: adaptMyDayOfferLine(),
    };
  }

  const routeMode =
    artifactExecution && offer
      ? "feature_offer"
      : resolveRouteMode(category, offer, artifactKind);
  const surfaceOfferUi =
    shouldSurfaceRoutingOfferUi(text, category, offer) ||
    Boolean(artifactExecution && offer);
  const surfaceClarificationUi = shouldSurfaceClarificationUi(text);
  const continuity =
    offer && routeMode === "feature_offer"
      ? buildWorkspaceContinuity(offer.section, text, goal)
      : null;
  const suppressConversationSummary = Boolean(overwhelmTodayRoute);
  const learnFastPath = category === "learn" && isLearnIntent(text);
  const honorIntent = evaluateHonorTheirIntent({
    userText: text,
    overwhelmed,
  });
  const honorAllowsRelationship =
    honorIntent.arrivalMode === "come_to_be_helped" &&
    !honorIntent.emergentNeedDetected;
  const suppressRelationshipIntelligence =
    shouldSuppressRelationshipIntelligenceForUserText(text) &&
    !honorAllowsRelationship;
  const suppressDeepIntelligence =
    suppressRelationshipIntelligence || learnFastPath;

  const decision: IntentRoutingDecision = {
    category,
    routeMode,
    goal,
    workspaceOffer: routeMode === "feature_offer" ? offer : null,
    secondaryWorkspaceOffer:
      routeMode === "feature_offer" ? secondaryWorkspaceOffer : null,
    featureMatch: overwhelmTodayRoute ? featureMatchForRoute(overwhelmTodayRoute) : null,
    secondaryFeatureMatch: overwhelmTodayRoute
      ? secondaryFeatureMatchForRoute(overwhelmTodayRoute)
      : null,
    overwhelmTodayRoute,
    surfaceOfferUi,
    surfaceClarificationUi,
    decisionCompassRecommended,
    clarifyPrompt: routeMode === "clarify" ? buildClarificationPrompt() : null,
    artifactDetected,
    artifactKind,
    suppressRelationshipIntelligence,
    suppressRelationshipLead: false,
    suppressReflectionFirst:
      shouldSuppressReflectionForHonorIntent(honorIntent) ||
      learnFastPath ||
      Boolean(overwhelmTodayRoute) ||
      (category === "build" && honorIntent.arrivalMode !== "come_to_be_helped") ||
      (category === "execute" && honorIntent.arrivalMode !== "come_to_be_helped") ||
      (category === "organize" && honorIntent.arrivalMode !== "come_to_be_helped") ||
      (routeMode === "feature_offer" && honorIntent.arrivalMode === "come_to_work"),
    suppressConversationSummary: suppressConversationSummary || learnFastPath,
    learnFastPath,
    suppressWisdomIntelligence: suppressDeepIntelligence,
    suppressTransformationIntelligence: suppressDeepIntelligence,
    suppressObservationEngine:
      suppressRelationshipIntelligence || learnFastPath || artifactExecution,
    stayHereChatGuidance: overwhelmTodayRoute
      ? OVERWHELM_TODAY_STAY_HERE_GUIDANCE
      : null,
    supportStyle,
    supportStyleGuidance: supportStyleGuidance(supportStyle, category),
    adaptMyDayRecommended,
    continuity,
    navigationLine:
      offer?.line ??
      (artifactExecution && artifactKind
        ? buildRegistryArtifactOfferLine(
            artifactKind,
            category === "build" ? "build" : "execute",
          )
        : null),
    stayHereLabel: STAY_HERE_LABEL,
    featureLabel: offer ? featureLabelForSection(offer.section) : null,
    honorTheirIntent: honorIntent,
  };

  decision.suppressRelationshipLead =
    suppressRelationshipIntelligence ||
    shouldSuppressRelationshipLeadForRouting(decision);
  return decision;
}

export function intentRoutingHintForChat(
  decision: IntentRoutingDecision,
): string | null {
  const lines = [
    "INTENT ROUTING INTELLIGENCE (P0.7 — always available, not always visible):",
    `Category: ${decision.category}. Route: ${decision.routeMode}.`,
    `Goal: ${decision.goal.summary}`,
    decision.overwhelmTodayRoute
      ? overwhelmTodayRoutingHint(decision.overwhelmTodayRoute)
      : null,
    decision.suppressConversationSummary
      ? "Do NOT recap the conversation, summarize what you heard, or ask 'Did I get that right?'"
      : null,
    decision.stayHereChatGuidance
      ? `If user stays in chat: ${decision.stayHereChatGuidance}`
      : null,
    decision.supportStyleGuidance,
    decision.suppressReflectionFirst
      ? "Do NOT lead with relationship reflection. Route or build first."
      : null,
    decision.learnFastPath
      ? [
          "LEARN FAST PATH (P0.10): Answer the concept directly — no relationship layer.",
          "FORBIDDEN: I've noticed…, It sounds like…, You seem to…, You're looking to…",
          "Skip observations, wisdom, transformation, and user-pattern framing.",
        ].join("\n")
      : null,
    decision.suppressRelationshipIntelligence && !decision.learnFastPath
      ? [
          "RELATIONSHIP INTELLIGENCE BOUNDARIES (P0.17): This is NOT a self-understanding turn.",
          "ACTION FIRST — answer directly; help them learn, create, plan, decide, or execute.",
          visualStructureRoutingHintForChat(),
          visualThinkingStudioHintForChat(),
          visualThinkingOverreachHintForChat(),
          visualRecommendationEngineHintForChat(),
          visualLearnBoundaryHintForChat(),
          visualThinkingGuardsHintForChat(),
          visualTypeAvailabilityHintForChat(),
          "EXECUTE OVERRIDE (P0.7.3): Direct action only — minimal clarification or Create redirect.",
          "SKIP relationship observations, observation engine, and reflection-first openers entirely.",
          "FORBIDDEN: I've noticed…, behavioral analysis, ADHD pattern explanations, user history recap.",
          "ALLOWED: 'I can help with that.', 'Would you like to open Create?', 'What kind of email is it?'",
        ].join("\n")
      : null,
    decision.suppressRelationshipLead && !decision.suppressRelationshipIntelligence
      ? "Do NOT open with relationship observations for this turn."
      : null,
    decision.clarifyPrompt && !decision.surfaceClarificationUi
      ? `User may need clarification. Ask naturally in your reply: ${decision.clarifyPrompt.replace(/\n/g, " ")}`
      : null,
    decision.workspaceOffer && !decision.surfaceOfferUi
      ? `Feature fit (background): ${decision.featureLabel}. Workspace card is NOT shown — mention only if helpful, permission-first. User may ${decision.stayHereLabel.toLowerCase()}.`
      : null,
    decision.workspaceOffer && decision.surfaceOfferUi
      ? decision.secondaryWorkspaceOffer
        ? `Feature fit: ${decision.featureLabel} (primary) / ${featureLabelForSection(decision.secondaryWorkspaceOffer.section)} (secondary). Permission-first navigation. Buttons: ${decision.workspaceOffer.buttonLabel} / ${decision.secondaryWorkspaceOffer.buttonLabel} / ${decision.stayHereLabel}.`
        : `Feature fit: ${decision.featureLabel}. Permission-first navigation. Buttons: Open ${decision.featureLabel} / ${decision.stayHereLabel}.`
      : null,
    decision.navigationLine && decision.surfaceOfferUi
      ? `Suggested offer line: ${decision.navigationLine}`
      : decision.navigationLine
        ? `If you mention the feature: ${decision.navigationLine}`
        : null,
    decision.continuity
      ? `If user accepts, open ${decision.continuity.section} with context: ${decision.continuity.initialPrompt.slice(0, 160)}`
      : null,
    honorTheirIntentHintForChat(decision.honorTheirIntent),
  ].filter(Boolean);

  return lines.length > 1 ? lines.join("\n") : null;
}
