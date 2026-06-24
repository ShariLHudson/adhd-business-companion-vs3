/**
 * Companion Decision Intelligence™ — shared types.
 */

import type { ChatTurn } from "../companionIntelligence";
import type { OutcomeThread } from "../companionOutcomeThread";

export type DecisionComplexityLevel = "low" | "medium" | "high";

export type ExperienceMode =
  | "discovery"
  | "decision"
  | "action"
  | "completion";

export type BusinessDecisionType =
  | "product_choice"
  | "business_expansion"
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

export type ResourceCandidate = {
  id: EcosystemResourceId;
  label: string;
  confidence: number;
  reason: string;
  offerReady: boolean;
};

export type SituationAtlasDecision = {
  surfaceQuestion: string;
  actualSituation: string;
  decisionType: BusinessDecisionType;
  riskLevel: DecisionRiskLevel;
  situationId: string | null;
  situationName: string | null;
  ecosystemResources: EcosystemResourceId[];
};

export type DecisionComplexityScore = {
  level: DecisionComplexityLevel;
  score: number;
  targetDiscoveryQuestions: number;
  discoveryQuestionsAsked: number;
  discoveryComplete: boolean;
  rationale: string[];
};

export type AcceptedIntentResolution = {
  accepted: boolean;
  offerKind:
    | "resource"
    | "exploration"
    | "strategy"
    | "decision_support"
    | "workspace"
    | "guided_continue"
    | null;
  acceptedResource: EcosystemResourceId | null;
  pendingOutcome: string | null;
  nextStep: string | null;
  forbiddenReset: boolean;
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

export type BuildDecisionIntelligenceInput = {
  messages: ChatTurn[];
  userText: string;
  lastAssistantText: string;
  outcomeThread?: OutcomeThread | null;
};
