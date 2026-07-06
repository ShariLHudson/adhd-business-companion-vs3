import type { OpportunityId, OpportunityRelationship } from "../types";
import { opportunitySampleRepository } from "../repositories/sample";
import { getSampleOpportunity } from "../sample";

export function listOpportunityRelationships(): OpportunityRelationship[] {
  return opportunitySampleRepository.listRelationships();
}

export function relationshipsForOpportunity(opportunityId: OpportunityId): OpportunityRelationship[] {
  return opportunitySampleRepository.relationshipsFor(opportunityId);
}

export function describeOpportunityRelationship(rel: OpportunityRelationship): string {
  const from = getSampleOpportunity(rel.fromOpportunityId)?.title ?? rel.fromOpportunityId;
  const to = getSampleOpportunity(rel.toOpportunityId)?.title ?? rel.toOpportunityId;
  const verb = rel.relationship.replace(/-/g, " ");
  return `${from} ${verb} ${to}`;
}
