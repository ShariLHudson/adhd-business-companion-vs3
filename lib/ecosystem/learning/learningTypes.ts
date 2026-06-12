// Founder Ecosystem — Phase 15 Learning & Optimization types.
// Measure → Analyze → Optimize. Observational only.

import type { ID, ISODateString } from "../models";
import type { Tool } from "../automation/automationTypes";

export type AutomationLifecycle =
  | "suggested"
  | "approved"
  | "executed"
  | "rejected"
  | "dismissed"
  | "edited";

export type TrackContext = {
  projectId?: ID;
  documentId?: ID;
  goalLabel?: string;
  tool?: Tool | string;
  actionType?: string;
  userMessage?: string;
};

export type AutomationTrackRecord = {
  automationId: ID;
  title: string;
  tool: string;
  actionType: string;
  lifecycle: AutomationLifecycle;
  ts: ISODateString;
  timeSavedMinutes?: number;
  projectId?: ID;
  documentId?: ID;
  ok?: boolean;
};

export type AutomationSuccessMetric = {
  key: string;
  title: string;
  tool: string;
  suggested: number;
  approved: number;
  executed: number;
  rejected: number;
  dismissed: number;
  approvalRate: number;
  executionRate: number;
  avgTimeSavedMinutes: number;
};

export type ToolUsageMetric = {
  tool: string;
  triggerCount: number;
  successCount: number;
  totalTimeSavedMinutes: number;
  avgTimeSavedMinutes: number;
};

export type PendingVsExecuted = {
  pending: number;
  executed: number;
  dismissed: number;
  rejected: number;
};

export type EngagementHeatCell = {
  day: string;
  hour: number;
  count: number;
};

export type WorkflowEfficiency = {
  sequence: string[];
  count: number;
  avgTimeSavedMinutes: number;
};

export type AutomationScore = {
  key: string;
  title: string;
  score: number;
  approvalRate: number;
  executionRate: number;
  ignoreRate: number;
  avgTimeSavedMinutes: number;
  trend: "rising" | "steady" | "falling";
};

export type LearningAdjustment = {
  key: string;
  delta: number;
  reason: string;
};

export type PersonalizedSequence = {
  id: ID;
  label: string;
  steps: string[];
  confidence: number;
  basis: string;
};

export type LearningDashboard = {
  founderId: ID;
  generatedAt: ISODateString;
  automationSuccess: AutomationSuccessMetric[];
  pendingVsExecuted: PendingVsExecuted;
  timeSavedPerTool: ToolUsageMetric[];
  engagementHeatmap: EngagementHeatCell[];
  workflowEfficiency: WorkflowEfficiency[];
  totalTimeSavedMinutes: number;
  overallSuccessRate: number;
  insights: string[];
};
