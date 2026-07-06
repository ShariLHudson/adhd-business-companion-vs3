import type { AdvisoryRelationship } from "../types";
import { advisorySampleRepository } from "../repositories/sample";

export function listAdvisoryRelationships(): AdvisoryRelationship[] {
  return advisorySampleRepository.listRelationships();
}

export function relationshipsForTopic(topicId: string): AdvisoryRelationship[] {
  return listAdvisoryRelationships().filter((r) => r.topicId === topicId);
}

export function relationshipsForRef(kind: string, refId: string): AdvisoryRelationship[] {
  return listAdvisoryRelationships().filter(
    (r) => r.link.kind === kind && r.link.refId === refId,
  );
}
