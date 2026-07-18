/**
 * Topic Continuity & Conversation Anchor Intelligence (TCAI) — package 193.
 */

export type TopicConfidence = "high" | "medium" | "low";

export type TopicType =
  | "business-decision"
  | "planning"
  | "creative-block"
  | "overwhelm"
  | "fear-avoidance"
  | "relationship"
  | "opportunity-evaluation"
  | "identity-confidence"
  | "reflection-after-event"
  | "other";

/** Protected conversation subject — never overwritten by clarification/short replies. */
export type TopicAnchor = {
  primaryTopic: string;
  topicType: TopicType;
  conversationGoal: string | null;
  topicConfidence: TopicConfidence;
  topicSourceTurnId: string | null;
  currentFocus: string | null;
  topicHistory: string[];
  topicChangeRequested: boolean;
  topicChangeConfirmed: boolean;
  lastClarificationRequest: string | null;
  topicDriftDetected: boolean;
};

export type TcaiFailureCode =
  | "TOPIC_ANCHOR_MISSING"
  | "TOPIC_OVERWRITTEN_BY_CLARIFICATION"
  | "STOP_WORD_AS_TOPIC"
  | "PRONOUN_AS_TOPIC"
  | "SHORT_REPLY_AS_TOPIC"
  | "TOPIC_DRIFT"
  | "UNRELATED_RESPONSE_SUBJECT"
  | "REPAIR_LOST_TOPIC"
  | "UNCONFIRMED_TOPIC_CHANGE";

export type TcaiMessage = {
  role: "user" | "assistant";
  content: string;
  id?: string;
};

export type TcaiContinuityResult = {
  text: string;
  passed: boolean;
  failures: TcaiFailureCode[];
  usedFallback: boolean;
  anchor: TopicAnchor | null;
};
