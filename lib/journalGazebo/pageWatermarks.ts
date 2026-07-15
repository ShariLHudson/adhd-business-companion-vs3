/**
 * Soft watercolor topic marks for journal page corners.
 * Quiet variety — one mark per page, ~2", feathered, no frames.
 * Marks follow the journal intention (prayer, gratitude, health…).
 * Not Estate place photography.
 */

import {
  DEFAULT_JOURNAL_INTENTION,
  JOURNAL_INTENTION_WATERMARKS,
  resolveJournalIntention,
  type JournalIntentionId,
  type JournalIntentionWatermarkId,
} from "./journalIntentions";

export type JournalPageWatermarkId = JournalIntentionWatermarkId;

const WATERMARK_BASE = "/images/journal-gazebo/topic-watermarks";

/** Stable topic mark for a writing/ceremony page — rotates as pages turn. */
export function pageWatermarkIdForIndex(
  pageIndex: number,
  intention: JournalIntentionId = DEFAULT_JOURNAL_INTENTION,
): JournalPageWatermarkId {
  const set = JOURNAL_INTENTION_WATERMARKS[resolveJournalIntention(intention)];
  const index = Math.max(0, pageIndex) % set.length;
  return set[index]!;
}

export function pageWatermarkUrlForIndex(
  pageIndex: number,
  intention: JournalIntentionId = DEFAULT_JOURNAL_INTENTION,
): string {
  const id = pageWatermarkIdForIndex(pageIndex, intention);
  return pageWatermarkUrl(id);
}

export function pageWatermarkUrl(id: JournalPageWatermarkId): string {
  return `${WATERMARK_BASE}/${id}.png`;
}
