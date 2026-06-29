/**
 * Spark Core Intelligence v1.0 — Conversation Engine types.
 * @see spark-intelligence-foundation/15-spark-core-conversation-engine.md
 */

import type { EstateRoomId } from "@/lib/sparkResponseIntelligence/types";

export const SPARK_CONVERSATION_ENGINE_VERSION = "1.0" as const;

export type ConversationState =
  | "idle"
  | "understanding"
  | "clarifying"
  | "responding"
  | "creating"
  | "researching"
  | "planning"
  | "supporting"
  | "completed"
  | "handoff_to_room";

export type ConversationIntent =
  | "simple_question"
  | "business_guidance"
  | "creative"
  | "research"
  | "planning"
  | "emotional_support"
  | "execution"
  | "interruption"
  | "topic_change"
  | "misunderstanding_recovery"
  | "follow_up"
  | "room_navigation";

export type EmotionalState =
  | "calm"
  | "curious"
  | "excited"
  | "overwhelmed"
  | "frustrated"
  | "confused"
  | "urgent"
  | "reflective";

export type ResponseDepth =
  | "simple"
  | "moderate"
  | "structured"
  | "executive"
  | "empathy_first"
  | "collaborative_create"
  | "research_scoped";

export type StreamingBehavior = {
  enabled: boolean;
  immediateAck: boolean;
  streamTokens: boolean;
  reason?: string;
};

export type EstateRoutingSuggestion = {
  room: EstateRoomId;
  inviteCopy: string;
  optional: true;
};

export type ConversationObjective = {
  summary: string;
  desiredOutcome: string;
  locked: boolean;
  completed: boolean;
};

export type MultiTurnPlan = {
  steps: string[];
  currentStepIndex: number;
  parkedObjectives: string[];
};

export type ConversationContext = {
  threadId: string;
  state: ConversationState;
  objective: ConversationObjective;
  pendingClarification?: {
    question: string;
    field: string;
  };
  multiTurnPlan?: MultiTurnPlan;
  lastIntent?: ConversationIntent;
  turnCount: number;
  interrupted: boolean;
};

export type ConversationTurnInput = {
  turnId: string;
  memberMessage: string;
  context: ConversationContext;
  /** Prior turns for continuity */
  history?: Array<{ role: "member" | "spark"; content: string }>;
  userId?: string;
  daysSinceLastActivity?: number | null;
  openLoops?: Array<{ id: string; label: string; source?: string }>;
};

export type ConversationExecutiveFunctionSummary = {
  state: {
    primary: string;
    needsEmpathyFirst: boolean;
    singleRecommendationOnly: boolean;
  };
  cognitiveLoad: { value: number; level: string; reduceBeforeAsking: boolean };
  memberFacingLead?: string;
  nextStep: { action: string; whyStartHere: string };
};

export type ClarificationAction = {
  type: "clarify";
  question: string;
  reason: string;
  nextState: "clarifying";
};

export type RespondAction = {
  type: "respond";
  intent: ConversationIntent;
  depth: ResponseDepth;
  nextState: ConversationState;
  estateSuggestion?: EstateRoutingSuggestion;
  streaming: StreamingBehavior;
  guidance: string;
};

export type HandoffAction = {
  type: "handoff";
  room: EstateRoomId;
  inviteCopy: string;
  nextState: "handoff_to_room";
};

export type ConversationAction = ClarificationAction | RespondAction | HandoffAction;

export type ConversationQualityScore = {
  objectiveAlignment: number;
  clarity: number;
  speed: number;
  tone: number;
  helpfulness: number;
  focus: number;
  nextStep: number;
  overall: number;
  pass: boolean;
};

export type ConversationTurnResult = {
  turnId: string;
  context: ConversationContext;
  action: ConversationAction;
  intent: ConversationIntent;
  emotionalState: EmotionalState;
  quality?: ConversationQualityScore;
  executiveFunction?: ConversationExecutiveFunctionSummary;
  engineVersion: typeof SPARK_CONVERSATION_ENGINE_VERSION;
};

export function createInitialContext(threadId: string): ConversationContext {
  return {
    threadId,
    state: "idle",
    objective: {
      summary: "",
      desiredOutcome: "",
      locked: false,
      completed: false,
    },
    turnCount: 0,
    interrupted: false,
  };
}
