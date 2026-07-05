/**
 * Local informational answers — concept questions that should never route to Estate Guide.
 */

import { isKnowledgeQuestion } from "@/lib/knowledgeIntelligence";
import { isEstateGuideQuestion } from "./estateGuide";

const ADHD_SYMPTOMS_TOPIC_RE =
  /\b(?:symptoms?|signs?|characteristics|traits|what (?:is|are)|tell me about|explain|define)\b/i;

/** Repair common typos / missing spaces in knowledge questions. */
export function normalizeLooseKnowledgeText(text: string): string {
  return text
    .trim()
    .replace(/\bwhat\s*aresome\b/gi, "what are some")
    .replace(/\bwhataresome\b/gi, "what are some")
    .replace(/\bwhatare\b/gi, "what are")
    .replace(/\bsomeof\b/gi, "some of")
    .replace(/\s+/g, " ");
}

function isAdhdSymptomsQuestion(text: string): boolean {
  const normalized = normalizeLooseKnowledgeText(text);
  if (!/\badhd\b/i.test(normalized)) return false;
  if (
    /\badhd\s+app\b/i.test(normalized) &&
    /\b(?:potential users|my new|our new|benefit from|explain to|present(?:ation)?|launch)\b/i.test(
      normalized,
    )
  ) {
    return false;
  }
  return ADHD_SYMPTOMS_TOPIC_RE.test(normalized);
}

const ADHD_SYMPTOMS_REPLY = [
  "ADHD often shows up as a mix of these — not everyone has all of them.",
  "",
  "Inattention — hard to sustain focus, easy to drift, losing track of steps or objects, forgetting what you came to do.",
  "Hyperactivity / restlessness — feeling wired, hard to sit still, always \"on.\"",
  "Impulsivity — speaking or acting before thinking it through, difficulty waiting.",
  "",
  "In adults it can look more like mental restlessness and procrastination than the kid stereotype.",
  "If you're wondering whether this fits you, a clinician who knows ADHD is the right next step.",
  "",
  "Want me to go deeper on any one of those?",
].join("\n");

export function resolveInformationalKnowledgeLocalReply(
  text: string,
  lastAssistantText?: string | null,
): string | null {
  const t = text.trim();
  if (!t || isEstateGuideQuestion(t, lastAssistantText)) return null;
  const normalized = normalizeLooseKnowledgeText(t);
  if (
    isAdhdSymptomsQuestion(t) ||
    (isKnowledgeQuestion(normalized) && isAdhdSymptomsQuestion(normalized))
  ) {
    return ADHD_SYMPTOMS_REPLY;
  }
  return null;
}
