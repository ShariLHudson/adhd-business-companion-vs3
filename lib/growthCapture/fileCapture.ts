/**
 * File a universal capture into exactly one primary database.
 */

import { createEvidenceEntry, EMPTY_EVIDENCE_DRAFT } from "@/lib/evidenceBankStore";
import { createJournalEntry } from "@/lib/growthJournalStore";
import { createPortfolioEntry } from "@/lib/growthPortfolioStore";
import { getGrowthCaptureById, markCaptureFiled } from "./growthCaptureStore";
import type { GrowthPrimaryDestination } from "./types";

export type FileCaptureResult = {
  ok: boolean;
  recordId?: string;
  destination: GrowthPrimaryDestination;
  error?: string;
};

export function fileCaptureToDestination(
  captureId: string,
  destination: GrowthPrimaryDestination,
): FileCaptureResult {
  const capture = getGrowthCaptureById(captureId);
  if (!capture) {
    return { ok: false, destination, error: "Capture not found." };
  }
  if (!capture.body.trim() && capture.attachments.length === 0) {
    return { ok: false, destination, error: "Nothing to save." };
  }

  if (destination === "uncategorized") {
    markCaptureFiled(captureId, "uncategorized", captureId);
    return { ok: true, recordId: captureId, destination };
  }

  const lineage = {
    originatedFromId: capture.id,
    originatedFromKind: "capture-session" as const,
  };

  if (destination === "evidence-bank") {
    const entry = createEvidenceEntry({
      ...EMPTY_EVIDENCE_DRAFT,
      whatHappened: capture.body.trim() || "(See attachments)",
      attachments: [...capture.attachments],
      ...lineage,
    });
    markCaptureFiled(captureId, "evidence-bank", entry.id);
    return { ok: true, recordId: entry.id, destination };
  }

  if (destination === "journal") {
    const { entry, ok } = createJournalEntry({
      body: capture.body.trim() || "(See attachments)",
      attachments: [...capture.attachments],
      ...lineage,
    });
    if (!ok || !entry) {
      return { ok: false, destination, error: "Could not save to journal." };
    }
    markCaptureFiled(captureId, "journal", entry.id);
    return { ok: true, recordId: entry.id, destination };
  }

  if (destination === "portfolio") {
    const entry = createPortfolioEntry({
      title: capture.body.trim().slice(0, 80) || "Untitled work",
      description: capture.body.trim(),
      attachments: [...capture.attachments],
      ...lineage,
    });
    markCaptureFiled(captureId, "portfolio", entry.id);
    return { ok: true, recordId: entry.id, destination };
  }

  return { ok: false, destination, error: "Unknown destination." };
}
