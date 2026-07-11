/**
 * Emotional First, Action Second — understand the moment before optimizing.
 */

export const EMOTIONAL_FIRST_GOVERNING_QUESTION =
  "What is this moment really asking for?" as const;

export const EMOTIONAL_FIRST_SUCCESS =
  "Member leaves lighter, clearer, more capable, or less alone — not merely more accomplished." as const;

export type MomentNeed =
  | "action"
  | "rest"
  | "reassurance"
  | "clarity"
  | "permission"
  | "reflection"
  | "celebration"
  | "tiny_next_step"
  | "being_understood";

export type ResponseDepth =
  | "task_first"
  | "emotional_first"
  | "direct_command"
  | "curious"
  | "balanced";

export type EmotionalFirstActionSecondDecision = {
  depth: ResponseDepth;
  momentNeeds: readonly MomentNeed[];
  emotionalSignalsPresent: boolean;
  reason: string;
};

export type EmotionalFirstActionSecondHintInput = {
  userText: string;
  overwhelmed?: boolean;
};
