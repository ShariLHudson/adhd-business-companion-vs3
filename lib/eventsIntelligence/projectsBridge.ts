/**
 * Events Intelligence ↔ Projects (light).
 * Project Home creation lives in projectsBridgeHomes.ts.
 * Master Work identity + tasks/milestones are owned by the Universal Work Engine.
 */

import {
  upsertCanonicalWorkRecord,
  type CanonicalWorkRecord,
} from "@/lib/createProjects/canonicalWorkRecord";
import {
  resolveCanonicalWorkId,
  syncEventTasksIntoUniversalWork,
} from "@/lib/universalWorkEngine";
import type { EventRecord, EventTask } from "./types";
import { upsertEventRecord } from "./eventRecordStore";

function resolveEventMasterWorkId(record: EventRecord): string {
  return (
    resolveCanonicalWorkId(record.canonicalWorkId ?? record.id, {
      workTypeId: "event_plan",
      adoptIfMissing: true,
    }) ?? record.id
  );
}

export function eventRecordToCanonicalWork(
  record: EventRecord,
): CanonicalWorkRecord {
  const workId = resolveEventMasterWorkId(record);
  return upsertCanonicalWorkRecord({
    id: workId,
    title: record.title,
    workType: "Event Plan",
    purpose: record.purpose || record.outcomes,
    audience: record.audience,
    kind: record.projectHomeId ? "creation_with_project" : "creation",
    status: "planning",
    sections: record.sections.map((s) => ({
      id: s.id,
      title: s.title,
      content: s.content,
      skipped: s.status === "skipped",
    })),
    decisions: record.decisions
      .filter((d) => d.resolved)
      .map((d) => d.resolvedValue || d.decision),
    tasks: record.tasks
      .filter((t) => t.confirmed)
      .map((t) => ({ id: t.id, title: t.title, done: t.done })),
    milestones: record.milestones.map((m) => m.title),
    notes: record.dependencies,
    resources: [],
    projectHomeId: record.projectHomeId,
    companionProjectId: record.companionProjectId,
    conversationContext: record.conversationContext,
    createWorkflowId: record.id,
  });
}

/** Sync section updates into Projects-linked canonical work (no duplicate tasks). */
export function syncEventRecordToProjects(record: EventRecord): EventRecord {
  const work = eventRecordToCanonicalWork(record);
  const workId = work.id;
  syncEventTasksIntoUniversalWork({
    workId,
    tasks: record.tasks
      .filter((t) => t.confirmed)
      .map((t) => ({
        id: t.id,
        title: t.title,
        done: t.done,
        owner: t.owner,
        deadline: t.deadline,
        dependsOn: t.dependsOn,
        sectionId: t.sectionId,
      })),
    milestones: record.milestones.map((m) => ({
      id: m.id,
      title: m.title,
      due: m.due,
      done: m.done,
    })),
  });
  return upsertEventRecord({
    ...record,
    canonicalWorkId: workId,
    projectHomeId: record.projectHomeId ?? work.projectHomeId ?? null,
    companionProjectId:
      record.companionProjectId ?? work.companionProjectId ?? null,
  });
}

/**
 * Add a confirmed task only — never auto-dump the full checklist.
 * Event owns suggestion/confirmation; UWE owns the shared task store.
 */
export function addConfirmedEventTask(
  record: EventRecord,
  task: Omit<EventTask, "id" | "confirmed" | "done"> & {
    id?: string;
    done?: boolean;
  },
): EventRecord {
  const id =
    task.id ??
    `et-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
  const next: EventRecord = {
    ...record,
    tasks: [
      ...record.tasks.filter((t) => t.id !== id),
      {
        id,
        title: task.title,
        sectionId: task.sectionId,
        owner: task.owner,
        deadline: task.deadline,
        dependsOn: task.dependsOn,
        done: task.done ?? false,
        confirmed: true,
      },
    ],
  };
  return syncEventRecordToProjects(next);
}
