import type { FounderWorkspaceItem } from "../types";

export type ProjectHealth =
  | "healthy"
  | "needs_attention"
  | "at_risk"
  | "stalled";

export type IssueSeverity = "low" | "medium" | "high" | "critical";
export type IssueStatus = "active" | "resolved" | "parked";

export type OpportunityImpact = "low" | "medium" | "high";
export type OpportunityPriority = "low" | "medium" | "high";
export type OpportunityStatus = "open" | "pursuing" | "done" | "parked";

export type ProjectLinkTarget =
  | "experiment"
  | "note"
  | "google_doc"
  | "issue"
  | "integration";

export type ProjectIssue = {
  id: string;
  projectId: string;
  problem: string;
  severity: IssueSeverity;
  status: IssueStatus;
  dateFound: string;
  resolution?: string;
};

export type ProjectOpportunity = {
  id: string;
  projectId: string;
  idea: string;
  potentialImpact: OpportunityImpact;
  priority: OpportunityPriority;
  status: OpportunityStatus;
};

export type ProjectLink = {
  id: string;
  projectId: string;
  targetKind: ProjectLinkTarget;
  targetId?: string;
  label: string;
  url?: string;
};

export type ProjectActivityRecord = {
  lastViewedAt?: string;
  lastEditedAt?: string;
};

export type ProjectIntelligenceStore = {
  issues: ProjectIssue[];
  opportunities: ProjectOpportunity[];
  links: ProjectLink[];
  activity: Record<string, ProjectActivityRecord>;
};

export type ProjectMomentum = {
  score: number;
  progressSignals: string[];
  notesAdded: number;
  experimentsCompleted: number;
};

export type ProjectIntelligence = {
  project: FounderWorkspaceItem;
  health: ProjectHealth;
  healthLabel: string;
  completionScore: number;
  priority: number;
  momentum: ProjectMomentum;
  activity: {
    lastUpdated: string;
    lastViewed?: string;
    lastEdited?: string;
    daysSinceUpdate: number;
  };
  risks: string[];
  blockers: string[];
  nextStep: string;
  topOpportunity: ProjectOpportunity | null;
  openIssues: ProjectIssue[];
  opportunities: ProjectOpportunity[];
  relationships: ProjectLink[];
  recentActivity: string[];
};

export type ProjectIntelligenceDashboard = {
  needingAttention: ProjectIntelligence[];
  stalled: ProjectIntelligence[];
  highMomentum: ProjectIntelligence[];
  opportunities: ProjectOpportunity[];
  openIssues: ProjectIssue[];
};

export type ProjectSortKey =
  | "priority"
  | "health"
  | "momentum"
  | "last_activity";
