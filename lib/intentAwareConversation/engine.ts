/**
 * Intent-Aware Conversation Framework™ — evaluate depth and purpose per turn.
 */

import {
  detectConversationDepth,
  detectConversationPurpose,
  depthAllowsCoaching,
  depthAllowsPersonalQuestions,
  memberChangedPurpose,
} from "./detection";
import { routingGateHintForChat } from "./routingGate";
import {
  appropriateQuestionsFor,
  depthLabel,
  maxQuestionsForDepth,
  purposeLabel,
  TASK_FORBIDDEN_QUESTIONS,
} from "./depthRules";
import { loadIntentAwareSession, updateIntentAwareSession } from "./session";
import type {
  ConversationDepth,
  ConversationPurpose,
  IntentAwareConversationInput,
  IntentAwareEvaluation,
} from "./types";

const DEFAULT_PURPOSE: ConversationPurpose = "think";
const DEFAULT_DEPTH: ConversationDepth = "guidance";

export function evaluateIntentAwareConversation(
  input: IntentAwareConversationInput,
): IntentAwareEvaluation {
  const turn = input.currentTurn ?? 0;
  const detectedPurpose = detectConversationPurpose(input.userText);
  const detectedDepth = detectConversationDepth(input);
  const purposeChanged = memberChangedPurpose(input.userText);

  const session = updateIntentAwareSession(
    detectedPurpose,
    detectedPurpose ? detectedDepth : null,
    turn,
    purposeChanged,
  );

  const sessionPurpose =
    session.sessionPurpose ?? detectedPurpose ?? DEFAULT_PURPOSE;
  const sessionDepth = session.sessionDepth ?? detectedDepth ?? DEFAULT_DEPTH;

  let depth =
    depthRank(detectedDepth) >= depthRank(sessionDepth)
      ? detectedDepth
      : sessionDepth;

  if (
    isTaskOrientedPurpose(sessionPurpose) &&
    sessionDepth === "task" &&
    detectedDepth !== "reflection" &&
    detectedDepth !== "exploration" &&
    !purposeChanged
  ) {
    depth = "task";
  }

  const confidence: IntentAwareEvaluation["confidence"] =
    detectConversationPurpose(input.userText) ? "high" : "medium";

  const honorTaskFocus = depth === "task";
  const allowGuidanceQuestions =
    depth === "guidance" || depth === "reflection" || depth === "exploration";
  const allowReflection = depth === "reflection" || depth === "exploration";
  const allowExploration = depth === "exploration";

  return {
    purpose: detectedPurpose ?? sessionPurpose,
    depth,
    sessionPurpose,
    sessionDepth,
    purposeChanged,
    confidence,
    honorTaskFocus,
    allowGuidanceQuestions: allowGuidanceQuestions && depthAllowsCoaching(depth),
    allowReflection,
    allowExploration,
    maxQuestions: maxQuestionsForDepth(depth),
    forbiddenQuestionPatterns: honorTaskFocus
      ? [...TASK_FORBIDDEN_QUESTIONS]
      : !depthAllowsPersonalQuestions(depth)
        ? [
            "Uninvited personal history questions",
            "Motivation or joy questions unrelated to the task",
          ]
        : [],
    appropriateQuestionExamples: appropriateQuestionsFor(
      sessionPurpose,
      depth,
    ),
  };
}

function depthRank(depth: ConversationDepth): number {
  switch (depth) {
    case "task":
      return 1;
    case "guidance":
      return 2;
    case "reflection":
      return 3;
    case "exploration":
      return 4;
  }
}

function isTaskOrientedPurpose(purpose: ConversationPurpose): boolean {
  return (
    purpose === "create" ||
    purpose === "research" ||
    purpose === "learn" ||
    purpose === "organize" ||
    purpose === "solve" ||
    purpose === "plan"
  );
}

export function intentAwareConversationHintForChat(
  eval_: IntentAwareEvaluation,
  userText?: string,
): string {
  const parts: string[] = [];

  if (userText?.trim()) {
    const gateHint = routingGateHintForChat(userText);
    if (gateHint) parts.push(gateHint);
  }

  const lines = [
    "INTENT-AWARE CONVERSATION (mandatory — member sets depth):",
    `Session purpose: ${purposeLabel(eval_.sessionPurpose)}. Current depth: ${depthLabel(eval_.depth)}.`,
    "Internal check before every question:",
    "• Why did the member come today?",
    "• What are they trying to accomplish?",
    "• What is the smallest number of questions needed?",
    "• What will help them make progress?",
    "• Am I helping — or distracting?",
  ];

  if (eval_.honorTaskFocus) {
    lines.push(
      "TASK MODE: Stay focused and efficient. Ask ONLY questions directly related to the task.",
      "FORBIDDEN: redirect to personal coaching, feelings check-ins, motivation questions, unrelated exploration.",
      `Appropriate examples: ${eval_.appropriateQuestionExamples.slice(0, 3).join(" · ")}`,
      `NEVER: ${TASK_FORBIDDEN_QUESTIONS.slice(0, 3).join(" · ")}`,
    );
  }

  if (eval_.depth === "guidance") {
    lines.push(
      "GUIDANCE MODE: Member is stuck — coaching questions OK if focused on immediate goal.",
      "May recommend Estate experiences or visual thinking. Still honor the original purpose.",
    );
  }

  if (eval_.allowReflection) {
    lines.push(
      "REFLECTION MODE: Slow down. Listen more. Gentle encouragement.",
      "May recommend journal, nature, music, reading, or conversation — never pressure.",
    );
  }

  if (eval_.allowExploration) {
    lines.push(
      "EXPLORATION MODE: Member invited depth — journal, Coffee House, Estate Guide, life reflection OK.",
      "Curiosity serves the member's chosen conversation — not Spark's agenda.",
    );
  }

  if (eval_.purpose !== eval_.sessionPurpose && !eval_.purposeChanged) {
    lines.push(
      `Stay context-aware: conversation started for ${purposeLabel(eval_.sessionPurpose)} — do not drift to unrelated topics.`,
    );
  }

  lines.push(
    `Max questions this turn: ${eval_.maxQuestions}.`,
    "Relationships develop naturally — do not interview. Use existing knowledge only when it improves THIS task.",
    "Curiosity with purpose — never interrogation.",
  );

  return [...parts, lines.join("\n")].filter(Boolean).join("\n\n");
}

export function shouldSuppressCoachingForIntentAware(
  eval_: IntentAwareEvaluation,
): boolean {
  return eval_.honorTaskFocus;
}

export function shouldSuppressPersonalizationForIntentAware(
  eval_: IntentAwareEvaluation,
): boolean {
  return eval_.honorTaskFocus || eval_.depth === "guidance";
}
