/** SPARK™ Intelligence Core — shared ecosystem types (no UI). */

export type SparkEntityKind =
  | "signal"
  | "observation"
  | "pattern"
  | "relationship"
  | "priority"
  | "recommendation"
  | "insight"
  | "trend"
  | "opportunity"
  | "risk"
  | "action"
  | "question"
  | "finding"
  | "theme"
  | "knowledge"
  | "memory";

export type SparkConfidenceLevel = "very-low" | "low" | "medium" | "high" | "very-high";

export type SparkConfidence = {
  level: SparkConfidenceLevel;
  score: number;
};

export type SparkSource = {
  id: string;
  name: string;
  category: string;
  productScope: "ecosystem" | "founder" | "companion" | "postcraft" | "team-hub";
};

export type SparkCategory =
  | "product"
  | "customer"
  | "revenue"
  | "research"
  | "operations"
  | "learning"
  | "innovation"
  | "relationship"
  | "general";

export type SparkSignal = {
  id: string;
  sourceId: string;
  title: string;
  summary: string;
  category: SparkCategory;
  observedAt: string;
  confidence: SparkConfidence;
};

export type SparkObservation = {
  id: string;
  signalId: string;
  summary: string;
  recordedAt: string;
  confidence: SparkConfidence;
};

export type SparkPattern = {
  id: string;
  title: string;
  summary: string;
  themeId?: string;
  signalIds: string[];
  confidence: SparkConfidence;
  detectedAt: string;
};

export type SparkRelationshipKind =
  | "supports"
  | "evolved-from"
  | "enables"
  | "informs"
  | "resulted-in";

export type SparkConnection = {
  id: string;
  fromKind: SparkEntityKind;
  fromId: string;
  toKind: SparkEntityKind;
  toId: string;
  relationship: SparkRelationshipKind;
  notedAt: string;
};

export type SparkRelationship = {
  id: string;
  label: string;
  chain: SparkConnection[];
  summary: string;
};

export type SparkScoreDimension =
  | "strategic-value"
  | "customer-impact"
  | "revenue-potential"
  | "founder-importance"
  | "product-importance"
  | "innovation"
  | "urgency"
  | "confidence"
  | "learning-value"
  | "implementation-effort";

export type SparkScore = {
  dimension: SparkScoreDimension;
  value: number;
  weight: number;
  rationale?: string;
};

export type SparkEvidence = {
  id: string;
  label: string;
  sourceId?: string;
  excerpt: string;
};

export type SparkPriority = {
  id: string;
  title: string;
  summary: string;
  scores: SparkScore[];
  compositeScore: number;
  confidence: SparkConfidence;
  evidenceIds: string[];
};

export type SparkRecommendation = {
  id: string;
  title: string;
  summary: string;
  priorityId?: string;
  preparedFor: "founder" | "companion" | "postcraft" | "team-hub" | "ecosystem";
  confidence: SparkConfidence;
  evidenceIds: string[];
};

export type SparkInsight = {
  id: string;
  title: string;
  summary: string;
  themeId?: string;
  confidence: SparkConfidence;
  discoveredAt: string;
};

export type SparkTrend = {
  id: string;
  title: string;
  direction: "rising" | "stable" | "emerging" | "declining";
  summary: string;
  confidence: SparkConfidence;
};

export type SparkOpportunity = {
  id: string;
  title: string;
  summary: string;
  scores: SparkScore[];
  confidence: SparkConfidence;
};

export type SparkRisk = {
  id: string;
  title: string;
  summary: string;
  severity: "low" | "medium" | "high";
  confidence: SparkConfidence;
};

export type SparkAction = {
  id: string;
  title: string;
  summary: string;
  urgency: SparkScore;
};

export type SparkQuestion = {
  id: string;
  question: string;
  context: string;
  confidence: SparkConfidence;
};

export type SparkFinding = {
  id: string;
  title: string;
  summary: string;
  category: SparkCategory;
  signalId?: string;
  confidence: SparkConfidence;
};

export type SparkTheme = {
  id: string;
  title: string;
  summary: string;
  patternIds: string[];
};

export type SparkKnowledge = {
  id: string;
  title: string;
  summary: string;
  category: SparkCategory;
  sourceId?: string;
  memoryRefIds: string[];
};

export type SparkMemoryReference = {
  id: string;
  kind: SparkEntityKind;
  entityId: string;
  label: string;
  productScope: SparkSource["productScope"];
};

export type SparkGraphNode = {
  id: string;
  kind: SparkEntityKind;
  label: string;
};

export type SparkGraphEdge = {
  id: string;
  fromId: string;
  toId: string;
  relationship: SparkRelationshipKind;
};

export type SparkKnowledgeGraph = {
  nodes: SparkGraphNode[];
  edges: SparkGraphEdge[];
};

export type SparkIntelligenceBundle = {
  signals: SparkSignal[];
  observations: SparkObservation[];
  patterns: SparkPattern[];
  themes: SparkTheme[];
  priorities: SparkPriority[];
  recommendations: SparkRecommendation[];
  opportunities: SparkOpportunity[];
  risks: SparkRisk[];
  knowledge: SparkKnowledge[];
  graph: SparkKnowledgeGraph;
};

export type SparkPrepareContext = {
  product: SparkSource["productScope"];
  limit?: number;
};

export type SparkSummary = {
  headline: string;
  observationCount: number;
  patternCount: number;
  topPriorityTitle?: string;
  preparedAt: string;
};
