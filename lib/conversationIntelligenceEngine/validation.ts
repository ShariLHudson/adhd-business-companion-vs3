/**
 * CIE critical validation gates (package 198).
 */

import {
  certifyGroundedAcknowledgement,
  type GroundedAckFailureCode,
} from "@/lib/conversationalIntelligence/groundedAcknowledgement";
import { draftMatchesBlockedPattern } from "@/lib/goldStandardConversationLibrary";
import type { ThinkingMap } from "@/lib/reflectiveConversationIntelligence";
import {
  certifyNoHiddenMeaning,
  isGenericPostCorrectionFallback,
} from "@/lib/reflectiveConversationIntelligence/noHiddenMeaning";
import {
  certifyNaturalConversation,
  containsGenericConversationTemplate,
} from "@/lib/shariNaturalConversation";
import {
  certifyTopicContinuity,
  hasActiveTopicAnchor,
  isIllegalTopicLabel,
} from "@/lib/topicContinuityAnchorIntelligence";
import { isVerbatimGoldCopy } from "./antiCopy";
import type {
  CieFailureCode,
  CieMessage,
  ConversationPlan,
  ConversationRuntimeState,
  ValidationResult,
} from "./types";

const SCRIPTED =
  /\b(?:great question|let'?s dive in|here'?s a breakdown|as an ai|in conclusion)\b/i;

const ROBOTIC =
  /\b(?:i understand your concern\.?\s*would you like me to|processing your request|navigating to)\b/i;

const HIDDEN =
  /\b(?:quieter question underneath|something underneath|what this is really about|unspoken fear)\b/i;

function countQuestions(text: string): number {
  return (text.match(/\?/g) ?? []).length;
}

function mapGrounded(
  codes: GroundedAckFailureCode[],
): CieFailureCode[] {
  const out: CieFailureCode[] = [];
  for (const c of codes) {
    if (
      c === "GENERIC_ACKNOWLEDGEMENT" ||
      c === "MISSING_TOPIC_REFERENCE" ||
      c === "VAGUE_PRONOUN" ||
      c === "EMPTY_EMPATHY" ||
      c === "UNRELATED_NEXT_QUESTION"
    ) {
      out.push(c);
    }
  }
  return out;
}

