/**
 * 051 — Project sync adapter (execution only; creation stays on Creation Record).
 */

import {
  syncEventRecordToProjects,
  type EventRecord,
} from "@/lib/eventsIntelligence";

export function syncCreationToProjects(record: EventRecord): {
  synced: boolean;
  projectHomeId: string | null;
  record: EventRecord;
} {
  const next = syncEventRecordToProjects(record);
  return {
    synced: Boolean(next.projectHomeId || next.canonicalWorkId),
    projectHomeId: next.projectHomeId,
    record: next,
  };
}
