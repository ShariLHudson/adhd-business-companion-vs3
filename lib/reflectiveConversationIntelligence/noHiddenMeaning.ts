/**
 * Package 192 — No Hidden Meaning & Direct Repair.
 * Stay with the user's stated topic; corrections override interpretation.
 */

import { buildNaturalTopicReturn } from "@/lib/shariNaturalConversation/naturalVoice";
import { extractPrimaryTopic } from "@/lib/topicContinuityAnchorIntelligence";
import type { RciMessage, ThinkingMap } from "./types";

export type NoHiddenMeaningFailureCode =
  | "UNSUPPORTED_HIDDEN_MEANING"
  | "USER_CORRECTION_IGNORED"
  | "FAILED_TOPIC_RETURN"
  | "GENERIC_POST_CORRECTION_FALLBACK"
  | "INSUFFICIENT_INTERPRETATION_EVIDENCE"
  | "REJECTED_INTERPRETATION_REUSED";

const HIDDEN_MEANING =
  /\b(?:quieter question underneath|quieter piece underneath|something underneath|what this is really about|something deeper|what you are not saying|hiding beneath|unspoken fear|the real issue|what may be hiding|reading this wrong[^.?]*underneath)\b/i;

const DIRECT_CORRECTION =
  /\b(?:nothing underneath|that(?:'s| is) not what i mean(?:t)?|you(?:'re| are) reading (?:it|this|me) wrong|i already told you|it(?:'s| is) just what i said|no hidden (?:meaning|layer|issue)|not what i(?:'m| am) saying|you(?:'re| are) overthinking|you(?:'re| are) misunderstanding|there is nothing (?:else|deeper|underneath)|just (?:what|exactly what) i said|(?:has|have|it has)\s+nothing to do with)\b/i;

const GENERIC_POST_CORRECTION =
  /^(?:take your time\.?|i am with you\.?|i'?m with you\.?|what else wants to be said\??|that seems important\.?|tell me more\.?|what feels unfinished\??|what matters most(?:\s+here)?\??|let'?s stay with[^.?]*[.?]?)$/i;

/** Extract a short literal topic label from user language. */
export function extractLiteralTopic(userText: string): string | null {
  // Package 193 — delegate to TCAI (never clarification / stop words)
  return extractPrimaryTopic(userText);
}

export function containsUnsupportedHiddenMeaning(text: string): boolean {
  return HIDDEN_MEANING.test(text);
}

export function detectsDirectCorrection(userText: string): boolean {
  const t = userText.trim();
  if (!t) return false;
  if (DIRECT_CORRECTION.test(t)) return true;
  if (/^no\.?$/i.test(t) && t.length <= 4) return true;
  return false;
}

export function isGenericPostCorrectionFallback(text: string): boolean {
  return GENERIC_POST_CORRECTION.test(text.trim());
}

/** Count grounded signals that may justify tentative interpretation. */
export function countInterpretationEvidence(
  map: ThinkingMap,
  userText: string,
  messages: readonly RciMessage[],
): number {
  let n = 0;
  if (map.concerns.length >= 1) n += 1;
  if (map.tradeOffs.length >= 1) n += 1;
  if (map.patterns.length >= 1) n += 1;
  if (map.optionsNamed.length >= 2) n += 1;
  if (map.values.length >= 1 && map.concerns.length >= 1) n += 1;

  const blob = [
    ...messages.filter((m) => m.role === "user").map((m) => m.content),
    userText,
  ]
    .join(" ")
    .toLowerCase();

  if (/\b(?:afraid|fear|scared|anxious|terrified)\b/.test(blob)) n += 1;
  if (
    /\b(?:avoid|avoiding|putting off)\b/.test(blob) &&
    /\b(?:again|keep|always|usually)\b/.test(blob)
  ) {
    n += 1;
  }
  if (
    /\b(?:but|however)\b/.test(blob) &&
    /\b(?:want|need|should)\b/.test(blob)
  ) {
    n += 1;
  }
  // Repeated concern across turns
  const userTurns = messages.filter((m) => m.role === "user").length + 1;
  if (userTurns >= 3 && map.concerns.length >= 1) n += 1;

  return n;
}

export function interpretationAllowedFromEvidence(count: number): boolean {
  return count >= 2;
}

export function lastAssistantHadHiddenMeaning(
  messages: readonly RciMessage[],
): boolean {
  for (let i = messages.length - 1; i >= 0; i--) {
    const m = messages[i];
    if (m?.role === "assistant" && m.content.trim()) {
      return containsUnsupportedHiddenMeaning(m.content);
    }
  }
  return false;
}

