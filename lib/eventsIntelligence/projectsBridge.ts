/**
 * Events Intelligence ↔ Projects (light).
 * Project Home creation lives in projectsBridgeHomes.ts.
 */

import {
  upsertCanonicalWorkRecord,
  type CanonicalWorkRecord,
} from "@/lib/createProjects/canonicalWorkRecord";
import type { EventRecord, EventTask } from "./types";
import { upsertEventRecord } from "./eventRecordStore";

export function eventRecordToCanonicalWork(
  record: EventRecord,
): CanonicalWorkRecord {
  return upsertCanonicalWorkRecord({
    id: record.canonicalWorkId ?? undefined,
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
  });
}

/** Sync section updates into Projects-linked canonical work (no duplicate tasks). */
export function syncEventRecordToProjects(record: EventRecord): EventRecord {
  const work = eventRecordToCanonicalWork(record);
  return upsertEventRecord({
    ...record,
    canonicalWorkId: work.id,
    projectHomeId: record.projectHomeId ?? work.projectHomeId ?? null,
    companionProjectId:
      record.companionProjectId ?? work.companionProjectId ?? null,
  });
}

/**
 * Add a confirmed task only — never auto-dump the full checklist.
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
