/**
 * Topic-safe clarification repair — explain prior line against the Topic Anchor.
 */

import type { TopicAnchor } from "./types";

const VAGUE_PRIOR =
  /\b(?:take your time(?: with that)?|i am with you|that seems important|important part of this)\b/i;

/**
 * Build repair when user asks what the assistant meant.
 */
export function buildTopicSafeClarificationRepair(input: {
  anchor: TopicAnchor | null;
  previousAssistantText: string;
  userText: string;
  seed?: number;
}): string {
  const topic =
    input.anchor?.primaryTopic?.trim() ||
    "what you were deciding";
  const prior = input.previousAssistantText.trim();
  const vague = !prior || VAGUE_PRIOR.test(prior) || prior.length < 28;

  if (vague) {
    return `I did not say that clearly. I meant that you do not have to rush the decision about ${topic}. But that was not a useful response. What is making you consider ${topicQuestionTail(topic)} now?`;
  }

  // Grounded restatement of prior question/observation against the anchor
  const priorCore = prior
    .replace(/\?+$/, "")
    .replace(/^(?:take your time with that\.?\s*)/i, "")
    .trim();

  return `I did not explain that clearly. You are deciding whether ${topic} makes sense. What I meant to ask was what is making you consider ${topicQuestionTail(topic)} now.`;
}

function topicQuestionTail(topic: string): string {
  if (/\bhir(?:e|ing)\b/i.test(topic)) {
    if (/marketing assistant/i.test(topic)) return "hiring a marketing assistant";
    if (/bookkeeper/i.test(topic)) return "hiring a bookkeeper";
    return "hiring one";
  }
  return "it";
}

export function buildUnconfirmedTopicChangePrompt(
  primaryTopic: string,
): string {
  return `Are you changing the subject, or is this connected to ${primaryTopic}?`;
}
