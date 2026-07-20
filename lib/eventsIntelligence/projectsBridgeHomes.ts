/**
 * Event → Project Home creation (heavy). Kept off the light projectsBridge
 * so registry / Continue paths do not pull homeActions at module init.
 */

import { createPersistedProjectHomeWithResult } from "@/lib/projectHomes/homeActions";
import { recommendProjectHome } from "@/lib/projectHomes/roomCatalog";
import { eventRecordToCanonicalWork } from "./projectsBridge";
import { upsertEventRecord } from "./eventRecordStore";
import type { EventRecord } from "./types";

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
    pieces: record.sections
      .filter(
        (s) =>
          s.content.trim() ||
          [
            "outcomes",
            "audience",
            "purpose",
            "dates",
            "venue",
            "budget",
            "agenda",
          ].includes(s.id),
      )
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
