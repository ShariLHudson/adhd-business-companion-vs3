/**
 * Events Intelligence ↔ Projects
 * Events owns the experience and ops map; Projects carries execution forward.
 */

import {
  upsertCanonicalWorkRecord,
  type CanonicalWorkRecord,
} from "@/lib/createProjects/canonicalWorkRecord";
import { createPersistedProjectHomeWithResult } from "@/lib/projectHomes/homeActions";
import { recommendProjectHome } from "@/lib/projectHomes/roomCatalog";
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

/**
 * Create or reuse a Project Home for this event early in planning.
 * Does not invent tasks — only links the shared record.
 */
export function connectEventRecordToProjectHome(record: EventRecord): {
  record: EventRecord;
  projectHomeId: string | null;
  created: boolean;
  error?: string;
} {
  if (record.projectHomeId) {
    const work = eventRecordToCanonicalWork(record);
    return {
      record: upsertEventRecord({
        ...record,
        canonicalWorkId: work.id,
      }),
      projectHomeId: record.projectHomeId,
      created: false,
    };
  }

  const hint = `${record.title} ${record.eventTypeLabel} ${record.purpose} ${record.outcomes} retreat event workshop`;
  const roomId = recommendProjectHome(hint).roomId;
  const result = createPersistedProjectHomeWithResult({
    name: record.title || `${record.eventTypeLabel} Event`,
    purpose:
      record.purpose ||
      record.outcomes ||
      `Plan and deliver this ${record.eventTypeLabel.toLowerCase()}.`,
    projectHomeId: roomId,
    currentFocus: record.nextAction || "Shape the event outcome",
    nextSuggestedStep: record.nextAction || "Confirm the primary outcome",
    // Seed from the Event Creation Workspace map — never ask the member to invent "pieces"
    pieces: record.sections
      .filter((s) => s.content.trim() || ["outcomes", "audience", "purpose", "dates", "venue", "budget", "agenda"].includes(s.id))
      .map((s) => s.title)
      .slice(0, 12),
  });

  if (!result.persisted || !result.home) {
    return {
      record,
      projectHomeId: null,
      created: false,
      error: result.error ?? "Could not create Project Home",
    };
  }

  const withHome: EventRecord = {
    ...record,
    projectHomeId: result.home.id,
    companionProjectId: result.home.companionProjectId ?? result.home.id,
  };
  const work = eventRecordToCanonicalWork(withHome);
  const saved = upsertEventRecord({
    ...withHome,
    canonicalWorkId: work.id,
  });

  return {
    record: saved,
    projectHomeId: result.home.id,
    created: true,
  };
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
