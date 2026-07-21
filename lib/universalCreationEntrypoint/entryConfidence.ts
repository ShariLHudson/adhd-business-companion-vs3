/**
 * 055 — Confidence before launching a Creation Workspace.
 */

import {
  classifyPlatformIntent,
  looksLikeKnowledgeQuestion,
} from "@/lib/platformIntent/classifyPlatformIntent";
import { detectEventIntent } from "@/lib/eventsIntelligence/detectEventIntent";
import type { EntrypointConfidence } from "./types";
import { isForceNewCreationRequest } from "./forceNewIntent";

const SOFT_CREATE_RE =
  /\b(?:i(?:'m| am) thinking(?: about)?|maybe|might|considering|not sure if|what if i)\b/i;

const CLEAR_CREATE_RE =
  /\b(?:help me (?:plan|create|build|organize)|i want to (?:create|plan|build)|let'?s (?:create|build|plan)|create (?:a|an|my|the)|plan (?:a|an|my|the))\b/i;

/**
 * High → open/resume immediately
 * Medium → one clarifying question if needed
 * Low → stay in conversation (knowledge / vague curiosity)
 */
export function assessEntrypointConfidence(userText: string): {
  confidence: EntrypointConfidence;
  reason: string;
} {
  const t = userText.trim();
  if (!t) {
    return { confidence: "low", reason: "empty" };
  }

  if (isForceNewCreationRequest(t)) {
    return { confidence: "high", reason: "explicit_force_new" };
  }

  if (looksLikeKnowledgeQuestion(t) && !SOFT_CREATE_RE.test(t)) {
    return { confidence: "low", reason: "knowledge_question" };
  }

  const platform = classifyPlatformIntent(t);
  const event = detectEventIntent(t);

  // Soft curiosity about creating — clarify, don't invent a workspace yet
  if (
    SOFT_CREATE_RE.test(t) &&
    !CLEAR_CREATE_RE.test(t) &&
    (event.isClearEventGoal ||
      /\b(?:workshop|retreat|conference|webinar|event|summit)\b/i.test(t))
  ) {
    return { confidence: "medium", reason: "soft_create_signal" };
  }

  if (platform.intent === "know" || platform.intent === "decide") {
    return { confidence: "low", reason: `intent_${platform.intent}` };
  }

  if (
    platform.intent === "continue" ||
    platform.intent === "improve" ||
    (CLEAR_CREATE_RE.test(t) && (platform.blueprint || event.isClearEventGoal))
  ) {
    return { confidence: "high", reason: "clear_creation_or_resume" };
  }

  if (platform.intent === "create" && platform.blueprint) {
    return { confidence: "high", reason: "create_with_blueprint" };
  }

  if (platform.intent === "create" || event.isClearEventGoal) {
    return { confidence: "medium", reason: "create_needs_focus" };
  }

  return { confidence: "low", reason: "insufficient_signal" };
}

/**
 * One clarifying question only — never include an assumed answer in the same turn.
 */
export function clarifyingQuestionForMedium(userText: string): string {
  const t = userText.toLowerCase();
  if (/\bworkshop\b/.test(t)) {
    return "Is this a new workshop, or continuing one you've already started?";
  }
  if (/\b(retreat|conference|webinar|event)\b/.test(t)) {
    return "Is this a new gathering, or picking up one already in motion?";
  }
  return "Is this something new, or continuing work you've already begun?";
}

/** True when text is a pure clarification ask (no self-answer attached). */
export function isPureClarifyingQuestion(text: string): boolean {
  const t = text.trim();
  if (!t) return false;
  // Must end as a question; must not assert a chosen path afterward.
  if (!/\?\s*$/.test(t)) return false;
  if (
    /\?\s+(?:i(?:'ll| will)|let'?s|based on|so we(?:'ll| will)|i think|starting|continuing)\b/i.test(
      t,
    )
  ) {
    return false;
  }
  return true;
}
