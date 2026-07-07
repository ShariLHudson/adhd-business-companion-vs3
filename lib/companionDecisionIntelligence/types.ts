/**
 * Companion Decision Intelligence — business decision types + response guidance (Prompt 22).
 */

import type { OutcomeThread } from "../companionOutcomeThread";
import type { ChatTurn } from "../companionIntelligence";
import type { ArbitrationResult } from "@/lib/conversationStabilization";
import type { EstateCapability } from "@/lib/conversationStabilization/capabilityTypes";
import type { ConversationGoal } from "@/lib/conversationStabilization/goalClassifier";

export type BusinessDecisionType =
  | "business_expansion"
  | "product_choice"
  | "pricing"
  | "hiring"
  | "strategy"
  | "prioritization"
  | "general";

export type DecisionRiskLevel = "low" | "medium" | "high";

export type EcosystemResourceId =
  | "decision_compass"
  | "clear_my_mind"
  | "plan_my_day"
  | "strategy"
  | "template"
  | "board_expertise"
  | "business_canvas"
  | "conversation";

export type SituationAtlasDecision = {
  surfaceQuestion: string;
  actualSituation: string;
  decisionType: BusinessDecisionType;
  riskLevel: DecisionRiskLevel;
  situationId: string;
  situationName: string;
  ecosystemResources: EcosystemResourceId[];
};

export type DecisionComplexityLevel = "low" | "medium" | "high";

export type DecisionComplexityScore = {
  level: DecisionComplexityLevel;
  score: number;
  targetDiscoveryQuestions: number;
  discoveryQuestionsAsked: number;
  discoveryComplete: boolean;
  rationale: string[];
};

export type ResourceCandidate = {
  id: EcosystemResourceId;
  label: string;
  confidence: number;
  reason: string;
  offerReady: boolean;
};

export type ExperienceMode =
  | "discovery"
  | "decision"
  | "action"
  | "completion";

export type AcceptedOfferKind =
  | "resource"
  | "guided_continue"
  | "strategy"
  | "decision_support";

export type AcceptedIntentResolution = {
  accepted: boolean;
  offerKind: AcceptedOfferKind;
  acceptedResource: EcosystemResourceId | null;
  pendingOutcome: string | null;
  nextStep: string;
  forbiddenReset: boolean;
};

export type BuildDecisionIntelligenceInput = {
  messages: ChatTurn[];
  userText: string;
  lastAssistantText: string;
  outcomeThread?: OutcomeThread | null;
};

export type CompanionDecisionIntelligence = {
  complexity: DecisionComplexityScore;
  situation: SituationAtlasDecision;
  resources: ResourceCandidate[];
  topResource: ResourceCandidate | null;
  experienceMode: ExperienceMode;
  acceptance: AcceptedIntentResolution | null;
  shouldDeferSolutions: boolean;
  shouldOfferTopResource: boolean;
};

/** Prompt 22 — how Spark responds (member need over features). */
export type MemberNeedType =
  | "action"
  | "information"
  | "navigation"
  | "planning"
  | "research"
  | "encouragement"
  | "presence";

export type CompanionDecisionGuidance = {
  memberGoal: string;
  needType: MemberNeedType;
  smallestNextStep: string;
  maxChoices: number;
  oneQuestionOnly: boolean;
  allowEstateInvite: boolean;
  allowDiscoveryInvite: boolean;
  progressiveGuidanceOnly: boolean;
  suppressFeatureDump: boolean;
  continuityNote: string | null;
  responseHint: string;
};

export type CompanionDecisionInput = {
  userText: string;
  lastAssistantText?: string | null;
  goal: ConversationGoal;
  arbitration?: ArbitrationResult | null;
  winningCapability?: EstateCapability | null;
  category?: string | null;
  overwhelmed?: boolean;
};
