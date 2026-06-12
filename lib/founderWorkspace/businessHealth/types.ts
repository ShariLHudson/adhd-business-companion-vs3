export type HealthLevel = "healthy" | "needs_attention" | "at_risk";

export type UserHealthMetrics = {
  newUsers: number;
  activeUsers: number;
  returningUsers: number;
  retentionRate: number;
  retentionTrend: "up" | "stable" | "down";
};

export type ProductHealthMetrics = {
  topFeature: string | null;
  leastUsedFeature: string | null;
  errorSignals: number;
  abandonedWorkflows: number;
  topFriction: string | null;
};

export type EngagementHealthMetrics = {
  focusSessions: number;
  timeBlocks: number;
  projectsCreated: number;
  documentsCreated: number;
  recommendationsAccepted: number;
  trend: "up" | "stable" | "down";
};

export type BusinessHealthMetrics = {
  payingUsers: number;
  trialUsers: number;
  conversions: number;
  churnRate: number;
  dataConnected: boolean;
  revenueTrend: "up" | "stable" | "down" | "unknown";
};

export type SystemHealthMetrics = {
  openAiStatus: HealthLevel;
  claudeStatus: HealthLevel;
  googleIntegration: HealthLevel;
  ghlIntegration: HealthLevel;
  errorLogCount: number;
};

export type HealthDimensionScore = {
  level: HealthLevel;
  headline: string;
  detail: string;
};

export type HealthWarning = {
  id: string;
  severity: "high" | "medium";
  message: string;
  monitor: string;
};

export type WeeklyHealthReport = {
  weekStart: string;
  weekEnd: string;
  wins: string[];
  risks: string[];
  opportunities: string[];
  recommendations: string[];
  summary: string;
};

export type BusinessHealthReport = {
  generatedAt: string;
  overall: HealthLevel;
  overallHeadline: string;
  user: HealthDimensionScore;
  product: HealthDimensionScore;
  engagement: HealthDimensionScore;
  revenue: HealthDimensionScore;
  system: HealthDimensionScore;
  warnings: HealthWarning[];
  weeklyReport: WeeklyHealthReport;
  metrics: {
    user: UserHealthMetrics;
    product: ProductHealthMetrics;
    engagement: EngagementHealthMetrics;
    business: BusinessHealthMetrics;
    system: SystemHealthMetrics;
  };
};

export const HEALTH_LABELS: Record<HealthLevel, string> = {
  healthy: "Healthy",
  needs_attention: "Needs Attention",
  at_risk: "At Risk",
};

export type HealthMetricsBundle = {
  user: UserHealthMetrics;
  product: ProductHealthMetrics;
  engagement: EngagementHealthMetrics;
  business: BusinessHealthMetrics;
  system: SystemHealthMetrics;
};
