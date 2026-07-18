/**
 * Topic Anchor lifecycle — create, preserve, focus-update, explicit change.
 */

import {
  detectsTopicSubjectRejection,
  extractRejectedSubject,
  isBackgroundElaboration,
  recoverPreferredTopicFromHistory,
} from "@/lib/shariNaturalConversation/topicDiscipline";
import { isClarificationRequest } from "./clarificationDetection";
import { detectsExplicitTopicChange } from "./topicChangeDetection";
import {
  extractConversationGoal,
  extractCurrentFocus,
  extractPrimaryTopic,
  inferTopicType,
  isIllegalTopicLabel,
  isShortFocusReply,
  isShortNonTopicReply,
} from "./topicExtraction";
import type { TopicAnchor, TcaiMessage } from "./types";

export function emptyTopicAnchor(): TopicAnchor {
  return {
    primaryTopic: "",
    topicType: "other",
    conversationGoal: null,
    topicConfidence: "low",
    topicSourceTurnId: null,
    currentFocus: null,
    topicHistory: [],
    topicChangeRequested: false,
    topicChangeConfirmed: false,
    lastClarificationRequest: null,
    topicDriftDetected: false,
  };
}

export function hasActiveTopicAnchor(
  anchor: TopicAnchor | null | undefined,
): boolean {
  return Boolean(anchor?.primaryTopic?.trim()) && !isIllegalTopicLabel(anchor!.primaryTopic);
}

function pushHistory(anchor: TopicAnchor, topic: string): void {
  if (!topic || anchor.topicHistory[anchor.topicHistory.length - 1] === topic) {
    return;
  }
  anchor.topicHistory = [...anchor.topicHistory, topic].slice(-8);
}

/**
 * Update Topic Anchor from the latest user turn.
 * Clarification / short replies never overwrite primaryTopic.
 */
