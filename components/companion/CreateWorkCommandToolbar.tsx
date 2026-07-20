"use client";

import { useState } from "react";
import { ExportActions } from "@/components/companion/ExportActions";
import {
  dispatchCreateWorkCommand,
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
 * All actions go through dispatchCreateWorkCommand.
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
    workId: workspaceId,
  });

  function flash(message: string) {
    setNote(message);
    window.setTimeout(() => setNote(null), 3200);
  }

  function run(id: CreateWorkCommandId) {
    if (id === "rename") {
      onRename?.();
      return;
    }
    const result = dispatchCreateWorkCommand({
      commandId: id,
      workflow,
      workId: workspaceId,
      hasDraftText: Boolean(draftText),
      onSave,
      onArchive,
      onTrash,
      onExportSurface: () => setShowExport(true),
    });
    if (!result.ok) {
      flash(result.disabledReason ?? "That isn’t available right now.");
      return;
    }
    if (result.workflow !== workflow) {
      onWorkflowChange(result.workflow);
    }
    if (result.openExport) setShowExport(true);
    if (result.message) flash(result.message);
  }

  return (
    <div
      className="mb-3 flex flex-wrap items-center gap-2"
      data-testid="create-work-command-toolbar"
      data-workspace-id={workspaceId || undefined}
    >
      {commands.map((cmd) => (
        <button
          key={cmd.id}
          type="button"
          data-testid={`create-cmd-${cmd.id}`}
          disabled={!cmd.enabled}
          title={cmd.disabledReason}
          onClick={() => run(cmd.id)}
          className="rounded-lg border border-[#1e4f4f]/25 bg-white/90 px-2.5 py-1.5 text-xs font-semibold text-[#1e4f4f] hover:bg-[#f0f5f5] disabled:opacity-40"
        >
          {cmd.label}
        </button>
      ))}
      {note ? (
        <span className="text-xs font-medium text-[#5c5346]" role="status">
          {note}
        </span>
      ) : null}
      {showExport && draftText ? (
        <div className="w-full pt-1">
          <ExportActions
            title={workflow.selectedTemplateName || "Creation"}
            content={draftText}
          />
        </div>
      ) : null}
    </div>
  );
}
