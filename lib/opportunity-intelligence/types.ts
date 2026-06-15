/** Opportunity Intelligence — surface possibilities without overwhelm. */

export type OpportunityType =
  | "content_opportunity"
  | "lead_magnet_opportunity"
  | "workshop_opportunity"
  | "offer_opportunity"
  | "relationship_opportunity"
  | "referral_opportunity"
  | "product_opportunity"
  | "workflow_opportunity"
  | "retention_opportunity"
  | "founder_action_opportunity"
  | "custom";

export type OpportunitySource =
  | "conversation"
  | "repeated_topic"
  | "struggle_pattern"
  | "saved_idea"
  | "outcome"
  | "stalled_project"
  | "relationship"
  | "workflow_pattern"
  | "blocker_pattern"
  | "loop_pattern"
  | "founder_trend";

export type OpportunityLevel = "low" | "medium" | "high";

export type OpportunityStatus =
  | "suggested"
  | "exploring"
  | "dismissed"
  | "acted"
  | "parked";

export type Opportunity = {
  id: string;
  title: string;
  opportunityType: OpportunityType;
  source: OpportunitySource;
  confidence: OpportunityLevel;
  impact: OpportunityLevel;
  effort: OpportunityLevel;
  urgency: OpportunityLevel;
  reason: string;
  suggestedNextStep: string;
  status: OpportunityStatus;
  createdAt: string;
  updatedAt: string;
};

export type OpportunitySignalHit = {
  signalId: string;
  label: string;
  source: OpportunitySource;
  opportunityType: OpportunityType;
  topic: string;
  weight: number;
  detail: string;
};

export type OpportunityOffer = {
  opportunity: Opportunity;
  companionOffer: string;
  createdAt: string;
};

export type OpportunityInput = {
  now?: Date;
  text?: string;
  emotionalState?: string;
  cognitiveLoadLevel?: string | null;
  activationBlocker?: string | null;
  loopType?: string | null;
};

export type FounderOpportunityReport = {
  generatedAt: string;
  sampleSize: number;
  topOpportunities: { title: string; type: OpportunityType; score: number }[];
  newestOpportunities: { title: string; type: OpportunityType; createdAt: string }[];
  highImpactLowEffort: { title: string; type: OpportunityType }[];
  contentOpportunities: number;
  productOpportunities: number;
  relationshipOpportunities: number;
  recommendedFounderAction: string;
  notes: string;
};
