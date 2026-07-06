/** Executive Operating System™ — connected company intelligence (composition only). */

import type { MissionId } from "@/lib/founder/missions/types";

export type OperatingLoopStage =
  | "observe"
  | "collect"
  | "connect"
  | "understand"
  | "discover"
  | "recommend"
  | "compare"
  | "decide"
  | "prepare"
  | "approve"
  | "orchestrate"
  | "monitor"
  | "measure"
  | "improve"
  | "remember"
  | "learn"
  | "repeat";

export type CompanyContextMode =
  | "building"
  | "launching"
  | "researching"
  | "hiring"
  | "writing"
  | "planning"
  | "growing"
  | "recovering";

export type HealthDimension =
  | "mission"
  | "product"
  | "research"
  | "content"
  | "marketing"
  | "automation"
  | "team"
  | "founder"
  | "customer"
  | "learning";

export type HealthStatus = "strong" | "steady" | "watch" | "strained";

export type OperatingContext = {
  missionId: MissionId;
  mode: CompanyContextMode;
  label: string;
  rationale: string;
  date?: string;
};

export type RoutedRecommendation = {
  id: string;
  title: string;
  summary: string;
  source: string;
  leverageScore: number;
  tier: "primary" | "supporting" | "library";
};

export type AttentionState = {
  primary: RoutedRecommendation | null;
  supporting: RoutedRecommendation[];
  library: RoutedRecommendation[];
  deferredCount: number;
  principle: string;
};

export type RecommendationState = {
  primary: RoutedRecommendation | null;
  supporting: RoutedRecommendation[];
  libraryCount: number;
  competingFiltered: number;
};

export type ExecutionState = {
  activeInitiatives: number;
  awaitingApproval: number;
  waitingOnOthers: number;
  recommendedNextAction: string;
};

export type MissionState = {
  id: MissionId;
  name: string;
  progress: number;
  status: string;
  health: HealthStatus;
};

export type DepartmentState = {
  id: string;
  label: string;
  health: HealthStatus;
  summary: string;
};

export type ImprovementState = {
  topOpportunity: string | null;
  experimentCount: number;
  reviewKind: string;
};

export type ExecutiveBalance = {
  score: number;
  label: "calm" | "focused" | "busy" | "overloaded";
  openMissions: number;
  openDecisions: number;
  contextSwitchRisk: number;
  simplification: string[];
};

export type ExecutiveLeverage = {
  founderTimeSavedHours: number;
  researchTimeSavedHours: number;
  automationOpportunities: number;
  revenueLeverage: string;
  learningLeverage: string;
  strategicLeverage: number;
  summary: string;
};

export type DimensionHealth = {
  dimension: HealthDimension;
  status: HealthStatus;
  score: number;
  summary: string;
};

export type ExecutiveHealth = {
  overall: HealthStatus;
  score: number;
  founder: DimensionHealth;
  balance: ExecutiveBalance;
  dimensions: DimensionHealth[];
};

export type CompanyHealth = {
  overall: HealthStatus;
  score: number;
  dimensions: DimensionHealth[];
  departments: DepartmentState[];
};

export type ExecutiveState = {
  product: "founder";
  missionId: MissionId;
  generatedAt: string;
  operatingLoop: OperatingLoopStage[];
  currentStage: OperatingLoopStage;
  context: OperatingContext;
  attention: AttentionState;
  recommendations: RecommendationState;
  execution: ExecutionState;
  mission: MissionState;
  improvement: ImprovementState;
  leverage: ExecutiveLeverage;
  health: ExecutiveHealth;
  coordinatedSystems: string[];
};

export type CompanyState = {
  product: "founder";
  generatedAt: string;
  missions: MissionState[];
  health: CompanyHealth;
  context: OperatingContext;
  primaryRecommendation: RoutedRecommendation | null;
  operatingPrinciple: string;
};

export type ExecutiveOSContext = {
  missionId?: MissionId;
  mode?: CompanyContextMode;
  date?: string;
};
