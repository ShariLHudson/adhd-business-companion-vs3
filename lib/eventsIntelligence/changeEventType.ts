/**
 * P2 — Type change without creating a new Creation Record.
 * "This should be a webinar" updates subtype on the same Event Record.
 */

import { persistCreationContinuitySnapshot } from "@/lib/creationContinuity";
import { detectEventType } from "./detectEventIntent";
import { upsertEventRecord } from "./eventRecordStore";
import type { EventRecord, EventTypeId } from "./types";

function isTypeChangeRequest(userText: string): boolean {
  return /\b(?:should be|make it|change (?:it|this) to|actually|instead|this is)\b/i.test(
    userText,
  );
}

/**
 * Apply a member type-change request onto an existing Event Record.
 * Returns null when no type change is detected.
 */
export function applyEventTypeChangeRequest(
  record: EventRecord,
  userText: string,
): EventRecord | null {
  const t = userText.trim();
  if (!isTypeChangeRequest(t)) return null;

  const detected = detectEventType(t);
  if (!detected.eventType || detected.eventType === record.eventType) {
    return null;
  }

  // Avoid flipping to generic "custom"/"event" from soft language
  if (
    detected.eventType === "custom" &&
    !/\b(?:webinar|conference|workshop|retreat|summit|panel)\b/i.test(t)
  ) {
    return null;
  }

  const next = upsertEventRecord({
    ...record,
    eventType: detected.eventType as EventTypeId,
    eventTypeLabel: detected.eventTypeLabel,
    format:
      /\bonline\b|webinar\b/i.test(t) && record.format === "unspecified"
        ? "virtual"
        : record.format,
    conversationContext:
      `${record.conversationContext}\n— Type changed to ${detected.eventTypeLabel}`.slice(
        0,
        4000,
      ),
  });
  persistCreationContinuitySnapshot(next);
  return next;
}
