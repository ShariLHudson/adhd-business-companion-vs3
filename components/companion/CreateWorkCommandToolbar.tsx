"use client";

import { useState } from "react";
import { ExportActions } from "@/components/companion/ExportActions";
import {
  archiveActiveWorkspace,
  moveActiveWorkspaceToTrash,
} from "@/lib/activeWorkspaceRegistry";
import {
  duplicateCreationWorkspace,
  resolveCreateWorkCommands,
  type CreateWorkCommandId,
} from "@/lib/createCommands";
import type { CreateWorkflowState } from "@/lib/createWorkflow";

type Props = {
  workflow: CreateWorkflowState;
  onWorkflowChange: (next: CreateWorkflowState) => void;
  onRename?: () => void;
  onSave?: () => void;
  /** Optional: parent handles archive/trash (e.g. durable). */
  onArchive?: (workspaceId: string) => void;
  onTrash?: (workspaceId: string) => void;
};

/**
 * 084 — Work-level Create commands on Estate Create.
 * Section actions stay on Current Focus / Workshop Map.
 */
export function CreateWorkCommandToolbar({
  workflow,
  onWorkflowChange,
  onRename,
  onSave,
  onArchive,
  onTrash,
}: Props) {
  const [showExport, setShowExport] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const draftText = workflow.draftContent?.trim() || "";
  const workspaceId =
    workflow.sessionId?.trim() || workflow.eventRecordId?.trim() || "";
  const commands = resolveCreateWorkCommands({
    workflow,
    hasDraftText: Boolean(draftText),
  });

  function flash(message: string) {
    setNote(message);
    window.setTimeout(() => setNote(null), 3200);
  }

  function run(id: CreateWorkCommandId) {
    const def = commands.find((c) => c.id === id);
    if (!def?.enabled) return;

    switch (id) {
      case "save":
        onSave?.();
        flash(
          onSave
            ? "Saving…"
            : "Use Save in Current Focus — that’s the durable path.",
        );
        break;
      case "rename":
        onRename?.();
        break;
      case "duplicate": {
        const copy = duplicateCreationWorkspace(workflow);
        onWorkflowChange(copy);
        flash("Duplicated with a new Work ID.");
        break;
      }
      case "archive":
        if (workspaceId) {
          if (onArchive) onArchive(workspaceId);
          else archiveActiveWorkspace(workspaceId);
          flash("Archived — restore anytime from Recently removed.");
        }
        break;
      case "trash":
        if (workspaceId) {
          if (onTrash) onTrash(workspaceId);
          else moveActiveWorkspaceToTrash(workspaceId);
          flash("Moved to Trash — same Work ID on restore.");
        }
        break;
      case "print":
      case "export":
      case "share":
        setShowExport(true);
        break;
      default:
        break;
    }
  }

  return (
    <div
      className="mt-3 max-w-2xl rounded-2xl border border-[#e7dfd4] bg-white/70 px-3 py-2"
      data-testid="create-work-command-toolbar"
      data-workspace-id={workspaceId || undefined}
    >
      <div className="flex flex-wrap gap-1.5">
        {commands.map((cmd) =>
          cmd.available ? (
            <button
              key={cmd.id}
              type="button"
              disabled={!cmd.enabled}
              data-testid={`create-cmd-${cmd.id}`}
              onClick={() => run(cmd.id)}
              className="rounded-lg border border-[#d4cdc3] bg-white px-2.5 py-1.5 text-xs font-semibold text-[#4b463f] hover:bg-[#faf7f2] disabled:cursor-not-allowed disabled:opacity-35"
            >
              {cmd.label}
            </button>
          ) : null,
        )}
      </div>
      {note ? (
        <p
          className="mt-2 text-xs text-[#6b635a]"
          data-testid="create-cmd-note"
          role="status"
        >
          {note}
        </p>
      ) : null}
      {showExport && draftText ? (
        <div className="mt-3 border-t border-[#e7dfd4] pt-3" data-testid="create-cmd-export-panel">
          <ExportActions
            text={draftText}
            title={workflow.selectedTemplateName ?? undefined}
            variant="workspace"
            compact
            social
          />
          <button
            type="button"
            className="mt-2 text-xs font-semibold text-[#6b635a] underline"
            onClick={() => setShowExport(false)}
          >
            Hide export options
          </button>
        </div>
      ) : null}
    </div>
  );
}
