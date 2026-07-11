/** Executive Builder — implementation blueprint types. */

export type BuildEntryKind =
  | "idea"
  | "research"
  | "opportunity"
  | "mission"
  | "executive-question"
  | "customer-problem"
  | "product-idea"
  | "workshop-idea"
  | "feature"
  | "marketing-campaign";

export type BuildModeId =
  | "quick-build"
  | "standard-build"
  | "executive-build"
  | "innovation-build"
  | "prototype"
  | "research-first"
  | "experiment";

export type BuildPhaseId =
  | "mission"
  | "roadmap"
  | "research"
  | "executive-questions"
  | "requirements"
  | "cursor-prompt"
  | "development-phases"
  | "testing"
  | "marketing-plan"
  | "postcraft-content"
  | "ghl-workflow"
  | "launch-checklist"
  | "analytics-plan"
  | "review-plan"
  | "lessons-learned";

export type ImplementationOptionId = "fastest" | "highest-quality" | "highest-roi";

export type BuildPrepOutputKind =
  | "cursor-prompt"
  | "github-milestones"
  | "postcraft-campaign"
  | "course-outline"
  | "workshop-agenda"
  | "sales-funnel"
  | "email-sequence"
  | "customer-journey"
  | "launch-timeline"
  | "pricing-ideas"
  | "landing-page-outline"
  | "video-script"
  | "knowledge-base";

export type BuilderBoardPerspectiveId =
  | "ceo"
  | "marketing"
  | "finance"
  | "operations"
  | "technology"
  | "customer"
  | "innovation"
  | "adhd";

export type BuildImpactLevel = "high" | "medium" | "low";
export type BuildDifficulty = "low" | "medium" | "high";

export type BuildEntryPoint = {
  id: string;
  kind: BuildEntryKind;
  label: string;
  sourceRef?: string;
};

export type BuildMode = {
  id: BuildModeId;
  label: string;
  description: string;
  depth: "shallow" | "standard" | "deep";
};

export type BuildPhase = {
  id: BuildPhaseId;
  label: string;
  summary: string;
  status: "draft";
};

export type ExecutiveWorkPacket = {
  id: string;
  objective: string;
  background: string;
  context: string;
  research: string;
  whyItMatters: string;
  dependencies: string[];
  implementationSteps: string[];
  estimatedTime: string;
  estimatedImpact: BuildImpactLevel;
  approvalRequired: boolean;
  readyForCursor: boolean;
};

export type ImplementationOption = {
  id: ImplementationOptionId;
  label: string;
  summary: string;
  tradeoffs: string[];
  estimatedWeeks: number;
  recommended: boolean;
};

export type BuilderBoardPerspective = {
  id: BuilderBoardPerspectiveId;
  label: string;
  summary: string;
  concern: string;
};

export type BuildPrepOutput = {
  id: string;
  kind: BuildPrepOutputKind;
  label: string;
  description: string;
  status: "draft";
};

export type ExecutiveLeverageEstimate = {
  founderHoursSaved: number;
  researchSaved: string;
  writingSaved: string;
  planningSaved: string;
  automationPotential: BuildImpactLevel;
  revenueOpportunity: string;
  strategicValue: BuildImpactLevel;
};

export type ExecutiveQuestion = {
  id: string;
  question: string;
  answer: string;
};

export type BuildBlueprint = {
  id: string;
  title: string;
  entryKind: BuildEntryKind;
  buildMode: BuildModeId;
  generatedAt: string;
  executiveSummary: string;
  businessGoal: string;
  customerProblem: string;
  desiredOutcome: string;
  missionAlignment: string;
  estimatedImpact: BuildImpactLevel;
  estimatedRevenue: string;
  estimatedTimeWeeks: number;
  estimatedDifficulty: BuildDifficulty;
  founderRecommendation: string;
  purpose: string;
  whyNow: string;
  businessValue: string;
  customerValue: string;
  founderValue: string;
  potentialRisks: string[];
  dependencies: string[];
  milestones: string[];
  successMetrics: string[];
  roiSummary: string;
  automationOpportunities: string[];
  phases: BuildPhase[];
  workPackets: ExecutiveWorkPacket[];
  implementationOptions: ImplementationOption[];
  boardPerspectives?: BuilderBoardPerspective[];
  boardSummary?: string;
  executiveQuestions: ExecutiveQuestion[];
  prepOutputs: BuildPrepOutput[];
  leverage: ExecutiveLeverageEstimate;
  whatCanWait: string[];
  whatFounderPreparesNext: string;
};

export type BuildSessionView = {
  product: "founder";
  query: string;
  blueprint: BuildBlueprint;
  generatedAt: string;
};

export type BuilderBootstrap = {
  entryPoints: BuildEntryPoint[];
  buildModes: BuildMode[];
  suggestedBuilds: { id: string; phrase: string }[];
  sampleBlueprintId: string;
};

export type BuilderSuggestedBuild = {
  id: string;
  phrase: string;
  entryKind: BuildEntryKind;
};
