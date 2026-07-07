/**
 * Pick the single winning capability after session lock, goal, and estate check.
 */

import type { ArbitrationResult } from "./arbitration";
import { TASK_GOALS_BLOCKING_ESTATE } from "./goalClassifier";
import type { ConversationGoal } from "./goalClassifier";
import type {
  CapabilityEvaluation,
  EstateCapability,
} from "./capabilityTypes";

const GOAL_CAPABILITY: Partial<Record<ConversationGoal, EstateCapability>> = {
  continue_session: "session_continue",
  explicit_navigation: "navigation",
  capture: "capture",
  create: "create",
  research: "research",
  retrieve: "retrieval",
  help_how_to: "feature",
  discovery_estate: "discovery",
};

const ESTATE_WIN_ORDER: EstateCapability[] = [
  "room",
  "navigation",
  "feature",
  "object",
  "experience",
  "discovery",
  "help",
];

const TASK_FALLBACK_ORDER: EstateCapability[] = [
  "capture",
  "create",
  "research",
  "retrieval",
];

function bestEligible(
  candidates: CapabilityEvaluation[],
  capability: EstateCapability,
  minConfidence: "medium" | "high" = "medium",
): CapabilityEvaluation | null {
  const row = candidates.find((c) => c.capability === capability);
  if (!row?.eligible) return null;
  if (row.confidence === "low") return null;
  if (minConfidence === "high" && row.confidence !== "high") return null;
  return row;
}

export function selectWinningCapability(
  arbitration: ArbitrationResult,
  candidates: CapabilityEvaluation[],
  userText?: string,
): EstateCapability | null {
  const { goal, activeSession, sessionLocked, explicitDirectionChange } =
    arbitration;
  const whereIsQuery = userText ? /\bwhere is\b/i.test(userText.trim()) : false;

  if (sessionLocked) {
    if (explicitDirectionChange && goal === "explicit_navigation") {
      if (bestEligible(candidates, "navigation", "medium")) {
        return "navigation";
      }
    }
    if (activeSession === "brain_dump") {
      if (bestEligible(candidates, "capture", "medium")) return "capture";
    }
    if (bestEligible(candidates, "session_continue", "medium")) {
      return "session_continue";
    }
    return "session_continue";
  }

  if (
    activeSession === "universal_creation" ||
    activeSession === "project_naming" ||
    activeSession === "conversation_session"
  ) {
    if (bestEligible(candidates, "session_continue", "medium")) {
      return "session_continue";
    }
  }

  if (TASK_GOALS_BLOCKING_ESTATE.has(goal)) {
    const mapped = GOAL_CAPABILITY[goal];
    if (mapped) return mapped;
    for (const cap of TASK_FALLBACK_ORDER) {
      if (bestEligible(candidates, cap, "high")) {
        return cap;
      }
    }
  }

  if (whereIsQuery && bestEligible(candidates, "room", "medium")) {
    return "room";
  }

  if (goal === "discovery_estate") {
    if (bestEligible(candidates, "discovery", "medium")) {
      return "discovery";
    }
  }

  if (goal === "explicit_navigation") {
    if (bestEligible(candidates, "navigation", "medium")) {
      return "navigation";
    }
  }

  if (!arbitration.estateIntelligenceNeeded) {
    return null;
  }

  for (const cap of ESTATE_WIN_ORDER) {
    if (cap === "room" && whereIsQuery) continue;
    if (bestEligible(candidates, cap, "medium")) {
      return cap;
    }
  }

  const goalMapped = GOAL_CAPABILITY[goal];
  if (goalMapped && bestEligible(candidates, goalMapped, "medium")) {
    return goalMapped;
  }

  const semantic = arbitration.semanticIntent;
  if (
    semantic &&
    semantic.confidence !== "low" &&
    semantic.estateCapability &&
    bestEligible(candidates, semantic.estateCapability, "medium")
  ) {
    return semantic.estateCapability;
  }

  return null;
}
