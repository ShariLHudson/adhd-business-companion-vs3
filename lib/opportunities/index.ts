export type {
  OpportunityTypeId,
  OpportunityRecommendation,
  OpportunityConfidence,
  OpportunityImpactLevel,
  OpportunityEffortLevel,
  OpportunitySourceKind,
  OpportunityBoardPerspectiveId,
  SparkEcosystemTarget,
  OpportunityEvidence,
  OpportunityWhyNow,
  OpportunitySoWhat,
  OpportunityOutsideTheBox,
  OpportunityValueMetrics,
  OpportunityBoardPerspective,
  OpportunityPrepKind,
  OpportunityPrepOffer,
  BusinessOpportunity,
  OpportunityDiscoveryOverview,
  OpportunityType,
} from "./types";

export {
  OPPORTUNITY_DISCOVERY_PRINCIPLE,
  SAMPLE_OPPORTUNITIES,
  OPPORTUNITY_TYPES,
  getSampleOpportunity,
} from "./sample/opportunityData";

export { opportunitySampleRepository } from "./repositories/sample";

export {
  composeOpportunityDiscoveryOverview,
  getOpportunityById,
  OpportunityDiscoveryService,
  opportunityDiscoveryService,
} from "./services/opportunityDiscoveryService";
