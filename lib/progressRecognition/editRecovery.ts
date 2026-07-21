/**
 * 101 — Edit and recovery for recognition (source Work stays intact).
 */

import type { AccomplishmentRecord, WinRecord } from "./contracts";
import {
  listAccomplishmentRecords,
  listWinRecords,
  removeAccomplishmentRecognition,
  removeWinRecognition,
  saveAccomplishmentRecord,
  saveWinRecord,
} from "./adapters";

function loadWin(winId: string): WinRecord | null {
  return listWinRecords().find((w) => w.winId === winId) ?? null;
}

function loadAcc(id: string): AccomplishmentRecord | null {
  return listAccomplishmentRecords().find((a) => a.accomplishmentId === id) ?? null;
}

/** Soft-remove — does not delete source Work / Project / Evidence. */
export function removeRecognition(
  kind: "win" | "accomplishment",
  id: string,
): void {
  if (kind === "win") removeWinRecognition(id);
  else removeAccomplishmentRecognition(id);
}

export function renameWin(winId: string, title: string): WinRecord | null {
  const existing = loadWin(winId);
  if (!existing) return null;
  removeWinRecognition(winId);
  const next = saveWinRecord({
    ...existing,
    winId,
    title: title.trim() || existing.title,
  });
  return "duplicateOf" in next ? next.duplicateOf : next;
}

export function renameAccomplishment(
  accomplishmentId: string,
  title: string,
): AccomplishmentRecord | null {
  const existing = loadAcc(accomplishmentId);
  if (!existing) return null;
  removeAccomplishmentRecognition(accomplishmentId);
  const next = saveAccomplishmentRecord({
    ...existing,
    accomplishmentId,
    title: title.trim() || existing.title,
  });
  return "duplicateOf" in next ? next.duplicateOf : next;
}

/** Convert win → accomplishment (removes win recognition index; source Work intact). */
export function convertWinToAccomplishment(
  winId: string,
): AccomplishmentRecord | { error: string } {
  const win = loadWin(winId);
  if (!win) return { error: "Win not found." };
  removeWinRecognition(winId);
  const acc = saveAccomplishmentRecord({
    title: win.title,
    description: win.description,
    sourceType: win.sourceType,
    sourceId: win.sourceId,
    projectId: win.projectId,
    workId: win.workId,
    goalIds: win.goalIds,
    whyItMattered: win.description,
    occurredAt: win.occurredAt,
  });
  if ("duplicateOf" in acc) return acc.duplicateOf;
  return acc;
}

/** Convert accomplishment → win. */
export function convertAccomplishmentToWin(
  accomplishmentId: string,
): WinRecord | { error: string } {
  const acc = loadAcc(accomplishmentId);
  if (!acc) return { error: "Accomplishment not found." };
  removeAccomplishmentRecognition(accomplishmentId);
  const win = saveWinRecord({
    title: acc.title,
    description: acc.description,
    significance: "significant",
    sourceType: acc.sourceType,
    sourceId: acc.sourceId,
    projectId: acc.projectId,
    workId: acc.workId,
    goalIds: acc.goalIds,
    occurredAt: acc.occurredAt,
  });
  if ("duplicateOf" in win) return win.duplicateOf;
  return win;
}

/**
 * Restore soft-removed recognition by clearing removedAt via re-save.
 * Caller supplies the prior snapshot (kept in UI / session).
 */
export function restoreWinRecognition(snapshot: WinRecord): WinRecord | { duplicateOf: WinRecord } {
  const { removedAt: _r, createdAt: _c, ...rest } = snapshot;
  return saveWinRecord({ ...rest, winId: snapshot.winId });
}

export function restoreAccomplishmentRecognition(
  snapshot: AccomplishmentRecord,
): AccomplishmentRecord | { duplicateOf: AccomplishmentRecord } {
  const { removedAt: _r, createdAt: _c, ...rest } = snapshot;
  return saveAccomplishmentRecord({
    ...rest,
    accomplishmentId: snapshot.accomplishmentId,
  });
}
