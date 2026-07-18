/**
 * Conversation Quality & Rhythm Intelligence (CQRI).
 * Final pacing + certification — after RCI / CI / CRCI.
 * Does not invent new meaning or advice.
 */

import type {
  RciConversationArchetype,
  ThinkingMap,
} from "@/lib/reflectiveConversationIntelligence";

export type CqriExperienceId =
  | "talk-it-out"
  | "create"
  | "journal-gazebo"
  | "decision-compass"
  | "chamber"
  | "board"
  | "general-chat"
  | "founder-studio"
  | "other";

export type CqriResponseShape =
  | "brief-acknowledgement"
  | "one-observation"
  | "one-reflective-question"
  | "observation-plus-question"
  | "plain-clarification"
  | "short-summary"
  | "invitation-to-continue"
  | "intentional-brevity";

export type CqriLengthCategory = "very-short" | "short" | "expanded";

/** Invisible pacing phase — Opening → Exploration → Discovery → Completion */
export type ConversationPhase =
  | "opening"
  | "exploration"
  | "discovery"
  | "completion";

export type CqriMessage = {
  role: "user" | "assistant";
  content: string;
};

export type CqriInput = {
  experienceId: CqriExperienceId;
  userText: string;
  messages: readonly CqriMessage[];
  draftText: string;
  responseKind: string;
  archetype?: RciConversationArchetype;
  conversationGoal?: string;
  repairActive?: boolean;
  thinkingMap?: ThinkingMap | null;
  recentPhraseUsage?: readonly string[];
  /** Optional override; otherwise detected from turns + Thinking Map. */
  conversationPhase?: ConversationPhase;
};

export type CqriQualityFailure =
  | "grounding"
  | "purpose-advice"
  | "purpose-redirect"
  | "naturalness"
  | "clarity-abstract"
  | "clarity-repair-needed"
  | "rhythm-length"
  | "rhythm-multi-idea"
  | "rhythm-multi-question"
  | "repetition-user"
  | "repetition-phrase"
  | "repetition-answered"
  | "banned-fallback"
  | "generic-acknowledgement"
  | "vague-pronoun"
  | "missing-topic-reference";

export type CqriQualityResult = {
  passed: boolean;
  failures: CqriQualityFailure[];
};

export type CqriTelemetry = {
  conversationPhase: ConversationPhase;
  responseShape: CqriResponseShape;
  questionVersusObservation: "question" | "observation" | "mixed" | "other";
  lengthCategory: CqriLengthCategory;
  repairTriggered: boolean;
  qualityGateFailures: CqriQualityFailure[];
  regenerationCount: number;
  repeatedQuestionBlocked: boolean;
  userConfusionSignal: boolean;
  completionCheckUsed: boolean;
};

export type CqriResult = {
  approvedText: string;
  responseShape: CqriResponseShape;
  lengthCategory: CqriLengthCategory;
  conversationPhase: ConversationPhase;
  quality: CqriQualityResult;
  regenerationReasons: CqriQualityFailure[];
  usedFallback: boolean;
  telemetry: CqriTelemetry;
};
