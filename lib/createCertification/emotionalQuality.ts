/**
 * Sprint 3 — Emotional quality gate.
 * Technical PASS without emotional PASS stays TESTING.
 */

export type EmotionalQualityQuestionId =
  | "human_voice"
  | "fewer_decisions"
  | "calm"
  | "encouraging"
  | "remembered"
  | "no_software_language"
  | "progress_visible"
  | "earned_trust";

export type EmotionalQualityAnswer = "yes" | "no" | "unclear" | "not_run";

export type EmotionalQualityRow = {
  id: EmotionalQualityQuestionId;
  question: string;
  answer: EmotionalQualityAnswer;
  evidence: string | null;
};

/** Eight questions every browser certification run must answer. */
export const EMOTIONAL_QUALITY_CHECKLIST: readonly Omit<
  EmotionalQualityRow,
  "answer" | "evidence"
>[] = [
  {
    id: "human_voice",
    question: "Did Shari sound human?",
  },
  {
    id: "fewer_decisions",
    question: "Did Spark reduce decisions?",
  },
  {
    id: "calm",
    question: "Did it feel calm?",
  },
  {
    id: "encouraging",
    question: "Did it feel encouraging?",
  },
  {
    id: "remembered",
    question: "Did it remember me?",
  },
  {
    id: "no_software_language",
    question: "Did it avoid software language?",
  },
  {
    id: "progress_visible",
    question: "Did it make progress feel visible?",
  },
  {
    id: "earned_trust",
    question: "Did it earn trust?",
  },
] as const;

export function blankEmotionalQualityAudit(): EmotionalQualityRow[] {
  return EMOTIONAL_QUALITY_CHECKLIST.map((row) => ({
    ...row,
    answer: "not_run" as const,
    evidence: null,
  }));
}

export function emotionalQualityPasses(
  rows: readonly EmotionalQualityRow[],
): boolean {
  return rows.every((r) => r.answer === "yes");
}
