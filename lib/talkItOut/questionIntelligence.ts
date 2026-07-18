/**
 * Package 203 — Talk It Out Question Intelligence.
 * A good question must earn its place.
 */

export type QuestionFailureCode =
  | "STACKED_QUESTIONS"
  | "ALREADY_ANSWERED"
  | "ABSTRACT_WITH_CONCRETE_CONTEXT"
  | "GENERIC_PROBE"
  | "HIDDEN_MEANING_PROBE"
  | "LEADING"
  | "UNRELATED_TO_TOPIC"
  | "REPETITIVE";

const BANNED_GENERIC =
  /\b(?:what matters most(?:\s+to you)?(?:\s+here)?|what feels unfinished|what else wants to be said|tell me more\.?|what possibilities have you considered)\b/i;

const HIDDEN_PROBE =
  /\b(?:quieter question|something underneath|what (?:is|are) you (?:really|not) (?:afraid|saying)|childhood|deeper fear)\b/i;

const LEADING =
  /\b(?:don'?t you think|wouldn'?t it be better|you should (?:probably )?consider)\b/i;

const ROLE_DUTY =
  /\b(?:what would (?:you want )?(?:them|this person|the (?:assistant|hire)) (?:to )?(?:do|handle|take)|what (?:tasks|responsibilities))\b/i;

export function countMainQuestions(text: string): number {
  return (text.match(/\?/g) ?? []).length;
}

export function isBannedQuestionText(text: string): boolean {
  return BANNED_GENERIC.test(text) || HIDDEN_PROBE.test(text);
}

/** Extract short answered duty phrases from prior user turns. */
export function extractAnsweredDutyHints(
  userMessages: readonly string[],
): string[] {
  const hints: string[] = [];
  for (const m of userMessages) {
    const lower = m.toLowerCase();
    if (/\bsocial media\b/.test(lower)) hints.push("social media");
    if (/\bfollow[- ]?up\b/.test(lower)) hints.push("follow-up");
    if (/\b(?:content|posting)\b/.test(lower)) hints.push("content");
    if (/\b(?:outreach|leads)\b/.test(lower)) hints.push("outreach");
  }
  return [...new Set(hints)];
}

export function questionAlreadyAnswered(input: {
  questionText: string;
  answeredDutyHints: readonly string[];
}): boolean {
  if (!ROLE_DUTY.test(input.questionText)) return false;
  return input.answeredDutyHints.length >= 2;
}

export function validateTalkItOutQuestion(input: {
  responseText: string;
  userText: string;
  topicAnchor?: string | null;
  priorAssistantTexts?: readonly string[];
  answeredDutyHints?: readonly string[];
  concreteContext?: boolean;
}): { passed: boolean; failures: QuestionFailureCode[] } {
  const failures: QuestionFailureCode[] = [];
  const text = input.responseText.trim();
  const qCount = countMainQuestions(text);

  if (qCount >= 2) failures.push("STACKED_QUESTIONS");
  if (isBannedQuestionText(text)) {
    if (HIDDEN_PROBE.test(text)) failures.push("HIDDEN_MEANING_PROBE");
    else failures.push("GENERIC_PROBE");
  }
  if (LEADING.test(text)) failures.push("LEADING");

  const concrete =
    input.concreteContext ??
    /\b(?:hir|cost|budget|role|market|client|project|plan)\w*/i.test(
      `${input.userText} ${input.topicAnchor ?? ""}`,
    );
  if (
    concrete &&
    /\b(?:what matters most|what feels unfinished|what else wants)\b/i.test(text)
  ) {
    failures.push("ABSTRACT_WITH_CONCRETE_CONTEXT");
  }

  if (
    questionAlreadyAnswered({
      questionText: text,
      answeredDutyHints: input.answeredDutyHints ?? [],
    })
  ) {
    failures.push("ALREADY_ANSWERED");
  }

  const priors = input.priorAssistantTexts ?? [];
  const stem = text.replace(/\?.*$/, "").trim().toLowerCase().slice(0, 48);
  if (
    stem.length > 20 &&
    priors.some((p) => p.toLowerCase().includes(stem.slice(0, 28)))
  ) {
    failures.push("REPETITIVE");
  }

  return { passed: failures.length === 0, failures };
}

/** Prefer concrete replacement when a question fails validation. */
export function groundedQuestionFallback(input: {
  topicAnchor?: string | null;
  userText: string;
  answeredDutyHints?: readonly string[];
}): string {
  const topic = input.topicAnchor?.trim();
  const hints = input.answeredDutyHints ?? [];
  if (hints.length >= 2) {
    return `Which of those responsibilities — ${hints.slice(0, 2).join(" or ")} — feels most urgent?`;
  }
  if (topic && /\bhir/i.test(topic + input.userText)) {
    return "What is making you consider hiring someone now?";
  }
  if (topic) {
    return `What still feels murkiest about ${topic}?`;
  }
  return "What still feels murkiest in what you shared?";
}

/** Filter candidate bank texts that violate question intelligence. */
export function filterQuestionCandidates<T extends { text: string }>(
  candidates: readonly T[],
  opts?: { concreteContext?: boolean },
): T[] {
  return candidates.filter((c) => {
    if (isBannedQuestionText(c.text)) return false;
    if (
      opts?.concreteContext &&
      /\b(?:what matters most|what feels unfinished|afraid this might mean|who you want to be)\b/i.test(
        c.text,
      )
    ) {
      return false;
    }
    return true;
  });
}