function topicPhrase(map: ThinkingMap, messages: readonly RciMessage[]): string {
  if (map.literalTopic?.trim()) return map.literalTopic.trim();
  for (let i = messages.length - 1; i >= 0; i--) {
    const m = messages[i];
    if (m?.role === "user") {
      const lit = extractLiteralTopic(m.content);
      if (lit) return lit;
    }
  }
  return "what you actually said";
}

/**
 * Build ownership + return-to-topic repair after a direct user correction.
 */
export function buildDirectCorrectionRepair(input: {
  map: ThinkingMap;
  messages: readonly RciMessage[];
  seed?: number;
}): { text: string; rejectedInterpretation: string | null } {
  const topic = topicPhrase(input.map, input.messages);
  const lastHidden = (() => {
    for (let i = input.messages.length - 1; i >= 0; i--) {
      const m = input.messages[i];
      if (m?.role === "assistant" && containsUnsupportedHiddenMeaning(m.content)) {
        return m.content.trim().slice(0, 120);
      }
    }
    return null;
  })();

  const text = buildNaturalTopicReturn({ topic, mode: "correction" });

  return { text, rejectedInterpretation: lastHidden };
}

/** Apply correction to Thinking Map — reject prior hidden interpretation. */
export function applyUserCorrectionToMap(
  map: ThinkingMap,
  userText: string,
  rejectedInterpretation: string | null,
): ThinkingMap {
  const next: ThinkingMap = {
    ...map,
    rejectedInterpretations: [...map.rejectedInterpretations],
    userCorrections: [...map.userCorrections],
    emergingInsights: [...map.emergingInsights],
    patterns: [...map.patterns],
    assumptions: [...map.assumptions],
  };
  next.userCorrections.push(userText.trim().slice(0, 160));
  if (next.userCorrections.length > 12) {
    next.userCorrections.splice(0, next.userCorrections.length - 12);
  }
  if (rejectedInterpretation) {
    next.rejectedInterpretations.push(rejectedInterpretation);
    if (next.rejectedInterpretations.length > 12) {
      next.rejectedInterpretations.splice(
        0,
        next.rejectedInterpretations.length - 12,
      );
    }
  }
  // Clear unsupported interpretive residue
  next.emergingInsights = next.emergingInsights.filter(
    (x) => !/underneath|deeper|really about|hidden/i.test(x),
  );
  next.patterns = next.patterns.filter(
    (x) => !/underneath|deeper|hidden/i.test(x),
  );
  next.interpretationAllowed = false;
  next.interpretationEvidenceCount = 0;
  return next;
}

export function draftReusesRejectedInterpretation(
  draft: string,
  map: ThinkingMap,
): boolean {
  if (map.rejectedInterpretations.length === 0) return false;
  if (containsUnsupportedHiddenMeaning(draft)) return true;
  const d = draft.toLowerCase();
  return map.rejectedInterpretations.some((r) => {
    const stem = r.toLowerCase().slice(0, 40);
    return stem.length > 12 && d.includes(stem.slice(0, 24));
  });
}

export function certifyNoHiddenMeaning(input: {
  text: string;
  userText: string;
  map: ThinkingMap;
  wasCorrection?: boolean;
}): { passed: boolean; failures: NoHiddenMeaningFailureCode[] } {
  const failures: NoHiddenMeaningFailureCode[] = [];
  const text = input.text.trim();

  if (containsUnsupportedHiddenMeaning(text)) {
    failures.push("UNSUPPORTED_HIDDEN_MEANING");
  }
  if (draftReusesRejectedInterpretation(text, input.map)) {
    failures.push("REJECTED_INTERPRETATION_REUSED");
  }
  if (
    !input.map.interpretationAllowed &&
    containsUnsupportedHiddenMeaning(text)
  ) {
    failures.push("INSUFFICIENT_INTERPRETATION_EVIDENCE");
  }
  if (input.wasCorrection) {
    if (isGenericPostCorrectionFallback(text)) {
      failures.push("GENERIC_POST_CORRECTION_FALLBACK");
    }
    const topic = input.map.literalTopic?.toLowerCase() ?? "";
    if (
      topic &&
      !topic
        .split(/\s+/)
        .filter((w) => w.length >= 4)
        .some((w) => text.toLowerCase().includes(w))
    ) {
      // Allow hire synonyms
      if (!/hir|market|sales|decision|plate|project|client|program/i.test(text)) {
        failures.push("FAILED_TOPIC_RETURN");
      }
    }
  }

  return { passed: failures.length === 0, failures };
}
