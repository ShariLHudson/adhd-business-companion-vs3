/**
 * Workflow auto-restore state — separate from activity memory.
 * Activity memory (last draft, projects, topics) is kept for Today / "You were working on…"
 * but must not silently reopen Create. Restore only by explicit user consent.
 */

import { clearCreateSession } from "./createSessionStore";
import type { CreateSessionSnapshot } from "./createSessionStore";
import { toCreationContext } from "./workspaceCreation";
import {
  buildBriefFromRecord,
  shouldPersistWorkflowRecord,
  shouldAutoResumeWorkflowRecord,
  type CreateWorkflowRecord,
} from "./createWorkflowRecord";
import {
  clearWorkflowRecord,
  loadSavedWorkflowRecord,
  loadWorkflowRecord,
} from "./createWorkflowRecordStore";

export type ClearCreatePersistenceOptions = {
  /** Keep companion-create-workflow-saved-v1 (Save For Later bookmark). */
  preserveSavedForLater?: boolean;
};

/** Clear active workflow + create session (not activity memory). */
export function clearAllCreatePersistence(
  opts?: ClearCreatePersistenceOptions,
): void {
  if (typeof window === "undefined") return;
  clearWorkflowRecord();
  if (!opts?.preserveSavedForLater) {
    try {
      localStorage.removeItem("companion-create-workflow-saved-v1");
    } catch {
      /* noop */
    }
  }
  clearCreateSession();
}

/** Build a create-session snapshot from a stored workflow (explicit resume only). */
export function createSessionFromWorkflowRecord(
  record: CreateWorkflowRecord,
): CreateSessionSnapshot {
  const type = record.itemType ?? "content";
  const ctx = toCreationContext("content-generator", {
    itemType: type,
    title: "",
    draftContent: record.draftContent || undefined,
    brief: buildBriefFromRecord(record),
    stage: record.draftContent?.trim()
      ? "editing draft"
      : "discovery with Shari",
    source: "generated",
  });
  return {
    genSeed: {
      type,
      topic: type,
      brief: buildBriefFromRecord(record),
      draft: record.draftContent || undefined,
    },
    creationContext: {
      ...ctx,
      itemType: type,
      draftContent: record.draftContent || ctx.draftContent,
    },
    workspaceDetail: {
      view: "create",
      stage: record.draftContent?.trim() ? "Editing draft" : "Choosing content type",
    },
    updatedAt: new Date().toISOString(),
  };
}

/** Load workflow bookmark for explicit resume (saved-for-later, then active record). */
export function loadWorkflowRecordForExplicitResume(): CreateWorkflowRecord | null {
  const bookmark = loadSavedWorkflowRecord();
  if (bookmark && shouldPersistWorkflowRecord(bookmark)) return bookmark;
  const active = loadWorkflowRecord();
  if (active && shouldPersistWorkflowRecord(active)) return active;
  return null;
}

/** Simulates refresh + open Create — no silent draft restore from active storage. */
export function wouldSilentlyRestoreCreateDraft(): boolean {
  const record = loadWorkflowRecord();
  return shouldAutoResumeWorkflowRecord(record);
}

/** Saved-for-later bookmark exists but must not auto-open Create. */
export function hasSavedForLaterBookmark(): boolean {
  return loadSavedWorkflowRecord() !== null;
}

export {
  pauseCreatePersistence,
  resumeCreatePersistence,
  isCreatePersistencePaused,
} from "./createPersistencePause";

export {
  shouldPersistWorkflowRecord,
  shouldAutoResumeWorkflowRecord,
} from "./createWorkflowRecord";
