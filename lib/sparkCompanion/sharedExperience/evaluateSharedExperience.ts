import { classifyPrimaryConversationTurn } from "@/lib/conversation/primaryTurnClassifier";
import { SHARED_EXPERIENCE_CANON_BRIDGES } from "./canonBridges";
import type {
  EvaluateSharedExperienceInput,
  SharedExperienceBridge,
  SharedExperienceDecision,
} from "./types";

const INFORMATION_ONLY_RE =
  /^\s*(?:what is|what are|how does|how do|explain|describe|define|tell me about|can you explain)\b/i;

const STRUGGLE_NOT_INFO_RE =
  /\b(?:i (?:keep|can'?t|cannot|feel|am)|(?:so|too) (?:much|overwhelmed)|struggling|stuck|overwhelm)\b/i;

function matchesBridge(text: string, bridge: SharedExperienceBridge): boolean {
  return bridge.triggers.some((re) => re.test(text));
}

function pickBridge(
  text: string,
  recentBridgeIds: readonly string[],
): SharedExperienceBridge | null {
  for (const bridge of SHARED_EXPERIENCE_CANON_BRIDGES) {
    if (recentBridgeIds.includes(bridge.id)) continue;
    if (matchesBridge(text, bridge)) return bridge;
  }
  return null;
}

/**
 * Decide whether Shari may offer a brief shared experience this turn.
 * Teach/information turns → never relate.
 */
export function evaluateSharedExperience(
  input: EvaluateSharedExperienceInput,
): SharedExperienceDecision {
  const text = input.userText.trim();
  if (!text) {
    return { allowed: false, bridge: null, reason: "empty message" };
  }

  if (input.momentumLocked) {
    return { allowed: false, bridge: null, reason: "momentum locked" };
  }

  const primary = classifyPrimaryConversationTurn({ userText: text });

  if (primary.type === "INFORMATION_OR_RESEARCH") {
    return {
      allowed: false,
      bridge: null,
      reason: "information or research — teach only, no shared experience",
    };
  }

  if (primary.type === "TASK_REQUEST" && !STRUGGLE_NOT_INFO_RE.test(text)) {
    return {
      allowed: false,
      bridge: null,
      reason: "task request without struggle signal",
    };
  }

  if (INFORMATION_ONLY_RE.test(text) && !STRUGGLE_NOT_INFO_RE.test(text)) {
    return {
      allowed: false,
      bridge: null,
      reason: "pure information question",
    };
  }

  const recent = input.recentBridgeIds ?? [];
  const bridge = pickBridge(text, recent);
  if (!bridge) {
    return {
      allowed: false,
      bridge: null,
      reason: "no matching struggle theme or bridge on cooldown",
    };
  }

  return {
    allowed: true,
    bridge,
    reason: `struggle theme: ${bridge.theme}`,
  };
}
