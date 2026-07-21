/**
 * 051 Phase 6 stub — archive / reuse without corrupting the original.
 */

import type { EventRecord } from "@/lib/eventsIntelligence";

export type ArchiveReusePlan = {
  mode: "archive" | "reuse";
  sourceRecordId: string;
  /** Reuse creates a connected derivative — never mutates the original */
  derivativeTitle: string;
  preservesOriginal: true;
};

export function planArchiveOrReuse(input: {
  record: EventRecord;
  mode: "archive" | "reuse";
}): ArchiveReusePlan {
  return {
    mode: input.mode,
    sourceRecordId: input.record.id,
    derivativeTitle:
      input.mode === "reuse"
        ? `${input.record.title} (reuse)`
        : input.record.title,
    preservesOriginal: true,
  };
}
