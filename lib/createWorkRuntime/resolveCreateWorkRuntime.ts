import {
  peekRegistryWorkspaceEntry,
  type ActiveWorkspaceEntry,
} from "@/lib/activeWorkspaceRegistry";
import {
  resolveDurableSavePipeline,
  type SavePipelineInput,
} from "@/lib/creationDurable/savePipeline";
import type { CreateWorkflowState } from "@/lib/createWorkflow";
import {
  getWorkTypeSchema,
  getWorkTypeSchemaForCreateLabel,
  resolveWorkTypeIdFromLabel,
} from "@/lib/workTypeSchema/registry";
import { coalesceWorkflowWorkId } from "@/lib/universalWorkEngine";
import { resolvedTypeLabel } from "@/lib/createWorkflow";
import type { CreateWorkRuntimeContext } from "./types";

export type ResolveCreateWorkRuntimeInput = {
  workflow: CreateWorkflowState;
  workId?: string | null;
  save?: SavePipelineInput;
  registryEntry?: ActiveWorkspaceEntry | null;
};

/**
 * Build the shared Create runtime context from the existing authoritative stores.
 * CreateWorkflowState remains the section/content owner; registry owns Continue;
 * creationDurable owns save truth. Work identity coalesces through UWE.
 */
export function resolveCreateWorkRuntime(
  input: ResolveCreateWorkRuntimeInput,
): CreateWorkRuntimeContext {
  const typeLabel =
    resolvedTypeLabel(input.workflow) ||
    input.workflow.selectedTypeLabel ||
    "";
  const workTypeId =
    resolveWorkTypeIdFromLabel(typeLabel) ||
    (input.workflow.creationWorkspaceKind === "event" ? "event_plan" : null);
  const workId =
    coalesceWorkflowWorkId({
      workId: input.workId,
      sessionId: input.workflow.sessionId,
      eventRecordId: input.workflow.eventRecordId,
      workTypeId,
    }) ?? "";

  const schema =
    getWorkTypeSchema(workTypeId) ||
    getWorkTypeSchemaForCreateLabel(typeLabel);

  const registryEntry =
    input.registryEntry !== undefined
      ? input.registryEntry
      : workId
        ? peekRegistryWorkspaceEntry(workId)
        : null;

  const save = resolveDurableSavePipeline(input.save ?? {});
  const hasDraft = Boolean(input.workflow.draftContent?.trim());

  return {
    workId,
    workTypeId: schema?.workTypeId ?? workTypeId,
    schema,
    workflow: input.workflow,
    activeSectionId: input.workflow.activeSectionId ?? null,
    registryEntry,
    saveState: save.state,
    savePipeline: save.pipeline,
    saveLabel: save.label,
    permissions: {
      canSave: Boolean(workId),
      canArchive: Boolean(workId),
      canTrash: Boolean(workId),
      canExport: hasDraft,
    },
    timestamps: {
      createdAt: registryEntry?.createdAt ?? null,
      updatedAt: registryEntry?.lastActivityAt ?? null,
    },
  };
}
