/**
 * Intent and emotional state detection.
 */

import type { ConversationIntent, EmotionalState } from "./types";

export function detectEmotionalState(message: string): EmotionalState {
  const lower = message.toLowerCase();
  if (/\b(overwhelmed|too much|can't cope|burned out)\b/.test(lower)) return "overwhelmed";
  if (/\b(urgent|asap|right now|deadline today)\b/.test(lower)) return "urgent";
  if (/\b(frustrated|annoyed|stuck|this isn't working)\b/.test(lower)) return "frustrated";
  if (/\b(confused|don't understand|lost|unclear)\b/.test(lower)) return "confused";
  if (/\b(excited|can't wait|thrilled)\b/.test(lower)) return "excited";
  if (/\b(curious|wondering|what if)\b/.test(lower)) return "curious";
  if (/\b(reflect|journal|processing)\b/.test(lower)) return "reflective";
  return "calm";
}

export function detectIntent(
  message: string,
  emotional: EmotionalState,
  priorState: string,
): ConversationIntent {
  const lower = message.toLowerCase().trim();

  if (/\b(that's not what i|you misunderstood|wrong answer|not what i meant)\b/.test(lower)) {
    return "misunderstanding_recovery";
  }

  if (/\b(wait|stop|hold on|actually|instead|never mind)\b/.test(lower) && priorState !== "idle") {
    return "interruption";
  }

  if (/\b(actually|instead|let's work on|changed my mind|one more thing)\b/.test(lower)) {
    return "topic_change";
  }

  if (/\b(what about|follow up|and also|next)\b/.test(lower) && priorState === "completed") {
    return "follow_up";
  }

  if (/^(open|go to|take me to|show me)\b/.test(lower)) return "room_navigation";

  if (emotional === "overwhelmed") return "emotional_support";

  if (/\b(research|look up|investigate|competitor analysis)\b/.test(lower)) return "research";

  if (/\b(write|draft|create|design|build|landing page)\b/.test(lower)) return "creative";

  if (/\b(plan|roadmap|prioritize|quarter|schedule)\b/.test(lower)) return "planning";

  if (/\b(do it|send it|finish|complete|implement)\b/.test(lower)) return "execution";

  if (lower.length < 50 && (lower.endsWith("?") || /\b(what is|how do|why)\b/.test(lower))) {
    return "simple_question";
  }

  return "business_guidance";
}
