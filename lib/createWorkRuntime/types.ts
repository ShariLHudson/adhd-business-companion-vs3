/**
 * Universal Create Work runtime context — one object shared UI consumes.
 * Authoritative fields live on CreateWorkflowState + registry + save pipeline;
 * this normalizes them without inventing a second model.
 */

import type { ActiveWorkspaceEntry } from "@/lib/activeWorkspaceRegistry";
import type { CreationSaveState } from "@/lib/creationDurable";
import type { DurableSavePipelineState } from "@/lib/creationDurable/savePipeline";
import type { CreateWorkflowState } from "@/lib/createWorkflow";
import type { WorkTypeSchema } from "@/lib/workTypeSchema";

export type CreateWorkRuntimeContext = {
  workId: string;
  workTypeId: string | null;
  schema: WorkTypeSchema | null;
  workflow: CreateWorkflowState;
  activeSectionId: string | null;
  registryEntry: ActiveWorkspaceEntry | null;
  saveState: CreationSaveState;
  savePipeline: DurableSavePipelineState;
  saveLabel: string;
  permissions: {
    canSave: boolean;
    canArchive: boolean;
    canTrash: boolean;
    canExport: boolean;
  };
  timestamps: {
    createdAt: string | null;
    updatedAt: string | null;
  };
};
