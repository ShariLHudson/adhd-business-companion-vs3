/**
 * Conversation Decision contract — Phase A single-decision spine.
 *
 * Extends stabilization arbitration with response mode + permissions.
 * Knowledge and Directors contribute thinly; they do not finish the turn.
 * Observation Mode: no new Spec — consolidates existing authority.
 */

import {
  classifyOverwhelmNeed,
  shouldBlockScenicOverwhelmMenu,
  type OverwhelmNeedKind,
} from "@/lib/conversation/overwhelmNeedClassifier";
import { mayOfferScenicPlaceSuggestions } from "@/lib/estate/scenicPlaceSuggestionPolicy";
import { isBreatheUniversalRequest } from "@/lib/universalAccess/breatheUniversalAccess";
import { isExplicitNavigationIntent } from "./goalClassifier";
import {
  arbitrateConversationRouting,
  type ArbitrationInput,
  type ArbitrationResult,
} from "./arbitration";
import {
  buildTurnDecisionLogRecord,
  getActiveTurnDecision,
  getTurnAnnotation,
} from "./turnDecisionStore";

/** 301 response modes — exactly one primary mode per turn. */
export type ConversationResponseMode =
  | "natural_conversation"
  | "answer_directly"
  | "continue_workflow"
  | "ask_one_needed_question"
  | "offer_optional_help"
  | "show_choices"
  | "navigate_explicitly"
  | "perform_approved_action"
  | "prepare_for_review"
  | "resume_previous_work";

export type ConversationPermission = "allowed" | "denied" | "ask_first";

export type ConversationDecisionInput = ArbitrationInput & {
  primaryTurnType?: string | null;
  /** Handler that claimed the turn (filled when finishing). */
  finalResponseOwner?: string | null;
  /** Pending menu is active — pending answer owns precedence. */
  pendingSelectionActive?: boolean;
};

export type ConversationDecision = {
  primaryIntent: string;
  secondaryIntent?: string;
  emotionalCondition: OverwhelmNeedKind | "none";
  responseMode: ConversationResponseMode;
  navigationPermission: ConversationPermission;
  creationPermission: ConversationPermission;
  actionPermission: ConversationPermission;
  /** Scenic / experience place menus (Peaceful Places, Think & Reflect, …). */
  scenicMenuPermission: ConversationPermission;
  /** Auto-open Breathe destination (not conversational offer). */
  breatheAutoOpenPermission: ConversationPermission;
  /** Estate kernel place-menu plans. */
  kernelPlaceMenuPermission: ConversationPermission;
  selectedIntelligence: string[];
  arbitration: ArbitrationResult;
  primaryTurnType?: string | null;
  finalResponseOwner?: string | null;
  confidence: number;
  reason: string;
};

export type ConversationDecisionRecord = {
  turnId?: string;
  conversationId?: string;
  messageId?: string;
  primaryIntent: string;
  activeWorkflow?: string | null;
  pendingState?: string | null;
  emotionalCondition: string;
  responseMode: ConversationResponseMode;
  navigationPermission: ConversationPermission;
  scenicMenuPermission: ConversationPermission;
  breatheAutoOpenPermission: ConversationPermission;
  selectedIntelligence: string[];
  routeSelected?: string | null;
  finalResponseOwner?: string | null;
  actionExecuted?: string | null;
  bypassDetected?: string | null;
  goal: string;
  sessionLocked: boolean;
};

declare global {
  interface Window {
    __sparkConversationDecisionLog?: ConversationDecisionRecord[];
  }
}

function mapGoalToPrimaryIntent(goal: ArbitrationResult["goal"]): string {
  switch (goal) {
    case "continue_session":
      return "continue_workflow";
    case "explicit_navigation":
      return "navigate";
    case "capture":
      return "capture";
    case "create":
      return "create";
    case "research":
      return "research";
    case "retrieve":
      return "retrieve";
    case "plan_strategy":
      return "plan";
    case "decision_support":
      return "decide";
    case "help_how_to":
      return "help";
    case "discovery_estate":
      return "discover_estate";
    default:
      return "conversation";
  }
}

