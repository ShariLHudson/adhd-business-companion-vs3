/** SPARK™ Intelligence Core — shared ecosystem types (no UI, no Founder dependency). */

export type SparkEntityKind =
  | "signal"
  | "observation"
  | "finding"
  | "pattern"
  | "theme"
  | "relationship"
  | "priority"
  | "recommendation"
  | "opportunity"
  | "risk"
  | "action"
  | "question"
  | "knowledge"
  | "memory";

export type SparkConfidenceLevel = "very-low" | "low" | "medium" | "high" | "very-high";

export type SparkConfidence = {
  level: SparkConfidenceLevel;
  /** Normalized 0–100 */
  score: number;
};

export type SparkSourceCategory =
  | "companion"
  | "founder"
  | "postcraft"
  | "teamhub"
  | "ghl"
  | "research"
  | "analytics"
  | "social"
  | "competitor"
  | "product"
  | "user-feedback"
  | "development"
  | "content"
  | "manual-note";

export type SparkProductScope =
  | "ecosystem"
  | "founder"
  | "companion"
  | "postcraft"
  | "teamhub";

export type SparkCategory =
  | "product"
  | "customer"
  | "revenue"
  | "research"
  | "operations"
  | "learning"
  | "innovation"
  | "relationship"
  | "executive"
  | "content"
  | "general";

export type SparkEntityStatus = "active" | "candidate" | "archived" | "superseded";

export type SparkSource = {
  id: string;
  sourceCategory: SparkSourceCategory;
  title: string;
  summary: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
  status: SparkEntityStatus;
};

export type SparkSignal = {
  id: string;
  sourceId: string;
  title: string;
  summary: string;
  category: SparkCategory;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
  status: SparkEntityStatus;
  confidence: SparkConfidence;
  evidenceIds?: string[];
  relationshipIds?: string[];
};

export type SparkObservation = {
  id: string;
  signalId: string;
  title: string;
  summary: string;
  category: SparkCategory;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
  status: SparkEntityStatus;
  confidence: SparkConfidence;
  evidenceIds?: string[];
  relationshipIds?: string[];
};

export type SparkFinding = {
  id: string;
  signalId?: string;
  sourceId?: string;
  title: string;
  summary: string;
  category: SparkCategory;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
  status: SparkEntityStatus;
  confidence: SparkConfidence;
  evidenceIds?: string[];
  relationshipIds?: string[];
};

export type SparkPattern = {
  id: string;
  title: string;
  summary: string;
  themeId?: string;
  signalIds: string[];
  findingIds?: string[];
  category: SparkCategory;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
  status: SparkEntityStatus;
  confidence: SparkConfidence;
  evidenceIds?: string[];
  relationshipIds?: string[];
};

export type SparkTheme = {
  id: string;
  title: string;
  summary: string;
  patternIds: string[];
  tags?: string[];
  createdAt: string;
  updatedAt: string;
  status: SparkEntityStatus;
};

export type SparkRelationshipKind =
  | "supports"
  | "contradicts"
  | "influences"
  | "duplicates"
  | "extends"
  | "belongs_to"
  | "generated"
  | "derived_from"
  | "requires"
  | "blocks"
  | "related_to";

export type SparkConnection = {
  id: string;
  fromKind: SparkEntityKind;
  fromId: string;
  toKind: SparkEntityKind;
  toId: string;
  relationship: SparkRelationshipKind;
  createdAt: string;
  updatedAt: string;
};

export type SparkRelationship = {
  id: string;
  label: string;
  chain: SparkConnection[];
  summary: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
  status: SparkEntityStatus;
};

export type SparkScoreDimension =
  | "strategicValue"
  | "customerImpact"
  | "revenuePotential"
  | "founderImportance"
  | "productImportance"
  | "innovationValue"
  | "urgency"
  | "confidence"
  | "learningValue"
  | "implementationEffort";

export type SparkScore = {
  dimension: SparkScoreDimension;
  /** Normalized 0–100 */
  value: number;
  weight: number;
  rationale?: string;
};

export type SparkEvidence = {
  id: string;
  sourceId?: string;
  title: string;
  summary: string;
  excerpt: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
};

export type SparkPriority = {
  id: string;
  title: string;
  summary: string;
  category: SparkCategory;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
  status: SparkEntityStatus;
  scores: SparkScore[];
  /** Normalized 0–100 */
  compositeScore: number;
  confidence: SparkConfidence;
  evidenceIds: string[];
  relationshipIds?: string[];
};

export type SparkRecommendation = {
  id: string;
  title: string;
  summary: string;
  priorityId?: string;
  preparedFor: SparkProductScope;
  category: SparkCategory;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
  status: SparkEntityStatus;
  confidence: SparkConfidence;
  evidenceIds: string[];
  relationshipIds?: string[];
};

export type SparkOpportunity = {
  id: string;
  title: string;
  summary: string;
  category: SparkCategory;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
  status: SparkEntityStatus;
  scores: SparkScore[];
  confidence: SparkConfidence;
  evidenceIds?: string[];
  relationshipIds?: string[];
};

export type SparkRisk = {
  id: string;
  title: string;
  summary: string;
  severity: "low" | "medium" | "high";
  category: SparkCategory;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
  status: SparkEntityStatus;
  confidence: SparkConfidence;
  evidenceIds?: string[];
  relationshipIds?: string[];
};

export type SparkAction = {
  id: string;
  title: string;
  summary: string;
  urgency: SparkScore;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
  status: SparkEntityStatus;
};

export type SparkQuestion = {
  id: string;
  title: string;
  summary: string;
  question: string;
  context: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
  confidence: SparkConfidence;
};

export type SparkKnowledgeItem = {
  id: string;
  title: string;
  summary: string;
  category: SparkCategory;
  sourceId?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
  status: SparkEntityStatus;
  memoryRefIds: string[];
  relationshipIds?: string[];
};

/** @deprecated Use SparkKnowledgeItem */
export type SparkKnowledge = SparkKnowledgeItem;

export type SparkMemoryReference = {
  id: string;
  kind: SparkEntityKind;
  entityId: string;
  title: string;
  summary: string;
  productScope: SparkProductScope;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
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

export type SparkPrepareContext = {
  product: SparkProductScope;
  limit?: number;
};

export type SparkOverview = {
  headline: string;
  sourceCount: number;
  signalCount: number;
  observationCount: number;
  findingCount: number;
  patternCount: number;
  priorityCount: number;
  recommendationCount: number;
  topPatternTitle?: string;
  topPriorityTitle?: string;
  preparedAt: string;
};

export type SparkIntelligenceBundle = {
  sources: SparkSource[];
  signals: SparkSignal[];
  observations: SparkObservation[];
  findings: SparkFinding[];
  patterns: SparkPattern[];
  themes: SparkTheme[];
  priorities: SparkPriority[];
  recommendations: SparkRecommendation[];
  opportunities: SparkOpportunity[];
  risks: SparkRisk[];
  knowledge: SparkKnowledgeItem[];
  graph: SparkKnowledgeGraph;
};

export type SparkSummary = SparkOverview;
