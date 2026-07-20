import type { CreateWorkflowState } from "@/lib/createWorkflow";
import type { CreateWorkCommandDef, CreateWorkCommandId } from "./types";
import {
  CREATE_WORK_COMMAND_CATALOG,
  CREATE_WORK_COMMAND_ORDER,
} from "./types";

export function resolveCreateWorkCommands(input: {
  workflow: CreateWorkflowState;
  hasDraftText: boolean;
  canSave?: boolean;
  workId?: string | null;
  sectionId?: string | null;
  /** When true, include section + restore/delete commands (full catalog). */
  fullCatalog?: boolean;
}): CreateWorkCommandDef[] {
  const workspaceId =
    input.workId?.trim() ||
    input.workflow.sessionId?.trim() ||
    input.workflow.eventRecordId?.trim() ||
    "";
  const hasId = Boolean(workspaceId);
  const hasDraft = input.hasDraftText;
  const sectionId = input.sectionId?.trim() || "";
  const hasSection = Boolean(sectionId);
  const completed = new Set(input.workflow.completedSectionIds ?? []);
  const isComplete = hasSection && completed.has(sectionId);

  const byId: Record<
    CreateWorkCommandId,
    Omit<CreateWorkCommandDef, "id">
  > = {
    save: {
      label: "Save",
      available: true,
      enabled: input.canSave !== false && hasId,
      disabledReason: !hasId
        ? "No Work ID yet."
        : input.canSave === false
          ? "Nothing to save right now."
          : undefined,
    },
    rename: {
      label: "Rename",
      available: true,
      enabled: hasId,
      disabledReason: hasId ? undefined : "No Work ID yet.",
    },
    duplicate: {
      label: "Duplicate",
      available: true,
      enabled: hasId,
      disabledReason: hasId ? undefined : "No Work ID yet.",
    },
    archive: {
      label: "Archive",
      available: true,
      enabled: hasId,
      disabledReason: hasId ? undefined : "No Work ID yet.",
    },
    restore: {
      label: "Restore",
      available: true,
      enabled: hasId,
      disabledReason: hasId ? undefined : "No Work ID yet.",
    },
    trash: {
      label: "Move to Trash",
      available: true,
      enabled: hasId,
      disabledReason: hasId ? undefined : "No Work ID yet.",
    },
    permanently_delete: {
      label: "Delete permanently",
      available: true,
      enabled: hasId,
      disabledReason: hasId ? undefined : "No Work ID yet.",
    },
    print: {
      label: "Print",
      available: true,
      enabled: hasDraft,
      disabledReason: hasDraft ? undefined : "Build a draft first.",
    },
    export: {
      label: "Export",
      available: true,
      enabled: hasDraft,
      disabledReason: hasDraft ? undefined : "Build a draft first.",
    },
    share: {
      label: "Share",
      available: true,
      enabled: hasDraft,
      disabledReason: hasDraft ? undefined : "Build a draft first.",
    },
    complete_for_now: {
      label: "Complete for Now",
      available: true,
      enabled: hasSection && !isComplete,
      disabledReason: !hasSection
        ? "Choose a section first."
        : "Already complete for now.",
    },
    reopen: {
      label: "Reopen",
      available: true,
      enabled: hasSection && isComplete,
      disabledReason: !hasSection
        ? "Choose a section first."
        : "Section isn’t complete for now.",
    },
    skip_for_now: {
      label: "Skip for Now",
      available: true,
      enabled: hasSection,
      disabledReason: hasSection ? undefined : "Choose a section first.",
    },
    move_to_project: {
      label: "Move to Project",
      available: true,
      enabled: false,
      disabledReason: "Move to Project isn’t available for this work yet.",
    },
  };

  const order = input.fullCatalog
    ? CREATE_WORK_COMMAND_CATALOG
    : CREATE_WORK_COMMAND_ORDER;

  return order.map((id) => ({
    id,
    ...byId[id]!,
  }));
}
