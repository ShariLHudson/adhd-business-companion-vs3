/**
 * After durable verify — update React/memory/registry caches only.
 * Never call this before DurableMutationResult ok:true.
 */

import { registerCreationDestinationWorkspace } from "@/lib/activeWorkspaceRegistry";
import type { CreateWorkflowState } from "@/lib/createWorkflow";
import {
  upsertRuntimeCreationRecord,
  type RuntimeCreationRecord,
} from "@/lib/currentFocus/creationRecord";
import { WORKSPACE_SCHEMA_VERSION } from "@/lib/currentFocus/canonicalFacts";
import type { WorkingMemoryFields } from "@/lib/currentFocus/workingMemory";
import type { AuthoritativeCreationRecord } from "./types";

export function authoritativeToRuntimeRecord(
  record: AuthoritativeCreationRecord
): RuntimeCreationRecord {
  const sections = record.payload.templateSections.map((s) => ({
    id: s.id,
    label: s.title,
  }));
  const now = record.updatedAt;
  return {
    id: record.workspaceId,
    typeLabel: record.creationType,
    title: record.title,
    sectionContent: { ...record.payload.answers },
    skippedSectionIds: Array.isArray(
      (record.payload.workflowSnapshot as { skippedSectionIds?: string[] } | null)
        ?.skippedSectionIds
    )
      ? [
          ...((record.payload.workflowSnapshot as { skippedSectionIds: string[] })
            .skippedSectionIds ?? []),
        ]
      : [],
    knownFacts: (() => {
      const seen = new Set<string>();
      const out: string[] = [];
      for (const v of Object.values(record.payload.knownFacts)) {
        if (typeof v !== "string" || !v.trim()) continue;
        const key = v.trim().toLowerCase();
        if (seen.has(key)) continue;
        seen.add(key);
        out.push(v.trim());
        if (out.length >= 24) break;
      }
      return out;
    })(),
    templateSections: sections,
    schemaVersion: record.payload.schemaVersion ?? WORKSPACE_SCHEMA_VERSION,
    focusSectionId: record.payload.currentFocusId,
    currentFocusTitle: null,
    selectedTemplateId: record.payload.schemaId,
    selectedTemplateName: record.title,
    creationWorkspaceKind: null,
    eventRecordId: record.eventRecordId,
    draftContent: record.payload.draft,
    originalRequest: record.originalRequest || null,
    workingIntent:
      (record.payload.workflowSnapshot as { workingIntent?: string } | null)
        ?.workingIntent ?? null,
    // SOP Build Journey Phase 2 — reads back whatever the write side put in
    // the snapshot bag. Absent on every record saved before this phase;
    // that is the hydrate-safety case the D5 gate required.
    workingMemory:
      (
        record.payload.workflowSnapshot as {
          workingMemory?: WorkingMemoryFields;
        } | null
      )?.workingMemory ?? null,
    // SOP Reasoning-First Migration Phase 2 — same hydrate-safety pattern.
    // Absent on every record saved before this phase, which correctly
    // means the discovery gate treats them as not-yet-started.
    discoveryAnswers:
      (
        record.payload.workflowSnapshot as {
          sopDiscoveryAnswers?: Record<string, string>;
        } | null
      )?.sopDiscoveryAnswers ?? null,
    skippedDiscoveryIds:
      (
        record.payload.workflowSnapshot as {
          sopSkippedDiscoveryIds?: string[];
        } | null
      )?.sopSkippedDiscoveryIds ?? null,
    // Conversational Create Entrance (2026-08-06) — same hydrate-safety
    // pattern; absent on every record saved before this phase.
    entrySupportChoice:
      (
        record.payload.workflowSnapshot as {
          entrySupportChoice?: "guided" | "independent" | null;
        } | null
      )?.entrySupportChoice ?? null,
    createdAt: record.createdAt,
    updatedAt: now,
  };
}

export function mergeAuthoritativeIntoWorkflow(
  workflow: CreateWorkflowState,
  record: AuthoritativeCreationRecord
): CreateWorkflowState {
  const snap = record.payload.workflowSnapshot as Record<string, unknown> | null;
  const draft = record.payload.draft;
  return {
    ...workflow,
    sessionId: record.workspaceId,
    eventRecordId: record.eventRecordId ?? workflow.eventRecordId,
    // projectHomeId lives on registry / Event — not on CreateWorkflowState
    selectedTypeLabel: record.creationType || workflow.selectedTypeLabel,
    selectedTemplateName: record.title || workflow.selectedTemplateName,
    selectedTemplateId: record.payload.schemaId ?? workflow.selectedTemplateId,
    originalRequest:
      record.originalRequest || workflow.originalRequest || null,
    workingIntent:
      (snap?.workingIntent as string | undefined) ||
      workflow.workingIntent ||
      null,
    templateSections: record.payload.templateSections.map((s) => ({
      id: s.id,
      label: s.title,
    })),
    sectionContent: { ...record.payload.answers },
    skippedSectionIds:
      (snap?.skippedSectionIds as string[] | undefined) ??
      workflow.skippedSectionIds ??
      [],
    draftContent: draft,
    draftStatus: draft?.trim()
      ? "ready"
      : workflow.draftStatus === "building"
        ? "building"
        : workflow.draftStatus,
    workspacePhaseLabel: draft?.trim()
      ? "Draft ready"
      : (snap?.workspacePhaseLabel as string | undefined) ??
        workflow.workspacePhaseLabel,
    questionMode: "current_focus",
    workspaceKnownFacts: (() => {
      const seen = new Set<string>();
      const out: string[] = [];
      for (const v of Object.values(record.payload.knownFacts)) {
        if (typeof v !== "string" || !v.trim()) continue;
        const key = v.trim().toLowerCase();
        if (seen.has(key)) continue;
        seen.add(key);
        out.push(v.trim());
        if (out.length >= 24) break;
      }
      return out;
    })(),
  };
}

/** Sync verified record into runtime memory + registry (optional LS via those layers). */
export function applyVerifiedCreationToCaches(
  record: AuthoritativeCreationRecord,
  workflow?: CreateWorkflowState | null
): CreateWorkflowState | null {
  const runtime = authoritativeToRuntimeRecord(record);
  upsertRuntimeCreationRecord(runtime);
  if (!workflow) return null;
  const merged = mergeAuthoritativeIntoWorkflow(workflow, record);
  registerCreationDestinationWorkspace(merged, {
    projectHomeId: record.projectHomeId,
  });
  return merged;
}
