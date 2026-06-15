/** Business Operating System Intelligence — run the business with less in your head. */

export type BusinessHealthLevel =
  | "healthy"
  | "stable"
  | "needs_attention"
  | "overloaded"
  | "unknown";

export type BusinessArea =
  | "offers"
  | "marketing"
  | "content"
  | "sales"
  | "relationships"
  | "delivery"
  | "operations"
  | "finances"
  | "projects"
  | "customer_support"
  | "founder_capacity";

export type FounderLoadLevel = "low" | "moderate" | "high" | "critical";

export type BusinessAreaStatus = "healthy" | "watch" | "needs_attention";

export type BusinessAreaSummary = {
  area: BusinessArea;
  label: string;
  status: BusinessAreaStatus;
  summary: string;
  signalCount: number;
};

export type BusinessRisk = {
  id: string;
  area: BusinessArea;
  label: string;
  reason: string;
  severity: "low" | "medium" | "high";
};

export type BusinessOpportunityItem = {
  id: string;
  area: BusinessArea;
  label: string;
  reason: string;
  impact: "low" | "medium" | "high";
};

export type BusinessAction = {
  id: string;
  label: string;
  reason: string;
  area: BusinessArea;
};

export type BusinessOSSnapshot = {
  businessHealth: BusinessHealthLevel;
  businessAreas: BusinessAreaSummary[];
  activeRisks: BusinessRisk[];
  activeOpportunities: BusinessOpportunityItem[];
  recommendedActions: BusinessAction[];
  founderLoad: FounderLoadLevel;
  highestRiskArea: BusinessArea | null;
  createdAt: string;
};

export type BusinessOSInput = {
  now?: Date;
  text?: string;
};

export type BusinessOSSortOffer = {
  snapshot: BusinessOSSnapshot;
  companionOffer: string;
  createdAt: string;
};

export type FounderBusinessOSReport = {
  generatedAt: string;
  sampleSize: number;
  healthDistribution: { level: BusinessHealthLevel; label: string; count: number }[];
  overloadedCount: number;
  topRiskAreas: { area: BusinessArea; label: string; count: number }[];
  topOpportunities: { label: string; area: BusinessArea; count: number }[];
  commonActions: { label: string; count: number }[];
  recommendedFounderAction: string;
  notes: string;
};
