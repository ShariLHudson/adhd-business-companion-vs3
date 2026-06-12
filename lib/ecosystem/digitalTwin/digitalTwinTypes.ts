// Founder Ecosystem — Phase 16 Founder Digital Twin types.
//
// A LIVING, BEHAVIORAL model of the founder — how they actually work, decide,
// execute, gain momentum, get stuck, and succeed. We model BEHAVIOR, not
// personality. ETHICS: never diagnose, never label, never claim certainty —
// always observational ("you tend to…", "it appears that…").

import type { ID, ISODateString } from "../models";
import type { Level } from "../dashboardTypes";
import type { BusinessStage, FounderFocus } from "../journey/journeyTypes";

export type { Level };

export type Confidence = Level; // low | medium | high
export type Scored<T extends string> = { value: T; score: number; confidence: Confidence };

// ---- Work style ---------------------------------------------------------
export type WorkStyleTrait =
  | "visionary"
  | "builder"
  | "operator"
  | "teacher"
  | "creator"
  | "strategist"
  | "connector";
export type WorkStyleModel = {
  traits: Scored<WorkStyleTrait>[]; // multiple allowed
  observation: string; // "You tend to approach work as a builder."
};

// ---- Decision style -----------------------------------------------------
export type DecisionTrait =
  | "fast-decision-maker"
  | "slow-decision-maker"
  | "research-driven"
  | "action-driven"
  | "consensus-seeking"
  | "independent";
export type DecisionModel = {
  traits: Scored<DecisionTrait>[];
  patterns: string[];
  examples: string[];
  observation: string;
};

// ---- Execution style ----------------------------------------------------
export type ExecutionTrait =
  | "starts-quickly"
  | "needs-warm-up"
  | "works-best-with-time-blocks"
  | "works-best-with-focus-sessions"
  | "works-best-with-conversation"
  | "works-best-with-structured-plans";
export type ExecutionModel = {
  traits: Scored<ExecutionTrait>[];
  observation: string;
};

// ---- Momentum / overwhelm / success ------------------------------------
export type BehaviorDriver = { factor: string; weight: number; evidence: number };
export type MomentumModel = { drivers: BehaviorDriver[]; observation: string };
export type OverwhelmModel = { triggers: BehaviorDriver[]; observation: string };
export type SuccessModel = { patterns: BehaviorDriver[]; observation: string };

// ---- Twin memory --------------------------------------------------------
export type TwinMention = { label: string; count: number };
export type DigitalTwinMemory = {
  projects: TwinMention[];
  goals: TwinMention[];
  decisions: { id: ID; text: string }[];
  wins: number;
  patterns: string[];
  challenges: TwinMention[];
  opportunities: TwinMention[];
  advisorHistory: TwinMention[]; // which advisors have been engaged
};

// ---- Predictions (probabilities, never facts) --------------------------
export type Likelihood = { probability: number; confidence: Confidence; basis: string };
export type TwinPredictions = {
  taskCompletion: Likelihood;
  procrastination: Likelihood;
  overwhelm: Likelihood;
  projectSuccess: Likelihood;
  recommendationAcceptance: Likelihood;
};

// ---- Preferences derived from behavior ---------------------------------
export type WorkHourPreference = {
  bestTimeOfDay: "morning" | "afternoon" | "evening" | null;
  evidence: number;
};

// ---- The Digital Twin ---------------------------------------------------
export type FounderDigitalTwin = {
  founderId: ID;
  generatedAt: ISODateString;
  /** How much behavioral evidence underpins this twin (more days = more sure). */
  maturity: Confidence;
  observedEventCount: number;

  businessStage: BusinessStage;
  businessFocus: FounderFocus | null;

  workStyle: WorkStyleModel;
  decisionStyle: DecisionModel;
  executionStyle: ExecutionModel;

  momentum: MomentumModel;
  overwhelm: OverwhelmModel;
  success: SuccessModel;

  preferredWorkHours: WorkHourPreference;
  preferredWorkspaceTypes: TwinMention[];
  mostSuccessfulActivities: TwinMention[];
  mostSuccessfulProjects: TwinMention[];

  memory: DigitalTwinMemory;
  predictions: TwinPredictions;

  /** Plain, observational notes — never diagnostic or evaluative. */
  observations: string[];
};
