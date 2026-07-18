/**
 * Prefer observation when another question would feel repetitive.
 */

import { countQuestions } from "@/lib/reflectiveConversationIntelligence";
import { shouldSuppressQuestion } from "./questionFrequency";
import type { CqriMessage } from "./types";

export function stripTrailingQuestion(text: string): string {
  const t = text.trim();
  const marks = countQuestions(t);
  if (marks === 0) return t;
  const qIdx = t.lastIndexOf("?");
  if (qIdx < 0) return t;
  const before = t.slice(0, qIdx).trim();
  const lastBreak = Math.max(
    before.lastIndexOf("."),
    before.lastIndexOf("!"),
  );
  if (lastBreak > 16) {
    return before.slice(0, lastBreak + 1).trim();
  }
  // Pure interrogative drafts must not become fake statements ending in "."
  // Package 191/206 — never invent vague pause shells ("Take your time with that.").
  if (/^(what|which|how|why|when|where|who|do|does|did|is|are|would|could)\b/i.test(before)) {
    return "We can stay with what you just shared.";
  }
  if (before.length > 12) {
    return before.replace(/[,;:\s]+$/, "").trim() + ".";
  }
  return t;
}

export function preferObservationOverQuestion(input: {
  text: string;
  messages: readonly CqriMessage[];
  userText: string;
  repairActive?: boolean;
  responseKind: string;
}): { text: string; blockedQuestion: boolean } {
  if (input.repairActive || input.responseKind === "repair") {
    return { text: input.text, blockedQuestion: false };
  }
  if (input.responseKind === "clarifying-question") {
    // Keep one clarifying question unless frequency says otherwise
    if (
      !shouldSuppressQuestion({
        messages: input.messages,
        userText: input.userText,
        repairActive: false,
      })
    ) {
      return { text: input.text, blockedQuestion: false };
    }
  }
  if (
    shouldSuppressQuestion({
      messages: input.messages,
      userText: input.userText,
      repairActive: input.repairActive,
    }) &&
    countQuestions(input.text) >= 1
  ) {
    return {
      text: stripTrailingQuestion(input.text),
      blockedQuestion: true,
    };
  }
  return { text: input.text, blockedQuestion: false };
}