function pickResponseMode(
  arbitration: ArbitrationResult,
  emotional: OverwhelmNeedKind | "none",
  userText: string,
  pendingSelectionActive?: boolean,
): ConversationResponseMode {
  if (pendingSelectionActive) {
    return "perform_approved_action";
  }
  if (arbitration.sessionLocked && !arbitration.explicitDirectionChange) {
    return "continue_workflow";
  }
  if (isExplicitNavigationIntent(userText)) {
    return "navigate_explicitly";
  }
  if (arbitration.goal === "research" || arbitration.goal === "retrieve") {
    return "answer_directly";
  }
  if (arbitration.goal === "create" || arbitration.goal === "capture") {
    return "perform_approved_action";
  }
  if (emotional === "task_breakdown") {
    return "ask_one_needed_question";
  }
  if (emotional === "cognitive_overload") {
    return "offer_optional_help";
  }
  if (arbitration.goal === "decision_support") {
    return "offer_optional_help";
  }
  return "natural_conversation";
}

/** Text-based scenic gate (used while building the turn decision). */
export function computeScenicPlaceMenuAllowed(userText: string): boolean {
  if (!mayOfferScenicPlaceSuggestions(userText)) return false;
  if (shouldBlockScenicOverwhelmMenu(userText)) return false;
  return true;
}

/** Text-based breathe auto-open (used while building the turn decision). */
export function computeBreatheAutoOpenAllowed(userText: string): boolean {
  return isBreatheUniversalRequest(userText);
}

/**
 * Whether scenic / multi-place experience menus may finish this turn.
 * Prefers the immutable turn decision when one is active.
 */
export function authorizeScenicPlaceMenu(userText: string): boolean {
  const turn = getActiveTurnDecision();
  if (turn) return turn.scenicMenuPermission === "allowed";
  return computeScenicPlaceMenuAllowed(userText);
}

/**
 * Auto-open Breathe only on explicit breathe language — never bare overwhelm.
 * Prefers the immutable turn decision when one is active.
 */
export function authorizeBreatheAutoOpen(userText: string): boolean {
  const turn = getActiveTurnDecision();
  if (turn) return turn.breatheAutoOpenPermission === "allowed";
  return computeBreatheAutoOpenAllowed(userText);
}

/**
 * Direct estate navigation (single place). Prefers turn decision when active.
 */
export function authorizeDirectNavigation(userText: string): boolean {
  const turn = getActiveTurnDecision();
  if (turn) return turn.navigationPermission !== "denied";
  return isExplicitNavigationIntent(userText);
}

/**
 * Build the turn decision once per user message.
 * Does not produce member-facing copy.
 */
export function buildConversationDecision(
  input: ConversationDecisionInput,
): ConversationDecision {
  const arbitration = arbitrateConversationRouting(input);
  const emotional = classifyOverwhelmNeed(input.userText) ?? "none";
  const pendingSelectionActive = Boolean(input.pendingSelectionActive);

  // Pending answers own the turn — deny new scenic/breathe; allow completing nav.
  const scenicAllowed = pendingSelectionActive
    ? false
    : computeScenicPlaceMenuAllowed(input.userText);
  const breatheAllowed = pendingSelectionActive
    ? false
    : computeBreatheAutoOpenAllowed(input.userText);
  const explicitNav =
    pendingSelectionActive || isExplicitNavigationIntent(input.userText);

  const selectedIntelligence: string[] = [];
  if (pendingSelectionActive) selectedIntelligence.push("pending_selection");
  if (emotional !== "none") selectedIntelligence.push("overwhelm_need");
  if (arbitration.semanticIntent) selectedIntelligence.push("semantic_intent");
  if (arbitration.sessionLocked) selectedIntelligence.push("active_session");

  const primaryIntent = pendingSelectionActive
    ? "pending_selection"
    : input.primaryTurnType && input.primaryTurnType !== "IMPLIED_NEED"
      ? input.primaryTurnType.toLowerCase()
      : mapGoalToPrimaryIntent(arbitration.goal);

  const responseMode = pickResponseMode(
    arbitration,
    emotional,
    input.userText,
    pendingSelectionActive,
  );

  const navigationPermission: ConversationPermission = explicitNav
    ? "allowed"
    : scenicAllowed
      ? "ask_first"
      : arbitration.sessionLocked ||
          emotional === "task_breakdown" ||
          emotional === "cognitive_overload"
        ? "denied"
        : "ask_first";

  return {
    primaryIntent,
    secondaryIntent: emotional !== "none" ? emotional : undefined,
    emotionalCondition: emotional,
    responseMode,
    navigationPermission,
    creationPermission:
      arbitration.goal === "create" || arbitration.goal === "capture"
        ? "allowed"
        : "ask_first",
    actionPermission: pendingSelectionActive ? "allowed" : "ask_first",
    scenicMenuPermission: scenicAllowed ? "allowed" : "denied",
    breatheAutoOpenPermission: breatheAllowed ? "allowed" : "denied",
    kernelPlaceMenuPermission: scenicAllowed ? "allowed" : "denied",
    selectedIntelligence,
    arbitration,
    primaryTurnType: input.primaryTurnType,
    finalResponseOwner: input.finalResponseOwner,
    confidence: pendingSelectionActive
      ? 0.95
      : arbitration.semanticIntent?.confidence === "high"
        ? 0.85
        : 0.65,
    reason: pendingSelectionActive
      ? "pending_selection_precedence"
      : arbitration.reason,
  };
}

