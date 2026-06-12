// Founder Ecosystem — Phase 12 Founder Command Center types.
// One calm view-model: what matters, what's stuck, what to do next.

import type { ID, ISODateString } from "../models";
import type { Level } from "../dashboardTypes";
import type { AdvisorId } from "../board/advisorTypes";
import type { BusinessStage } from "../journey/journeyTypes";
import type { FounderAction } from "../actions/actionTypes";

export type CommandCenterToday = {
  focus: string | null;
  topPriority: string | null;
  nextActionLabel: string | null;
  currentProject: string | null;
  currentStage: BusinessStage;
  stageLabel: string;
  capacityLevel: string;
  capacityScore: number;
  momentumDirection: string;
  momentumScore: number;
};

export type CommandCenterBriefing = {
  headline: string;
  mostImportantGoal: string | null;
  projectsNeedingAttention: { name: string; reason: string }[];
  risks: string[];
  opportunities: string[];
  openDecisions: { decision: string; status: string; project?: string }[];
  recommendedAction: string | null;
};

export type CommandCenterCurrentWork = {
  project: string | null;
  document: string | null;
  timeBlock: string | null;
  focusSession: string | null;
  recommendation: string | null;
  openWorkspace: string | null;
  canResume: boolean;
};

export type CommandCenterAdvisorBoard = {
  mostActiveAdvisor: AdvisorId | null;
  mostActiveAdvisorName: string | null;
  currentRecommendations: { text: string; reason: string }[];
  priorityRecommendation: string | null;
  riskRecommendation: string | null;
  opportunityRecommendation: string | null;
};

export type ProjectAttentionItem = {
  projectId: ID;
  name: string;
  status: "at-risk" | "stalled" | "blocked" | "inactive";
  lastActivity: ISODateString | null;
  nextAction: string | null;
  healthScore: number;
};

export type CommandCenterOpportunity = {
  id: ID;
  text: string;
  category: "idea" | "growth" | "new" | "revenue";
  impact: Level;
};

export type CommandCenterDecision = {
  id: ID;
  decision: string;
  status: string;
  project: string | null;
  ageDays: number | null;
  recommendedNextStep: string | null;
};

export type CommandCenterMomentum = {
  winsThisWeek: number;
  tasksCompleted: number;
  projectsAdvanced: number;
  focusSessions: number;
  timeBlocksCompleted: number;
  trend: string;
  trendDirection: "rising" | "steady" | "falling";
};

export type CapacityRecommendation =
  | "protect-focus"
  | "reduce-commitments"
  | "continue-pace";

export type CommandCenterCapacity = {
  level: string;
  score: number;
  workload: number;
  attentionLoad: string;
  projectLoad: number;
  commitmentLoad: number;
  recommendation: CapacityRecommendation;
  recommendationText: string;
};

export type CommandCenterNextAction = {
  title: string;
  reason: string;
  reasons: string[];
  action: FounderAction | null;
};

export type CommandCenterState = {
  founderId: ID;
  generatedAt: ISODateString;
  today: CommandCenterToday;
  briefing: CommandCenterBriefing;
  currentWork: CommandCenterCurrentWork;
  advisorBoard: CommandCenterAdvisorBoard;
  projects: ProjectAttentionItem[];
  opportunities: CommandCenterOpportunity[];
  decisions: CommandCenterDecision[];
  momentum: CommandCenterMomentum;
  capacity: CommandCenterCapacity;
  nextAction: CommandCenterNextAction;
};
