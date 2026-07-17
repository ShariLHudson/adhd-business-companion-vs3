import {
  detectForbiddenHumanConversationOpener,
  containsForbiddenHumanConversationPhrase,
  extractLeadingSentence,
} from "./forbiddenPatterns";
import {
  repairNumberedEstateRoomMenu,
} from "../conversation/vagueOfferRepair";
import {
  evaluateHumanConversationTwelveTests,
  type TwelveTestEvaluation,
} from "./twelveTests";
import {
  scrubAiVoiceFormatting,
  scrubAiVoicePhrases,
} from "./sparkHumanVoice";
import { scrubExpertAttribution } from "./expertKnowledgeBranding";

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
  [/\bone effective way is\s*/gi, ""],
  [/\bthis might help me suggest a better approach[.!]?\s*/gi, ""],
  [/\bthis will help me provide the most relevant advice[.!]?\s*/gi, ""],
];

const SHAME_SCRUB_RE =
  /\b(?:you should be able to|you just need to|if you would|why can't you|no excuses?|simply just)\b/gi;

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

function stripForbiddenLeadingOpener(response: string): {
  text: string;
  stripped: boolean;
} {
  const trimmed = response.trim();
  if (!trimmed) return { text: trimmed, stripped: false };

  const opener = extractLeadingSentence(trimmed);
  if (!opener || !detectForbiddenHumanConversationOpener(trimmed)) {
    return { text: trimmed, stripped: false };
  }

  let remainder = trimmed;
  if (trimmed.startsWith(opener)) {
    remainder = trimmed.slice(opener.length).trim();
  } else {
    remainder = trimmed.replace(/^[^.!?]+[.!?]+\s*/, "").trim();
  }

  remainder = remainder.replace(/^\.{3}\s*/, "").trim();
  if (!remainder) return { text: trimmed, stripped: false };
  return { text: remainder, stripped: true };
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

  const expertScrub = scrubExpertAttribution(message, input.userText);
  if (expertScrub.rewritten) {
    message = expertScrub.text;
    rewritten = true;
  }

  for (let pass = 0; pass < 3; pass++) {
    const violation = detectHumanConversationViolation(message);
    if (!violation) break;
    const stripped = stripForbiddenLeadingOpener(message);
    if (!stripped.stripped) break;
    message = stripped.text;
    rewritten = true;
  }

  const bodyRescrub = scrubForbiddenBodyPhrases(message);
  if (bodyRescrub.rewritten) {
    message = bodyRescrub.text;
    rewritten = true;
  }

  const menuRepair = repairNumberedEstateRoomMenu(message);
  if (menuRepair !== message) {
    message = menuRepair;
    rewritten = true;
  }

  const violation = detectHumanConversationViolation(message);

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
