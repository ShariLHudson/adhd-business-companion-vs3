/**
 * CIE repair / regeneration (packages 197–198, 208).
 */

import { buildGroundedFallback } from "@/lib/conversationalIntelligence/groundedAcknowledgement";
import { buildNaturalTopicReturn } from "@/lib/shariNaturalConversation/naturalVoice";
import type { ConversationPlan, ConversationRuntimeState } from "./types";

/**
 * Build a safe replacement after validation failure.
 * Preserves topic; never reintroduces rejected interpretations or coaching shells.
 */
export function repairConversationResponse(input: {
  plan: ConversationPlan;
  state: ConversationRuntimeState;
  userText: string;
  failureCodes: string[];
  attempt: number;
}): string {
  const topic =
    input.plan.activeTopic ??
    input.state.topicAnchor?.primaryTopic ??
    null;

  if (
    input.failureCodes.includes("VERBATIM_GOLD_COPY") ||
    input.failureCodes.includes("SCRIPTED_LANGUAGE") ||
    input.failureCodes.includes("ROBOTIC_TRANSITION")
  ) {
    if (topic) {
      return buildNaturalTopicReturn({
        topic,
        mode: "continue",
        focus: input.state.currentFocus?.label,
      });
    }
    return buildGroundedFallback(input.userText, input.attempt + 17, topic);
  }

  if (
    input.failureCodes.includes("UNSUPPORTED_HIDDEN_MEANING") ||
    input.failureCodes.includes("USER_CORRECTION_IGNORED") ||
    input.failureCodes.includes("REJECTED_INTERPRETATION_REUSED") ||
    input.failureCodes.includes("TOPIC_DRIFT")
  ) {
    if (topic) {
      return buildNaturalTopicReturn({ topic, mode: "correction" });
    }
    return "You're right to correct me. What did you want me to stay with?";
  }

  if (
    input.failureCodes.includes("FAILED_CLARIFICATION_REPAIR") ||
    input.failureCodes.includes("REPAIR_LOST_TOPIC") ||
    input.failureCodes.includes("STOP_WORD_AS_TOPIC")
  ) {
    if (topic) {
      return buildNaturalTopicReturn({ topic, mode: "clarification" });
    }
    return input.plan.safeFallback;
  }

  if (topic) {
    return buildNaturalTopicReturn({
      topic,
      mode: "continue",
      focus: input.state.currentFocus?.label,
    });
  }

  return buildGroundedFallback(
    input.userText,
    input.attempt + input.userText.length,
    topic,
  );
}
