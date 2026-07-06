import type { OpportunityId } from "../../types";
import {
  getSampleEvidenceForOpportunity,
  getSampleOpportunity,
  getSampleRecommendationsForOpportunity,
  getSampleRelationshipsForOpportunity,
  getSampleRisksForOpportunity,
  getSampleSignalsForOpportunity,
  listSampleOpportunities,
  SAMPLE_OPPORTUNITY_RELATIONSHIPS,
} from "../../sample";

export const opportunitySampleRepository = {
  list: () => listSampleOpportunities(),
  get: (id: OpportunityId) => getSampleOpportunity(id),
  listRelationships: () => [...SAMPLE_OPPORTUNITY_RELATIONSHIPS],
  signalsFor: (id: OpportunityId) => getSampleSignalsForOpportunity(id),
  evidenceFor: (id: OpportunityId) => getSampleEvidenceForOpportunity(id),
  recommendationsFor: (id: OpportunityId) => getSampleRecommendationsForOpportunity(id),
  risksFor: (id: OpportunityId) => getSampleRisksForOpportunity(id),
  relationshipsFor: (id: OpportunityId) => getSampleRelationshipsForOpportunity(id),
};

export type OpportunitySampleRepository = typeof opportunitySampleRepository;
