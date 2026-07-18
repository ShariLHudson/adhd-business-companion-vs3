/**
 * Conversation Intelligence Engine (CIE) — packages 195–199.
 * Shared orchestration contracts. No hidden chain-of-thought in state.
 */

import type { TopicAnchor } from "@/lib/topicContinuityAnchorIntelligence";
import type { GscConversationalMove } from "@/lib/goldStandardConversationLibrary";

export type CieExperienceId =
  | "talk-it-out"
  | "create"
  | "general-chat"
  | "chamber"
  | "board"
  | "projects"
  | "onboarding"
  | "other";

export type ConversationMode =
  | "direct_answer"
  | "reflective_thinking"
  | "clarification"
  | "repair"
  | "decision_exploration"
  | "practical_planning"
  | "creation_workflow"
  | "project_workflow"
  | "navigation"
  | "emotional_support"
  | "expert_member_response"
  | "board_deliberation"
  | "reminder_rhythm"
  | "platform_help";

export type ConversationPhase =
  | "opening"
  | "context_gathering"
  | "clarification"
  | "exploration"
  | "distinction"
  | "synthesis"
  | "decision_criteria"
  | "practical_next_step"
  | "completion"
  | "repair";

export type PriorityEvent =
  | "safety"
  | "explicit_action"
  | "direct_correction"
  | "clarification_request"
  | "topic_change"
  | "answer_to_question"
  | "conversation_management"
  | "normal";

export type CieFailureCode =
  | "TOPIC_DRIFT"
  | "TOPIC_ANCHOR_MISSING"
  | "STOP_WORD_AS_TOPIC"
  | "REPAIR_LOST_TOPIC"
  | "USER_CORRECTION_IGNORED"
  | "REJECTED_INTERPRETATION_REUSED"
  | "FAILED_CLARIFICATION_REPAIR"
  | "GENERIC_POST_CORRECTION_FALLBACK"
  | "GENERIC_ACKNOWLEDGEMENT"
  | "MISSING_TOPIC_REFERENCE"
  | "VAGUE_PRONOUN"
  | "EMPTY_EMPATHY"
  | "UNSUPPORTED_HIDDEN_MEANING"
  | "INSUFFICIENT_INTERPRETATION_EVIDENCE"
  | "UNRELATED_NEXT_QUESTION"
  | "QUESTION_ALREADY_ANSWERED"
  | "STACKED_QUESTIONS"
  | "ABSTRACT_QUESTION_WITH_GROUNDED_CONTEXT"
  | "SCRIPTED_LANGUAGE"
  | "ROBOTIC_TRANSITION"
  | "POOR_RESPONSE_RHYTHM"
  | "EXCESSIVE_LENGTH"
  | "MODE_MISMATCH"
  | "ROLE_DRIFT"
  | "PREMATURE_ADVICE"
  | "WORKFLOW_BYPASS"
  | "VERBATIM_GOLD_COPY"
  | "UNGROUNDED_FALLBACK";

export type GroundedFact = {
  id: string;
  fact: string;
  sourceTurnId: string;
  confidence: number;
  status: "active" | "superseded" | "rejected";
};

export type UserCorrection = {
  id: string;
  sourceTurnId: string;
  correctedItem: string;
  replacementMeaning?: string;
  timestamp: string;
};

export type RejectedInterpretation = {
  interpretation: string;
  rejectedByTurnId: string;
  reason?: string;
};

export type ClarificationState = {
  requested: boolean;
  targetAssistantTurnId?: string;
  confusingPhrase?: string;
  repairRequired: boolean;
};

export type CurrentFocus = {
  label: string;
  sourceTurnId: string;
  relationToTopic: string;
  confidence: number;
};

export type RetrievedExampleReference = {
  conversationId: string;
  similarityReason: string;
  applicableMove: string;
  prohibitedPatterns: string[];
  confidence: number;
};

export type QualityEvent = {
  turnId: string;
  status: "passed" | "regenerated" | "fallback";
  failureCodes: CieFailureCode[];
};

export type ConversationRuntimeState = {
  conversationId: string;
  experienceId: CieExperienceId;
  activeMemberId?: string;
  primaryMode: ConversationMode;
  conversationPhase: ConversationPhase;
  topicAnchor: TopicAnchor | null;
  currentFocus?: CurrentFocus;
  conversationGoal?: string;
  knownFacts: GroundedFact[];
  userCorrections: UserCorrection[];
  rejectedInterpretations: RejectedInterpretation[];
  clarificationState?: ClarificationState;
  exploredDimensions: string[];
  openQuestions: string[];
  resolvedQuestions: string[];
  retrievedExamples: RetrievedExampleReference[];
  previousAssistantMove?: GscConversationalMove | string;
  nextRecommendedMoves: string[];
  qualityHistory: QualityEvent[];
  turnCount: number;
};

export type ConversationPlan = {
  activeTopic: string | null;
  userIntent: string;
  conversationPhase: ConversationPhase;
  primaryMode: ConversationMode;
  alreadyKnown: string[];
  mustNotAssume: string[];
  conversationalMove: string;
  shouldAcknowledge: boolean;
  shouldAskQuestion: boolean;
  questionPurpose: string | null;
  goldExampleIds: string[];
  blockedFailurePatterns: string[];
  desiredResponseLength: "brief" | "medium" | "expanded";
  safeFallback: string;
  priorityEvent: PriorityEvent;
};

export type CieMessage = {
  role: "user" | "assistant";
  content: string;
  id?: string;
};

export type CieTurnInput = {
  conversationId: string;
  experienceId: CieExperienceId;
  userText: string;
  messages: readonly CieMessage[];
  priorState?: ConversationRuntimeState | null;
  activeMemberId?: string;
  /** Optional draft from experience-specific intelligence (RCI/Create/etc.). */
  draftText?: string;
  /** When true, treat as repair/clarification path. */
  repairActive?: boolean;
};

export type ValidationResult = {
  passed: boolean;
  failures: CieFailureCode[];
};

export type CieTurnResult = {
  assistantText: string;
  state: ConversationRuntimeState;
  plan: ConversationPlan;
  validation: ValidationResult;
  regenerated: boolean;
  usedFallback: boolean;
  /** Internal only — never surface to members */
  failureCodes: CieFailureCode[];
};
