/**
 * Migrate existing Event/runtime local records into authoritative table.
 * Uses immutable Workspace ID — never creates duplicates.
 */

import {
  getRuntimeCreationRecord,
  ensureRuntimeCreationRecord,
} from "@/lib/currentFocus/creationRecord";
import type { CreateWorkflowState } from "@/lib/createWorkflow";
import { EMPTY_CREATE_WORKFLOW } from "@/lib/createWorkflow";
import { listEventRecords } from "@/lib/eventsIntelligence/eventRecordStore";
import { applyEventWorkspaceToCreateWorkflow } from "@/lib/eventCreationWorkspace";
import { persistCreationMutation } from "./mutate";
import { fetchAuthoritativeCreation } from "./repository";
import type { DurableMutationResult, AuthoritativeCreationRecord } from "./types";

export type MigrationResult = {
  attempted: number;
  migrated: number;
  skippedExisting: number;
  failed: number;
  errors: Array<{ workspaceId: string; errorCode: string }>;
};

/**
 * One-time / on-hydrate migration: LS Event + runtime → DB if missing.
 * If DB already has workspaceId, skip (no duplicates).
 */
export async function migrateLocalCreationsToAuthoritative(): Promise<MigrationResult> {
  const result: MigrationResult = {
    attempted: 0,
    migrated: 0,
    skippedExisting: 0,
    failed: 0,
    errors: [],
  };

  const events = listEventRecords();
  const ids = new Set<string>();
  for (const ev of events) {
    if (ev.id?.trim()) ids.add(ev.id.trim());
  }

  // Also scan runtime via known event ids (runtime alone may not be enumerable)
  for (const id of [...ids]) {
    result.attempted += 1;
    try {
      const existing = await fetchAuthoritativeCreation(id);
      if (existing) {
        result.skippedExisting += 1;
        continue;
      }
      const event = events.find((e) => e.id === id);
      const runtime = getRuntimeCreationRecord(id);
      let workflow: CreateWorkflowState = {
        ...EMPTY_CREATE_WORKFLOW,
        sessionId: id,
        eventRecordId: id,
        selectedTypeLabel: event?.eventTypeLabel || runtime?.typeLabel || "Creation",
        selectedTemplateName: event?.title || runtime?.title || "Creation",
        sectionContent: runtime?.sectionContent ?? {},
        draftContent: runtime?.draftContent ?? null,
        workspaceFirst: true,
        questionMode: "current_focus",
      };
      if (event) {
        workflow = applyEventWorkspaceToCreateWorkflow(workflow, event);
      }
      ensureRuntimeCreationRecord(workflow);
      const persisted = await persistCreationMutation({
        workflow,
        originalRequest: event?.purpose || event?.conversationContext || "",
        previous: null,
      });
      if (persisted.ok) {
        result.migrated += 1;
      } else {
        result.failed += 1;
        result.errors.push({
          workspaceId: id,
          errorCode: persisted.errorCode,
        });
      }
    } catch {
      result.failed += 1;
      result.errors.push({ workspaceId: id, errorCode: "MIGRATE_EXCEPTION" });
    }
  }

  return result;
}

export type { DurableMutationResult, AuthoritativeCreationRecord };
