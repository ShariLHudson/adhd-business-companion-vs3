/** Institutional Memory™ — ecosystem organizational wisdom (not storage). */

export type MemoryKind =
  | "decision"
  | "lesson"
  | "experiment"
  | "success"
  | "failure"
  | "roadmap-change"
  | "research-history"
  | "product-evolution"
  | "customer-insight"
  | "marketing-history"
  | "campaign-outcome"
  | "founder-reflection"
  | "meeting-outcome"
  | "event";

export type MemoryConfidenceLevel = "high" | "medium" | "low" | "exploratory";

export type MemoryConfidence = {
  level: MemoryConfidenceLevel;
  /** 0–100 */
  score: number;
  rationale: string;
};

export type EvidenceReference = {
  id: string;
  kind: string;
  label: string;
  summary: string;
  refId?: string;
  graphNodeId?: string;
};

export type MemoryRelationship = {
  id: string;
  fromMemoryId: string;
  toMemoryId: string;
  kind: "supports" | "inspired_by" | "learned_from" | "superseded_by" | "related_to" | "validated_by" | "requires";
  reason: string;
  graphEdgeId?: string;
};

export type MemoryRevision = {
  id: string;
  memoryId: string;
  revisedAt: string;
  summary: string;
  previousSummary?: string;
};

export type MemoryEvent = {
  id: string;
  memoryId: string;
  kind: "created" | "recalled" | "revised" | "linked" | "archived" | "rediscovered";
  summary: string;
  occurredAt: string;
};

export type InstitutionalMemoryCore = {
  id: string;
  kind: MemoryKind;
  title: string;
  description: string;
  context: string;
  whyThisHappened: string;
  problemSolved: string;
  decidedBy?: string;
  alternativesConsidered: string[];
  expectedOutcome: string;
  actualOutcome: string;
  lessonsLearned: string[];
  wouldDoAgain: boolean | "partial";
  relatedMissions: string[];
  relatedProducts: string[];
  relatedResearch: string[];
  relatedCustomers: string[];
  relatedContent: string[];
  relatedWorkshops: string[];
  relatedCampaigns: string[];
  relatedRevenue: string[];
  evidence: EvidenceReference[];
  graphNodeIds: string[];
  confidence: MemoryConfidence;
  createdAt: string;
  updatedAt: string;
  timeline: MemoryEvent[];
};

export type InstitutionalMemory = InstitutionalMemoryCore;

export type BusinessDecision = InstitutionalMemoryCore & { kind: "decision" };
export type LessonLearned = InstitutionalMemoryCore & { kind: "lesson" };
export type BusinessExperiment = InstitutionalMemoryCore & { kind: "experiment" };
export type SuccessStory = InstitutionalMemoryCore & { kind: "success" };
export type FailureStory = InstitutionalMemoryCore & { kind: "failure" };
export type RoadmapChange = InstitutionalMemoryCore & { kind: "roadmap-change" };
export type ResearchHistory = InstitutionalMemoryCore & { kind: "research-history" };
export type ProductEvolution = InstitutionalMemoryCore & {
  kind: "product-evolution";
  originalVision: string;
  majorRevisions: string[];
  featuresAdded: string[];
  featuresRemoved: string[];
  customerFeedback: string[];
  businessImpact: string;
  revenueImpact: string;
};
export type CustomerInsightHistory = InstitutionalMemoryCore & { kind: "customer-insight" };
export type MarketingHistory = InstitutionalMemoryCore & { kind: "marketing-history" };
export type CampaignOutcome = InstitutionalMemoryCore & { kind: "campaign-outcome" };
export type FounderReflection = InstitutionalMemoryCore & { kind: "founder-reflection" };
export type MeetingOutcome = InstitutionalMemoryCore & { kind: "meeting-outcome" };

export type BusinessReasoning = {
  memoryId: string;
  title: string;
  whyDecided: string;
  alternatives: string[];
  evidenceSummary: string;
  wasSuccessful: boolean;
  wouldDecideSameToday: boolean;
  narrative: string[];
};

export type RediscoveryResult = {
  query: string;
  memories: InstitutionalMemory[];
  relatedGraphNodeIds: string[];
  pastDecisions: BusinessDecision[];
  lessons: LessonLearned[];
  experiments: BusinessExperiment[];
  narrative: string[];
};

export type RecallFilter = {
  kind?: MemoryKind;
  missionId?: string;
  tag?: string;
  search?: string;
};

export type RememberInput = Omit<
  InstitutionalMemoryCore,
  "id" | "createdAt" | "updatedAt" | "timeline" | "confidence"
> & {
  confidence?: MemoryConfidence;
};
