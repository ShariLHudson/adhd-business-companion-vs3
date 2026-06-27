/**
 * Clear My Mind → Companion Presence journey mapping.
 *
 * Listening → Receiving → Thinking → Understanding → Supporting
 */

import type { ClearMyMindStage } from "@/lib/clearMyMindStages";
import type { ClearMyMindUnfoldStep } from "@/lib/clearMyMindUnfold";
import { shariVisibleThinkingLine } from "@/lib/clearMyMindCompanionVoice";
import type {
  CompanionAnimationState,
  CompanionPresenceExpression,
  CompanionPresenceResult,
  CompanionSpeechBubbleState,
} from "./types";

export type ClearMyMindPresencePhase =
  | "listening"
  | "thinking"
  | "receiving"
  | "understanding"
  | "supporting";

const LISTENING_LINES = [
  "I'm here with you.",
  "Take your time.",
  "No rush — I'm listening.",
] as const;

export function resolveClearMyMindPresencePhase(input: {
  stage: ClearMyMindStage;
  shareConfirming: boolean;
  holdAck: string | null;
  showingPatterns: boolean;
  unfoldStep?: ClearMyMindUnfoldStep;
}): ClearMyMindPresencePhase {
  if (input.shareConfirming) {
    return "thinking";
  }

  const unfold = input.unfoldStep ?? "idle";
  if (unfold === "reflecting") {
    return "thinking";
  }
  if (
    (unfold === "connections" || unfold === "patterns") &&
    !input.showingPatterns
  ) {
    return "understanding";
  }
  if (unfold === "possibility") {
    return "supporting";
  }

  if (input.stage === "release" && input.holdAck) {
    return "receiving";
  }
  if (input.stage === "permission" || input.stage === "release") {
    return "listening";
  }
  if (input.stage === "received") {
    return "receiving";
  }
  if (input.stage === "understanding") {
    return input.showingPatterns ? "listening" : "thinking";
  }
  if (input.stage === "choice") {
    return "supporting";
  }
  return "listening";
}

function listeningLine(seed: number): string {
  return LISTENING_LINES[Math.abs(seed) % LISTENING_LINES.length];
}

/** Presence evaluation for Clear My Mind — consumes journey phase, not page logic. */
export function evaluateClearMyMindPresence(
  phase: ClearMyMindPresencePhase,
  now = new Date(),
): CompanionPresenceResult {
  const base = {
    photoContext: "reflection" as const,
    rotate: false,
    shariImageState: "support" as const,
  };

  switch (phase) {
    case "listening":
      return {
        ...base,
        expression: "listening",
        animationState: "listening",
        speechBubbleState: "listening",
        thinkingMessage: listeningLine(now.getMinutes()),
        reason: "clear-my-mind:listening",
      };
    case "thinking":
      return {
        ...base,
        expression: "thoughtful",
        animationState: "thinking",
        speechBubbleState: "thinking",
        shariImageState: "support",
        thinkingMessage: shariVisibleThinkingLine(now.getMinutes()),
        reason: "clear-my-mind:thinking",
      };
    case "receiving":
      return {
        ...base,
        expression: "calm_reassurance",
        animationState: "listening",
        speechBubbleState: "listening",
        thinkingMessage: null,
        reason: "clear-my-mind:receiving",
      };
    case "understanding":
      return {
        ...base,
        expression: "thoughtful",
        animationState: "thinking",
        speechBubbleState: "thinking",
        thinkingMessage: "I want to be thoughtful here.",
        reason: "clear-my-mind:understanding",
      };
    case "supporting":
      return {
        ...base,
        expression: "encouraging",
        animationState: "listening",
        speechBubbleState: "listening",
        thinkingMessage: null,
        reason: "clear-my-mind:supporting",
      };
  }
}

export function clearMyMindPresenceIsThinking(
  phase: ClearMyMindPresencePhase,
): boolean {
  return phase === "thinking" || phase === "understanding";
}
