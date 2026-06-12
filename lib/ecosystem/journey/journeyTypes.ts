// Founder Ecosystem — Phase 9 Founder Journey types.
//
// Where is the founder in their business journey? Different stages need
// different guidance. Everything is derived from the event stream + (optional)
// business profile. Business/productivity only — never a clinical claim.

import type { ID, ISODateString } from "../models";
import type { Level } from "../dashboardTypes";

export type { Level };

// ---- Business stages ----------------------------------------------------
export type BusinessStage =
  | "idea" // exploring / validating / brainstorming offers
  | "building" // creating products / systems / content / website
  | "launching" // audience / funnels / leads / first sales
  | "growing" // revenue / expanding offers / operations / team
  | "scaling"; // delegation / automation / leadership / systems

export const STAGE_ORDER: BusinessStage[] = [
  "idea",
  "building",
  "launching",
  "growing",
  "scaling",
];

export const STAGE_LABEL: Record<BusinessStage, string> = {
  idea: "Idea",
  building: "Building",
  launching: "Launching",
  growing: "Growing",
  scaling: "Scaling",
};

// ---- Founder focus areas ------------------------------------------------
export type FounderFocus =
  | "marketing"
  | "sales"
  | "operations"
  | "product-creation"
  | "systems"
  | "content"
  | "customer-success"
  | "leadership";

// ---- Detection internals (explainable) ----------------------------------
export type StageScore = {
  stage: BusinessStage;
  score: number;
  signals: string[];
};

export type FocusScore = {
  focus: FounderFocus;
  score: number;
};

// ---- Stage-aware recommendation -----------------------------------------
export type JourneyRecommendation = {
  text: string;
  focus: FounderFocus;
  reason: string; // why this matters at this stage
  avoid?: string; // the common distraction to skip at this stage
};

// ---- The Journey object -------------------------------------------------
export type FounderJourney = {
  founderId: ID;
  generatedAt: ISODateString;
  currentStage: BusinessStage;
  previousStage: BusinessStage | null;
  confidence: Level; // how sure we are of the stage
  stageScores: StageScore[]; // ranked, for transparency
  primaryFocus: FounderFocus | null;
  secondaryFocus: FounderFocus | null;
  focusScores: FocusScore[];
  currentChallenges: string[];
  currentOpportunities: string[];
  currentRisks: string[];
  recommendations: JourneyRecommendation[];
};

// ---- Advisor adjustment -------------------------------------------------
export type AdvisorKey = "ceo" | "marketing" | "sales" | "operations";
export type AdvisorStageGuidance = {
  advisor: AdvisorKey;
  stage: BusinessStage;
  recommend: string[];
  deprioritize: string[];
};
