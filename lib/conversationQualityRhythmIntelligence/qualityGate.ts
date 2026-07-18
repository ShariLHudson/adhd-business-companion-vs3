/**
 * Final Conversation Quality Gate — all checks must pass before send.
 */

import {
  countQuestions,
  isTooCloseToUser,
  usesAvoidedDefaultScript,
} from "@/lib/reflectiveConversationIntelligence";
import { detectForbiddenHumanConversationOpener } from "@/lib/humanConversation/forbiddenPatterns";
import { isBannedFallbackPhrase } from "./safeFallback";
import {
  hasVaguePronounOpen,
  isGenericAcknowledgement,
  hasTopicReference,
} from "@/lib/conversationalIntelligence/groundedAcknowledgement";
import type { CqriInput, CqriQualityFailure, CqriQualityResult } from "./types";

const ADVICE =
  /\b(?:you should|you need to|you must|i recommend|my advice|here'?s what to do)\b/i;
const REDIRECT =
  /\b(?:open the (?:chamber|boardroom|journal|decision compass|clear my mind)|go to (?:the )?(?:chamber|boardroom))\b/i;
const ABSTRACT =
  /\b(?:the essence of|fundamentally speaking|at a deeper level|the underlying paradigm|leverage your|optimize your)\b/i;
const GENERIC_AI =
  /\b(?:as an ai|great question|let'?s dive in|here'?s a breakdown|in conclusion)\b/i;

function alreadyAnsweredQuestion(text: string, userText: string): boolean {
  // Ask for options when user already listed options
  if (
    /\b(?:what options|what possibilities|what have you considered)\b/i.test(
      text,
    ) &&
    /\b(?:or|versus|vs\.?|option|either)\b/i.test(userText) &&
    userText.length > 40
  ) {
    return true;
  }
  return false;
}

export function runQualityGate(
  text: string,
  input: CqriInput,
): CqriQualityResult {
  const failures: CqriQualityFailure[] = [];
  const t = text.trim();

  if (!t || t.length < 6) failures.push("grounding");
  if (isTooCloseToUser(input.userText, t)) failures.push("repetition-user");
  if (ADVICE.test(t) && input.experienceId === "talk-it-out") {
    failures.push("purpose-advice");
  }
  if (REDIRECT.test(t)) failures.push("purpose-redirect");
  if (
    detectForbiddenHumanConversationOpener(t) ||
    GENERIC_AI.test(t) ||
    usesAvoidedDefaultScript(t)
  ) {
    failures.push("naturalness");
  }
  if (ABSTRACT.test(t)) failures.push("clarity-abstract");
  if (
    input.repairActive &&
    countQuestions(t) >= 1 &&
    !/meant|explain|clearly|trying to say|fair question/i.test(t)
  ) {
    // During repair, a new reflective question without explanation fails
    const hasExplain = /meant|trying|explain|plain|fair question/i.test(t);
    if (!hasExplain) failures.push("clarity-repair-needed");
  }
  if (countQuestions(t) > 1) failures.push("rhythm-multi-question");
  // Stacked choices / multi-part
  if (
    /\b(?:1[\).]|2[\).]|first[,:]|second[,:])\b/i.test(t) &&
    countQuestions(t) >= 1
  ) {
    failures.push("rhythm-multi-idea");
  }
  if (t.length > 520 && !input.repairActive) {
    failures.push("rhythm-length");
  }
  const recent = input.recentPhraseUsage ?? [];
  if (
    recent.some((prev) => {
      const a = prev.toLowerCase().slice(0, 36);
      const b = t.toLowerCase().slice(0, 36);
      return a.length > 14 && b.startsWith(a.slice(0, 16));
    })
  ) {
    failures.push("repetition-phrase");
  }
  if (alreadyAnsweredQuestion(t, input.userText)) {
    failures.push("repetition-answered");
  }
  if (isBannedFallbackPhrase(t)) failures.push("banned-fallback");
  // Package 191 — grounded acknowledgement (final backstop after CI gate)
  if (isGenericAcknowledgement(t)) failures.push("generic-acknowledgement");
  if (hasVaguePronounOpen(t) && !hasTopicReference(t, input.userText)) {
    failures.push("vague-pronoun");
    failures.push("missing-topic-reference");
  }

  return { passed: failures.length === 0, failures };
}
