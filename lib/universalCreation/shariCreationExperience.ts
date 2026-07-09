/**
 * Spark Estate™ — Shari conversation experience for creation (Phase 11).
 * Warm, practical, step-by-step guidance — never a software manual.
 *
 * @see docs/protocols/SPARK_ESTATE_UNIVERSAL_CREATION_JOURNEY_AND_SHARI_EXPERIENCE_PHASE11.md
 */

import type { UniversalCreationTurnResult } from "./types";
import { personalizeSparkEstateCreationQuestion } from "@/lib/estate/sparkEstateMemberProfileEngine";
import { sanitizeSparkEstateShariCopy } from "@/lib/estate/sparkEstateConversationEngine";

export const SHARI_CREATION_TRAITS = [
  "warm",
  "encouraging",
  "practical",
  "patient",
  "step-by-step",
  "curious",
  "supportive",
  "focused on progress",
] as const;

export const SHARI_CREATION_AVOID = [
  "software manual",
  "consultant giving instructions",
  "complicated business system",
  "checklist robot",
] as const;

export const SHARI_CREATION_CONVERSATION_RULES = [
  "Ask one question at a time.",
  "Explain why something matters when it helps.",
  "Celebrate progress.",
  "Avoid overwhelming lists.",
  "Provide examples when helpful.",
  "Adjust to energy level.",
] as const;

export function sanitizeShariCreationCopy(text: string): string {
  return sanitizeSparkEstateShariCopy(text);
}

export function formatShariCreationIntro(intro: string): string {
  const cleaned = sanitizeShariCreationCopy(intro);
  if (/one (?:thing|question) at a time/i.test(cleaned)) {
    return cleaned;
  }
  return `${cleaned}\n\nWe'll go one question at a time — no forms, no overwhelm.`;
}

export function formatShariCreationQuestion(question: string): string {
  return personalizeSparkEstateCreationQuestion(
    sanitizeShariCreationCopy(question.trim()),
  );
}

export function formatShariCreationTurnReply(
  turn: UniversalCreationTurnResult,
): string {
  if (turn.kind === "question") {
    const parts: string[] = [];
    if (turn.intro) {
      parts.push(formatShariCreationIntro(turn.intro), "");
    }
    parts.push(formatShariCreationQuestion(turn.question));
    return parts.join("\n");
  }

  if (turn.kind === "ready") {
    return sanitizeShariCreationCopy(turn.message);
  }

  if (
    turn.kind === "uncertainty" ||
    turn.kind === "message" ||
    turn.kind === "draft"
  ) {
    return sanitizeShariCreationCopy(turn.message);
  }

  return "";
}

export function shariCreationExperienceHint(): string {
  return (
    "SHARI CREATION EXPERIENCE: Sound warm, encouraging, practical, and patient. " +
    "One question at a time. Celebrate progress. Never software-manual tone."
  );
}
