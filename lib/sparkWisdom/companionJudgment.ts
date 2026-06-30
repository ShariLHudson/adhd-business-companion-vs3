/**
 * Spec 123 — Companion Judgment™
 */

import type { JudgmentCue } from "./types";

const JUDGMENT_TRIGGERS =
  /\b(what would you do|your opinion|am i wrong|should i really|is this a mistake)\b/i;

export function recommendJudgment(message: string): JudgmentCue | null {
  if (!JUDGMENT_TRIGGERS.test(message)) return null;
  return {
    appropriate: true,
    permissionPhrase: "May I share what I would do?",
    guidance:
      "Offer thoughtful opinion only after permission. Frame as perspective on their business — never criticism of them.",
  };
}