export function validateConversationResponse(input: {
  responseText: string;
  userText: string;
  plan: ConversationPlan;
  state: ConversationRuntimeState;
  messages: readonly CieMessage[];
  thinkingMap?: ThinkingMap | null;
  repairActive?: boolean;
}): ValidationResult {
  const failures: CieFailureCode[] = [];
  const text = input.responseText.trim();
  const { plan, state, userText } = input;

  if (!text) {
    failures.push("UNGROUNDED_FALLBACK");
    return { passed: false, failures };
  }

  // Topic continuity
  const topicCert = certifyTopicContinuity({
    text,
    userText,
    anchor: state.topicAnchor,
    repairActive: input.repairActive || plan.priorityEvent === "clarification_request",
  });
  for (const f of topicCert.failures) {
    if (f === "TOPIC_DRIFT") failures.push("TOPIC_DRIFT");
    if (f === "TOPIC_ANCHOR_MISSING") failures.push("TOPIC_ANCHOR_MISSING");
    if (f === "STOP_WORD_AS_TOPIC") failures.push("STOP_WORD_AS_TOPIC");
    if (f === "REPAIR_LOST_TOPIC") failures.push("REPAIR_LOST_TOPIC");
  }
  if (
    state.topicAnchor &&
    isIllegalTopicLabel(state.topicAnchor.primaryTopic) &&
    hasActiveTopicAnchor(state.topicAnchor)
  ) {
    failures.push("STOP_WORD_AS_TOPIC");
  }

  // Correction compliance
  if (
    plan.priorityEvent === "direct_correction" ||
    state.userCorrections.length > 0
  ) {
    if (isGenericPostCorrectionFallback(text)) {
      failures.push("GENERIC_POST_CORRECTION_FALLBACK");
    }
    if (HIDDEN.test(text)) {
      failures.push("USER_CORRECTION_IGNORED");
      failures.push("UNSUPPORTED_HIDDEN_MEANING");
    }
    for (const rejected of state.rejectedInterpretations.slice(-3)) {
      const stem = rejected.interpretation.toLowerCase().slice(0, 28);
      if (stem.length > 16 && text.toLowerCase().includes(stem.slice(0, 20))) {
        failures.push("REJECTED_INTERPRETATION_REUSED");
      }
    }
  }

  // Clarification repair
  if (
    plan.priorityEvent === "clarification_request" ||
    state.clarificationState?.repairRequired
  ) {
    if (/\bsomething around does\b/i.test(text)) {
      failures.push("FAILED_CLARIFICATION_REPAIR");
      failures.push("STOP_WORD_AS_TOPIC");
    }
    if (
      hasActiveTopicAnchor(state.topicAnchor) &&
      !new RegExp(
        (state.topicAnchor!.primaryTopic.split(/\s+/).find((w) => w.length >= 4) ??
          "x").replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
        "i",
      ).test(text) &&
      !/\b(?:did not (?:say|explain)|meant|clarify|clearly)\b/i.test(text)
    ) {
      failures.push("REPAIR_LOST_TOPIC");
    }
  }

  // Grounded acknowledgement
  const grounded = certifyGroundedAcknowledgement({ text, userText });
  failures.push(...mapGrounded(grounded.failures));

  // No hidden meaning
  if (input.thinkingMap) {
    const nhm = certifyNoHiddenMeaning({
      text,
      userText,
      map: input.thinkingMap,
      wasCorrection: plan.priorityEvent === "direct_correction",
    });
    for (const f of nhm.failures) {
      if (f === "UNSUPPORTED_HIDDEN_MEANING") {
        failures.push("UNSUPPORTED_HIDDEN_MEANING");
      }
      if (f === "INSUFFICIENT_INTERPRETATION_EVIDENCE") {
        failures.push("INSUFFICIENT_INTERPRETATION_EVIDENCE");
      }
      if (f === "REJECTED_INTERPRETATION_REUSED") {
        failures.push("REJECTED_INTERPRETATION_REUSED");
      }
      if (f === "GENERIC_POST_CORRECTION_FALLBACK") {
        failures.push("GENERIC_POST_CORRECTION_FALLBACK");
      }
      if (f === "USER_CORRECTION_IGNORED") {
        failures.push("USER_CORRECTION_IGNORED");
      }
    }
  } else if (HIDDEN.test(text)) {
    failures.push("UNSUPPORTED_HIDDEN_MEANING");
  }

  // Question quality
  const qCount = countQuestions(text);
  if (qCount >= 3) failures.push("STACKED_QUESTIONS");
  if (
    plan.primaryMode === "reflective_thinking" &&
    /\b(?:you should|you need to|you must)\b/i.test(text) &&
    /\b(?:hire|decide|choose|launch)\b/i.test(text)
  ) {
    failures.push("PREMATURE_ADVICE");
  }

  // Natural conversation (package 208)
  if (SCRIPTED.test(text) || containsGenericConversationTemplate(text)) {
    failures.push("SCRIPTED_LANGUAGE");
  }
  if (ROBOTIC.test(text)) failures.push("ROBOTIC_TRANSITION");
  const natural = certifyNaturalConversation({
    responseText: text,
    activeTopic: state.topicAnchor?.primaryTopic,
    rejectedSubjects: state.rejectedInterpretations
      .map((r) => r.interpretation)
      .slice(-4),
  });
  if (natural.failures.includes("TOPIC_FIDELITY")) {
    failures.push("TOPIC_DRIFT");
  }
  if (text.length > 900 && plan.desiredResponseLength === "brief") {
    failures.push("EXCESSIVE_LENGTH");
  }

  // Mode
  if (
    plan.primaryMode === "direct_answer" &&
    qCount >= 2 &&
    text.length > 200
  ) {
    failures.push("MODE_MISMATCH");
  }

  // Gold blocked patterns + anti-copy
  if (draftMatchesBlockedPattern(text, plan.blockedFailurePatterns)) {
    failures.push("SCRIPTED_LANGUAGE");
  }
  if (isVerbatimGoldCopy(text, plan)) {
    failures.push("VERBATIM_GOLD_COPY");
  }

  // Permanent Talk It Out failure regressions (package 206) — always block
  if (
    /^take your time(?: with that)?\.?$/i.test(text) ||
    /\btake your time with that\b/i.test(text)
  ) {
    failures.push("GENERIC_ACKNOWLEDGEMENT");
  }
  if (/\bquieter question underneath\b/i.test(text)) {
    failures.push("UNSUPPORTED_HIDDEN_MEANING");
  }
  if (/\bsomething around does\b/i.test(text) || /\baround does\b/i.test(text)) {
    failures.push("UNGROUNDED_FALLBACK");
    failures.push("STOP_WORD_AS_TOPIC");
  }

  const unique = [...new Set(failures)];
  return { passed: unique.length === 0, failures: unique };
}
