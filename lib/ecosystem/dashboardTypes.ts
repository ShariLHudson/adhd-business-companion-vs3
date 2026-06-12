// Founder Ecosystem — Phase 2 dashboard data types.
//
// The shapes the data layer produces. No UI — these are plain, serializable
// objects derived from the Phase 1 event stream. Missing data → empty arrays /
// null, never fabricated values.

import type { ID, ISODateString } from "./models";

export type Level = "low" | "medium" | "high";

// ---- 1. Today -----------------------------------------------------------
export type PriorityItem = { taskId: ID; title: string; projectId?: ID };
export type WinItem = { ts: ISODateString; label: string };
export type BlockerItem = { ts: ISODateString; text: string; projectId?: ID };

export type TodaySection = {
  topPriorities: PriorityItem[];
  activeTask: PriorityItem | null;
  nextTimeBlock: {
    timeBlockId: ID;
    title: string | null;
    scheduledFor: ISODateString | null;
    durationMin: number | null;
    projectId?: ID;
  } | null;
  currentFocusSession: {
    startedAt: ISODateString;
    plannedMinutes: number | null;
    projectId?: ID;
  } | null;
  wins: WinItem[];
  blockers: BlockerItem[];
};

// ---- 2. Active Projects -------------------------------------------------
export type ActiveProjectView = {
  projectId: ID;
  name: string;
  status: string;
  nextAction: string | null;
  lastActivity: ISODateString | null;
  linkedDocuments: { documentId: ID; title: string }[];
  scheduledBlocks: { timeBlockId: ID; scheduledFor: ISODateString | null }[];
  /** 0–1 fraction (completed tasks / total tasks), or null when no tasks yet. */
  progressEstimate: number | null;
};

// ---- 3. Momentum --------------------------------------------------------
export type MomentumSection = {
  tasksCompletedToday: number;
  focusSessionsCompleted: number; // today
  documentsCreated: number; // today
  projectsMovedForward: number; // distinct projects touched today
  winsCaptured: number; // today
};

// ---- 4. Open Decisions --------------------------------------------------
export type OpenDecisionView = {
  decisionId: ID;
  text: string;
  projectId?: ID;
  createdAt: ISODateString;
  lastMentionedAt: ISODateString;
  recommendedNextStep: string;
};

// ---- 5. Opportunities ---------------------------------------------------
export type OpportunityStatusLabel = "idea" | "exploring" | "active" | "parked";
export type OpportunityView = {
  opportunityId: ID;
  text: string;
  status: OpportunityStatusLabel;
  projectId?: ID;
  sourceEventId: ID;
};

// ---- 6. Pain Points / Patterns -----------------------------------------
export type PainPointCategory =
  | "overwhelm"
  | "low-energy"
  | "procrastination"
  | "email-overload"
  | "decision-fatigue"
  | "focus-problems"
  | "unfinished-projects"
  | "other";

export type PainPointPattern = {
  category: PainPointCategory;
  label: string;
  occurrences: number;
  firstSeen: ISODateString;
  lastSeen: ISODateString;
  relatedProjectIds: ID[];
  /** Supportive next path (a tool/strategy), never a diagnosis. */
  suggestedSupportPath: string;
};

// ---- 7. Founder State (support indicators, NOT a diagnosis) -------------
export type FounderState = {
  energy: Level;
  focus: Level;
  overwhelm: Level;
  confidence: Level;
  momentum: Level;
};

// ---- The whole dashboard ------------------------------------------------
export type FounderDashboardData = {
  today: TodaySection;
  activeProjects: ActiveProjectView[];
  momentum: MomentumSection;
  openDecisions: OpenDecisionView[];
  opportunities: OpportunityView[];
  painPoints: PainPointPattern[];
  founderState: FounderState;
};
