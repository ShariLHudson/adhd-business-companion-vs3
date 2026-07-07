/**
 * Conversational pivot — member responds to a factual KB answer with feeling, not a new question.
 */

import type {
  CompanionConversationState,
  LastDiscussedEntity,
} from "./types";

export type EmotionalPivotSignal =
  | "grief"
  | "memory"
  | "affection"
  | "appreciation"
  | "personal_story";

export type EmotionalPivotResult = {
  signal: EmotionalPivotSignal;
  entity: LastDiscussedEntity;
  suppressKbRepeat: true;
};

const NEW_KNOWLEDGE_RE =
  /\b(?:what is|what'?s|who is|where is|tell me about|what are|how do i|open |take me|research )\b/i;

const GRIEF_MEMORY_RE =
  /\b(?:i miss|miss (?:her|him|them)|reminds me of|had a (?:dog|cat|pet)|she was|he was|passed away|lost (?:her|him|them))\b/i;

const AFFECTION_RE =
  /\b(?:seems?(?: like)? (?:a )?(?:sweet|lovely|gentle|kind)|what a (?:sweet|lovely|gentle))\b/i;

const APPRECIATION_RE =
  /^(?:that sounds?|sounds? (?:beautiful|fun|wonderful|nice|lovely|sweet))\b/i;

const PERSONAL_STORY_RE =
  /\b(?:that reminds me|i remember|when i was|my (?:dog|cat|mom|dad|friend))\b/i;

export function detectEmotionalPivot(input: {
  userText: string;
  state: CompanionConversationState;
  currentTurn: number;
}): EmotionalPivotResult | null {
  const t = input.userText.trim();
  if (!t || NEW_KNOWLEDGE_RE.test(t)) return null;

  const entity = input.state.lastDiscussedEntity;
  if (!entity || input.state.lastKnowledgeAnswerType !== "factual_kb") {
    return null;
  }
  if (input.currentTurn - entity.answeredAtTurn > 3) return null;

  let signal: EmotionalPivotSignal | null = null;
  if (GRIEF_MEMORY_RE.test(t)) signal = /\bi miss\b/i.test(t) ? "grief" : "memory";
  else if (AFFECTION_RE.test(t)) signal = "affection";
  else if (APPRECIATION_RE.test(t)) signal = "appreciation";
  else if (PERSONAL_STORY_RE.test(t)) signal = "personal_story";

  if (!signal) return null;

  return { signal, entity, suppressKbRepeat: true };
}

export function formatEmotionalPivotReply(pivot: EmotionalPivotResult): string {
  const { signal, entity } = pivot;

  if (entity.id === "kinsey") {
    if (signal === "grief" || signal === "memory") {
      return "She must have been very special to you. Dogs have a way of staying with us, don't they? If you'd like, I'd love to hear about her.";
    }
    if (signal === "affection") {
      return "She does have that gentle presence about her. What's stirring for you as you think about her?";
    }
  }

  if (entity.id === "discovery-chest" && signal === "appreciation") {
    return "I'm glad it sounds inviting. Curiosity is kind of the whole point there — what would you want to discover first?";
  }

  switch (signal) {
    case "grief":
    case "memory":
      return "That sounds like it carries real weight. If you'd like, I'd love to hear more.";
    case "affection":
      return "There's something tender in the way you said that. What's on your mind?";
    case "appreciation":
      return "I'm glad it lands that way. What drew you to it?";
    case "personal_story":
      return "I'd like to hear that, if you want to share.";
    default:
      return "I'm listening — tell me more if you'd like.";
  }
}
