/**
 * Universal Request-to-Outcome Intelligence — shared contracts.
 * Templates deepen results; they do not make creation possible.
 */

export type UniversalCreationFamily =
  | "guide"
  | "step_by_step_instructions"
  | "plan"
  | "content_plan"
  | "campaign"
  | "report"
  | "research_report"
  | "comparison"
  | "strategy"
  | "process"
  | "sop"
  | "checklist"
  | "handbook"
  | "policy"
  | "framework"
  | "program"
  | "curriculum"
  | "course"
  | "workshop"
  | "presentation"
  | "proposal"
  | "timeline"
  | "communication_series"
  | "resource_collection"
  | "worksheet"
  | "template"
  | "decision_support"
  | "project_plan"
  | "event_plan"
  | "launch_plan"
  | "customer_journey"
  | "operating_system"
  | "experience_design"
  | "mixed_creation_package"
  | "single_deliverable"
  | "unknown";

export type UniversalResearchStatus =
  | "current_research_completed"
  | "stable_knowledge_used"
  | "current_research_unavailable"
  | "current_research_partial"
  | "user_sources_used"
  | "estate_sources_used"
  | "not_required";

export type UniversalRequestUnderstanding = {
  id: string;
  rawRequest: string;
  normalizedRequest: string;
  primaryIntent:
    | "create"
    | "research"
    | "plan"
    | "instruct"
    | "organize"
    | "project"
    | "mixed"
    | "unknown";
  secondaryIntents: string[];
  desiredOutcome: string;
  desiredOutcomeType: string;
  requestedAction: string;
  requestedDepth: "essentials" | "guided" | "detailed" | "unspecified";
  requestedScope: "single" | "series" | "package" | "program" | "unspecified";
  requestedQuantity: number | null;
  requestedDuration: { value: number; unit: "day" | "week" | "month" } | null;
  requestedTimeframe: string | null;
  intendedAudience: string | null;
  intendedChannel: string | null;
  intendedDestination: string | null;
  intendedUse: string | null;
  primaryDeliverable: string;
  supportingDeliverables: string[];
  creationFamily: UniversalCreationFamily;
  requiresResearch: boolean;
  requiresUserInformation: boolean;
  requiresCurrentInformation: boolean;
  requiresExecutionPlanning: boolean;
  requiresVisualRepresentation: boolean;
  requiresStrategicContext: boolean;
  knownConstraints: string[];
  inferredConstraints: string[];
  unresolvedEssentialQuestions: string[];
  confidence: number;
  interpretationSummary: string;
  /** Mapped Create catalog / UWE label when known. */
  createArtifactType: string | null;
  qualifiers: {
    durationPreserved: boolean;
    quantityPreserved: boolean;
    planNotPost: boolean;
    seriesPreserved: boolean;
    stepByStep: boolean;
  };
};

export type RequestInterpretationValidation = {
  preservedActions: string[];
  preservedQuantities: string[];
  preservedDurations: string[];
  preservedDeliverables: string[];
  preservedSubjects: string[];
  preservedAudience: string[];
  preservedChannels: string[];
  preservedConstraints: string[];
  droppedQualifiers: string[];
  contradictoryInferences: string[];
  overNarrowed: boolean;
  validationPassed: boolean;
};

export type DynamicCreationBlueprint = {
  id: string;
  requestUnderstandingId: string;
  creationFamily: UniversalCreationFamily;
  creationSubtype: string;
  purpose: string;
  intendedAudience: string | null;
  desiredOutcome: string;
  primaryDeliverable: string;
  supportingDeliverables: string[];
  requiredSections: string[];
  inferredSections: string[];
  optionalSections: string[];
  requiredItems: string[];
  itemCount: number | null;
  sequence: string[];
  dependencies: string[];
  researchRequirements: string[];
  userInformationRequirements: string[];
  qualityCriteria: string[];
  completionCriteria: string[];
  substanceCriteria: string[];
  specializedProfileId: string | null;
  reusablePatternId: string | null;
  dynamicallyInferred: boolean;
  destinationOptions: string[];
};

export type ResearchFinding = {
  id: string;
  title: string;
  content: string;
  source: string;
  freshness: "current" | "stable" | "unknown";
  confidence: "high" | "medium" | "low";
  verificationStatus: "verified" | "partially_verified" | "unverified";
};

export type ResearchCollection = {
  id: string;
  topic: string;
  purpose: string;
  researchQuestion: string;
  intendedOutcome: string;
  sourceExperience: string | null;
  sourceEntityId: string | null;
  sourceSelectionIds: string[];
  findings: ResearchFinding[];
  facts: string[];
  themes: string[];
  examples: string[];
  options: string[];
  recommendations: string[];
  risks: string[];
  questions: string[];
  conflicts: string[];
  uncertainties: string[];
  sourceReferences: string[];
  retrievalDates: string[];
  freshness: "current" | "stable" | "mixed" | "unknown";
  confidence: "high" | "medium" | "low";
  verificationStatus: "verified" | "partially_verified" | "unverified";
  userNotes: string[];
  approvedFindingIds: string[];
  excludedFindingIds: string[];
  status: UniversalResearchStatus;
  failureState: string | null;
  retryState: string | null;
  possibleUses: string[];
  selectedUse: string | null;
  linkedCreationIds: string[];
  linkedProjectIds: string[];
  linkedWorkspaceIds: string[];
  linkedStrategyIds: string[];
  createdAt: string;
  updatedAt: string;
};

export type CreationPackageSection = {
  id: string;
  title: string;
  content: string;
  order: number;
  kind:
    | "overview"
    | "day"
    | "step"
    | "section"
    | "checklist"
    | "note"
    | "cta"
    | "metric";
  metadata?: Record<string, unknown>;
};

export type CreationPackage = {
  id: string;
  title: string;
  purpose: string;
  audience: string | null;
  desiredOutcome: string;
  requestUnderstandingId: string;
  blueprintId: string;
  researchCollectionIds: string[];
  primaryDeliverableId: string;
  supportingDeliverableIds: string[];
  sections: CreationPackageSection[];
  knowledgeItemIds: string[];
  sourceReferences: string[];
  status: "draft" | "substantive" | "partial" | "failed";
  completionAssessment: string;
  validationResults: string[];
  researchStatus: UniversalResearchStatus;
  sourceExperience: string | null;
  currentDestination: string | null;
  availableHandoffs: string[];
  linkedProjectId: string | null;
  linkedVisualWorkspaceId: string | null;
  linkedStrategyId: string | null;
  linkedEstateRecords: string[];
  createdAt: string;
  updatedAt: string;
};

export type OutcomeSubstanceValidation = {
  passed: boolean;
  failureReasons: string[];
  dayCount: number;
  stepCount: number;
  sectionCount: number;
  overNarrowedToSingleArtifact: boolean;
};
