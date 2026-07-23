/**
 * Shared response policy — runs after specialist drafting, before delivery.
 *
 * Expert members generate expertise; this policy ensures the delivery feels
 * like a thoughtful human conversation (Shari voice) without forcing reflection.
 */

import type {
  ChamberSharedResponsePolicyResult,
  ConversationBehaviorMode,
} from "./types";
import { hasClearObjective } from "@/lib/chamber/chamberUnderstandingGate";
import {
  containsChamberReflectiveBan,
  containsPermanentBanPhrase,
} from "./scrubAiLanguage";

function countQuestions(text: string): number {
  return (text.match(/\?/g) ?? []).length;
}

function looksLikeDirectAnswer(text: string, userText: string): boolean {
  const t = text.trim();
  if (t.length < 40) return false;
  // Advisory answers usually contain trade-off / recommendation language
  // or a clear declarative stance before any question.
  const beforeQ = t.split("?")[0] ?? t;
  if (beforeQ.trim().split(/\s+/).length < 12) return false;
  const userAsks =
    /\?/.test(userText) ||
    /^(should|can|how|what|when|where|why|which|is|are|do|does|would|could)\b/i.test(
      userText.trim(),
    );
  if (!userAsks) return beforeQ.trim().length > 60;
  return (
    /\b(?:instead|rather|trade-?off|phased|gradually|all at once|recommend|consider|because|risk|clarity)\b/i.test(
      beforeQ,
    ) || beforeQ.trim().split(/\s+/).length >= 20
  );
}

function followUpWarranted(
  mode: ConversationBehaviorMode,
  userText: string,
  text: string,
): boolean {
  if (mode !== "advisory") return countQuestions(text) === 1;
  // Advisory: follow-up only when a concrete constraint is still unknown.
  if (
    /\b(?:budget|timeline|audience|offer|product|launch|feature)\b/i.test(
      userText,
    ) &&
    !/\b(?:budget|timeline|audience|constraint|priority)\b/i.test(text)
  ) {
    return true;
  }
  return countQuestions(text) === 1;
}

/**
 * Chamber Shared Response Policy — the gate every Chamber member uses
 * before a reply is shown.
 */
export function evaluateChamberSharedResponsePolicy(input: {
  userText: string;
  responseText: string;
  behaviorMode: ConversationBehaviorMode;
  onTopic?: boolean;
}): ChamberSharedResponsePolicyResult {
  const text = input.responseText.trim();
  const failures: string[] = [];
  const qCount = countQuestions(text);
  const situationShareNeedsListen =
    input.behaviorMode === "advisory" &&
    /\b(?:i have|my client|won'?t|doesn'?t|keeps)\b/i.test(input.userText) &&
    !/\b(?:should i|do i|which|or)\b/i.test(input.userText) &&
    !hasClearObjective(input.userText);

  const answeredDirectly =
    input.behaviorMode === "advisory"
      ? looksLikeDirectAnswer(text, input.userText)
      : true;
  const onTopic = input.onTopic !== false;
  const banHit = containsPermanentBanPhrase(text);
  const reflectiveBan =
    input.behaviorMode === "advisory" && containsChamberReflectiveBan(text);
  const soundsLikeShari = !banHit && !/\bas an ai\b/i.test(text);
  const natural =
    !/\bhere(?:'s| is) a breakdown\b/i.test(text) &&
    !/\blet(?:'s| us) dive in\b/i.test(text);
  const helpful =
    input.behaviorMode === "advisory"
      ? answeredDirectly || qCount === 1 || situationShareNeedsListen
      : text.length > 20;
  const warranted = followUpWarranted(
    input.behaviorMode,
    input.userText,
    text,
  );

  if (!onTopic) failures.push("OFF_TOPIC");
  if (banHit) failures.push("PERMANENT_BAN");
  if (reflectiveBan) failures.push("REFLECTIVE_COACHING_PATTERN");
  if (!soundsLikeShari) failures.push("AI_TELL");
  if (!natural) failures.push("UNNATURAL");
  // Understanding-first: situation shares may listen/question before answering.
  if (
    input.behaviorMode === "advisory" &&
    !answeredDirectly &&
    !situationShareNeedsListen
  ) {
    failures.push("DID_NOT_ANSWER");
  }
  if (qCount >= 2) failures.push("STACKED_QUESTIONS");
  if (input.behaviorMode === "advisory" && qCount >= 1 && !warranted) {
    // Soft — do not fail solely for an extra useful follow-up
  }
  if (!helpful) failures.push("NOT_HELPFUL");

  const hardFail = failures.some((f) =>
    [
      "OFF_TOPIC",
      "PERMANENT_BAN",
      "REFLECTIVE_COACHING_PATTERN",
      "STACKED_QUESTIONS",
      "AI_TELL",
    ].includes(f),
  );

  return {
    answeredDirectly,
    onTopic,
    soundsLikeShari,
    natural,
    helpful,
    followUpQuestionCount: qCount,
    followUpWarranted: warranted,
    failures,
    passed: !hardFail,
  };
}

/** Advisory safe fallback when certification must replace a broken draft. */
export function buildAdvisorySafeFallback(input: {
  userText: string;
  topicAnchor?: string | null;
  specialistLabel?: string | null;
}): string {
  const topic = input.topicAnchor?.trim();
  const who = input.specialistLabel?.trim() || "this";
  if (
    /\blaunch everything|all at once|features over time|phased|big bang\b/i.test(
      input.userText,
    )
  ) {
    return (
      "I'd release in phases rather than everything at once — " +
      "one clear offer or feature that proves demand, then expand. " +
      "All-at-once usually blurs the message and burns attention. " +
      "What are you trying to launch first — the core offer, or the supporting pieces?"
    );
  }
  if (topic) {
    return (
      `Looking at ${topic} through ${who}'s lens: start with the decision that unlocks the rest, ` +
      `not the longest list of options. What's the real constraint — time, clarity, or risk?`
    );
  }
  return (
    "I'd answer the decision directly first, then we can refine. " +
    "What's the main constraint shaping this — time, clarity, or risk?"
  );
}
