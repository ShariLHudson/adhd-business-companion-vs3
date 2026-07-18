/**
 * Expression engine — wording, pacing, transitions. Never changes the move kind.
 */

import {
  ensureSingleQuestion,
  sanitizeAgainstUser,
} from "@/lib/reflectiveConversationIntelligence";
import type { AiTone } from "@/lib/companionStore";
import { pacingHint } from "./toneSelection";
import type { ExpressionToneBand } from "./types";
import {
  trimToSentenceBudget,
  varyAgainstRecent,
} from "./variation";

const OVERWHELM_SOFTENERS = [
  "We can take this slowly.",
  "No rush here.",
];

const CELEBRATION_SOFTENERS = [
  "That deserves a quiet smile.",
  "I am glad you said that out loud.",
];

function pick(items: readonly string[], seed: number): string {
  return items[Math.abs(seed) % items.length]!;
}

/**
 * Soften openings for overwhelm/celebration without adding a second question.
 */
export function applyToneBandShape(
  text: string,
  band: ExpressionToneBand,
  seed: number,
): string {
  const t = text.trim();
  if (band === "overwhelm" && !/^(we can take|no rush)/i.test(t) && seed % 5 === 0) {
    // Prefer not stacking — only when the draft is a bare question
    if (/^\S.+\?$/.test(t) && t.length < 120) {
      return `${pick(OVERWHELM_SOFTENERS, seed)} ${t}`;
    }
  }
  if (
    band === "celebration" &&
    seed % 4 === 0 &&
    !/glad you|deserves/i.test(t)
  ) {
    return `${pick(CELEBRATION_SOFTENERS, seed)} ${t}`;
  }
  return t;
}

/**
 * Prefer observation-only when the kind was observation but a formula glued a question.
 * Does not invent new content — may drop a trailing question if preferBrevity.
 */
export function maybePreferObservation(
  text: string,
  preferBrevity: boolean,
  responseKind: string,
): string {
  if (!preferBrevity) return text;
  if (
    responseKind !== "gentle-observation" &&
    responseKind !== "tentative-pattern" &&
    responseKind !== "connection" &&
    responseKind !== "summary"
  ) {
    return text;
  }
  const marks = (text.match(/\?/g) ?? []).length;
  if (marks === 0) return text;
  // Keep text through first period before the question, if substantial
  const qIdx = text.indexOf("?");
  const before = text.slice(0, qIdx);
  const lastPeriod = Math.max(before.lastIndexOf("."), before.lastIndexOf("!"));
  if (lastPeriod > 24) {
    return before.slice(0, lastPeriod + 1).trim();
  }
  return text;
}

export function expressConversationalDraft(input: {
  draftText: string;
  userText: string;
  toneBand: ExpressionToneBand;
  aiTone?: AiTone;
  recentAssistantTexts?: readonly string[];
  preferBrevity?: boolean;
  responseKind: string;
}): string {
  const seed = input.draftText.length + input.userText.length;
  const pacing = pacingHint(input.toneBand, input.aiTone);

  let text = varyAgainstRecent(
    input.draftText,
    input.recentAssistantTexts ?? [],
  );
  text = maybePreferObservation(
    text,
    Boolean(input.preferBrevity) || pacing.favorShort,
    input.responseKind,
  );
  text = applyToneBandShape(text, input.toneBand, seed);
  if (pacing.favorShort) {
    text = trimToSentenceBudget(text, pacing.maxSentences);
  } else {
    text = trimToSentenceBudget(text, pacing.maxSentences);
  }
  text = sanitizeAgainstUser(input.userText, text);
  return ensureSingleQuestion(text);
}

/** Safe fallbacks when quality cert fails after expression. */
export const CI_FALLBACKS = [
  "Which part of that keeps pulling your attention?",
  "What would you most like to understand before you decide?",
  "What feels heaviest in what you just shared?",
  "What part of that decision still feels hardest to judge?",
] as const;

export function fallbackExpression(userText: string, seed: number): string {
  const pickFb = CI_FALLBACKS[Math.abs(seed) % CI_FALLBACKS.length]!;
  return ensureSingleQuestion(sanitizeAgainstUser(userText, pickFb));
}
