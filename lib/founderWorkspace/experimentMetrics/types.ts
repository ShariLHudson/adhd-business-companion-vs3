import type {
  BarSeriesItem,
  PieSlice,
  TimeSeriesPoint,
} from "@/lib/founderWorkspace/analytics";
import type { AnalyticsTimeframe } from "@/lib/founderWorkspace/analytics/types";
import type { FounderExperimentStatus } from "@/lib/founderWorkspace/tracking/types";

export type ExperimentMetricsFilters = {
  timeframe: AnalyticsTimeframe;
  projectId: string | null;
  status: FounderExperimentStatus | "all";
  tag: string | null;
};

export type ExperimentGoogleLink = {
  label: string;
  url?: string;
};

export type ExperimentCustomKpiSnapshot = {
  id: string;
  label: string;
  value: number;
  unit?: string;
  threshold?: number;
  thresholdExceeded: boolean;
};

export type ExperimentTimelineEvent = {
  id: string;
  ts: string;
  kind: string;
  label: string;
  detail?: string;
};

export type ExperimentMetricAlert = {
  id: string;
  severity: "high" | "medium";
  experimentId: string;
  experimentTitle: string;
  message: string;
  category: "completion" | "api" | "project" | "insight" | "kpi";
};

export type ExperimentMetricRow = {
  id: string;
  title: string;
  source: "tracked" | "workspace";
  status: string;
  tags: string[];
  relatedProjectId?: string;
  relatedProjectTitle?: string;
  success: boolean | null;
  completionRate: number;
  milestoneCount: number;
  milestonesCompleted: number;
  avgDaysPerMilestone: number | null;
  durationDays: number;
  apiCalls: number;
  apiTokens: number;
  estimatedCostUsd: number;
  timeInvestedMinutes: number;
  googleDocLinks: ExperimentGoogleLink[];
  result: string;
  hypothesis?: string;
  bottleneck: string | null;
  taskCount: number;
  tasksCompleted: number;
  insightsFlagged: number;
  projectActivityCount: number;
  googleDocUpdates: number;
  projectDelayed: boolean;
  customKpis: ExperimentCustomKpiSnapshot[];
  timeline: ExperimentTimelineEvent[];
  createdAt: string;
  updatedAt: string;
};

export type ExperimentAggregateStats = {
  total: number;
  successful: number;
  failed: number;
  inProgress: number;
  avgCompletionRate: number;
  successRate: number;
  totalApiCalls: number;
  totalApiTokens: number;
  totalEstimatedCostUsd: number;
  totalTimeInvestedMinutes: number;
};

export type ExperimentRecommendation = {
  id: string;
  title: string;
  rationale: string;
  priority: "high" | "medium" | "low";
};

export type ExperimentPendingAction = {
  id: string;
  experimentId: string;
  experimentTitle: string;
  action: string;
};

export type ExperimentMetricsReport = {
  generatedAt: string;
  filters: ExperimentMetricsFilters;
  aggregate: ExperimentAggregateStats;
  experiments: ExperimentMetricRow[];
  outcomesPie: PieSlice[];
  completionByExperiment: BarSeriesItem[];
  tokensOverTime: TimeSeriesPoint[];
  typePerformance: BarSeriesItem[];
  successRateTrend: TimeSeriesPoint[];
  bottlenecks: string[];
  pendingActions: ExperimentPendingAction[];
  recommendations: ExperimentRecommendation[];
  allTags: string[];
  alerts: ExperimentMetricAlert[];
  anomalies: string[];
  suggestedKpis: string[];
  engagementTrend: TimeSeriesPoint[];
};
