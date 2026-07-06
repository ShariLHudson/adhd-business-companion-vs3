/**
 * Pass 2 — prevent re-interview when Conversation Session already holds an answer.
 */

import type { AnsweredQuestion, ConversationSession } from "./types";

export const DISCOVERY_SLOT_ALIASES: Record<string, readonly string[]> = {
  what: ["what", "purpose", "topic", "subject"],
  why: ["why", "reason", "motivation"],
  who: ["who", "audience", "recipient", "for"],
  success: ["success", "goal", "outcome", "result"],
};

function normalizeSlot(slot: string): string {
  return slot.trim().toLowerCase();
}

export function slotAliases(slot: string): readonly string[] {
  const key = normalizeSlot(slot);
  return DISCOVERY_SLOT_ALIASES[key] ?? [key];
}

export function findAnswerForSlot(
  session: ConversationSession | null | undefined,
  slot: string,
): AnsweredQuestion | undefined {
  if (!session?.answeredQuestions.length) return undefined;
  const searchAliases = new Set(slotAliases(slot));
  return session.answeredQuestions.find((q) => {
    const qSlot = normalizeSlot(q.slot);
    const qAliases = slotAliases(qSlot);
    if (searchAliases.has(qSlot)) return true;
    if (qAliases.some((a) => searchAliases.has(a))) return true;
    if (q.questionId && searchAliases.has(normalizeSlot(q.questionId))) return true;
    return false;
  });
}

export function isQuestionAnswered(
  session: ConversationSession | null | undefined,
  slot: string,
): boolean {
  const answer = findAnswerForSlot(session, slot);
  return Boolean(answer?.answer?.trim());
}

/** Returns false when the session already holds this slot — adapters must not re-ask. */
export function mayAskQuestion(
  session: ConversationSession | null | undefined,
  slot: string,
): boolean {
  return !isQuestionAnswered(session, slot);
}

export function hasDiscoveryBasics(
  session: ConversationSession | null | undefined,
): { purpose: boolean; audience: boolean; goal: boolean } {
  return {
    purpose: isQuestionAnswered(session, "what"),
    audience: isQuestionAnswered(session, "who"),
    goal: isQuestionAnswered(session, "success"),
  };
}
