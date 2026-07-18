/**
 * Conversation phases for reflective experiences (Talk It Out first).
 * Invisible to members — shapes pacing only.
 *
 * Opening → Exploration → Discovery → Completion
 */

import type { ThinkingMap } from "@/lib/reflectiveConversationIntelligence";
import type { ConversationPhase, CqriMessage } from "./types";

export type { ConversationPhase };

export function detectConversationPhase(input: {
  messages: readonly CqriMessage[];
  userText: string;
  thinkingMap?: ThinkingMap | null;
  repairActive?: boolean;
}): ConversationPhase {
  if (input.repairActive) {
    // Stay in whatever depth we had — treat as exploration for pacing
    // (repair must explain; not a completion moment).
    return "exploration";
  }

  const userTurns = input.messages.filter((m) => m.role === "user").length;
  // Current turn not yet in messages when called from buildTalkItOutTurn
  const effectiveUserTurns = userTurns + (input.userText.trim() ? 1 : 0);

  if (effectiveUserTurns <= 1) {
    return "opening";
  }

  const map = input.thinkingMap;
  const insights = map?.emergingInsights?.length ?? 0;
  const answered = map?.questionsAnswered?.length ?? 0;
  const named = (map?.optionsNamed?.length ?? 0) + (map?.concerns?.length ?? 0);
  const clarityCue =
    /\b(?:clearer|makes sense|i (?:get|see) (?:it|that)|that helps|figured|realized|i think i know)\b/i.test(
      input.userText,
    );

  if (
    clarityCue ||
    (effectiveUserTurns >= 5 && (insights >= 1 || answered >= 2)) ||
    (effectiveUserTurns >= 6 && named >= 2)
  ) {
    return "completion";
  }

  if (
    insights >= 1 ||
    answered >= 2 ||
    (effectiveUserTurns >= 3 && named >= 2) ||
    effectiveUserTurns >= 4
  ) {
    return "discovery";
  }

  return "exploration";
}

/** Preferred shapes by phase — soft bias, not a hard lock. */
export function phasePreferredShapes(
  phase: ConversationPhase,
): readonly string[] {
  switch (phase) {
    case "opening":
      return ["one-reflective-question", "observation-plus-question"];
    case "exploration":
      return [
        "one-reflective-question",
        "observation-plus-question",
        "one-observation",
      ];
    case "discovery":
      return [
        "one-observation",
        "short-summary",
        "observation-plus-question",
        "invitation-to-continue",
      ];
    case "completion":
      return [
        "intentional-brevity",
        "short-summary",
        "invitation-to-continue",
        "brief-acknowledgement",
      ];
  }
}
