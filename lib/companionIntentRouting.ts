/**
 * Companion-first intent buckets — information vs creation.
 * Research, learning, advice, and brainstorming stay in chat.
 * Only explicit create/draft/build requests open Create.
 */

import { isResearchIntelligenceRequest } from "./researchIntelligence";
import { matchCatalogFromText } from "./createCatalog";
import {
  hasClearEmotionalSignal,
  isContentBrainstorming,
  isDecidingConversation,
  isExplicitCreationRequest,
  isPrioritizingConversation,
  isProblemSolvingContext,
} from "./messageClassification";

const CREATE_SIGNAL_RE =
  /\b(?:write|draft|create|compose|generate|put together|build|make)\s+(?:the|my|a|an|this|that)\b/i;

function mentionsDeliverableType(text: string): boolean {
  return Boolean(matchCatalogFromText(text)?.type);
}

export type CompanionIntentBucket =
  | "research"
  | "learning"
  | "advice"
  | "brainstorming"
  | "examples"
  | "problem_solving"
  | "decision_making"
  | "emotional_support"
  | "content_creation"
  | "drafting"
  | "building_assets"
  | "neutral";

const LEARNING_RE =
  /\b(?:how do(?:es)? .+ work|how (?:do|to) .+ work|what is (?:a|an) \w|what are \w|can you explain|could you explain|explain (?:how|what|why)|tell me (?:about|how)|teach me (?:about|how)|help me understand|walk me through)\b/i;

const ADVICE_RE =
  /\b(?:which .+ (?:would|should|do you) (?:work best|you recommend|i (?:use|choose|pick))|what (?:would|should) (?:you|i) (?:recommend|suggest|use|charge|pick|choose)|should i (?:use|charge|pick|choose|go with)|what(?:'s| is) the best (?:way|approach|option|model|strategy|pricing)|which (?:pricing|business|marketing|revenue) model)\b/i;

const EXAMPLES_RE =
  /\b(?:give me|show me|can you (?:give|show)|need|want) (?:some )?examples?\b/i;

const DRAFT_VERB_RE =
  /\b(?:draft|write|compose|rewrite|re-?write)\s+(?:the|my|a|an|this|that)\b/i;

const BUILD_VERB_RE =
  /\b(?:build|make)\s+(?:the|my|a|an|this|that)\b/i;

const CREATE_VERB_RE =
  /\b(?:create|generate|produce|craft)\s+(?:the|my|a|an|this|that)\b/i;

const VAGUE_CREATE_RE =
  /\b(?:help me write something|write something|something for my business|help (?:me )?with (?:some )?content|need to do a message|can you help me write|help me with a message)\b/i;

/** Buckets that answer in chat — never auto-open Create. */
export const INFORMATION_INTENT_BUCKETS: ReadonlySet<CompanionIntentBucket> =
  new Set([
    "research",
    "learning",
    "advice",
    "brainstorming",
    "examples",
    "problem_solving",
    "decision_making",
    "emotional_support",
  ]);

/** Buckets that may open Create when the user explicitly asked for output. */
export const CREATE_INTENT_BUCKETS: ReadonlySet<CompanionIntentBucket> =
  new Set(["content_creation", "drafting", "building_assets"]);

export function classifyCompanionIntentBucket(
  text: string,
): CompanionIntentBucket {
  const t = text.trim();
  if (!t) return "neutral";

  if (isExplicitCreationRequest(t)) {
    if (DRAFT_VERB_RE.test(t)) return "drafting";
    if (BUILD_VERB_RE.test(t)) return "building_assets";
    return "content_creation";
  }

  if (isContentBrainstorming(t)) return "brainstorming";
  if (isResearchIntelligenceRequest(t)) return "research";
  if (LEARNING_RE.test(t) && t.includes("?")) return "learning";
  if (LEARNING_RE.test(t) && !CREATE_SIGNAL_RE.test(t)) return "learning";
  if (ADVICE_RE.test(t)) return "advice";
  if (EXAMPLES_RE.test(t)) return "examples";
  if (isDecidingConversation(t)) return "decision_making";
  if (isPrioritizingConversation(t)) return "problem_solving";
  if (isProblemSolvingContext(t) && /\?/.test(t)) return "problem_solving";
  if (hasClearEmotionalSignal(t) && !CREATE_SIGNAL_RE.test(t)) {
    return "emotional_support";
  }

  if (DRAFT_VERB_RE.test(t) && mentionsDeliverableType(t)) return "drafting";
  if (BUILD_VERB_RE.test(t) && mentionsDeliverableType(t)) return "building_assets";
  if (CREATE_VERB_RE.test(t) && mentionsDeliverableType(t)) return "content_creation";

  return "neutral";
}

export function isInformationIntent(text: string): boolean {
  const t = text.trim();
  if (!t) return false;
  if (isExplicitCreationRequest(t)) return false;
  if (VAGUE_CREATE_RE.test(t)) return false;
  const bucket = classifyCompanionIntentBucket(t);
  return INFORMATION_INTENT_BUCKETS.has(bucket);
}

/**
 * True only when chat may open Create as a direct response to this message.
 * Information / advice / soft exploration never qualify — deny by default.
 * Requires an explicit create/draft/write/build request (isExplicitCreationRequest).
 */
export function shouldOpenCreateWorkspace(text: string): boolean {
  const t = text.trim();
  if (!t) return false;
  if (isInformationIntent(t)) return false;
  if (!isExplicitCreationRequest(t)) return false;
  return CREATE_INTENT_BUCKETS.has(classifyCompanionIntentBucket(t));
}

export function informationIntentHintForChat(
  bucket: CompanionIntentBucket,
  text: string,
): string | undefined {
  if (!INFORMATION_INTENT_BUCKETS.has(bucket) || bucket === "neutral") {
    return undefined;
  }

  const job =
    bucket === "research"
      ? "own the research — synthesize current findings naturally; never push internet lookup onto the user"
      : bucket === "learning"
        ? "explain clearly in chat"
        : bucket === "advice"
          ? "give recommendations in chat"
          : bucket === "brainstorming"
            ? "offer ideas or options in chat only"
            : bucket === "examples"
              ? "show examples in chat"
              : bucket === "decision_making"
                ? "help them decide in chat"
                : bucket === "emotional_support"
                  ? "support emotionally in chat"
                  : "stay in conversation";

  const borderline =
    bucket === "brainstorming" &&
    /\b(?:post|email|newsletter|caption|script|lead magnet|funnel)\b/i.test(text)
      ? ' End with something like: "Would you like me to turn one of these into a post?" — only open Create if they say yes.'
      : "";

  return (
    `INFORMATION INTENT (${bucket}): User wants information, not a deliverable — "${text.slice(0, 100)}". ` +
    `${job}. Do NOT open Create, drafts, or content builder. ` +
    `Do NOT say "I'm opening Create".${borderline}`
  );
}
