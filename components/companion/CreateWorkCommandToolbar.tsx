"use client";

import { useEffect, useRef, useState } from "react";
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

const MORE_COMMAND_IDS: readonly CreateWorkCommandId[] = [
  "rename",
  "duplicate",
  "export",
  "print",
  "share",
  "archive",
  "trash",
];

/**
 * 084 / 127 — Work-level Create commands.
 * Primary: Save. Secondary actions live under More (…).
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
  const [moreOpen, setMoreOpen] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const moreRef = useRef<HTMLDivElement | null>(null);
  const draftText = workflow.draftContent?.trim() || "";
  const workspaceId =
    workflow.sessionId?.trim() || workflow.eventRecordId?.trim() || "";
  const commands = resolveCreateWorkCommands({
    workflow,
    hasDraftText: Boolean(draftText),
    workId: workspaceId,
  });
  const byId = new Map(commands.map((c) => [c.id, c]));
  const saveCmd = byId.get("save");

  useEffect(() => {
    if (!moreOpen) return;
    function onDoc(e: MouseEvent) {
      if (!moreRef.current?.contains(e.target as Node)) {
        setMoreOpen(false);
      }
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [moreOpen]);

  function flash(message: string) {
    setNote(message);
    window.setTimeout(() => setNote(null), 3200);
  }

  function run(id: CreateWorkCommandId) {
    setMoreOpen(false);
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
      data-action-bar="simplified"
    >
      <button
        type="button"
        data-testid="create-cmd-save"
        data-primary-action="save"
        disabled={!saveCmd?.enabled}
        title={saveCmd?.disabledReason}
        onClick={() => run("save")}
        className="rounded-lg bg-[#1e4f4f] px-3.5 py-1.5 text-sm font-semibold text-white hover:bg-[#163a3a] disabled:opacity-40"
      >
        Save
      </button>

      <div className="relative" ref={moreRef}>
        <button
          type="button"
          data-testid="create-cmd-more"
          aria-expanded={moreOpen}
          aria-haspopup="menu"
          onClick={() => setMoreOpen((o) => !o)}
          className="rounded-lg border border-[#1e4f4f]/25 bg-white/90 px-2.5 py-1.5 text-sm font-semibold text-[#1e4f4f] hover:bg-[#f0f5f5]"
          title="More actions"
        >
          More…
        </button>
        {moreOpen ? (
          <div
            role="menu"
            data-testid="create-cmd-more-menu"
            className="absolute left-0 z-20 mt-1 min-w-[11rem] rounded-xl border border-[#e7dfd4] bg-white py-1 shadow-md"
          >
            {MORE_COMMAND_IDS.map((id) => {
              const cmd = byId.get(id);
              if (!cmd?.available) return null;
              return (
                <button
                  key={id}
                  type="button"
                  role="menuitem"
                  data-testid={`create-cmd-${id}`}
                  disabled={!cmd.enabled}
                  title={cmd.disabledReason}
                  onClick={() => run(id)}
                  className="block w-full px-3 py-2 text-left text-sm text-[#1f1c19] hover:bg-[#faf7f2] disabled:opacity-40"
                >
                  {cmd.label}
                </button>
              );
            })}
          </div>
        ) : null}
      </div>

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
