/**
 * Persist generated Create drafts to Saved Work immediately on build.
 */

import {
  emptySavedArtifact,
  recordAfterSavedWorkSave,
  type SavedArtifactRecord,
} from "./savedArtifact";
import {
  createSavedWork,
  persistSavedWorkDurable,
  updateSavedWork,
  type SavedWorkItem,
} from "./savedWorkStore";
import type { DurableRecordResult } from "./durableRecords";

export function buildDraftSavedAnnouncement(record: SavedArtifactRecord): string {
  const loc = record.savedLocationDetail || record.savedLocation;
  return (
    `Your **${record.artifactType}** draft is ready — **${record.artifactTitle}**.\n\n` +
    `**Saved to:** ${loc}\n\n` +
    `Find it anytime in **My Work**. You can close this panel and reopen it from there.`
  );
}

export function persistGeneratedDraft(opts: {
  draft: string;
  artifactType: string;
  title: string;
  existingSavedWorkId?: string | null;
  prevArtifact?: SavedArtifactRecord | null;
}): { item: SavedWorkItem; record: SavedArtifactRecord } {
  const body = opts.draft.trim();
  const artifactType = opts.artifactType.trim() || "Draft";
  const title = opts.title.trim() || artifactType;
  const existingId = opts.existingSavedWorkId?.trim();

  let item: SavedWorkItem;
  if (existingId) {
    item =
      updateSavedWork(existingId, {
        title,
        body,
        artifactType,
        status: "saved",
      }) ??
      createSavedWork({
        title,
        artifactType,
        body,
        status: "saved",
        sourceWorkspace: "content-generator",
      });
  } else {
    item = createSavedWork({
      title,
      artifactType,
      body,
      status: "saved",
      sourceWorkspace: "content-generator",
    });
  }

  const record = recordAfterSavedWorkSave(
    opts.prevArtifact ?? emptySavedArtifact(artifactType, title),
    artifactType,
    title,
    item.id,
    body,
  );

  return { item, record };
}

/**
 * Durable variant: performs the same local recovery write, then attempts a
 * verified durable save and returns the receipt. Member-facing copy is
 * unchanged (buildDraftSavedAnnouncement stays as-is); the truthful receipt is
 * returned so Blocker 2 can gate the "saved" announcement on it later.
 */
export async function persistGeneratedDraftDurable(opts: {
  draft: string;
  artifactType: string;
  title: string;
  existingSavedWorkId?: string | null;
  prevArtifact?: SavedArtifactRecord | null;
}): Promise<{
  item: SavedWorkItem;
  record: SavedArtifactRecord;
  receipt: DurableRecordResult<SavedWorkItem>;
}> {
  const { item, record } = persistGeneratedDraft(opts);
  const receipt = await persistSavedWorkDurable(item);
  return { item, record, receipt };
}
