/**
 * Sole Create command dispatcher (084).
 * UI surfaces resolve + dispatch here — they do not implement archive/delete/rename themselves.
 */

import {
  archiveActiveWorkspace,
  moveActiveWorkspaceToTrash,
  permanentlyDeleteActiveWorkspace,
  renameActiveWorkspaceTitle,
  restoreActiveWorkspace,
} from "@/lib/activeWorkspaceRegistry";
import {
  applySectionLifecycleTransition,
  type CreateSectionLifecycleTransition,
} from "@/lib/createSectionLifecycle";
import type { CreateWorkflowState } from "@/lib/createWorkflow";
import { coalesceWorkflowWorkId } from "@/lib/universalWorkEngine";
import { duplicateCreationWorkspace } from "./duplicateCreationWorkspace";
import { resolveCreateWorkCommands } from "./resolveCreateWorkCommands";
import type { CreateWorkCommandId } from "./types";

export type DispatchCreateWorkCommandInput = {
  commandId: CreateWorkCommandId;
  workflow: CreateWorkflowState;
  workId?: string | null;
  sectionId?: string | null;
  /** Required for rename. */
  newTitle?: string;
  hasDraftText?: boolean;
  canSave?: boolean;
  /** Optional durable/parent overrides. */
  onSave?: () => void | Promise<void>;
  onArchive?: (workId: string) => void;
  onTrash?: (workId: string) => void;
  onPermanentDelete?: (workId: string) => void;
  onExportSurface?: (kind: "print" | "export" | "share") => void;
  confirmDestructive?: boolean;
};

export type DispatchCreateWorkCommandResult = {
  ok: boolean;
  disabledReason?: string;
  workflow: CreateWorkflowState;
  workId: string;
  message?: string;
  requiresConfirmation?: boolean;
  openExport?: "print" | "export" | "share";
};

function resolveWorkId(
  workflow: CreateWorkflowState,
  explicit?: string | null,
): string {
  return (
    coalesceWorkflowWorkId({
      workId: explicit,
      sessionId: workflow.sessionId,
      eventRecordId: workflow.eventRecordId,
    }) ||
    explicit?.trim() ||
    workflow.sessionId?.trim() ||
    workflow.eventRecordId?.trim() ||
    ""
  );
}

function sectionTransition(
  commandId: CreateWorkCommandId,
): CreateSectionLifecycleTransition | null {
  switch (commandId) {
    case "complete_for_now":
      return { type: "complete_for_now" };
    case "reopen":
      return { type: "reopen" };
    case "skip_for_now":
      return { type: "skip_for_now" };
    default:
      return null;
  }
}

export function dispatchCreateWorkCommand(
  input: DispatchCreateWorkCommandInput,
): DispatchCreateWorkCommandResult {
  const workId = resolveWorkId(input.workflow, input.workId);
  const commands = resolveCreateWorkCommands({
    workflow: input.workflow,
    hasDraftText: Boolean(
      input.hasDraftText ?? input.workflow.draftContent?.trim(),
    ),
    canSave: input.canSave,
    workId,
    sectionId: input.sectionId,
    // Dispatcher always resolves the full catalog; toolbars may show a subset.
    fullCatalog: true,
  });
  const def = commands.find((c) => c.id === input.commandId);
  if (!def?.available) {
    return {
      ok: false,
      disabledReason: "That action isn’t available here.",
      workflow: input.workflow,
      workId,
    };
  }
  if (!def.enabled) {
    return {
      ok: false,
      disabledReason: def.disabledReason ?? "That action isn’t ready yet.",
      workflow: input.workflow,
      workId,
    };
  }

  const sectionId = input.sectionId?.trim() || "";
  const transition = sectionTransition(input.commandId);
  if (transition) {
    if (!sectionId) {
      return {
        ok: false,
        disabledReason: "Choose a section first.",
        workflow: input.workflow,
        workId,
      };
    }
    return {
      ok: true,
      workflow: applySectionLifecycleTransition(
        input.workflow,
        sectionId,
        transition,
      ),
      workId,
      message:
        input.commandId === "complete_for_now"
          ? "Marked complete for now — you can reopen anytime."
          : input.commandId === "reopen"
            ? "Reopened — your earlier version is still here."
            : "Skipped for now — content kept.",
    };
  }

  switch (input.commandId) {
    case "save":
      void input.onSave?.();
      return {
        ok: true,
        workflow: input.workflow,
        workId,
        message: input.onSave
          ? "Saving…"
          : "Use Save in Current Focus — that’s the durable path.",
      };

    case "rename": {
      const title = input.newTitle?.trim();
      if (!title) {
        return {
          ok: false,
          disabledReason: "Enter a name first.",
          workflow: input.workflow,
          workId,
        };
      }
      if (workId) renameActiveWorkspaceTitle(workId, title);
      return {
        ok: true,
        workflow: {
          ...input.workflow,
          selectedTemplateName: title,
        },
        workId,
        message: "Renamed.",
      };
    }

    case "duplicate": {
      const copy = duplicateCreationWorkspace(input.workflow);
      return {
        ok: true,
        workflow: copy,
        workId: copy.sessionId?.trim() || workId,
        message: "Duplicated with a new Work ID.",
      };
    }

    case "archive":
      if (workId) {
        if (input.onArchive) input.onArchive(workId);
        else archiveActiveWorkspace(workId);
      }
      return {
        ok: true,
        workflow: input.workflow,
        workId,
        message: "Archived — restore anytime from Recently removed.",
      };

    case "trash":
      if (workId) {
        if (input.onTrash) input.onTrash(workId);
        else moveActiveWorkspaceToTrash(workId);
      }
      return {
        ok: true,
        workflow: input.workflow,
        workId,
        message: "Moved to Trash — same Work ID on restore.",
      };

    case "restore":
      if (workId) restoreActiveWorkspace(workId);
      return {
        ok: true,
        workflow: input.workflow,
        workId,
        message: "Restored — same Work ID.",
      };

    case "permanently_delete":
      if (!input.confirmDestructive) {
        return {
          ok: false,
          requiresConfirmation: true,
          disabledReason: "Confirm permanent delete first.",
          workflow: input.workflow,
          workId,
        };
      }
      if (workId) {
        if (input.onPermanentDelete) input.onPermanentDelete(workId);
        else permanentlyDeleteActiveWorkspace(workId);
      }
      return {
        ok: true,
        workflow: input.workflow,
        workId,
        message: "Permanently removed.",
      };

    case "print":
    case "export":
    case "share":
      input.onExportSurface?.(input.commandId);
      return {
        ok: true,
        workflow: input.workflow,
        workId,
        openExport: input.commandId,
      };

    case "move_to_project":
      return {
        ok: false,
        disabledReason: "Move to Project isn’t available for this work yet.",
        workflow: input.workflow,
        workId,
      };

    default:
      return {
        ok: false,
        disabledReason: "Unknown command.",
        workflow: input.workflow,
        workId,
      };
  }
}
