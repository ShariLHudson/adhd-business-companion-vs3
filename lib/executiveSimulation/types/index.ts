/** Executive Simulation Studio™ — scenario planning types. */

export type SimulationConfidence = "high" | "medium" | "low" | "exploratory";

export type SimulationImpactLevel = "high" | "medium" | "low";
export type SimulationEffortLevel = "low" | "medium" | "high";
export type SimulationComplexity = "low" | "medium" | "high";

export type SimulationBoardPerspectiveId =
  | "ceo"
  | "marketing"
  | "customer"
  | "finance"
  | "technology"
  | "operations"
  | "innovation"
  | "adhd";

export type SparkEcosystemArea =
  | "founder"
  | "companion"
  | "postcraft"
  | "listening-rooms"
  | "team-hub"
  | "research"
  | "marketing"
  | "community"
  | "revenue"
  | "operations"
  | "brand";

export type SimulationRiskKind =
  | "strategic"
  | "financial"
  | "customer"
  | "technology"
  | "founder-burnout"
  | "complexity"
  | "timing"
  | "execution";

export type SimulationPrepKind =
  | "mission"
  | "executive-builder"
  | "cursor-prompt"
  | "roadmap"
  | "postcraft-campaign"
  | "marketing-strategy"
  | "launch-plan"
  | "ghl-workflow"
  | "executive-brief"
  | "decision-vault-entry";

export type WhatChanges = {
  becomesEasier: string[];
  becomesHarder: string[];
  getsDelayed: string[];
  speedsUp: string[];
  newOpportunities: string[];
  lostOpportunities: string[];
};

export type SecondOrderEffect = {
  id: string;
  trigger: string;
  consequence: string;
};

export type SimulationBoardPerspective = {
  id: SimulationBoardPerspectiveId;
  label: string;
  likes: string;
  concerns: string;
  questions: string[];
};

export type EcosystemImpact = {
  area: SparkEcosystemArea;
  summary: string;
  direction: "positive" | "neutral" | "negative" | "mixed";
};

export type ResourceAnalysis = {
  founderTime: string;
  money: string;
  teamEffort: string;
  developmentEffort: string;
  marketingEffort: string;
  maintenance: string;
  customerSupport: string;
  automationOpportunities: string[];
  learningOpportunities: string[];
};

export type OpportunityCost = {
  notChoosing: string[];
  whatWaits: string[];
  whatSlows: string[];
  becomesUnavailable: string[];
};

export type SimulationRisk = {
  kind: SimulationRiskKind;
  summary: string;
  confidence: SimulationConfidence;
};

export type SimulationPrepOffer = {
  id: string;
  kind: SimulationPrepKind;
  label: string;
  description: string;
  status: "draft";
};

export type ExecutiveScenario = {
  id: string;
  letter: "A" | "B" | "C" | "D";
  name: string;
  executiveSummary: string;
  whyThisApproach: string;
  advantages: string[];
  disadvantages: string[];
  estimatedEffort: SimulationEffortLevel;
  estimatedComplexity: SimulationComplexity;
  estimatedCost: string;
  estimatedTimeWeeks: number;
  estimatedFounderEnergy: SimulationEffortLevel;
  estimatedCustomerImpact: SimulationImpactLevel;
  estimatedBusinessImpact: SimulationImpactLevel;
  estimatedRevenueOpportunity: string;
  estimatedAutomationOpportunity: SimulationImpactLevel;
  estimatedLongTermStrategicValue: SimulationImpactLevel;
  confidence: SimulationConfidence;
  keyAssumptions: string[];
  dependencies: string[];
  risks: string[];
  unknowns: string[];
  whatChanges: WhatChanges;
  secondOrderEffects: SecondOrderEffect[];
  boardPerspectives: SimulationBoardPerspective[];
  ecosystemImpact: EcosystemImpact[];
  resources: ResourceAnalysis;
  opportunityCost: OpportunityCost;
  riskAnalysis: SimulationRisk[];
};

export type IfIWereYou = {
  recommendedScenarioId: string;
  recommendedPath: string;
  why: string;
  confidence: SimulationConfidence;
  evidence: string[];
  alternativeWorthWatching: string;
  whatWouldChangeRecommendation: string;
};

export type ExecutiveSimulation = {
  id: string;
  decisionQuestion: string;
  generatedAt: string;
  scenarios: ExecutiveScenario[];
  boardSummary: string;
  ifIWereYou: IfIWereYou;
  prepOffers: SimulationPrepOffer[];
  learningLoopNote: string;
};

export type SimulationSessionView = {
  product: "founder";
  query: string;
  simulation: ExecutiveSimulation;
  generatedAt: string;
};

export type SimulationBootstrap = {
  suggestedDecisions: SimulationSuggestedDecision[];
  sampleSimulationId: string;
};

export type SimulationSuggestedDecision = {
  id: string;
  phrase: string;
};

export type ScenarioComparisonRow = {
  label: string;
  values: Record<string, string>;
};
