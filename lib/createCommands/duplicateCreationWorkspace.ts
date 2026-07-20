/**
 * 084 — Duplicate creates a new Work ID; never overwrites current work.
 */

import type { CreateWorkflowState } from "@/lib/createWorkflow";
import { ensureRuntimeCreationRecord } from "@/lib/currentFocus/creationRecord";
import { registerCreationDestinationWorkspace } from "@/lib/activeWorkspaceRegistry";

function newWorkspaceId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `ws-${crypto.randomUUID()}`;
  }
  return `ws-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function duplicateCreationWorkspace(
  workflow: CreateWorkflowState,
): CreateWorkflowState {
  const nextId = newWorkspaceId();
  const titleBase =
    workflow.selectedTemplateName?.trim() ||
    workflow.selectedTypeLabel?.trim() ||
    "Creation";
  const next: CreateWorkflowState = {
    ...workflow,
    sessionId: nextId,
    eventRecordId:
      workflow.creationWorkspaceKind === "event" ? nextId : workflow.eventRecordId,
    selectedTemplateName: `${titleBase} (copy)`,
    // Fresh identity — keep content, new Work ID
  };
  ensureRuntimeCreationRecord(next);
  registerCreationDestinationWorkspace(next);
  return next;
}
