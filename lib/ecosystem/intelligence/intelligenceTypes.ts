// Founder Ecosystem — Phase 4 Intelligence types.
//
// The six intelligence objects + memory + the composed result. Everything is
// derived from the Phase 1 event stream and is EXPLAINABLE: every object
// carries the sourceEventIds it was inferred from. Business / productivity
// observations only — no medical, mental-health, legal, or financial claims.

import type { ID, ISODateString } from "../models";
import type { Level } from "../dashboardTypes";

export type { Level };

// ---- Patterns -----------------------------------------------------------
export type PatternType =
  | "project-switching"
  | "unfinished-tasks"
  | "timeblock-cancellations"
  | "low-energy-checkins"
  | "focus-abandonment"
  | "document-incomplete"
  | "marketing-activity"
  | "sales-activity"
  | "procrastination-language";

export type FounderPattern = {
  id: ID;
  type: PatternType;
  label: string;
  firstSeen: ISODateString;
  lastSeen: ISODateString;
  frequency: number;
  severity: Level;
  relatedProjectIds: ID[];
  sourceEventIds: ID[];
};

// ---- Insights (plain-English, business only) ----------------------------
export type FounderInsight = {
  id: ID;
  text: string;
  category: "timing" | "focus" | "project" | "behavior";
  basedOnPatternType?: PatternType;
  sourceEventIds: ID[];
};

// ---- Risks --------------------------------------------------------------
export type RiskType =
  | "project-stalled"
  | "task-overdue"
  | "no-sales-activity"
  | "no-marketing-activity"
  | "repeated-overwhelm"
  | "unfinished-priorities";

export type FounderRisk = {
  id: ID;
  type: RiskType;
  label: string;
  severity: Level;
  detectedAt: ISODateString;
  relatedProjectIds: ID[];
  suggestedAction: string;
  sourceEventIds: ID[];
};

// ---- Opportunities ------------------------------------------------------
export type OpportunitySource =
  | "chat"
  | "brain-dump"
  | "clear-my-mind"
  | "project"
  | "create";
export type OpportunityStatus =
  | "idea"
  | "exploring"
  | "active"
  | "parked"
  | "completed";

export type FounderOpportunity = {
  id: ID;
  text: string;
  source: OpportunitySource;
  relatedProjectId?: ID;
  status: OpportunityStatus;
  sourceEventIds: ID[];
};

// ---- Wins ---------------------------------------------------------------
export type WinType =
  | "task-completed"
  | "project-milestone"
  | "focus-completed"
  | "document-finished"
  | "timeblock-completed";

export type FounderWin = {
  id: ID;
  type: WinType;
  date: ISODateString;
  projectId?: ID;
  impact: Level;
  sourceEventIds: ID[];
};

// ---- Recommendations (must be explainable) ------------------------------
export type FounderRecommendation = {
  id: ID;
  text: string;
  reason: string; // the "because…" — always present
  confidence: Level;
  relatedObjectIds: ID[]; // projects / decisions / etc.
  sourceEventIds: ID[]; // the evidence behind it
};

// ---- Founder Memory -----------------------------------------------------
export type MentionCount = { key: string; label: string; mentions: number };
export type FounderMemory = {
  frequentProjects: MentionCount[];
  frequentGoals: MentionCount[];
  frequentStruggles: MentionCount[];
  frequentOpportunities: MentionCount[];
  frequentPeople: MentionCount[];
};

// ---- Composed result ----------------------------------------------------
export type FounderIntelligence = {
  patterns: FounderPattern[];
  insights: FounderInsight[];
  risks: FounderRisk[];
  wins: FounderWin[];
  opportunities: FounderOpportunity[];
  recommendations: FounderRecommendation[];
  memory: FounderMemory;
};
