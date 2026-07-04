/**
 * Intent-Aware Conversation Framework™
 * @see docs/estate/INTENT_AWARE_CONVERSATION_FRAMEWORK.md
 */

/** Why the member opened this conversation */
export type ConversationPurpose =
  | "create"
  | "research"
  | "learn"
  | "plan"
  | "think"
  | "journal"
  | "recover"
  | "celebrate"
  | "relax"
  | "explore"
  | "organize"
  | "solve";

/** Member-determined conversational depth */
export type ConversationDepth =
  | "task"
  | "guidance"
  | "reflection"
  | "exploration";

export type IntentAwareConversationInput = {
  userText: string;
  currentTurn?: number;
  overwhelmed?: boolean;
  emotionalState?: string | null;
  workspace?: string | null;
  /** Prior turns were productive task work */
  sessionWasWork?: boolean;
};

export type IntentAwareEvaluation = {
  purpose: ConversationPurpose;
  depth: ConversationDepth;
  /** Purpose when conversation began — stay context-aware */
  sessionPurpose: ConversationPurpose;
  sessionDepth: ConversationDepth;
  purposeChanged: boolean;
  confidence: "low" | "medium" | "high";
  /** Task-focused — no coaching detours */
  honorTaskFocus: boolean;
  /** May ask coaching questions */
  allowGuidanceQuestions: boolean;
  /** May slow down, listen, encourage */
  allowReflection: boolean;
  /** Member invited deeper exploration */
  allowExploration: boolean;
  /** Smallest number of questions — usually 0–1 */
  maxQuestions: number;
  forbiddenQuestionPatterns: readonly string[];
  appropriateQuestionExamples: readonly string[];
};

export type IntentAwareSessionStore = {
  version: 1;
  sessionPurpose: ConversationPurpose | null;
  sessionDepth: ConversationDepth | null;
  startedAtTurn: number | null;
};

export const INTENT_AWARE_CONVERSATION_PRINCIPLE =
  "The member sets the destination. Spark chooses the best path — helpful, not intrusive." as const;
