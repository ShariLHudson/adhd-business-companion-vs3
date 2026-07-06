export type * from "./types";

export {
  OpportunityDiscoveryService,
  opportunityDiscoveryService,
  discoverOpportunities,
  listOpportunities,
  getOpportunity,
  rankOpportunitiesPublic as rankOpportunities,
  listQuickWins,
  listStrategicBets,
  listMissionOpportunities,
} from "./services/opportunityDiscoveryService";

export {
  discover,
  findEmerging,
  findHidden,
  findRecurring,
  findIgnored,
  group,
  prepareExecutiveSummary,
} from "./discovery/opportunityDiscovery";

export {
  scoreOpportunity,
  rankByMission,
} from "./ranking/opportunityRanking";

export {
  buildOpportunityScore,
  compareOpportunityScores,
  isQuickWin,
  isStrategicBet,
  isHighImpact,
  needsResearch,
} from "./scoring/opportunityScoring";

export {
  OPPORTUNITY_CATEGORY_LABELS,
  EXECUTIVE_FILTER_LABELS,
  labelForCategory,
  labelForExecutiveFilter,
} from "./categories/opportunityCategories";

export {
  listOpportunityRelationships,
  relationshipsForOpportunity,
  describeOpportunityRelationship,
} from "./relationships/opportunityRelationships";
