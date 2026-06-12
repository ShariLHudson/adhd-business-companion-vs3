// Founder Ecosystem — Phase 8 Founder Operating System (FOS) types.
//
// The OS continuously evaluates goals, projects, tasks, opportunities,
// decisions, risks and capacity to answer one question: "What should happen
// next?" Everything is derived from the event stream + the memory/intelligence
// layers. Business/productivity only — never a medical or financial claim.

import type { ID, ISODateString } from "../models";
import type { Level } from "../dashboardTypes";

export type { Level };

// ---- Capacity -----------------------------------------------------------
export type CapacityLevel = "low" | "medium" | "high";
export type CapacityState = {
  level: CapacityLevel;
  score: number; // 0–100, higher = more available capacity
  energy: Level;
  focus: Level;
  workload: number; // open tasks
  openProjects: number;
  activeCommitments: number; // open tasks + decisions + scheduled blocks
  overwhelmSignals: number;
  factors: string[]; // explainability
};

// ---- Momentum -----------------------------------------------------------
export type MomentumDirection = "rising" | "steady" | "falling";
export type MomentumState = {
  score: number; // 0–100
  trend: number; // current raw - previous raw
  direction: MomentumDirection;
  tasksCompleted: number;
  projectsAdvanced: number;
  wins: number;
  focusSessions: number;
  timeBlocksCompleted: number;
};

// ---- Project health -----------------------------------------------------
export type ProjectHealthRating =
  | "healthy"
  | "needs-attention"
  | "at-risk"
  | "stalled";

export type ProjectHealth = {
  projectId: ID;
  name: string;
  rating: ProjectHealthRating;
  healthScore: number; // 0–100
  progress: number | null; // 0–1
  riskCount: number;
  velocity: number; // activities in the recent window
  lastActivity: ISODateString | null;
  daysSinceActivity: number | null;
  status: "active" | "complete" | "stalled";
  reasons: string[];
};

// ---- Priorities ---------------------------------------------------------
export type PriorityItem = {
  projectId: ID;
  name: string;
  score: number; // 0–100
  rank: number; // 1 = most important
  recommendedAction: string;
  reasons: string[];
};

// ---- Next action --------------------------------------------------------
export type NextActionType =
  | "finish-task"
  | "schedule-focus"
  | "complete-timeblock"
  | "make-decision"
  | "follow-up"
  | "review"
  | "capture"
  | "address-risk";

export type NextAction = {
  projectId?: ID;
  type: NextActionType;
  action: string;
  rationale: string;
};

// ---- Attention ----------------------------------------------------------
export type AttentionLevel = "clear" | "busy" | "overloaded";
export type AttentionState = {
  loadScore: number; // 0–100, higher = more overloaded
  level: AttentionLevel;
  activeProjects: number;
  openPriorities: number;
  openOpportunities: number;
  unfinishedItems: number;
  competing: string[]; // what's pulling at attention
};

// ---- Briefings ----------------------------------------------------------
export type BriefingKind = "morning" | "midday" | "end-of-day" | "weekly";
export type BriefingSection = { title: string; lines: string[] };
export type Briefing = {
  kind: BriefingKind;
  generatedAt: ISODateString;
  headline: string;
  topGoal: string | null;
  projectsNeedingAttention: { projectId: ID; name: string; reason: string }[];
  risks: string[];
  opportunities: string[];
  recommendedNextAction: string | null;
  momentumSummary: string;
  sections: BriefingSection[];
};

// ---- The Operating State (the single source of "what's happening") ------
export type RiskSummary = { id: ID; label: string; severity: Level; projectId?: ID };
export type OpportunitySummary = {
  id: ID;
  text: string;
  impact: Level;
  projectId?: ID;
};

export type FounderOperatingState = {
  founderId: ID;
  generatedAt: ISODateString;
  currentFocus: { projectId: ID; name: string; action: string } | null;
  activeProject: ProjectHealth | null;
  topGoal: string | null;
  capacity: CapacityState;
  momentum: MomentumState;
  riskLevel: Level;
  opportunityLevel: Level;
  risks: RiskSummary[];
  opportunities: OpportunitySummary[];
  attention: AttentionState;
  nextAction: NextAction | null;
  recommendedNextAction: NextAction | null; // alias kept for clarity
  priorities: PriorityItem[];
  projectHealth: ProjectHealth[];
};
