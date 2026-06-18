/**
 * Persist the shared Create workflow record — survives close, switch, refresh.
 */

import { isCreatePersistencePaused } from "./createPersistencePause";
import {
  shouldPersistWorkflowRecord,
} from "./createWorkflowRecord";
import type { CreateWorkflowRecord } from "./createWorkflowRecord";
import { emptyWorkflowRecord } from "./createWorkflowRecord";

const RECORD_KEY = "companion-create-workflow-record-v1";
const SAVED_FOR_LATER_KEY = "companion-create-workflow-saved-v1";

export function saveWorkflowRecord(record: CreateWorkflowRecord): void {
  if (typeof window === "undefined") return;
  if (isCreatePersistencePaused()) return;
  if (!shouldPersistWorkflowRecord(record)) {
    clearWorkflowRecord();
    return;
  }
  try {
    localStorage.setItem(RECORD_KEY, JSON.stringify(record));
  } catch {
    /* noop */
  }
}

export function loadWorkflowRecord(): CreateWorkflowRecord | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(RECORD_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CreateWorkflowRecord;
    if (!parsed?.workflowId || !parsed.workflowState) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function clearWorkflowRecord(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(RECORD_KEY);
  } catch {
    /* noop */
  }
}

export function hasWorkflowRecord(): boolean {
  return loadWorkflowRecord() !== null;
}

/** Save For Later — explicit bookmark only (not active auto-restore). */
export function saveWorkflowRecordForLater(record: CreateWorkflowRecord): void {
  if (typeof window === "undefined") return;
  if (!shouldPersistWorkflowRecord(record)) return;
  try {
    localStorage.setItem(SAVED_FOR_LATER_KEY, JSON.stringify(record));
  } catch {
    /* noop */
  }
}

export function loadSavedWorkflowRecord(): CreateWorkflowRecord | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(SAVED_FOR_LATER_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CreateWorkflowRecord;
    if (!parsed?.workflowId || !parsed.workflowState) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function clearSavedWorkflowRecord(): void {
  clearWorkflowRecord();
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(SAVED_FOR_LATER_KEY);
  } catch {
    /* noop */
  }
}

export function ensureWorkflowRecord(
  existing?: CreateWorkflowRecord | null,
): CreateWorkflowRecord {
  return existing ?? loadWorkflowRecord() ?? emptyWorkflowRecord();
}
