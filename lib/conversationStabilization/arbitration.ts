/**
 * Capability arbitration — active session first, then intent. Estate is secondary.
 */

import {
  detectCompanionActiveSession,
  isCompanionSessionLocked,
  isExplicitDirectionChange,
  type CompanionActiveSession,
} from "@/lib/companionIntelligence/activeSession";
import { shouldUseEstateIntelligence } from "@/lib/companionIntelligence/estateGate";
import {
  classifyConversationGoal,
  isExplicitNavigationIntent,
  TASK_GOALS_BLOCKING_ESTATE,
  type ConversationGoal,
} from "./goalClassifier";
import {
  isSemanticIntentResolverEnabled,
  resolveSemanticMemberIntent,
  type SemanticMemberIntent,
} from "@/lib/semanticIntentResolver";
import {
  semanticNeedsEstateIntelligence,
  upgradeGoalFromSemantic,
} from "@/lib/semanticIntentResolver/mapToRouting";

export type ActiveSessionKind = CompanionActiveSession;

export type EstateSubsystem =
  | "recommendation"
  | "implied_need"
  | "help_discovery_location"
  | "estate_guide"
  | "navigation_philosophy";

export type ArbitrationInput = {
  userText: string;
  lastAssistantText?: string | null;
  activeWorkflow?: string | null;
  workspace?: string | null;
};

export type ArbitrationResult = {
  goal: ConversationGoal;
  activeSession: ActiveSessionKind;
  priority: number;
  blockedSubsystems: EstateSubsystem[];
  reason: string;
  sessionLocked: boolean;
  explicitDirectionChange: boolean;
  estateIntelligenceNeeded: boolean;
  semanticIntent: SemanticMemberIntent | null;
};

function goalPriority(goal: ConversationGoal): number {
  switch (goal) {
    case "continue_session":
      return 1;
    case "explicit_navigation":
      return 2;
    case "capture":
      return 3;
    case "create":
      return 4;
    case "research":
      return 5;
    case "retrieve":
      return 6;
    case "plan_strategy":
      return 7;
    case "decision_support":
      return 8;
    case "help_how_to":
      return 9;
    case "discovery_estate":
      return 10;
    default:
      return 11;
  }
}

export function arbitrateConversationRouting(
  input: ArbitrationInput,
): ArbitrationResult {
  const activeSession = detectCompanionActiveSession(input);
  const explicitDirectionChange = isExplicitDirectionChange(
    input.userText,
    activeSession,
  );
  const sessionLocked = isCompanionSessionLocked(
    activeSession,
    explicitDirectionChange,
  );

  const goal = classifyConversationGoal(input.userText, {
    lastAssistantText: input.lastAssistantText,
    hasUniversalCreationSession: activeSession === "universal_creation",
    hasConversationSession: activeSession === "conversation_session",
    activeWorkflow: input.activeWorkflow,
    workspace: input.workspace,
    activeSession,
    sessionLocked,
    explicitDirectionChange,
  });

  const semanticIntent = isSemanticIntentResolverEnabled()
    ? resolveSemanticMemberIntent({
        userText: input.userText,
        lastAssistantText: input.lastAssistantText,
        activeWorkflow: input.activeWorkflow,
        workspace: input.workspace,
        sessionLocked,
        explicitDirectionChange,
        activeSession,
      })
    : null;

  const mergedGoal = upgradeGoalFromSemantic(goal, semanticIntent);

  const blockedSubsystems: EstateSubsystem[] = [];
  let reason = "default";

  if (sessionLocked || TASK_GOALS_BLOCKING_ESTATE.has(mergedGoal) || mergedGoal === "explicit_navigation") {
    blockedSubsystems.push("recommendation", "implied_need");
    reason = sessionLocked
      ? `active_session:${activeSession}`
      : `task_goal:${mergedGoal}`;
  }

  if (sessionLocked) {
    blockedSubsystems.push(
      "help_discovery_location",
      "estate_guide",
      "navigation_philosophy",
    );
    if (!explicitDirectionChange || !isExplicitNavigationIntent(input.userText)) {
      if (!blockedSubsystems.includes("recommendation")) {
        blockedSubsystems.push("recommendation");
      }
    }
  }

  if (TASK_GOALS_BLOCKING_ESTATE.has(mergedGoal)) {
    if (!blockedSubsystems.includes("help_discovery_location")) {
      blockedSubsystems.push("help_discovery_location");
    }
    if (mergedGoal === "retrieve" || mergedGoal === "research") {
      blockedSubsystems.push("estate_guide");
    }
  }

  if (mergedGoal === "retrieve") {
    blockedSubsystems.push("estate_guide", "navigation_philosophy");
    reason = "retrieve_content";
  }

  const estateIntelligenceNeeded =
    shouldUseEstateIntelligence(
      {
        goal: mergedGoal,
        activeSession,
        priority: goalPriority(mergedGoal),
        blockedSubsystems,
        reason,
        sessionLocked,
        explicitDirectionChange,
        estateIntelligenceNeeded: false,
        semanticIntent,
      },
      input.userText,
      input.lastAssistantText,
    ) || semanticNeedsEstateIntelligence(semanticIntent);

  return {
    goal: mergedGoal,
    activeSession,
    priority: goalPriority(mergedGoal),
    blockedSubsystems,
    reason: semanticIntent?.reason ?? reason,
    sessionLocked,
    explicitDirectionChange,
    estateIntelligenceNeeded,
    semanticIntent,
  };
}

export function shouldBlockEstateSubsystem(
  arbitration: ArbitrationResult,
  subsystem: EstateSubsystem,
): boolean {
  return arbitration.blockedSubsystems.includes(subsystem);
}

export function isConversationStabilizationEnabled(): boolean {
  if (typeof process === "undefined") return true;
  return process.env.NEXT_PUBLIC_CONVERSATION_STABILIZATION !== "0";
}
