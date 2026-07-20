/**
 * Hydrate Active Workspace Registry + runtime from authoritative DB.
 * LocalStorage is optional cache refresh only.
 */

import {
  setLastActiveWorkspaceId,
  upsertActiveWorkspace,
} from "@/lib/activeWorkspaceRegistry";
import { resolveCanonicalWorkspaceStatus } from "@/lib/activeWorkspaceRegistry/canonicalStatus";
import type { ActiveWorkspaceEntry } from "@/lib/activeWorkspaceRegistry/types";
import { applyVerifiedCreationToCaches } from "./applyVerified";
import { writeOptionalCreationCache } from "./optionalCache";
import { listAuthoritativeCreations } from "./repository";
import type { AuthoritativeCreationRecord } from "./types";
import { markWorkspaceAuthoritativelyDurable } from "./verifiedRegistry";

export type CreationDurableHydrationResult = {
  ok: boolean;
  count: number;
  workspaceIds: string[];
  lastActiveId: string | null;
  errorCode?: string;
  message?: string;
};

function entryFromAuthoritative(
  record: AuthoritativeCreationRecord
): ActiveWorkspaceEntry {
  const draft = record.payload.draft?.trim() || null;
  const draftState = draft ? "ready" : "none";
  const progressLabel = draft
    ? "Draft ready for review"
    : record.payload.progress.answeredCount > 0
      ? `${record.payload.progress.answeredCount} of ${record.payload.progress.totalFocusCount} answered`
      : "In progress";
  const status = resolveCanonicalWorkspaceStatus({
    draftState,
    progressLabel,
    hasDraft: Boolean(draft),
    draftContent: draft,
    workspacePhaseLabel: draft ? "Draft ready" : "Shaping",
  });
  return {
    workspaceId: record.workspaceId,
    creationType: record.creationType,
    title: record.title,
    currentFocusTitle: null,
    currentFocusId: record.payload.currentFocusId
      ? `section:${record.payload.currentFocusId}`
      : null,
    progressLabel:
      status === "Draft Ready" ? "Draft ready for review" : progressLabel,
    lastActivityAt: record.updatedAt,
    draftState,
    hasDraft: Boolean(draft),
    resumeTarget: "estate-create",
    runtimeCreationRecordId: record.workspaceId,
    eventRecordId: record.eventRecordId,
    projectHomeId: record.projectHomeId,
    sessionId: record.workspaceId,
    status: record.status === "archived" ? "archived" : "active",
    createdAt: record.createdAt,
  };
}

/**
 * Authenticate → query DB → hydrate registry + runtime → optional cache.
 */
export async function hydrateCreationWorkspacesFromDurable(): Promise<CreationDurableHydrationResult> {
  try {
    const rows = await listAuthoritativeCreations();
    if (rows.length === 0) {
      return { ok: true, count: 0, workspaceIds: [], lastActiveId: null };
    }

    let lastActiveId: string | null = null;
    let latestMs = 0;
    for (const record of rows) {
      markWorkspaceAuthoritativelyDurable(
        record.workspaceId,
        record.version,
        record.updatedAt
      );
      applyVerifiedCreationToCaches(record, null);
      upsertActiveWorkspace(entryFromAuthoritative(record));
      writeOptionalCreationCache(record);
      const ms = new Date(record.updatedAt).getTime();
      if (ms >= latestMs) {
        latestMs = ms;
        lastActiveId = record.workspaceId;
      }
    }
    if (lastActiveId) {
      setLastActiveWorkspaceId(lastActiveId);
    }
    return {
      ok: true,
      count: rows.length,
      workspaceIds: rows.map((r) => r.workspaceId),
      lastActiveId,
    };
  } catch {
    return {
      ok: false,
      count: 0,
      workspaceIds: [],
      lastActiveId: null,
      errorCode: "HYDRATE_FAILED",
      message: "I couldn't reload your saved work yet. Try refreshing once you're signed in.",
    };
  }
}
