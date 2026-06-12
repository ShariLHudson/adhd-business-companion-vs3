export type GhlPeriod = "7d" | "30d" | "90d";

export type GhlBusinessMetrics = {
  totalContacts: number;
  newContacts: number;
  openOpportunities: number;
  wonOpportunities: number;
  lostOpportunities: number;
  pipelineValue: number;
  conversionRate: number;
  payingSubscribers: number;
  trialSubscribers: number;
  period: GhlPeriod;
  fetchedAt: string;
};

export type GhlFounderSummary = {
  activeProjects: number;
  activeExperiments: number;
  recentNotes: number;
  topProjects: { title: string; status: string }[];
  configured: boolean;
};

export type GhlProductSignal = {
  label: string;
  count: number;
  kind: "struggle" | "question" | "feature_request" | "feedback";
};

export type GhlContentAssetIdea = {
  type: string;
  label: string;
  title: string;
  angle: string;
};

export type GhlContentSourceRef = {
  kind: string;
  category: string;
  count: number;
};

export type GhlContentOpportunity = {
  topic: string;
  topicKey?: string;
  mentions: number;
  opportunityScore: number;
  trend?: "up" | "stable" | "down";
  whyThisMatters?: string;
  suggestedAssets: string[];
  assetIdeas?: GhlContentAssetIdea[];
  sourceSignals?: GhlContentSourceRef[];
};

export type GhlPostCraftExport = {
  generatedAt: string;
  dashboardName: string;
  opportunities: Array<{
    topic: string;
    topicKey: string;
    mentions: number;
    opportunityScore: number;
    trend: "up" | "stable" | "down";
    whyThisMatters: string;
    sourceSignals: GhlContentSourceRef[];
    assets: GhlContentAssetIdea[];
  }>;
};

export type GhlDashboardPayload = {
  generatedAt: string;
  business: GhlBusinessMetrics | null;
  founder: GhlFounderSummary;
  productSignals: GhlProductSignal[];
  contentOpportunities: GhlContentOpportunity[];
  postCraftExport: GhlPostCraftExport | null;
  integration: {
    ghlConfigured: boolean;
    founderDbConfigured: boolean;
    ecosystemSignalsConfigured: boolean;
    errors: string[];
  };
};
