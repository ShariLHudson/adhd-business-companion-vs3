/**
 * 049 — What larger creation does this belong to?
 * Connect. Never duplicate. Never orphan.
 */

import {
  findCanonicalWorkByCreateWorkflow,
  findCanonicalWorkByProjectHome,
  getCanonicalWorkRecord,
  listCanonicalWorkRecords,
  type CanonicalWorkRecord,
} from "@/lib/createProjects/canonicalWorkRecord";
import {
  findEcosystemByCanonicalWork,
  findEcosystemByEventRecord,
  getCreationEcosystemRecord,
  listCreationEcosystemRecords,
  type CreationEcosystemRecord,
} from "@/lib/createAssets";
import {
  getActiveEventRecord,
  getEventRecord,
} from "@/lib/eventsIntelligence/eventRecordStore";
import type { EventRecord } from "@/lib/eventsIntelligence/types";

export type ResolvedCreationEcosystem = {
  creationId: string;
  title: string;
  creationType: string;
  canonicalWork: CanonicalWorkRecord | null;
  eventRecord: EventRecord | null;
  ecosystem: CreationEcosystemRecord | null;
  projectHomeId: string | null;
  blueprintId: string | null;
};

/**
 * Resolve the active / matching Creation Ecosystem for new work.
 */
export function resolveLargerCreation(hints: {
  creationId?: string | null;
  eventRecordId?: string | null;
  canonicalWorkId?: string | null;
  projectHomeId?: string | null;
  createWorkflowId?: string | null;
  ecosystemRecordId?: string | null;
  preferActiveEvent?: boolean;
}): ResolvedCreationEcosystem | null {
  if (hints.ecosystemRecordId) {
    const eco = getCreationEcosystemRecord(hints.ecosystemRecordId);
    if (eco) return fromEcosystem(eco);
  }

  if (hints.eventRecordId) {
    const event = getEventRecord(hints.eventRecordId);
    if (event) return fromEvent(event);
    const eco = findEcosystemByEventRecord(hints.eventRecordId);
    if (eco) return fromEcosystem(eco);
  }

  if (hints.preferActiveEvent !== false) {
    const active = getActiveEventRecord();
    if (active) return fromEvent(active);
  }

  if (hints.canonicalWorkId) {
    const work = getCanonicalWorkRecord(hints.canonicalWorkId);
    if (work) return fromCanonical(work);
    const eco = findEcosystemByCanonicalWork(hints.canonicalWorkId);
    if (eco) return fromEcosystem(eco);
  }

  if (hints.createWorkflowId) {
    const work = findCanonicalWorkByCreateWorkflow(hints.createWorkflowId);
    if (work) return fromCanonical(work);
  }

  if (hints.projectHomeId) {
    const work = findCanonicalWorkByProjectHome(hints.projectHomeId);
    if (work) return fromCanonical(work);
  }

  if (hints.creationId) {
    const work = getCanonicalWorkRecord(hints.creationId);
    if (work) return fromCanonical(work);
    const eco = getCreationEcosystemRecord(hints.creationId);
    if (eco) return fromEcosystem(eco);
    const event = getEventRecord(hints.creationId);
    if (event) return fromEvent(event);
  }

  // Most recent ecosystem / canonical work as last resort (never invent a second creation)
  const ecosystems = listCreationEcosystemRecords();
  if (ecosystems[0]) return fromEcosystem(ecosystems[0]);
  const works = listCanonicalWorkRecords();
  if (works[0]) return fromCanonical(works[0]);

  return null;
}

function fromEvent(event: EventRecord): ResolvedCreationEcosystem {
  const eco = findEcosystemByEventRecord(event.id);
  const work = event.canonicalWorkId
    ? getCanonicalWorkRecord(event.canonicalWorkId)
    : null;
  return {
    creationId: event.canonicalWorkId || event.id,
    title: event.title,
    creationType: event.eventTypeLabel || "Event",
    canonicalWork: work,
    eventRecord: event,
    ecosystem: eco,
    projectHomeId: event.projectHomeId,
    blueprintId: eco?.blueprintId ?? null,
  };
}

function fromEcosystem(eco: CreationEcosystemRecord): ResolvedCreationEcosystem {
  const event = eco.eventRecordId ? getEventRecord(eco.eventRecordId) : null;
  const work = eco.canonicalWorkId
    ? getCanonicalWorkRecord(eco.canonicalWorkId)
    : null;
  return {
    creationId: eco.canonicalWorkId || eco.eventRecordId || eco.id,
    title: eco.title,
    creationType: eco.blueprintId || "Creation",
    canonicalWork: work,
    eventRecord: event,
    ecosystem: eco,
    projectHomeId: eco.projectHomeId,
    blueprintId: eco.blueprintId,
  };
}

function fromCanonical(work: CanonicalWorkRecord): ResolvedCreationEcosystem {
  const eco = findEcosystemByCanonicalWork(work.id);
  const event = eco?.eventRecordId
    ? getEventRecord(eco.eventRecordId)
    : getActiveEventRecord()?.canonicalWorkId === work.id
      ? getActiveEventRecord()
      : null;
  return {
    creationId: work.id,
    title: work.title,
    creationType: work.workType,
    canonicalWork: work,
    eventRecord: event,
    ecosystem: eco,
    projectHomeId: work.projectHomeId ?? null,
    blueprintId: eco?.blueprintId ?? null,
  };
}

/** True when a similar asset already exists on this creation (do not duplicate). */
export function similarAssetAlreadyExists(
  creation: ResolvedCreationEcosystem,
  assetDefId: string,
): boolean {
  return Boolean(
    creation.ecosystem?.instances.some((i) => i.assetId === assetDefId),
  );
}
