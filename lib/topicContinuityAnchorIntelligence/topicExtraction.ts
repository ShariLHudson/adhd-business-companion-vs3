/**
 * Safe topic extraction — noun phrases / decisions only; never stop words.
 */

import { isClarificationRequest } from "./clarificationDetection";
import { isPronounAsTopic, isStopWordTopic } from "./topicLexicon";
import type { TopicType } from "./types";

const SHORT_FOCUS =
  /^(?:cost|timing|both|trust|overwhelmed|money|budget|capacity|fear|energy|not sure|unsure)\.?$/i;

const SHORT_AFFIRM =
  /^(?:yes|no|ok|okay|sure|maybe|yep|nope|right|exactly|true)\.?$/i;

export function isShortFocusReply(userText: string): boolean {
  const t = userText.trim();
  if (!t) return false;
  if (SHORT_FOCUS.test(t)) return true;
  if (t.split(/\s+/).length <= 2 && t.length <= 24 && !isClarificationRequest(t)) {
    // Single meaningful noun as focus answer
    const w = t.toLowerCase().replace(/[^a-z0-9'-]/g, "");
    return w.length >= 3 && !isStopWordTopic(w) && !SHORT_AFFIRM.test(t);
  }
  return false;
}

export function isShortNonTopicReply(userText: string): boolean {
  const t = userText.trim();
  if (!t) return true;
  if (isClarificationRequest(t)) return true;
  if (SHORT_AFFIRM.test(t)) return true;
  if (isPronounAsTopic(t)) return true;
  if (t.length <= 2) return true;
  return false;
}

/** Extract a stable primary topic label, or null if turn must not set one. */
export function extractPrimaryTopic(userText: string): string | null {
  const t = userText.trim();
  if (!t) return null;
  if (isClarificationRequest(t)) return null;
  if (isShortNonTopicReply(t)) return null;
  if (isShortFocusReply(t) && t.split(/\s+/).length <= 2) return null;
  if (isPronounAsTopic(t)) return null;

  const lower = t.toLowerCase();

  if (
    /\bhir(?:e|ing)\b/.test(lower) &&
    /\bmarketing\b/.test(lower) &&
    /\bassistant\b/.test(lower)
  ) {
    return "hiring a marketing assistant";
  }
  if (
    /\bhir(?:e|ing)\b/.test(lower) &&
    /\b(?:marketing|sales)\b/.test(lower)
  ) {
    return "hiring marketing or sales help";
  }
  if (/\bhir(?:e|ing)\b/.test(lower) && /\bbookkeeper\b/.test(lower)) {
    return "hiring a bookkeeper";
  }
  if (/\bhir(?:e|ing)\b/.test(lower)) {
    return "whether to hire help";
  }
  if (
    /\b(?:project|projects)\b/.test(lower) &&
    /\b(?:avoid|avoiding|putting off)\b/.test(lower)
  ) {
    return "which project to start";
  }
  if (/\b(?:overwhelm|too many|too much|where to start)\b/.test(lower)) {
    return "where to start with everything on your plate";
  }
  if (/\b(?:explain|program|offer)\b/.test(lower)) {
    return "how to explain your program";
  }
  if (
    /\b(?:let (?:a |the )?client go|fire (?:a |the )?client|end (?:the )?relationship)\b/.test(
      lower,
    )
  ) {
    return "whether to end a client relationship";
  }
  if (
    /\bclient\b/.test(lower) &&
    /\b(?:bring (?:this|it) up|tell them|hard conversation|difficult conversation)\b/.test(
      lower,
    )
  ) {
    return "whether to bring something up with your client";
  }
  if (/\bcollaborat|partner with|other business owners\b/.test(lower)) {
    return "whether to collaborate with other business owners";
  }
  if (/\bsubscription|subscriptions\b/.test(lower) && /\b(?:cancel|avoid)/.test(lower)) {
    return "canceling unused subscriptions";
  }
  if (/\b(?:decid|whether|should i|or not)\b/.test(lower)) {
    // Prefer noun phrase over raw sentence dump
    const hireBit = t.match(
      /\b(?:hire|hiring)\s+(?:a\s+)?([a-z][a-z\s/-]{2,40}?)(?:\s+or\s+not)?[.?!]?$/i,
    );
    if (hireBit?.[1]) {
      return `hiring ${hireBit[1].trim()}`;
    }
    const clipped = t.length <= 90 ? t : `${t.slice(0, 87)}…`;
    return clipped.replace(/^if\s+/i, "whether ").replace(/\.$/, "");
  }

  // Reject if the only content words are stop words
  const tokens = t
    .toLowerCase()
    .replace(/[^a-z0-9\s'-]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length >= 3 && !isStopWordTopic(w));
  if (tokens.length === 0) return null;

  // Do not use full clarification-like leftovers
  if (tokens.every((w) => isStopWordTopic(w))) return null;

  // Designing/building a platform + awareness → marketing outcome, not a token dump
  if (
    /\b(?:design|build|creat|launch)\b/.test(lower) &&
    /\b(?:platform|app|product)\b/.test(lower) &&
    /\b(?:people to know|membership|discover|market)\b/.test(lower)
  ) {
    return "getting the offering known";
  }

  // Never store the raw user sentence as the topic (echo risk) — compress to cues
  if (tokens.length >= 2) {
    const joined = tokens.slice(0, 6).join(" ");
    // Package 209 — reject malformed token-dump topics ("… platform need")
    if (/\bplatform need\b/i.test(joined) || isIllegalTopicLabel(joined)) {
      return null;
    }
    return joined;
  }
  return null;
}

export function extractConversationGoal(userText: string): string | null {
  const lower = userText.toLowerCase();
  if (/\bhir(?:e|ing)\b/.test(lower)) {
    return "think through whether to hire";
  }
  if (/\b(?:decid|whether|should i|or not)\b/.test(lower)) {
    return "think through a decision";
  }
  if (/\b(?:overwhelm|too many|where to start)\b/.test(lower)) {
    return "find a place to start";
  }
  return null;
}

export function inferTopicType(userText: string): TopicType {
  const lower = userText.toLowerCase();
  if (/\bhir(?:e|ing)|decid|whether|should i\b/.test(lower)) {
    return "business-decision";
  }
  if (/\boverwhelm|too many|too much\b/.test(lower)) return "overwhelm";
  if (/\bclient|conversation\b/.test(lower)) return "relationship";
  if (/\bexplain|program|creat\b/.test(lower)) return "creative-block";
  return "other";
}

export function extractCurrentFocus(userText: string): string | null {
  const t = userText.trim();
  if (!isShortFocusReply(t) && !SHORT_FOCUS.test(t)) {
    // Longer turns may still name a focus
    if (/\bcost\b/i.test(t) && t.length < 80) return "cost concern";
    if (/\btiming\b/i.test(t) && t.length < 80) return "timing";
    return null;
  }
  const lower = t.toLowerCase().replace(/\.$/, "");
  if (lower === "cost" || lower === "money" || lower === "budget") {
    return "cost concern";
  }
  if (lower === "timing") return "timing";
  if (lower === "both") return "more than one concern";
  if (lower === "trust") return "trust";
  if (lower === "overwhelmed") return "feeling overwhelmed";
  if (lower === "not sure" || lower === "unsure") return "uncertainty";
  if (lower === "capacity" || lower === "energy") return lower;
  return lower.slice(0, 40);
}

/** True if candidate topic is illegal (stop word / pronoun / clarification residue). */
export function isIllegalTopicLabel(label: string): boolean {
  const t = label.trim().toLowerCase();
  if (!t) return true;
  if (isPronounAsTopic(t)) return true;
  if (isStopWordTopic(t)) return true;
  if (/^(?:does|what|mean|that|this|it|something|around)\b/.test(t) && t.split(/\s+/).length <= 2) {
    return true;
  }
  if (/\bsomething around (?:does|what|that|it)\b/.test(t)) return true;
  // Package 209 — malformed extraction dumps
  if (/\bplatform need\b/.test(t)) return true;
  if (
    /\b(?:designing|building|creating)\b/.test(t) &&
    /\bplatform\b/.test(t) &&
    (/\bneed\b/.test(t) || t.split(/\s+/).length >= 5) &&
    !/\bhir|market|sales\b/.test(t)
  ) {
    return true;
  }
  return false;
}
