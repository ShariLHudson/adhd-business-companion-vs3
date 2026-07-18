/**
 * Package 210 — Canonical conversation runtime order.
 * All CIE-wired experiences must follow this sequence.
 */

export const CONVERSATION_RUNTIME_ORDER = [
  "intent",
  "state",
  "topic_anchor",
  "planning",
  "gold_standard_retrieval",
  "draft",
  "human_conversation_validator",
  "regeneration",
  "final_validation",
  "response",
] as const;

export type ConversationRuntimeStage =
  (typeof CONVERSATION_RUNTIME_ORDER)[number];

/** Human-readable pipeline for docs / PR review. */
export const CONVERSATION_RUNTIME_ORDER_LABEL =
  "Intent → State → Topic Anchor → Planning → Gold Standard Retrieval → Draft → Human Conversation Validator → Regeneration → Final Validation → Response";
