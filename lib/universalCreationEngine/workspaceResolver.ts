/**
 * 051 — Workspace resolution (048 Event Creation Workspace adapter).
 */

import { buildEventCreationWorkspace } from "@/lib/eventCreationWorkspace";
import type { EventCreationWorkspaceSnapshot } from "@/lib/eventCreationWorkspace/types";
import {
  getActiveEventRecord,
  getEventRecord,
  type EventRecord,
} from "@/lib/eventsIntelligence";
import type { CreationResolution } from "./types";

export type WorkspaceResolution = {
  workspaceKind: "event_creation" | "none";
  workspaceId: string | null;
  snapshot: EventCreationWorkspaceSnapshot | null;
  record: EventRecord | null;
};

export function resolveCreationWorkspace(
  resolution: CreationResolution,
): WorkspaceResolution {
  const record =
    (resolution.eventRecordId
      ? getEventRecord(resolution.eventRecordId)
      : null) ?? getActiveEventRecord();

  if (!record) {
    return {
      workspaceKind: "none",
      workspaceId: null,
      snapshot: null,
      record: null,
    };
  }

  const snapshot = buildEventCreationWorkspace(record);
  return {
    workspaceKind: "event_creation",
    workspaceId: record.id,
    snapshot,
    record,
  };
}
