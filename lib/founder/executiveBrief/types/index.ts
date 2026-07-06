/** Executive Brief Experience™ — presentation types (plain English, no UI). */

export type ExecutivePriorityLabel =
  | "critical"
  | "high"
  | "medium"
  | "low"
  | "watch"
  | "ignore";

export type ExecutiveTimeSensitivity =
  | "today"
  | "this-week"
  | "this-month"
  | "next-quarter"
  | "long-term"
  | "no-action-needed";

export type ExecutiveEcosystemConnection =
  | "founder"
  | "spark"
  | "companion"
  | "postcraft"
  | "team-hub"
  | "gohighlevel"
  | "business-growth"
  | "member-experience"
  | "revenue"
  | "product-development"
  | "marketing";

export type ExecutiveRecommendedActionKind =
  | "keep-watching"
  | "research-further"
  | "build-later"
  | "add-to-roadmap"
  | "discuss-strategy-center"
  | "create-workshop"
  | "write-content"
  | "ignore"
  | "build-now";

export type ExecutiveEvidenceKind =
  | "research"
  | "customer-request"
  | "mission-history"
  | "analytics"
  | "competitor"
  | "technology"
  | "ai"
  | "founder-decision"
  | "companion-insight";

export type FounderAlertDomain =
  | "spark"
  | "founder"
  | "companion"
  | "postcraft"
  | "team-hub"
  | "revenue"
  | "marketing"
  | "operations"
  | "research"
  | "member-success";

export type ExecutivePriority = {
  label: ExecutivePriorityLabel;
  /** 0–100 internal score */
  score: number;
};

export type ExecutiveEvidence = {
  id: string;
  kind: ExecutiveEvidenceKind;
  title: string;
  plainSummary: string;
  refId?: string;
};

export type ExecutiveExplanation = {
  whatHappened: string;
  whyShouldICare: string;
  whatShouldWeDo: string;
  connections: ExecutiveEcosystemConnection[];
  actionKind: ExecutiveRecommendedActionKind;
};

export type ExecutiveLearning = {
  explainSimply: string;
  explainInDetail: string;
  teachWhyItMatters: string;
  howSparkCouldUseThis: string;
  whatProblemDoesThisSolve: string;
};

export type ExecutiveBriefItemCore = {
  id: string;
  title: string;
  simpleExplanation: string;
  businessExplanation: string;
  whyItMatters: string;
  howItAffectsSpark: string;
  recommendedAction: string;
  priority: ExecutivePriority;
  estimatedImpact: string;
  timeSensitivity: ExecutiveTimeSensitivity;
  relatedMissionIds: string[];
  relatedResearchIds: string[];
  evidence: ExecutiveEvidence[];
  explanation: ExecutiveExplanation;
  learning?: ExecutiveLearning;
};

export type ExecutiveAlert = ExecutiveBriefItemCore & {
  kind: "alert";
};

export type FounderAlert = ExecutiveBriefItemCore & {
  kind: "founder-alert";
  domains: FounderAlertDomain[];
  appearsFirst: true;
};

export type ExecutiveOpportunity = ExecutiveBriefItemCore & {
  kind: "opportunity";
};

export type ExecutiveRisk = ExecutiveBriefItemCore & {
  kind: "risk";
  severity: "low" | "medium" | "high";
};

export type ExecutiveRecommendation = ExecutiveBriefItemCore & {
  kind: "recommendation";
};

export type ExecutiveDecision = ExecutiveBriefItemCore & {
  kind: "decision";
  status: "pending" | "decided" | "revisit";
};

export type ExecutiveAction = {
  id: string;
  label: string;
  summary: string;
  priority: ExecutivePriority;
  timeSensitivity: ExecutiveTimeSensitivity;
  missionId?: string;
};

export type ExecutiveInsight = {
  id: string;
  title: string;
  summary: string;
  explanation: ExecutiveExplanation;
  priority: ExecutivePriority;
};

export type ExecutiveNextStep = {
  id: string;
  label: string;
  summary: string;
  missionId?: string;
  timeSensitivity: ExecutiveTimeSensitivity;
};

export type ExecutiveSummary = {
  headline: string;
  narrative: string[];
  stats: {
    itemsReviewed: number;
    opportunitiesWorthAttention: number;
    decisionsWaiting: number;
    founderAlerts: number;
  };
};

export type ExecutiveAdvisorRecommendation = {
  id: string;
  title: string;
  why: string;
  expectedImpact: string;
  difficulty: "low" | "medium" | "high";
  suggestedNextStep: string;
  missionId: string;
  missionRelationship: string;
};

export type IfIWereRunningSection = {
  headline: string;
  subhead: string;
  recommendations: ExecutiveAdvisorRecommendation[];
};

export type ExecutiveBrief = {
  id: string;
  date: string;
  greeting: string;
  summary: ExecutiveSummary;
  founderAlerts: FounderAlert[];
  alerts: ExecutiveAlert[];
  opportunities: ExecutiveOpportunity[];
  risks: ExecutiveRisk[];
  recommendations: ExecutiveRecommendation[];
  decisions: ExecutiveDecision[];
  actions: ExecutiveAction[];
  insights: ExecutiveInsight[];
  learnings: ExecutiveLearning[];
  nextSteps: ExecutiveNextStep[];
  ifIWereRunning: IfIWereRunningSection;
  calmClose: string;
};

export type ExecutiveBriefFilter = {
  date?: string;
  missionId?: string;
};
