/**
 * Question quality filter — never ask because it is "next."
 */

import type { RciCandidateQuestion, ThinkingMap } from "./types";
import { significantTokens } from "./repetitionGuard";

function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s']/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Rough check: user already answered something very similar. */
export function alreadyAnswered(
  questionText: string,
  map: ThinkingMap,
  userMessages: readonly string[],
): boolean {
  const qNorm = normalize(questionText);
  const qTokens = new Set(significantTokens(questionText));
  if (qTokens.size === 0) return false;

  for (const answered of map.questionsAnswered) {
    if (normalize(answered) === qNorm) return true;
    const overlap = significantTokens(answered).filter((t) => qTokens.has(t));
    if (overlap.length / qTokens.size >= 0.7) return true;
  }

  if (
    /\bmatters most|what do you want|what are you afraid\b/i.test(questionText)
  ) {
    if (
      map.values.length >= 2 &&
      /\bmatters|important|value\b/i.test(questionText)
    ) {
      return true;
    }
    if (
      map.concerns.length >= 2 &&
      /\bafraid|fear|worry\b/i.test(questionText)
    ) {
      return true;
    }
  }

  if (
    /\bwhich (?:one|option)\b/i.test(questionText) &&
    map.optionsNamed.length >= 2
  ) {
    const last = userMessages[userMessages.length - 1] ?? "";
    if (/\b(?:the |my )?(?:first|second|neither|both)\b/i.test(last)) {
      return true;
    }
  }

  return false;
}

export function passesQuestionQualityFilter(
  question: RciCandidateQuestion,
  map: ThinkingMap,
  userMessages: readonly string[],
): {
  ok: boolean;
  reason?: "already-answered" | "does-not-deepen" | "does-not-follow";
} {
  if (alreadyAnswered(question.text, map, userMessages)) {
    return { ok: false, reason: "already-answered" };
  }

  // Situation-tuned questions always pass deepen/follow checks.
  if (question.id.startsWith("sit-")) {
    return { ok: true };
  }

  if (
    question.area === "future-feeling" ||
    /\bfeel once|hanging over|tomorrow feel|future self\b/i.test(question.text)
  ) {
    const last = (map.lastUserText ?? "").toLowerCase();
    if (
      !/\b(?:decid|handle|finish|avoid|cancel|act|ready|do it|start)\b/.test(
        last,
      )
    ) {
      return { ok: false, reason: "does-not-follow" };
    }
  }

  if (
    map.turnCount >= 3 &&
    /\bwhat happened from your point of view\b/i.test(question.text)
  ) {
    return { ok: false, reason: "does-not-deepen" };
  }

  // Soft relevance: if situation is rich, deprioritize stale "what happened" bank items.
  const sitTokens = new Set(
    significantTokens(map.situation ?? map.lastUserText ?? ""),
  );
  const qTokens = significantTokens(question.text);
  if (sitTokens.size >= 4 && qTokens.length >= 3) {
    const hit = qTokens.some((t) => sitTokens.has(t));
    if (!hit && question.area === "what-happened" && map.turnCount >= 2) {
      return { ok: false, reason: "does-not-follow" };
    }
  }

  void userMessages;
  return { ok: true };
}

export function filterCandidateQuestions(
  candidates: readonly RciCandidateQuestion[],
  map: ThinkingMap,
  usedIds: ReadonlySet<string>,
  userMessages: readonly string[],
): RciCandidateQuestion[] {
  return candidates.filter((q) => {
    if (usedIds.has(q.id)) return false;
    return passesQuestionQualityFilter(q, map, userMessages).ok;
  });
}
