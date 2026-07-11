/** Executive Questions Framework — reusable reasoning types (no UI). */

export type ExecutiveCategory =
  | "product"
  | "customers"
  | "content"
  | "business"
  | "technology"
  | "founder"
  | "marketing"
  | "team";

export type ExecutiveProduct =
  | "founder"
  | "companion"
  | "postcraft"
  | "team-hub"
  | "ghl"
  | "estate"
  | "workshop";

export type ExecutiveConfidenceLevel = "high" | "medium" | "low" | "exploratory";

export type ExecutivePriorityLevel = "critical" | "high" | "medium" | "low";

export type ExecutiveSourceKind =
  | "spark"
  | "flame"
  | "fire"
  | "mission"
  | "research"
  | "decision-vault"
  | "content"
  | "roadmap"
  | "companion"
  | "postcraft"
  | "team-hub"
  | "ghl"
  | "analytics"
  | "customer-feedback";

export type ExecutiveRelatedKind =
  | "mission"
  | "research"
  | "decision"
  | "content"
  | "roadmap"
  | "companion"
  | "postcraft"
  | "team-hub"
  | "ghl"
  | "analytics"
  | "customer-feedback"
  | "opportunity"
  | "risk";

export type ExecutiveTimeHorizon = "today" | "this-week" | "this-month";

export type ExecutiveBusinessArea =
  | "product"
  | "customers"
  | "content"
  | "revenue"
  | "operations"
  | "technology"
  | "marketing"
  | "team"
  | "founder";

export type ExecutiveQuestionId = string;

export type ExecutiveSource = {
  id: string;
  kind: ExecutiveSourceKind;
  label: string;
  summary?: string;
};

export type ExecutiveContext = {
  product?: ExecutiveProduct;
  missionId?: string;
  timeHorizon?: ExecutiveTimeHorizon;
  businessArea?: ExecutiveBusinessArea;
};

export type ExecutiveMission = {
  missionId: string;
  name: string;
  summary: string;
};

export type ExecutiveEvidence = {
  id: string;
  title: string;
  summary: string;
  source: ExecutiveSource;
  weight?: number;
};

export type ExecutiveRecommendation = {
  id: string;
  title: string;
  summary: string;
  rationale: string;
};

export type ExecutiveAction = {
  id: string;
  label: string;
  summary: string;
  href?: string;
  priority: ExecutivePriorityLevel;
};

export type ExecutivePriority = {
  level: ExecutivePriorityLevel;
  /** 0–100 */
  score: number;
  founderImportance: number;
  customerImpact: number;
  revenuePotential: number;
  label: string;
};

export type ExecutiveConfidence = {
  level: ExecutiveConfidenceLevel;
  /** 0–100 */
  score: number;
  rationale: string;
};

export type ExecutiveOpportunity = {
  id: string;
  title: string;
  summary: string;
};

export type ExecutiveRisk = {
  id: string;
  title: string;
  summary: string;
  severity: "low" | "medium" | "high";
};

export type ExecutiveDecision = {
  id: string;
  title: string;
  summary: string;
  status: "pending" | "decided" | "revisit";
};

export type ExecutiveRelatedItem = {
  id: string;
  kind: ExecutiveRelatedKind;
  title: string;
  summary: string;
  refId?: string;
};

export type ExecutiveInsight = {
  id: string;
  title: string;
  summary: string;
};

export type ExecutiveSummary = {
  headline: string;
  narrative: string;
};

export type ExecutiveQuestionDefinition = {
  id: ExecutiveQuestionId;
  category: ExecutiveCategory;
  title: string;
  purpose: string;
  businessValue: string;
  whoBenefits: string;
  requiredEvidence: string[];
  possibleSources: ExecutiveSourceKind[];
  relatedMissionIds: string[];
  relatedProducts: ExecutiveProduct[];
  priority: ExecutivePriority;
  sampleAnswerId?: string;
  nextActionHints: string[];
  tags: string[];
  /** Populated by Question Builder when assembled */
  relationshipCount?: number;
};

export type ExecutiveQuestion = ExecutiveQuestionDefinition;

export type ExecutiveAnswer = {
  questionId: ExecutiveQuestionId;
  summary: ExecutiveSummary;
  evidence: ExecutiveEvidence[];
  supportingResearch: ExecutiveEvidence[];
  relatedMissions: ExecutiveMission[];
  relatedDecisions: ExecutiveDecision[];
  recommendedActions: ExecutiveAction[];
  confidence: ExecutiveConfidence;
  priority: ExecutivePriority;
  openQuestions: string[];
  opportunities: ExecutiveOpportunity[];
  risks: ExecutiveRisk[];
  insights: ExecutiveInsight[];
  relatedItems: ExecutiveRelatedItem[];
};

export type ComposedExecutiveAnswer = {
  question: ExecutiveQuestion;
  answer: ExecutiveAnswer;
};

export type ExecutiveQuestionRelationship = {
  id: string;
  questionId: ExecutiveQuestionId;
  relatedKind: ExecutiveRelatedKind;
  relatedId: string;
  summary: string;
};

export type ExecutiveQuestionFilter = {
  timeHorizon?: ExecutiveTimeHorizon;
  missionId?: string;
  category?: ExecutiveCategory;
  businessArea?: ExecutiveBusinessArea;
  priorityLevel?: ExecutivePriorityLevel;
  minCustomerImpact?: number;
  minRevenuePotential?: number;
  minFounderImportance?: number;
  product?: ExecutiveProduct;
};
