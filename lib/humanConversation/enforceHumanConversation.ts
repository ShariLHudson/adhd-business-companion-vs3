import {
  detectForbiddenHumanConversationOpener,
  containsForbiddenHumanConversationPhrase,
  extractLeadingSentence,
} from "./forbiddenPatterns";
import { pickCuriosityOpener } from "./curiosityIntelligence";
import {
  evaluateHumanConversationTwelveTests,
  type TwelveTestEvaluation,
} from "./twelveTests";
import {
  scrubAiVoiceFormatting,
  scrubAiVoicePhrases,
} from "./sparkHumanVoice";

export type HumanConversationViolation = {
  reason: string;
  originalOpener: string;
};

export type HumanConversationEnforcementResult = {
  message: string;
  rewritten: boolean;
  enforcementRan: boolean;
  violation?: HumanConversationViolation;
  skipReason?: string;
  twelveTests: TwelveTestEvaluation;
  bodyPhrasesRewritten?: boolean;
};

const BODY_PHRASE_REPLACEMENTS: readonly [RegExp, string][] = [
  [
    /\btry breaking it into smaller steps\b/gi,
    "can we look at one piece that actually matters to you",
  ],
  [
    /\bbreak (?:it )?into smaller (?:steps|pieces)\b/gi,
    "find one meaningful piece instead of chopping everything up",
  ],
  [/\bset a timer\b/gi, "a short focus block can help — only if you want"],
  [/\buse (?:a )?pomodoro\b/gi, "a brief sprint might help — want to try one together?"],
  [/\btake a walk\b/gi, "stepping away for a minute can help — if that sounds good"],
  [/\bmake a checklist\b/gi, "we can shape a short list together — if that would help"],
  [/\bexecutive function\b/gi, "how your mind is moving right now"],
  [/\byou should be able to\b/gi, "this might feel harder than it looks"],
  [/\byou just need to\b/gi, "there might be one gentler way in"],
  [/\bif you would\b/gi, "if you're open to it"],
  [/\bthe system detected\b/gi, "I've been noticing something"],
];

const SHAME_SCRUB_RE =
  /\b(?:you should be able to|you just need to|if you would|why can't you|no excuses?|simply just)\b/gi;

function replaceLeadingSentence(response: string, newLead: string): string {
  const trimmed = response.trim();
  const lead = newLead.trim();
  if (!trimmed) return lead;

  const paragraphs = trimmed.split(/\n\s*\n/);
  if (paragraphs.length >= 2) {
    const rest = paragraphs.slice(1).join("\n\n");
    const tail = paragraphs[0]!.replace(/^[^.!?]+[.!?]+\s*/, "").trim();
    if (tail) {
      return `${lead} ${tail}\n\n${rest}`.trim();
    }
    return `${lead}\n\n${rest}`.trim();
  }

  const oldLead = extractLeadingSentence(trimmed);
  if (oldLead && trimmed.startsWith(oldLead)) {
    const remainder = trimmed.slice(oldLead.length).trim();
    return remainder ? `${lead} ${remainder}`.trim() : lead;
  }

  return `${lead}\n\n${trimmed}`;
}

export function scrubForbiddenBodyPhrases(text: string): {
  text: string;
  rewritten: boolean;
} {
  let rewritten = false;
  let out = text;
  for (const [pattern, replacement] of BODY_PHRASE_REPLACEMENTS) {
    if (pattern.test(out)) {
      rewritten = true;
      out = out.replace(pattern, replacement);
    }
  }
  if (SHAME_SCRUB_RE.test(out)) {
    rewritten = true;
    out = out.replace(SHAME_SCRUB_RE, "there might be a gentler way in");
  }
  return { text: out, rewritten };
}

export function detectHumanConversationViolation(
  response: string,
): HumanConversationViolation | null {
  const opener = extractLeadingSentence(response);
  if (!opener) return null;

  const forbidden = detectForbiddenHumanConversationOpener(response);
  if (!forbidden) return null;

  return {
    reason: `Forbidden Human Conversation opener: ${forbidden}`,
    originalOpener: opener,
  };
}

/**
 * Constitutional enforcement — curiosity voice, body-phrase scrub, twelve-test evaluation.
 * Runs for all responses after relationship contract enforcement.
 */
export function enforceHumanConversation(input: {
  response: string;
  userText?: string;
  gentle?: boolean;
  seed?: number;
  memoryConfidence?: "none" | "forming" | "sufficient";
}): HumanConversationEnforcementResult {
  let message = input.response;
  let rewritten = false;

  const bodyScrub = scrubForbiddenBodyPhrases(message);
  if (bodyScrub.rewritten) {
    message = bodyScrub.text;
    rewritten = true;
  }

  const aiFormatScrub = scrubAiVoiceFormatting(message, input.userText);
  if (aiFormatScrub.rewritten) {
    message = aiFormatScrub.text;
    rewritten = true;
  }

  const aiPhraseScrub = scrubAiVoicePhrases(message);
  if (aiPhraseScrub.rewritten) {
    message = aiPhraseScrub.text;
    rewritten = true;
  }

  const violation = detectHumanConversationViolation(message);
  if (violation) {
    const seed =
      input.seed ??
      (input.userText?.length ?? 0) + violation.originalOpener.length;
    const replacement = pickCuriosityOpener(seed, input.gentle);
    message = replaceLeadingSentence(message, replacement);
    rewritten = true;
  }

  const twelveTests = evaluateHumanConversationTwelveTests({
    response: message,
    userText: input.userText,
    memoryConfidence: input.memoryConfidence,
  });

  return {
    message,
    rewritten,
    enforcementRan: true,
    violation: violation ?? undefined,
    skipReason: violation ? undefined : "no opener violation",
    twelveTests,
    bodyPhrasesRewritten: bodyScrub.rewritten,
  };
}

export function containsRewriteableHumanConversationIssues(
  response: string,
): boolean {
  return Boolean(
    detectHumanConversationViolation(response) ||
      containsForbiddenHumanConversationPhrase(response) ||
      SHAME_SCRUB_RE.test(response),
  );
}
