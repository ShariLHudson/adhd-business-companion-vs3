/**
 * Conversation Rhythm — choose natural response shape before send.
 * Biased by conversation phase (Opening → Exploration → Discovery → Completion).
 */

import { countQuestions } from "@/lib/reflectiveConversationIntelligence";
import {
  detectConversationPhase,
  type ConversationPhase,
} from "./conversationPhase";
import { shouldSuppressQuestion } from "./questionFrequency";
import type { CqriInput, CqriResponseShape } from "./types";

export function selectResponseShape(
  input: CqriInput,
  phase?: ConversationPhase,
): CqriResponseShape {
  const conversationPhase =
    phase ??
    input.conversationPhase ??
    detectConversationPhase({
      messages: input.messages,
      userText: input.userText,
      thinkingMap: input.thinkingMap,
      repairActive: input.repairActive,
    });

  if (input.repairActive || input.responseKind === "repair") {
    return "plain-clarification";
  }

  const briefUser =
    input.userText.trim().length <= 24 ||
    /^(yes|no|ok|okay|idk|dunno|sure|maybe|not sure)\b/i.test(
      input.userText.trim(),
    );

  if (conversationPhase === "completion") {
    if (input.responseKind === "summary") return "short-summary";
    if (briefUser) return "intentional-brevity";
    if (shouldSuppressQuestion({
      messages: input.messages,
      userText: input.userText,
      repairActive: false,
    })) {
      return "one-observation";
    }
    return "invitation-to-continue";
  }

  if (conversationPhase === "discovery") {
    if (input.responseKind === "summary") return "short-summary";
    if (briefUser) return "brief-acknowledgement";
    const suppressQ = shouldSuppressQuestion({
      messages: input.messages,
      userText: input.userText,
      repairActive: input.repairActive,
    });
    if (suppressQ || countQuestions(input.draftText) === 0) {
      return "one-observation";
    }
    return "observation-plus-question";
  }

  if (briefUser && input.archetype === "overwhelm") {
    return "intentional-brevity";
  }
  if (briefUser) {
    return "brief-acknowledgement";
  }

  if (input.responseKind === "summary") {
    return "short-summary";
  }

  const suppressQ = shouldSuppressQuestion({
    messages: input.messages,
    userText: input.userText,
    repairActive: input.repairActive,
  });

  const draftQs = countQuestions(input.draftText);

  // Opening: one thoughtful question is welcome
  if (conversationPhase === "opening" && !suppressQ && draftQs >= 1) {
    return /[.!][\s\S]+\?/.test(input.draftText)
      ? "observation-plus-question"
      : "one-reflective-question";
  }

  if (suppressQ) {
    return draftQs >= 1 || /seem|sound|appear|notice/i.test(input.draftText)
      ? "one-observation"
      : "intentional-brevity";
  }

  if (
    input.responseKind === "gentle-observation" ||
    input.responseKind === "tentative-pattern" ||
    input.responseKind === "connection"
  ) {
    return draftQs >= 1 ? "observation-plus-question" : "one-observation";
  }

  if (
    input.responseKind === "clarifying-question" ||
    input.responseKind === "future-feeling" ||
    draftQs >= 1
  ) {
    return draftQs >= 1 && /[.!][\s\S]+\?/.test(input.draftText)
      ? "observation-plus-question"
      : "one-reflective-question";
  }

  return "one-observation";
}