export function mayFinishWithScenicMenu(decision: ConversationDecision): boolean {
  return decision.scenicMenuPermission === "allowed";
}

export function mayKernelOfferPlaceMenu(decision: ConversationDecision): boolean {
  return decision.kernelPlaceMenuPermission === "allowed";
}

export function mayAutoOpenBreathe(decision: ConversationDecision): boolean {
  return decision.breatheAutoOpenPermission === "allowed";
}

/** Structured log — never blocks the member response. */
export function logConversationDecision(
  decision: ConversationDecision,
  meta?: { conversationId?: string; messageId?: string; turnId?: string },
): void {
  try {
    const storeRecord = buildTurnDecisionLogRecord();
    const annotation = getTurnAnnotation();
    const record: ConversationDecisionRecord = {
      turnId:
        (storeRecord?.turnId as string | undefined) ??
        meta?.turnId ??
        meta?.messageId,
      conversationId: meta?.conversationId,
      messageId: meta?.messageId,
      primaryIntent: decision.primaryIntent,
      activeWorkflow:
        (storeRecord?.activeWorkflow as string | null | undefined) ??
        (decision.arbitration.sessionLocked ? decision.arbitration.goal : null),
      pendingState:
        (storeRecord?.pendingState as string | null | undefined) ??
        annotation?.pendingState ??
        null,
      emotionalCondition: decision.emotionalCondition,
      responseMode: decision.responseMode,
      navigationPermission: decision.navigationPermission,
      scenicMenuPermission: decision.scenicMenuPermission,
      breatheAutoOpenPermission: decision.breatheAutoOpenPermission,
      selectedIntelligence: decision.selectedIntelligence,
      routeSelected:
        (storeRecord?.routeSelected as string | null | undefined) ??
        annotation?.routeSelected ??
        null,
      finalResponseOwner:
        (storeRecord?.finalResponseOwner as string | null | undefined) ??
        decision.finalResponseOwner ??
        annotation?.finalResponseOwner ??
        null,
      actionExecuted:
        (storeRecord?.actionExecuted as string | null | undefined) ??
        annotation?.actionExecuted ??
        null,
      bypassDetected:
        (storeRecord?.bypassDetected as string | null | undefined) ??
        annotation?.bypassDetected ??
        null,
      goal: decision.arbitration.goal,
      sessionLocked: decision.arbitration.sessionLocked,
    };

    if (typeof process !== "undefined" && process.env.NODE_ENV !== "production") {
      if (process.env.NEXT_PUBLIC_CONVERSATION_DECISION_TRACE === "1") {
        console.info("[conversation-decision]", record);
      }
    }
    if (typeof window !== "undefined") {
      const log = window.__sparkConversationDecisionLog ?? [];
      log.push(record);
      window.__sparkConversationDecisionLog = log.slice(-50);
    }
  } catch {
    // Logging must never block the turn.
  }
}

/**
 * Feature flag: when "0", permission helpers that wrap this still use
 * authorizeScenicPlaceMenu / authorizeBreatheAutoOpen (reliability non-negotiable).
 * Shadow log always records when buildConversationDecision is called.
 */
export function isConversationDecisionGateEnabled(): boolean {
  if (typeof process === "undefined") return true;
  return process.env.NEXT_PUBLIC_CONVERSATION_DECISION_GATE !== "0";
}
