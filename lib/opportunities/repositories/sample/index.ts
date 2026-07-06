import {
  OPPORTUNITY_DISCOVERY_PRINCIPLE,
  SAMPLE_OPPORTUNITIES,
  getSampleOpportunity,
} from "../../sample/opportunityData";
import type { BusinessOpportunity } from "../../types";

export const opportunitySampleRepository = {
  principle: () => OPPORTUNITY_DISCOVERY_PRINCIPLE,
  all: () => SAMPLE_OPPORTUNITIES,
  get: (id: string) => getSampleOpportunity(id),
  byBucket: (bucket: BusinessOpportunity["bucket"]) =>
    SAMPLE_OPPORTUNITIES.filter((o) => o.bucket === bucket).sort((a, b) => b.rankScore - a.rankScore),
};
