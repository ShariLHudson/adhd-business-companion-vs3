/**
 * Help Me Choose — one question → Reminder or Rhythm (confirm before create).
 */

import {
  CONFIRM_REMINDER_PREFIX,
  CONFIRM_RHYTHM_PREFIX,
  HELP_ME_CHOOSE_CLARIFY_OPTIONS,
  HELP_ME_CHOOSE_OPTIONS,
  HELP_ME_CHOOSE_QUESTION,
  UNSURE_FALLBACK,
} from "./copy";

export type HelpMeChooseResult = "reminder" | "rhythm" | "clarify" | "unsure";

export type HelpMeChoosePrimaryId =
  (typeof HELP_ME_CHOOSE_OPTIONS)[number]["id"];

export type HelpMeChooseClarifyId =
  (typeof HELP_ME_CHOOSE_CLARIFY_OPTIONS)[number]["id"];

export type HelpMeChoosePhase =
  | { phase: "question" }
  | { phase: "clarify" }
  | {
      phase: "confirm";
      recommendation: "reminder" | "rhythm";
      explanation: string;
    }
  | { phase: "unsure"; message: string };

/** Classify free text (conversation + Help Me Choose). */
export function classifyReminderOrRhythm(
  text: string,
): "reminder" | "rhythm" | "ambiguous" {
  const t = text.trim().toLowerCase();
  if (!t) return "ambiguous";

  const specificTime =
    /\b(tomorrow|tonight|today|at\s+\d|on\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)|\d{1,2}(:\d{2})?\s*(am|pm)|next week|this afternoon|this morning)\b/i.test(
      t,
    ) && !/\b(every|each|daily|weekly|monthly|regularly|rhythm|routine)\b/i.test(t);

  const flexibleRepeated =
    /\b(every|each|daily|weekly|monthly|regularly|rhythm|routine|habit|always)\b/i.test(
      t,
    );

  if (specificTime && !flexibleRepeated) return "reminder";
  if (flexibleRepeated && !specificTime) return "rhythm";
  if (specificTime && flexibleRepeated) {
    // Exact clock + every X → still often a Reminder (recurring reminder)
    if (/\bat\s+\d/i.test(t) || /\d{1,2}:\d{2}/.test(t)) return "reminder";
    return "rhythm";
  }
  return "ambiguous";
}

export function resolveHelpMeChoosePrimary(
  id: HelpMeChoosePrimaryId,
): HelpMeChoosePhase {
  const opt = HELP_ME_CHOOSE_OPTIONS.find((o) => o.id === id);
  if (!opt) return { phase: "question" };
  if (opt.result === "clarify") return { phase: "clarify" };
  return {
    phase: "confirm",
    recommendation: opt.result,
    explanation:
      opt.result === "reminder"
        ? CONFIRM_REMINDER_PREFIX
        : CONFIRM_RHYTHM_PREFIX,
  };
}

export function resolveHelpMeChooseClarify(
  id: HelpMeChooseClarifyId,
): HelpMeChoosePhase {
  const opt = HELP_ME_CHOOSE_CLARIFY_OPTIONS.find((o) => o.id === id);
  if (!opt) return { phase: "clarify" };
  if (opt.result === "unsure") {
    return { phase: "unsure", message: UNSURE_FALLBACK };
  }
  return {
    phase: "confirm",
    recommendation: opt.result,
    explanation:
      opt.result === "reminder"
        ? CONFIRM_REMINDER_PREFIX
        : CONFIRM_RHYTHM_PREFIX,
  };
}

/** Conversation: explain type + ask confirm before create. */
export function buildConversationTypeConfirm(input: {
  kind: "reminder" | "rhythm";
  title: string;
  detail?: string;
}): string {
  const prefix =
    input.kind === "reminder" ? CONFIRM_REMINDER_PREFIX : CONFIRM_RHYTHM_PREFIX;
  const detail = input.detail?.trim() ? ` ${input.detail.trim()}` : "";
  const noun = input.kind === "reminder" ? "Reminder" : "Rhythm";
  return `${prefix} I’d set up a ${noun} for “${input.title}.”${detail} Shall I create it?`;
}

export function buildAmbiguousRememberQuestion(): string {
  return `${HELP_ME_CHOOSE_QUESTION} You can say once, at a time, regularly, or not sure.`;
}

export function parseRememberClarifyAnswer(
  text: string,
): "reminder" | "rhythm" | "unsure" | null {
  const t = text.trim().toLowerCase();
  if (!t) return null;
  if (/^(1|once|one.?time|reminder)\b/.test(t)) return "reminder";
  if (/^(2|at a time|specific|timed)\b/.test(t)) return "reminder";
  if (/^(3|regularly|rhythm|routine)\b/.test(t)) return "rhythm";
  if (/^(4|not sure|unsure|either|both)\b/.test(t)) return "unsure";
  if (/\b(reminder|once|specific time|tomorrow|tonight)\b/.test(t)) {
    return "reminder";
  }
  if (/\b(rhythm|regularly|every|habit|routine)\b/.test(t)) return "rhythm";
  if (/\b(not sure|unsure|either)\b/.test(t)) return "unsure";
  return null;
}
