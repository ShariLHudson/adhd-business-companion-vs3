/**
 * 084 — Duplicate creates a new Work ID; never overwrites current work.
 */

import type { CreateWorkflowState } from "@/lib/createWorkflow";
import { ensureRuntimeCreationRecord } from "@/lib/currentFocus/creationRecord";
import { registerCreationDestinationWorkspace } from "@/lib/activeWorkspaceRegistry";
import { allocateCanonicalWorkId } from "@/lib/universalWorkEngine";

export function duplicateCreationWorkspace(
  workflow: CreateWorkflowState,
): CreateWorkflowState {
  const nextId = allocateCanonicalWorkId({ origin: "duplicate" });
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
