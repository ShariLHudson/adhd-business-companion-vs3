/** Founder Intelligence Pipeline — shared domain types */

export type FounderIntelligenceSourceId = string;

export type FounderIntelligenceSourceStatus =
  | "placeholder"
  | "configured"
  | "active"
  | "paused";

export type FounderIntelligenceSource = {
  id: FounderIntelligenceSourceId;
  name: string;
  category: string;
  description: string;
  status: FounderIntelligenceSourceStatus;
  futureIntegration?: string;
};

export type FounderIntelligenceSignalStatus =
  | "received"
  | "processing"
  | "routed"
  | "archived";

export type FounderIntelligenceSignal = {
  id: string;
  sourceId: FounderIntelligenceSourceId;
  title: string;
  summary: string;
  observedAt: string;
  status: FounderIntelligenceSignalStatus;
};

export type FounderIntelligenceObservation = {
  id: string;
  signalId: string;
  sourceId: FounderIntelligenceSourceId;
  summary: string;
  recordedAt: string;
};

export type FounderIntelligenceFindingKind =
  | "research"
  | "customer"
  | "analytics"
  | "competitor"
  | "product"
  | "general";

export type FounderIntelligenceFinding = {
  id: string;
  kind: FounderIntelligenceFindingKind;
  signalId: string;
  sourceId: FounderIntelligenceSourceId;
  title: string;
  summary: string;
  discoveredAt: string;
};

export type FounderResearchFinding = FounderIntelligenceFinding & {
  kind: "research";
};

export type FounderCustomerFinding = FounderIntelligenceFinding & {
  kind: "customer";
};

export type FounderAnalyticsFinding = FounderIntelligenceFinding & {
  kind: "analytics";
};

export type FounderCompetitorFinding = FounderIntelligenceFinding & {
  kind: "competitor";
};

export type FounderProductFinding = FounderIntelligenceFinding & {
  kind: "product";
};

export type FounderIntelligenceTrend = {
  id: string;
  label: string;
  direction: "rising" | "steady" | "emerging" | "fading";
  note: string;
  sourceId?: FounderIntelligenceSourceId;
};

export type FounderIntelligenceWeakSignal = {
  id: string;
  label: string;
  note: string;
  sourceId?: FounderIntelligenceSourceId;
};

export type FounderIntelligenceScores = {
  importance: number;
  confidence: number;
  urgency: number;
  strategicValue: number;
  revenuePotential: number;
  innovationScore: number;
  customerImpact: number;
  implementationEffort: number;
};

export type FounderInsightCandidate = {
  id: string;
  findingId: string;
  title: string;
  summary: string;
  scores: FounderIntelligenceScores;
  stage: "insight-candidate";
};

export type FounderOpportunityCandidate = {
  id: string;
  findingId: string;
  title: string;
  summary: string;
  scores: FounderIntelligenceScores;
  stage: "opportunity-candidate";
};

export type FounderDecisionCandidate = {
  id: string;
  findingId: string;
  title: string;
  summary: string;
  scores: FounderIntelligenceScores;
  stage: "decision-candidate";
};

export type FounderContentCandidate = {
  id: string;
  findingId: string;
  title: string;
  summary: string;
  scores: FounderIntelligenceScores;
  stage: "content-candidate";
};

export type FounderRecommendationCandidate = {
  id: string;
  insightCandidateId: string;
  title: string;
  summary: string;
  scores: FounderIntelligenceScores;
  stage: "recommendation-candidate";
};

export type FounderReportCandidate = {
  id: string;
  recommendationCandidateId: string;
  title: string;
  summary: string;
  scores: FounderIntelligenceScores;
  stage: "report-candidate";
};

export type FounderIntelligenceArchiveRecord = {
  id: string;
  reportCandidateId: string;
  title: string;
  summary: string;
  archivedAt: string;
  stage: "archive";
};

export type FounderIntelligencePipelineStageId =
  | "source"
  | "signal"
  | "finding"
  | "insight-candidate"
  | "recommendation-candidate"
  | "report-candidate"
  | "archive";

export type FounderIntelligencePipelineStage = {
  id: FounderIntelligencePipelineStageId;
  label: string;
  description: string;
  count: number;
};

export type FounderIntelligenceInboxStatus =
  | "new"
  | "needs-review"
  | "accepted"
  | "archived";

export type FounderIntelligenceInboxItem = {
  id: string;
  signalId: string;
  sourceId: FounderIntelligenceSourceId;
  title: string;
  summary: string;
  status: FounderIntelligenceInboxStatus;
  receivedAt: string;
};

export type FounderIntelligenceTimelineEventType =
  | "research-discovered"
  | "product-launched"
  | "feature-completed"
  | "idea-captured"
  | "workshop-created"
  | "user-request"
  | "competitor-update"
  | "signal-received"
  | "finding-recorded"
  | "decision-pending";

export type FounderIntelligenceTimelineEvent = {
  id: string;
  type: FounderIntelligenceTimelineEventType;
  title: string;
  summary: string;
  sourceId?: FounderIntelligenceSourceId;
  occurredAt: string;
};

export type FounderIntelligenceSourceSummary = {
  sourceId: FounderIntelligenceSourceId;
  name: string;
  category: string;
  status: FounderIntelligenceSourceStatus;
  signalCount: number;
  findingCount: number;
};

export type FounderIntelligenceRoomOverview = {
  incomingSignals: FounderIntelligenceSignal[];
  timeline: FounderIntelligenceTimelineEvent[];
  inbox: Record<FounderIntelligenceInboxStatus, FounderIntelligenceInboxItem[]>;
  recentFindings: FounderIntelligenceFinding[];
  sourceSummary: FounderIntelligenceSourceSummary[];
  pipelineStatus: FounderIntelligencePipelineStage[];
};
