/**
 * Shari Answer-First / Core Conversation Intelligence — internal contracts.
 * Never expose help modes or classification to members.
 *
 * Pyramid standard: docs/SHARI_CORE_CONVERSATION_INTELLIGENCE_STANDARD.md
 */

import type { ShariConversationMode } from "./conversationModes";

export type { ShariConversationMode };

export type ShariPrimaryHelpMode =
  | "direct_answer"
  | "explanation"
  | "how_to_guidance"
  | "advice"
  | "comparison"
  | "brainstorming"
  | "reflective_thinking"
  | "troubleshooting"
  | "simple_planning"
  | "simple_creation"
  | "research"
  | "formal_creation"
  | "project_execution"
  | "visual_exploration"
  | "strategic_work"
  | "explicit_navigation";

export type ShariAnswerDepth = "brief" | "standard" | "detailed" | "comprehensive";

export type ShariAnswerStructure =
  | "prose"
  | "numbered_steps"
  | "checklist"
  | "comparison"
  | "options"
  | "troubleshoot_sequence"
  | "reflective"
  | "mixed";

export type ShariCapabilityOfferKind =
  | "create_from_answer"
  | "turn_into_checklist"
  | "turn_into_project"
  | "research_current"
  | "show_visually"
  | "build_strategy"
  | "continue_in_chat"
  | "none";

export type ShariResponseDecision = {
  id: string;
  rawRequest: string;
  normalizedRequest: string;
  primaryHelpMode: ShariPrimaryHelpMode;
  secondaryHelpModes: ShariPrimaryHelpMode[];
  /** Eight-mode pyramid classification (teach/explain/advise/…). */
  conversationMode: ShariConversationMode | null;
  directAnswerPossible: boolean;
  directAnswerRequired: boolean;
  currentResearchRequired: boolean;
  userContextRequired: boolean;
  consequentialDecision: boolean;
  explicitDestinationRequested: boolean;
  explicitCreationRequested: boolean;
  explicitResearchRequested: boolean;
  explicitProjectRequested: boolean;
  explicitNavigationRequested: boolean;
  answerDepth: ShariAnswerDepth;
  answerStructure: ShariAnswerStructure;
  followUpApproach: "continue_topic" | "one_question" | "offer_capability" | "none";
  optionalCapabilityOffer: ShariCapabilityOfferKind;
  automaticContinuation: boolean;
  /** False when answer-first must suppress route-before-answer. */
  routingAllowed: boolean;
  confidence: number;
  reasons: string[];
};

export type ShariAnswerSubstanceValidation = {
  valid: boolean;
  directlyAddressesRequest: boolean;
  providesUsefulInformation: boolean;
  requestedDepthSatisfied: boolean;
  explicitQualifiersPreserved: boolean;
  actionableWhenAppropriate: boolean;
  contextUsed: boolean;
  uncertaintyHandled: boolean;
  requestEchoDetected: boolean;
  destinationMenuOnlyDetected: boolean;
  routeBeforeAnswerDetected: boolean;
  warningOnlyDetected: boolean;
  genericResponseDetected: boolean;
  failures: string[];
  repairInstructions: string[];
};

export type ShariConversationHandoff = {
  id: string;
  sourceConversationId: string | null;
  sourceMessageIds: string[];
  originalRequest: string;
  currentGoal: string;
  answerContent: string;
  selectedContent: string | null;
  userFollowUpContext: string[];
  researchStatus: "not_needed" | "stable_only" | "current_required" | "unavailable";
  sourceReferences: string[];
  assumptions: string[];
  unresolvedQuestions: string[];
  destination:
    | "create"
    | "projects"
    | "visual_thinking"
    | "research_library"
    | "strategic_planning"
    | "save";
  intendedOutcome: string;
  returnContext: string | null;
  createdAt: string;
};

export const SHARI_ANSWER_FIRST_HANDOFF_KEY =
  "companion-shari-answer-first-handoff-v1";
