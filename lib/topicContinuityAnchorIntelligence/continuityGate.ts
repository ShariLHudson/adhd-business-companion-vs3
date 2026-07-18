/**
 * Pre-send topic continuity validation — reject drift / stop-word subjects.
 */

import { buildNaturalTopicReturn } from "@/lib/shariNaturalConversation/naturalVoice";
import { isIllegalTopicLabel } from "./topicExtraction";
import { buildTopicSafeClarificationRepair } from "./topicSafeRepair";
import { hasActiveTopicAnchor } from "./topicAnchor";
import type {
  TcaiContinuityResult,
  TcaiFailureCode,
  TopicAnchor,
} from "./types";

const BAD_SUBJECT =
  /\b(?:something around (?:does|what|that|it|mean)|thinking about what\.|about that\.|around does)\b/i;

const UNANCHORED_TAKE_TIME =
  /^(?:take your time(?: with that)?\.?|i am with you\.?)$/i;

function draftMentionsTopic(text: string, topic: string): boolean {
  const d = text.toLowerCase();
  const parts = topic
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w.length >= 4);
  if (parts.length === 0) return false;
  const hits = parts.filter((w) => d.includes(w));
  return hits.length >= Math.min(2, parts.length) || hits.some((w) =>
    /hir|market|sales|client|program|project|cost|bookkeep/.test(w),
  );
}

export function certifyTopicContinuity(input: {
  text: string;
  userText: string;
  anchor: TopicAnchor | null;
  repairActive?: boolean;
}): { passed: boolean; failures: TcaiFailureCode[] } {
  const failures: TcaiFailureCode[] = [];
  const text = input.text.trim();
  const anchor = input.anchor;

  if (BAD_SUBJECT.test(text) || /\baround does\b/i.test(text)) {
    failures.push("STOP_WORD_AS_TOPIC");
    failures.push("TOPIC_DRIFT");
  }

  if (/\byou are (?:working through|thinking about) (?:what|that|it)\b/i.test(text)) {
    failures.push("PRONOUN_AS_TOPIC");
  }

  if (
    hasActiveTopicAnchor(anchor) &&
    UNANCHORED_TAKE_TIME.test(text)
  ) {
    failures.push("UNRELATED_RESPONSE_SUBJECT");
  }

  if (
    input.repairActive &&
    hasActiveTopicAnchor(anchor) &&
    !draftMentionsTopic(text, anchor!.primaryTopic) &&
    !/\b(?:did not (?:say|explain)|meant|clarify)\b/i.test(text)
  ) {
    failures.push("REPAIR_LOST_TOPIC");
  }

  if (
    hasActiveTopicAnchor(anchor) &&
    text.length > 40 &&
    !draftMentionsTopic(text, anchor!.primaryTopic) &&
    !input.repairActive &&
    // Early grounded questions should name the topic
    (anchor!.topicHistory.length <= 2 || !anchor!.currentFocus)
  ) {
    // Soft: only fail when draft invents a different concrete subject
    if (/\b(?:bookkeeper|client|program|project)\b/i.test(text) &&
      !new RegExp(anchor!.primaryTopic.split(/\s+/)[0] ?? "x", "i").test(text)) {
      failures.push("TOPIC_DRIFT");
    }
  }

  if (isIllegalTopicLabel(text.split(/\s+/).slice(0, 3).join(" "))) {
    // only if the whole short draft is illegal
    if (text.length < 48 && BAD_SUBJECT.test(text)) {
      failures.push("SHORT_REPLY_AS_TOPIC");
    }
  }

  if (!hasActiveTopicAnchor(anchor) && BAD_SUBJECT.test(text)) {
    failures.push("TOPIC_ANCHOR_MISSING");
  }

  return { passed: failures.length === 0, failures };
}

/**
 * Validate draft; on failure regenerate from Topic Anchor.
 */
export function applyTopicContinuityValidation(input: {
  draftText: string;
  userText: string;
  anchor: TopicAnchor | null;
  previousAssistantText?: string;
  repairActive?: boolean;
  wasClarification?: boolean;
}): TcaiContinuityResult {
  const first = certifyTopicContinuity({
    text: input.draftText,
    userText: input.userText,
    anchor: input.anchor,
    repairActive: input.repairActive,
  });

  if (first.passed) {
    return {
      text: input.draftText.trim(),
      passed: true,
      failures: [],
      usedFallback: false,
      anchor: input.anchor,
    };
  }

  const topic = input.anchor?.primaryTopic?.trim() || "this decision";
  let fallback: string;
  if (input.wasClarification || input.repairActive) {
    fallback = buildTopicSafeClarificationRepair({
      anchor: input.anchor,
      previousAssistantText: input.previousAssistantText ?? "",
      userText: input.userText,
    });
  } else if (/\bhir|market|sales|assistant|bookkeep/i.test(topic)) {
    fallback = buildNaturalTopicReturn({ topic, mode: "continue" });
  } else {
    fallback = buildNaturalTopicReturn({ topic, mode: "continue" });
  }

  const second = certifyTopicContinuity({
    text: fallback,
    userText: input.userText,
    anchor: input.anchor,
    repairActive: true,
  });

  return {
    text: fallback,
    passed: second.passed,
    failures: first.failures,
    usedFallback: true,
    anchor: input.anchor
      ? { ...input.anchor, topicDriftDetected: true }
      : null,
  };
}