export function updateTopicAnchor(input: {
  previous: TopicAnchor | null | undefined;
  userText: string;
  messages?: readonly TcaiMessage[];
  turnId?: string | null;
}): TopicAnchor {
  const prev = input.previous?.primaryTopic
    ? { ...input.previous, topicHistory: [...input.previous.topicHistory] }
    : emptyTopicAnchor();

  const t = input.userText.trim();
  const next: TopicAnchor = {
    ...prev,
    topicChangeRequested: false,
    topicDriftDetected: false,
  };

  // Recover Topic Anchor from history before interpreting this turn
  // (prevents background elaborations from becoming the first topic).
  if (!hasActiveTopicAnchor(next) && input.messages?.length) {
    const recovered = recoverTopicFromHistory(input.messages);
    if (recovered) {
      next.primaryTopic = recovered.primaryTopic;
      next.conversationGoal = recovered.conversationGoal;
      next.topicType = recovered.topicType;
      next.topicConfidence = recovered.topicConfidence;
      next.topicHistory = [...recovered.topicHistory];
      next.topicSourceTurnId = recovered.topicSourceTurnId;
    }
  }

  if (isClarificationRequest(t)) {
    next.lastClarificationRequest = t.slice(0, 160);
    // Preserve primary topic — never extract from clarification
    if (!hasActiveTopicAnchor(next) && input.messages) {
      const recovered = recoverTopicFromHistory(input.messages);
      if (recovered) {
        next.primaryTopic = recovered.primaryTopic;
        next.conversationGoal = recovered.conversationGoal;
        next.topicType = recovered.topicType;
        next.topicConfidence = recovered.topicConfidence;
      }
    }
    return next;
  }

  if (detectsExplicitTopicChange(t)) {
    next.topicChangeRequested = true;
    const newTopic = extractPrimaryTopic(t);
    if (newTopic && !isIllegalTopicLabel(newTopic)) {
      pushHistory(next, next.primaryTopic);
      next.primaryTopic = newTopic;
      next.conversationGoal = extractConversationGoal(t);
      next.topicType = inferTopicType(t);
      next.topicConfidence = "high";
      next.topicSourceTurnId = input.turnId ?? null;
      next.currentFocus = null;
      next.topicChangeConfirmed = true;
      next.lastClarificationRequest = null;
      return next;
    }
    // Ambiguous change — keep old topic, flag request
    next.topicChangeConfirmed = false;
    return next;
  }

  if (isShortFocusReply(t) || (isShortNonTopicReply(t) && hasActiveTopicAnchor(next))) {
    const focus = extractCurrentFocus(t);
    if (focus) next.currentFocus = focus;
    return next;
  }

  // Package 208 — user rejects a misread subject; restore preferred topic
  if (detectsTopicSubjectRejection(t) && hasActiveTopicAnchor(next)) {
    const rejected = extractRejectedSubject(t);
    const restored =
      recoverPreferredTopicFromHistory(next.topicHistory, rejected) ??
      (/\bhir|market/i.test(next.primaryTopic) ? next.primaryTopic : null);
    if (restored) {
      if (restored.toLowerCase() !== next.primaryTopic.toLowerCase()) {
        pushHistory(next, next.primaryTopic);
        next.primaryTopic = restored;
      }
      next.topicConfidence = "high";
      if (/\bmarket/i.test(t)) {
        next.currentFocus = "marketing the offering";
      }
      return next;
    }
  }

  // Package 208 Rule 1 — background elaborates; does not replace Topic Anchor
  if (
    hasActiveTopicAnchor(next) &&
    isBackgroundElaboration(t, next.primaryTopic)
  ) {
    if (/\bmarket|people to know|discover|membership/i.test(t)) {
      next.currentFocus = "getting the offering known";
    } else if (/\bdesign|platform|build/i.test(t)) {
      next.currentFocus = "context for the decision";
    }
    return next;
  }

  const extracted = extractPrimaryTopic(t);
  if (extracted && !isIllegalTopicLabel(extracted)) {
    if (!hasActiveTopicAnchor(next)) {
      next.primaryTopic = extracted;
      next.conversationGoal = extractConversationGoal(t);
      next.topicType = inferTopicType(t);
      next.topicConfidence = "high";
      next.topicSourceTurnId = input.turnId ?? null;
      pushHistory(next, extracted);
    } else if (extracted.toLowerCase() !== next.primaryTopic.toLowerCase()) {
      const prevKey = next.primaryTopic
        .toLowerCase()
        .split(/\s+/)
        .filter((w) => w.length >= 5);
      const overlap = prevKey.filter((w) => t.toLowerCase().includes(w));
      const clearlyNewSubject =
        t.length > 40 &&
        overlap.length === 0 &&
        extracted.length > 12 &&
        !isBackgroundElaboration(t, next.primaryTopic);
      if (
        clearlyNewSubject ||
        (/\bhir(?:e|ing)\b/.test(t) && /\binstead\b/.test(t))
      ) {
        pushHistory(next, next.primaryTopic);
        next.primaryTopic = extracted;
        next.conversationGoal = extractConversationGoal(t);
        next.topicType = inferTopicType(t);
        next.topicConfidence = "high";
        next.topicSourceTurnId = input.turnId ?? null;
        next.currentFocus = null;
        next.topicChangeConfirmed = true;
      } else {
        const focus = extractCurrentFocus(t);
        if (focus) next.currentFocus = focus;
      }
    }
  }

  if (!hasActiveTopicAnchor(next) && input.messages) {
    const recovered = recoverTopicFromHistory(input.messages);
    if (recovered) Object.assign(next, recovered);
  }

  return next;
}

export function recoverTopicFromHistory(
  messages: readonly TcaiMessage[],
): TopicAnchor | null {
  for (let i = messages.length - 1; i >= 0; i--) {
    const m = messages[i];
    if (m?.role !== "user") continue;
    if (isClarificationRequest(m.content)) continue;
    if (isShortNonTopicReply(m.content)) continue;
    const topic = extractPrimaryTopic(m.content);
    if (topic && !isIllegalTopicLabel(topic)) {
      return {
        ...emptyTopicAnchor(),
        primaryTopic: topic,
        conversationGoal: extractConversationGoal(m.content),
        topicType: inferTopicType(m.content),
        topicConfidence: "high",
        topicSourceTurnId: m.id ?? null,
        topicHistory: [topic],
      };
    }
  }
  return null;
}

export function topicAnchorFromLiteral(
  literalTopic: string | null | undefined,
  archetype?: string | null,
): TopicAnchor | null {
  if (!literalTopic?.trim() || isIllegalTopicLabel(literalTopic)) return null;
  return {
    ...emptyTopicAnchor(),
    primaryTopic: literalTopic.trim(),
    topicType: (archetype as TopicAnchor["topicType"]) ?? "other",
    conversationGoal: /\bhir/.test(literalTopic)
      ? "think through whether to hire"
      : null,
    topicConfidence: "medium",
    topicHistory: [literalTopic.trim()],
  };
}
