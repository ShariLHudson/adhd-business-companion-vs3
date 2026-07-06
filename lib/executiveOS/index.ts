export type {
  OperatingLoopStage,
  CompanyContextMode,
  HealthDimension,
  HealthStatus,
  OperatingContext,
  RoutedRecommendation,
  AttentionState,
  RecommendationState,
  ExecutionState,
  MissionState,
  DepartmentState,
  ImprovementState,
  ExecutiveBalance,
  ExecutiveLeverage,
  DimensionHealth,
  ExecutiveHealth,
  CompanyHealth,
  ExecutiveState,
  CompanyState,
  ExecutiveOSContext,
} from "./types";

export {
  EXECUTIVE_OPERATING_LOOP,
  COORDINATED_SYSTEMS,
  ONE_RECOMMENDATION_PRINCIPLE,
  EXECUTIVE_OS_PRINCIPLE,
} from "./sample";

export { executiveOSSampleRepository } from "./repositories/sample";
export { routeAttention, collectCompetingRecommendations } from "./routing/attentionEngine";
export { composeExecutiveBalance } from "./health/companyHealth";

export {
  ExecutiveOSService,
  executiveOSService,
  composeExecutiveState,
  composeCompanyState,
  composeExecutiveContext,
  composeAttention,
  composeOperatingHealth,
  composeLeverage,
} from "./services/executiveOSService";
