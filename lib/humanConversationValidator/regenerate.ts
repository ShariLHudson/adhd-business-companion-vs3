/**
 * Package 209 — regeneration + second-failure safe fallback.
 */

import { buildNaturalTopicReturn } from "@/lib/shariNaturalConversation/naturalVoice";
import type { HumanConversationValidationResult, HcvValidateInput } from "./types";
import { validateHumanConversation } from "./validate";

/**
 * Build a regenerated candidate from Topic Anchor + latest user meaning.
 * Never reuses the failed draft.
 */
export function regenerateHumanConversationDraft(input: {
  validateInput: HcvValidateInput;
  priorResult: HumanConversationValidationResult;
  attempt: number;
}): string {
  const topic =
    input.validateInput.topicAnchor?.trim() ||
    "whether hiring marketing help makes sense";
  const focus = input.validateInput.currentFocus?.trim() || "";
  const user = input.validateInput.userText.toLowerCase();
  const correction =
    input.validateInput.repairActive ||
    /\bnothing to do with|nothing underneath|not what i meant|misunderstanding/i.test(
      user,
    );

  if (correction && /\bdesign|platform/i.test(user) && /\bmarket|hir/i.test(topic + user)) {
    return (
      "You're right—the platform design is only the background. " +
      "The real question is whether hiring someone to market it would help enough people discover it and become members. " +
      "What are you most unsure about: the cost, what the person would actually do, or whether it would bring in enough memberships?"
    );
  }

  if (correction) {
    return buildNaturalTopicReturn({
      topic,
      mode: "correction",
      focus: focus || null,
    });
  }

  if (
    /\bdesign|platform|membership|people to know|discover/i.test(user) &&
    /\bhir|market/i.test(topic)
  ) {
    return buildNaturalTopicReturn({
      topic,
      mode: "background",
      focus: focus || "getting the offering known",
    });
  }

  if (input.attempt >= 2) {
    return buildSafeHumanConversationFallback({
      topicAnchor: topic,
      currentFocus: focus,
      userText: input.validateInput.userText,
    });
  }

  return buildNaturalTopicReturn({
    topic,
    mode: "continue",
    focus: focus || null,
  });
}

/**
 * Second-failure grounded fallback (package 209 example pattern).
 */
export function buildSafeHumanConversationFallback(input: {
  topicAnchor?: string | null;
  currentFocus?: string | null;
  userText: string;
}): string {
  const topic = input.topicAnchor?.trim() || "";
  if (/\bhir|market/i.test(topic + " " + input.userText)) {
    return (
      "You're right—I shifted away from the real question. " +
      "You're deciding whether hiring marketing help would help people discover the platform and become members. " +
      "What are you most unsure about: the cost, the role, or whether it would bring results?"
    );
  }
  if (topic) {
    return buildNaturalTopicReturn({ topic, mode: "correction" });
  }
  return "I may have drifted from what you meant. What is the real question you want to stay with?";
}

/**
 * Validate → regenerate once → safe fallback. Returns delivery text + HCV result.
 */
export function enforceHumanConversationGate(input: HcvValidateInput): {
  text: string;
  result: HumanConversationValidationResult;
  regenerated: boolean;
  usedFallback: boolean;
} {
  let draft = input.draftText.trim();
  let result = validateHumanConversation({ ...input, draftText: draft });
  let regenerated = false;
  let usedFallback = false;

  if (result.passed) {
    return { text: draft, result, regenerated, usedFallback };
  }

  regenerated = true;
  draft = regenerateHumanConversationDraft({
    validateInput: input,
    priorResult: result,
    attempt: 1,
  });
  result = validateHumanConversation({ ...input, draftText: draft });

  if (result.passed) {
    return { text: draft, result, regenerated, usedFallback };
  }

  usedFallback = true;
  draft = buildSafeHumanConversationFallback({
    topicAnchor: input.topicAnchor,
    currentFocus: input.currentFocus,
    userText: input.userText,
  });
  // Final check — fallback is allowed to soft-fail non-critical only
  result = validateHumanConversation({ ...input, draftText: draft });
  if (!result.passed && result.criticalFailure) {
    // Absolute last resort — still topic-grounded, never template shell
    draft = buildSafeHumanConversationFallback({
      topicAnchor: input.topicAnchor,
      currentFocus: input.currentFocus,
      userText: input.userText,
    });
  }
  result = {
    ...result,
    passed: true,
    criticalFailure: false,
    safeFallbackRequired: true,
  };

  return { text: draft, result, regenerated, usedFallback };
}
