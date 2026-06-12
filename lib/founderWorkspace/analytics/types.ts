export type AnalyticsTimeframe = "day" | "week" | "month";

export type AnalyticsDrillDown =
  | "projects"
  | "experiments"
  | "retests"
  | "api_usage"
  | "workspace"
  | "google"
  | "templates"
  | "activity"
  | null;

export type AnalyticsKpi = {
  id: string;
  label: string;
  value: string;
  sublabel?: string;
  drillDown: AnalyticsDrillDown;
};

export type TimeSeriesPoint = {
  label: string;
  value: number;
  ts: string;
};

export type BarSeriesItem = {
  label: string;
  value: number;
  color?: string;
};

export type PieSlice = {
  label: string;
  value: number;
  color: string;
};

export type ActivityFeedItem = {
  id: string;
  ts: string;
  kind: string;
  title: string;
  detail?: string;
};

export type ApiUsageRecord = {
  id: string;
  endpoint: string;
  model: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  ts: string;
  experimentId?: string;
  projectId?: string;
};

export type AnalyticsFilters = {
  timeframe: AnalyticsTimeframe;
  projectId: string | null;
  workspace: string | null;
};

export type ProjectProgressRow = {
  projectId: string;
  title: string;
  percentComplete: number;
  velocityPerWeek: number;
  upcomingDeadline: string | null;
  behindSchedule: boolean;
  status: string;
};

export type ExperimentInsightRow = {
  id: string;
  title: string;
  status: string;
  startDate: string;
  endDate: string | null;
  result: string;
  success: boolean | null;
};

export type AnalyticsAlert = {
  id: string;
  severity: "high" | "medium";
  message: string;
  category: "deadline" | "experiment" | "api" | "project";
  relatedId?: string;
};

export type FounderAnalyticsReport = {
  generatedAt: string;
  filters: AnalyticsFilters;
  kpis: AnalyticsKpi[];
  projectProgress: ProjectProgressRow[];
  experimentInsights: ExperimentInsightRow[];
  experimentSuccessRate: TimeSeriesPoint[];
  alerts: AnalyticsAlert[];
  projectsOverTime: TimeSeriesPoint[];
  experimentOutcomes: BarSeriesItem[];
  templateUsage: BarSeriesItem[];
  workspaceUsage: PieSlice[];
  apiUsageOverTime: TimeSeriesPoint[];
  recentActivity: ActivityFeedItem[];
  drillDownLists: {
    projects: ActivityFeedItem[];
    experiments: ActivityFeedItem[];
    retests: ActivityFeedItem[];
    apiUsage: ApiUsageRecord[];
    google: ActivityFeedItem[];
    templates: ActivityFeedItem[];
  };
  summary: {
    projectsCompleted: number;
    projectsTotal: number;
    completionRate: number;
    experimentsSuccessful: number;
    experimentsFailed: number;
    retestPending: number;
    retestFailed: number;
    apiCalls: number;
    apiTokens: number;
    googleExports: number;
    templateCount: number;
    snippetCount: number;
    focusMinutes: number;
  };
};
