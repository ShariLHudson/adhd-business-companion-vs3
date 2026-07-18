/**
 * Soft completion checks — only in Completion phase (or late Discovery).
 */

import type { ThinkingMap } from "@/lib/reflectiveConversationIntelligence";
import type { ConversationPhase } from "./conversationPhase";
import type { CqriMessage } from "./types";

const COMPLETION_CHECKS = [
  "Do you feel like you understand this a little better now?",
  "Is there another part of this you still want to stay with?",
  "Have you reached the part that was hardest to untangle?",
] as const;

export function shouldOfferCompletionCheck(input: {
  messages: readonly CqriMessage[];
  thinkingMap?: ThinkingMap | null;
  repairActive?: boolean;
  userText: string;
  conversationPhase?: ConversationPhase;
}): boolean {
  if (input.repairActive) return false;
  if (
    /what do you mean|don'?t understand|explain|confused/i.test(input.userText)
  ) {
    return false;
  }
  if (input.conversationPhase === "completion") return true;
  if (input.conversationPhase === "opening") return false;
  if (input.conversationPhase === "exploration") return false;

  const userTurns = input.messages.filter((m) => m.role === "user").length;
  if (userTurns < 4) return false;
  const insights = input.thinkingMap?.emergingInsights?.length ?? 0;
  const answered = input.thinkingMap?.questionsAnswered?.length ?? 0;
  if (insights >= 1 && answered >= 1) return true;
  if (userTurns >= 6 && answered >= 2) return true;
  return false;
}

export function pickCompletionCheck(
  recentAssistantTexts: readonly string[],
  seed: number,
): string {
  const unused = COMPLETION_CHECKS.filter(
    (c) => !recentAssistantTexts.some((r) => r.includes(c.slice(0, 28))),
  );
  const pool = unused.length > 0 ? unused : COMPLETION_CHECKS;
  return pool[Math.abs(seed) % pool.length]!;
}

/** Append completion only when draft has no question and completion is due. */
export function maybeAttachCompletionCheck(
  text: string,
  check: string | null,
): string {
  if (!check) return text;
  if (text.includes("?")) return text;
  return `${text.trim()} ${check}`.trim();
}
