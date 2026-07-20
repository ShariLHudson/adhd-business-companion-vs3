import type { CreateWorkflowState } from "@/lib/createWorkflow";
import type { CreateWorkCommandDef } from "./types";
import { CREATE_WORK_COMMAND_ORDER } from "./types";

export function resolveCreateWorkCommands(input: {
  workflow: CreateWorkflowState;
  hasDraftText: boolean;
  canSave?: boolean;
}): CreateWorkCommandDef[] {
  const workspaceId =
    input.workflow.sessionId?.trim() ||
    input.workflow.eventRecordId?.trim() ||
    "";
  const hasId = Boolean(workspaceId);
  const hasDraft = input.hasDraftText;

  const byId: Record<string, Omit<CreateWorkCommandDef, "id">> = {
    save: {
      label: "Save",
      available: true,
      enabled: input.canSave !== false && hasId,
    },
    rename: {
      label: "Rename",
      available: true,
      enabled: hasId,
    },
    duplicate: {
      label: "Duplicate",
      available: true,
      enabled: hasId,
    },
    archive: {
      label: "Archive",
      available: true,
      enabled: hasId,
    },
    trash: {
      label: "Move to Trash",
      available: true,
      enabled: hasId,
    },
    print: {
      label: "Print",
      available: true,
      enabled: hasDraft,
    },
    export: {
      label: "Export",
      available: true,
      enabled: hasDraft,
    },
    share: {
      label: "Share",
      available: true,
      enabled: hasDraft,
    },
  };

  return CREATE_WORK_COMMAND_ORDER.map((id) => ({
    id,
    ...byId[id]!,
  }));
}
