export type ProductCategory =
  | "create"
  | "projects"
  | "focus"
  | "time_block"
  | "google_docs"
  | "memory"
  | "dashboard"
  | "general_ux"
  | "integrations";

export type ProductSignalType = "friction" | "feature_request" | "success";

export type ProductSignal = {
  id: string;
  type: ProductSignalType;
  text: string;
  category: ProductCategory;
  sourceEventId: string;
  ts: string;
  workspace?: string;
};

export type AggregatedSignal = {
  key: string;
  text: string;
  type: ProductSignalType;
  category: ProductCategory;
  count: number;
  lastSeen: string;
  firstSeen: string;
  sampleEventIds: string[];
};

export type PriorityLevel = "high" | "medium" | "low";

export type PrioritizedIssue = AggregatedSignal & {
  priority: PriorityLevel;
  priorityScore: number;
  frequencyScore: number;
  severityScore: number;
  impactScore: number;
  effortScore: number;
};

export type ProductOpportunity = {
  id: string;
  title: string;
  hypothesis: string;
  evidence: string[];
  category: ProductCategory;
  relatedSignalKeys: string[];
  potentialImpact: PriorityLevel;
};

export type QuickWin = {
  id: string;
  title: string;
  rationale: string;
  category: ProductCategory;
  relatedSignalKey: string;
  estimatedEffort: "low" | "medium";
};

export type LovedFeature = {
  feature: string;
  category: ProductCategory;
  engagementScore: number;
  evidence: string;
};

export type WeeklyProductReview = {
  weekStart: string;
  weekEnd: string;
  topIssues: PrioritizedIssue[];
  topRequests: AggregatedSignal[];
  biggestOpportunities: ProductOpportunity[];
  mostImproved: string[];
  recommendedActions: string[];
  summary: string;
};

export type ProductIntelligenceReport = {
  generatedAt: string;
  topFrustrations: PrioritizedIssue[];
  mostRequestedFeatures: AggregatedSignal[];
  mostLovedFeatures: LovedFeature[];
  quickWins: QuickWin[];
  opportunities: ProductOpportunity[];
  weeklyReview: WeeklyProductReview;
  categoryCounts: Record<ProductCategory, number>;
  leastUsedFeatures: { feature: string; opens: number }[];
};

export const PRODUCT_CATEGORY_LABELS: Record<ProductCategory, string> = {
  create: "Create",
  projects: "Projects",
  focus: "Focus",
  time_block: "Time Block",
  google_docs: "Google Docs",
  memory: "Memory",
  dashboard: "Dashboard",
  general_ux: "General UX",
  integrations: "Integrations",
};
