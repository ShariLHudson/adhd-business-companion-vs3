/** Founder Intelligence Operating System™ — shared domain types */

export type FounderLabelTone =
  | "critical"
  | "opportunity"
  | "quick-win"
  | "on-deck"
  | "insight"
  | "revenue"
  | "ignore";

export type FounderStatus =
  | "draft"
  | "active"
  | "archived"
  | "superseded"
  | "candidate";

export type FounderSource =
  | "manual"
  | "fire"
  | "spark"
  | "flame"
  | "team-hub"
  | "member-signal"
  | "research"
  | "system";

export type FounderScore = {
  confidence: number;
  impact?: number;
  urgency?: number;
};

export type FounderGlanceItem = {
  id: string;
  label: string;
  tone: FounderLabelTone;
  summary: string;
};

export type FounderGlanceSection = {
  id: string;
  title: string;
  items: FounderGlanceItem[];
};

export type FounderPriority = {
  id: string;
  title: string;
  note?: string;
  score?: FounderScore;
  status?: FounderStatus;
};

export type FounderCustomerSignal = {
  id: string;
  label: string;
  detail: string;
  source?: FounderSource;
};

export type FounderTrend = {
  id: string;
  label: string;
  direction: "up" | "down" | "watch";
  note: string;
};

export type FounderInsight = {
  id: string;
  title: string;
  summary: string;
  tone?: FounderLabelTone;
  category?: string;
  score?: FounderScore;
  source?: FounderSource;
  status?: FounderStatus;
};

export type FounderRecommendation = {
  id: string;
  title: string;
  summary: string;
  tone?: FounderLabelTone;
  category?: string;
  score?: FounderScore;
};

export type FounderOpportunity = {
  id: string;
  title: string;
  summary: string;
  tone?: FounderLabelTone;
  revenuePotential?: string;
};

export type FounderRevenueIdea = {
  id: string;
  title: string;
  summary: string;
  tone?: FounderLabelTone;
};

export type FounderIgnoreSuggestion = {
  id: string;
  summary: string;
};

export type FounderBuildSuggestion = {
  id: string;
  title: string;
  summary: string;
  tone?: FounderLabelTone;
};

export type FounderWeakSignal = {
  id: string;
  label: string;
  note: string;
};

export type FounderCompetitorInsight = {
  id: string;
  competitor: string;
  summary: string;
};

export type FounderDecision = {
  id: string;
  title: string;
  summary: string;
  decidedAt?: string;
  status?: FounderStatus;
};

export type FounderAlert = {
  id: string;
  title: string;
  summary: string;
  tone?: FounderLabelTone;
  severity?: "low" | "medium" | "high";
};

export type FounderMemoryItem = {
  id: string;
  title: string;
  summary: string;
  category:
    | "business-decision"
    | "roadmap"
    | "idea"
    | "archived-idea"
    | "lesson"
    | "product"
    | "research"
    | "revisit";
  status: FounderStatus;
  source?: FounderSource;
  tags?: string[];
  createdAt: string;
  revisitAt?: string;
};

export type FounderResearchItem = {
  id: string;
  title: string;
  summary: string;
  url?: string;
  status?: FounderStatus;
  savedAt?: string;
};

export type FounderReport = {
  id: string;
  title: string;
  summary: string;
  type: "fire-daily" | "weekly" | "forecast" | "decision" | "research";
  publishedAt: string;
  tone?: FounderLabelTone;
};

export type FounderAutomationOpportunity = {
  id: string;
  title: string;
  summary: string;
  tone?: FounderLabelTone;
  effort?: "low" | "medium" | "high";
};

export type FounderCreationOpportunity = {
  id: string;
  title: string;
  summary: string;
  tone?: FounderLabelTone;
  format:
    | "workshop"
    | "webinar"
    | "course"
    | "newsletter"
    | "linkedin"
    | "pinterest"
    | "email-sequence"
    | "lead-magnet"
    | "campaign"
    | "video";
};

export type FounderContentSuggestion = FounderCreationOpportunity;
export type FounderWorkshopSuggestion = FounderCreationOpportunity;
export type FounderCourseSuggestion = FounderCreationOpportunity;

export type FounderTaskRecommendation = {
  id: string;
  title: string;
  meta?: string;
  assignee?: "shari" | "izna" | "cursor" | "team";
  lane?:
    | "active-projects"
    | "my-tasks"
    | "waiting-shari"
    | "waiting-izna"
    | "waiting-cursor"
    | "approvals"
    | "assets"
    | "social-queue"
    | "completed";
};

export type FounderProjectSuggestion = {
  id: string;
  title: string;
  meta?: string;
  status?: FounderStatus;
};

export type FounderAnalyticsSummary = {
  id: string;
  label: string;
  value: string;
  trend?: "up" | "down" | "flat";
  note?: string;
};

export type FounderRoomCard = {
  id: string;
  title: string;
  summary: string;
  tone?: FounderLabelTone;
};

export type TeamHubSection = {
  id: string;
  title: string;
  items: { id: string; title: string; meta?: string }[];
};

export type FounderDailyBrief = {
  id: string;
  date: string;
  greeting: string;
  prompt: string;
  glance: FounderGlanceSection[];
  bestIdea: FounderInsight;
  priorities: FounderPriority[];
  customerSignals: FounderCustomerSignal[];
  trends: FounderTrend[];
  revenueOpportunity: FounderRevenueIdea;
  ignoreItems: FounderIgnoreSuggestion[];
  alerts?: FounderAlert[];
  weakSignals?: FounderWeakSignal[];
  competitorInsights?: FounderCompetitorInsight[];
  decisionReminders?: FounderDecision[];
  status: FounderStatus;
  generatedAt: string;
};

export * from "./fireBrief";
export * from "./workspace";
