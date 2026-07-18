/**
 * Shape the draft to the selected rhythm — never invent new advice.
 */

import { ensureSingleQuestion } from "@/lib/reflectiveConversationIntelligence";
import type { ConversationPhase } from "./conversationPhase";
import { applyLengthBudget, selectLengthCategory } from "./lengthSelector";
import {
  maybeAttachCompletionCheck,
  pickCompletionCheck,
  shouldOfferCompletionCheck,
} from "./completionRhythm";
import { preferObservationOverQuestion } from "./observationVsQuestion";
import { buildGroundedFallback } from "@/lib/conversationalIntelligence/groundedAcknowledgement";
import type {
  CqriInput,
  CqriLengthCategory,
  CqriResponseShape,
} from "./types";

/**
 * Package 191/206 — brief holds only.
 * Never "Take your time." / "Take your time with that." (permanent Talk It Out ban).
 */
const BRIEF_ACKS = [
  "We can stay with what you just named.",
  "No rush — say what comes next when you are ready.",
  "We can stay right here until it feels clearer.",
] as const;

export function applyResponseShape(input: {
  draft: string;
  shape: CqriResponseShape;
  cqriInput: CqriInput;
  seed: number;
  conversationPhase?: ConversationPhase;
}): {
  text: string;
  lengthCategory: CqriLengthCategory;
  repeatedQuestionBlocked: boolean;
  completionCheckUsed: boolean;
} {
  let text = input.draft.trim();
  let repeatedQuestionBlocked = false;
  let completionCheckUsed = false;

  const lengthCategory = selectLengthCategory({
    userText: input.cqriInput.userText,
    repairActive: input.cqriInput.repairActive,
    responseKind: input.cqriInput.responseKind,
    archetype: input.cqriInput.archetype,
    wantsSummary: input.shape === "short-summary",
  });

  if (
    input.shape === "brief-acknowledgement" ||
    input.shape === "intentional-brevity"
  ) {
    const obs = preferObservationOverQuestion({
      text,
      messages: input.cqriInput.messages,
      userText: input.cqriInput.userText,
      repairActive: input.cqriInput.repairActive,
      responseKind: input.cqriInput.responseKind,
    });
    text = obs.text;
    repeatedQuestionBlocked = obs.blockedQuestion;
    // Package 208 — never collapse correction/repair into question-less shells
    const preserveRepairQuestion =
      input.cqriInput.repairActive ||
      input.cqriInput.responseKind === "repair";
    // If still long/question-heavy, collapse — keep grounded, never vague filler
    if (
      !preserveRepairQuestion &&
      (text.length > 140 || (text.match(/\?/g) ?? []).length > 0)
    ) {
      const first = text.split(/(?<=[.!])\s+/)[0]?.trim();
      if (first && first.length > 8 && !first.endsWith("?")) {
        text = first;
      } else {
        // Prefer a short grounded line from the user subject over empty pause shells
        const grounded = buildGroundedFallback(
          input.cqriInput.userText,
          input.seed,
        );
        const groundedFirst = grounded.split(/(?<=[.!?])\s+/)[0]?.trim();
        text =
          groundedFirst && groundedFirst.length > 12 && !groundedFirst.endsWith("?")
            ? groundedFirst
            : BRIEF_ACKS[Math.abs(input.seed) % BRIEF_ACKS.length]!;
      }
    }
  } else if (
    input.shape === "one-observation" ||
    input.shape === "plain-clarification"
  ) {
    const obs = preferObservationOverQuestion({
      text,
      messages: input.cqriInput.messages,
      userText: input.cqriInput.userText,
      repairActive: input.cqriInput.repairActive,
      responseKind:
        input.shape === "plain-clarification"
          ? "repair"
          : input.cqriInput.responseKind,
    });
    text = obs.text;
    repeatedQuestionBlocked = obs.blockedQuestion;
  } else if (input.shape === "one-reflective-question") {
    text = ensureSingleQuestion(text);
  } else if (input.shape === "observation-plus-question") {
    text = ensureSingleQuestion(text);
  }

  text = applyLengthBudget(text, lengthCategory);

  if (
    input.shape === "one-observation" ||
    input.shape === "intentional-brevity" ||
    input.shape === "invitation-to-continue" ||
    input.shape === "short-summary"
  ) {
    const due = shouldOfferCompletionCheck({
      messages: input.cqriInput.messages,
      thinkingMap: input.cqriInput.thinkingMap,
      repairActive: input.cqriInput.repairActive,
      userText: input.cqriInput.userText,
      conversationPhase: input.conversationPhase,
    });
    if (due) {
      const recent = input.cqriInput.messages
        .filter((m) => m.role === "assistant")
        .map((m) => m.content)
        .slice(-4);
      const check = pickCompletionCheck(recent, input.seed);
      const next = maybeAttachCompletionCheck(text, check);
      if (next !== text) {
        text = next;
        completionCheckUsed = true;
      }
    }
  }

  return {
    text,
    lengthCategory,
    repeatedQuestionBlocked,
    completionCheckUsed,
  };
}
