export type {
  IntegrationGroupId,
  IntegrationStatus,
  IntegrationConnectionLabel,
  IntegrationCapability,
  IntegrationQuickActionKind,
  IntegrationQuickAction,
  IntegrationHighlight,
  ExecutiveIntegration,
  IntegrationGroup,
  IntegrationSearchResult,
  ExecutiveIntegrationBootstrap,
  ExecutiveIntegrationCenterView,
  IntegrationSearchView,
} from "./types";

export {
  GHL_CAPABILITIES,
  INTEGRATION_OPEN_ROUTES,
  INTEGRATION_STATUS_LABELS,
  POSTCRAFT_CAPABILITIES,
  integrationConnectionLabel,
  integrationStatusDisplayLabel,
  parseMarketingIntegrationStatus,
  resolveIntegrationActionHref,
  resolveIntegrationConnectionLabel,
} from "./integrationConnection";
export type {
  EcosystemDashboardStatusPayload,
  MarketingIntegrationLiveStatus,
} from "./integrationConnection";

export {
  GHL_DEPARTMENT,
  MARKETING_FEEDBACK_STEP,
  MARKETING_ORCHESTRATION_FLOW,
  MARKETING_ORCHESTRATION_HEADLINE,
  MARKETING_ORCHESTRATION_STEPS,
  MARKETING_ORCHESTRATION_SUMMARY,
  POSTCRAFT_DEPARTMENT,
} from "./marketingOrchestration";
export type {
  MarketingDepartmentRole,
  MarketingOrchestrationStep,
} from "./marketingOrchestration";

export {
  composeEcosystemSystemsStatus,
  ECOSYSTEM_SYSTEMS_STATUS_HEADLINE,
} from "./ecosystemSystemsStatus";
export type {
  EcosystemSystemStatusKind,
  EcosystemSystemStatusRow,
} from "./ecosystemSystemsStatus";

export {
  INTEGRATION_CENTER_PRINCIPLE,
  ONE_OFFICE_MESSAGE,
  INTEGRATION_GROUPS,
  SEARCH_INDEX,
  getIntegration,
} from "./sample/integrationData";

export { integrationSampleRepository, matchIntegrationSearch } from "./repositories/sample";

export {
  getExecutiveIntegrationBootstrap,
  composeIntegrationCenterView,
  composeIntegrationSearch,
  ExecutiveIntegrationService,
  executiveIntegrationService,
} from "./services/executiveIntegrationService";
