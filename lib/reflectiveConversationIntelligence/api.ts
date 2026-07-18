/**
 * Shared Reflective Conversation Intelligence API.
 * Any Estate experience can call runReflectiveTurn().
 */

import { markQuestionExplored, updateThinkingMap } from "./thinkingMap";
import {
  containsUnsupportedHiddenMeaning,
  draftReusesRejectedInterpretation,
} from "./noHiddenMeaning";
import { selectReflectiveResponse } from "./responseSelection";
import { ensureSingleQuestion } from "./repetitionGuard";
import type { RciTurnInput, RciTurnResult } from "./types";

/**
 * One reflective turn: update Thinking Map → select response → return.
 * Does not handle advice/help routing — callers own that boundary.
 */
export function runReflectiveTurn(input: RciTurnInput): RciTurnResult {
  const {
    userText,
    messages,
    previousMap,
    usedQuestionIds = [],
    candidateQuestions = [],
    futureFeelingAlreadyAsked = false,
  } = input;

  // Include current user text in map update even if not yet appended to messages.
  const messagesForMap =
    messages.some(
      (m) => m.role === "user" && m.content.trim() === userText.trim(),
    )
      ? messages
      : [...messages, { role: "user" as const, content: userText }];

  let map = updateThinkingMap(previousMap, userText, messagesForMap);
  const userMessages = messagesForMap
    .filter((m) => m.role === "user")
    .map((m) => m.content);

  const selected = selectReflectiveResponse({
    map,
    userText,
    userMessages,
    usedQuestionIds,
    candidateQuestions,
    futureFeelingAlreadyAsked,
  });

  if (selected.questionId && selected.text) {
    map = markQuestionExplored(map, selected.text);
  }

  let assistantText = ensureSingleQuestion(selected.text);
  // Package 192 — never send unsupported hidden-meaning drafts
  if (
    containsUnsupportedHiddenMeaning(assistantText) ||
    draftReusesRejectedInterpretation(assistantText, map)
  ) {
    const hire =
      /\b(?:hir(?:e|ing)|marketing|sales)\b/i.test(userText) ||
      /\b(?:hir|marketing|sales)\b/i.test(map.literalTopic ?? "");
    assistantText = hire
      ? "What is making you consider hiring someone now?"
      : "What part of what you shared feels most useful to understand first?";
  }

  const deepened =
    selected.kind !== "invite-continue" &&
    (Boolean(selected.questionId) ||
      selected.kind === "gentle-observation" ||
      selected.kind === "tentative-pattern" ||
      selected.kind === "connection" ||
      selected.kind === "summary");

  return {
    assistantText,
    responseKind: selected.kind,
    archetype: map.archetype,
    thinkingMap: map,
    questionId: selected.questionId,
    futureFeelingAsked: selected.futureFeelingAsked,
    offeredCompletionCheck: selected.offeredCompletionCheck,
    meta: {
      deepenedUnderstanding: deepened,
      rejectedAsRepetition: false,
      rejectedAsAlreadyAnswered: selected.rejectedAsAlreadyAnswered,
    },
  };
}
