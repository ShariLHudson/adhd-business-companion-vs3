"use client";

import { useCallback, useEffect, useState } from "react";
import {
  listActiveCreationWorkspaces,
  type ActiveCreationWorkspaceSummary,
} from "@/lib/createEstate/listActiveCreationWorkspaces";
import {
  CREATE_ESTATE_MANAGE_ARCHIVE,
  CREATE_ESTATE_MANAGE_DELETE,
  CREATE_ESTATE_MANAGE_RECOVERABLE_HEADING,
  CREATE_ESTATE_MANAGE_RESTORE,
  CREATE_ESTATE_MANAGE_SELECT_HINT,
  CREATE_ESTATE_MANAGE_TRASH,
  CREATE_ESTATE_MANAGE_WORK_DONE,
  CREATE_ESTATE_MANAGE_WORK_LABEL,
} from "@/lib/createEstate/copy";
import { resolveWorkTypeVisual } from "@/lib/createEstate/workTypeVisual";
import { formatLastWorkedLabel } from "@/lib/activeWorkspaceRegistry/humanReadableIdentity";
import {
  archiveActiveWorkspace,
  listRecoverableWorkspaces,
  moveActiveWorkspaceToTrash,
  permanentlyDeleteActiveWorkspace,
  renameActiveWorkspaceTitleDurable,
  restoreActiveWorkspace,
  type ActiveWorkspaceEntry,
} from "@/lib/activeWorkspaceRegistry";
import { ConfirmDialog } from "@/components/companion/ConfirmDialog";

type Props = {
  onResume: (
    workspace: ActiveCreationWorkspaceSummary,
  ) => void | { ok: boolean; acknowledgment?: string };
  /** Spec 129 — every Work item supports rename; immediate save. */
  onRename?: (workspaceId: string, title: string) => void | Promise<void>;
};

async function defaultRename(workspaceId: string, title: string): Promise<void> {
  const result = await renameActiveWorkspaceTitleDurable(workspaceId, title);
  if (!result.ok) {
    throw new Error(result.message);
  }
}

/**
 * 056 / 073 / 074 / 129 / 130 — Continue Existing Work by human-readable identity.
 * One resume CTA per Work · inline rename · Manage My Work bulk cleanup.
 */
export function CreateWorkspaceResumeList({
  onResume,
  onRename = defaultRename,
}: Props) {
  const [workspaces, setWorkspaces] = useState<ActiveCreationWorkspaceSummary[]>(
    [],
  );
  const [recoverable, setRecoverable] = useState<ActiveWorkspaceEntry[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [renameId, setRenameId] = useState<string | null>(null);
  const [renameDraft, setRenameDraft] = useState("");
  const [renameBusy, setRenameBusy] = useState(false);
  const [managing, setManaging] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [deleteConfirmIds, setDeleteConfirmIds] = useState<string[] | null>(
    null,
  );

  const refresh = useCallback(() => {
    setWorkspaces(listActiveCreationWorkspaces());
    setRecoverable(listRecoverableWorkspaces());
  }, []);

  useEffect(() => {
    refresh();
    const onFocus = () => refresh();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [refresh]);

  function toggleSelected(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function clearSelection() {
    setSelected(new Set());
  }

  function runBulk(
    action: "archive" | "trash" | "restore" | "delete",
    ids: string[],
  ) {
    if (ids.length === 0) {
      setFeedback("Select at least one item first.");
      return;
    }
    for (const id of ids) {
      if (action === "archive") archiveActiveWorkspace(id);
      else if (action === "trash") moveActiveWorkspaceToTrash(id);
      else if (action === "restore") restoreActiveWorkspace(id);
      else permanentlyDeleteActiveWorkspace(id);
    }
    clearSelection();
    refresh();
    const n = ids.length;
    if (action === "archive") {
      setFeedback(
        n === 1
          ? "Archived. You can restore it below."
          : `Archived ${n} items. You can restore them below.`,
      );
    } else if (action === "trash") {
      setFeedback(
        n === 1
          ? "Moved to Trash. You can restore it below."
          : `Moved ${n} items to Trash. You can restore them below.`,
      );
    } else if (action === "restore") {
      setFeedback(n === 1 ? "Restored." : `Restored ${n} items.`);
    } else {
      setFeedback(
        n === 1
          ? "Deleted permanently."
          : `Deleted ${n} items permanently.`,
      );
    }
  }

  function handleResume(ws: ActiveCreationWorkspaceSummary) {
    if (renameId === ws.id || managing) return;
    setBusyId(ws.id);
    setFeedback("Reopening your workspace…");
    try {
      const result = onResume(ws);
      if (result && result.ok === false) {
        setFeedback(
          result.acknowledgment ||
            "I couldn't reopen that workspace yet. Please try again.",
        );
      } else {
        setFeedback(null);
      }
    } catch {
      setFeedback(
        "I couldn't reopen that workspace yet. Please try again — I will not claim it is open until it verifies.",
      );
    } finally {
      setBusyId(null);
    }
  }

  async function commitRename(ws: ActiveCreationWorkspaceSummary) {
    const next = renameDraft.trim();
    if (!next || !onRename) {
      setRenameId(null);
      return;
    }
    if (next === ws.title) {
      setRenameId(null);
      return;
    }
    setRenameBusy(true);
    setFeedback(null);
    try {
      await Promise.resolve(onRename(ws.id, next));
      setRenameId(null);
      refresh();
    } catch {
      setFeedback("I couldn't rename that yet. Your title is still here — try again.");
    } finally {
      setRenameBusy(false);
    }
  }

  if (workspaces.length === 0 && recoverable.length === 0) return null;

  const selectedIds = Array.from(selected);

  return (
    <div
      className="rounded-2xl border border-[#d4cdc3] bg-white/90 p-4 shadow-sm"
      data-testid="create-workspace-resume-list"
    >
      <ConfirmDialog
        open={Boolean(deleteConfirmIds?.length)}
        title="Delete permanently?"
        message="This cannot be undone. Archived and Trash items can usually be restored — permanent delete cannot."
        confirmLabel={CREATE_ESTATE_MANAGE_DELETE}
        cancelLabel="Cancel"
        destructive
        onCancel={() => setDeleteConfirmIds(null)}
        onConfirm={() => {
          if (deleteConfirmIds?.length) {
            runBulk("delete", deleteConfirmIds);
          }
          setDeleteConfirmIds(null);
        }}
      />

      {workspaces.length > 0 ? (
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <button
            type="button"
            className="text-sm font-semibold text-[#1e4f4f] hover:underline"
            data-testid="create-manage-my-work"
            aria-pressed={managing}
            onClick={() => {
              setManaging((m) => !m);
              clearSelection();
              setFeedback(null);
            }}
          >
            {managing ? CREATE_ESTATE_MANAGE_WORK_DONE : CREATE_ESTATE_MANAGE_WORK_LABEL}
          </button>
          {managing ? (
            <span className="text-xs text-[#6b635a]">
              {CREATE_ESTATE_MANAGE_SELECT_HINT}
            </span>
          ) : null}
        </div>
      ) : null}

      {managing && selectedIds.length > 0 ? (
        <div
          className="mb-3 flex flex-wrap gap-2"
          data-testid="create-manage-bulk-actions"
          role="group"
          aria-label="Bulk work actions"
        >
          <button
            type="button"
            className="rounded-lg border border-[#cfc6b8] bg-white px-3 py-1.5 text-xs font-semibold text-[#3d3429]"
            data-testid="create-manage-archive"
            onClick={() => runBulk("archive", selectedIds)}
          >
            {CREATE_ESTATE_MANAGE_ARCHIVE}
          </button>
          <button
            type="button"
            className="rounded-lg border border-[#cfc6b8] bg-white px-3 py-1.5 text-xs font-semibold text-[#3d3429]"
            data-testid="create-manage-trash"
            onClick={() => runBulk("trash", selectedIds)}
          >
            {CREATE_ESTATE_MANAGE_TRASH}
          </button>
          <button
            type="button"
            className="rounded-lg border border-[#e8c4c4] bg-white px-3 py-1.5 text-xs font-semibold text-[#a85c4a]"
            data-testid="create-manage-delete"
            onClick={() => setDeleteConfirmIds(selectedIds)}
          >
            {CREATE_ESTATE_MANAGE_DELETE}
          </button>
        </div>
      ) : null}

      <ul className="flex flex-col gap-2">
        {workspaces.map((ws) => {
          const lastWorked =
            ws.lastWorkedLabel || formatLastWorkedLabel(ws.updatedAt);
          const renaming = renameId === ws.id;
          const visual = resolveWorkTypeVisual(ws.kindLabel);
          const isSelected = selected.has(ws.id);
          return (
            <li key={ws.id}>
              <div
                className="w-full rounded-xl border border-[#e7dfd4] bg-[#faf7f2]/80 px-3 py-3 text-left transition hover:border-[#c4b8a8] hover:bg-[#f5f0e8]"
                style={{
                  borderLeftWidth: 4,
                  borderLeftColor: visual.accent,
                  backgroundColor: visual.tint,
                }}
                data-testid={`create-workspace-resume-${ws.id}`}
                data-work-type-kind={visual.kind}
              >
                {managing ? (
                  <label className="flex cursor-pointer items-start gap-3">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelected(ws.id)}
                      className="mt-1"
                      data-testid={`create-manage-select-${ws.id}`}
                      aria-label={`Select ${ws.title}`}
                    />
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-2">
                        <span aria-hidden="true">{visual.icon}</span>
                        <span className="text-base font-semibold text-[#1f1c19]">
                          {ws.title}
                        </span>
                      </span>
                      <span className="mt-0.5 block text-sm text-[#6b635a]">
                        {ws.kindLabel}
                        {ws.statusLabel || ws.phaseLabel
                          ? ` · ${ws.statusLabel || ws.phaseLabel}`
                          : ""}
                      </span>
                    </span>
                  </label>
                ) : renaming ? (
                  <form
                    className="flex flex-col gap-2"
                    onSubmit={(e) => {
                      e.preventDefault();
                      void commitRename(ws);
                    }}
                  >
                    <input
                      type="text"
                      value={renameDraft}
                      onChange={(e) => setRenameDraft(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Escape") setRenameId(null);
                      }}
                      disabled={renameBusy}
                      autoFocus
                      aria-label="Rename this work"
                      className="w-full rounded-lg border border-[#cfc6b8] bg-white px-3 py-2 text-base font-semibold text-[#1f1c19] outline-none focus:border-[#1e4f4f]"
                      data-testid={`create-workspace-rename-input-${ws.id}`}
                    />
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="submit"
                        disabled={renameBusy}
                        className="rounded-lg bg-[#1e4f4f] px-3 py-1.5 text-sm font-semibold text-white disabled:opacity-70"
                        data-testid={`create-workspace-rename-save-${ws.id}`}
                      >
                        {renameBusy ? "Saving…" : "Save"}
                      </button>
                      <button
                        type="button"
                        disabled={renameBusy}
                        onClick={() => setRenameId(null)}
                        className="rounded-lg px-3 py-1.5 text-sm font-semibold text-[#6b635a]"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <>
                    <div className="flex items-start gap-2">
                      <span
                        className="mt-0.5 text-lg"
                        aria-hidden="true"
                        data-testid="create-workspace-type-icon"
                      >
                        {visual.icon}
                      </span>
                      <div className="min-w-0 flex-1">
                        {onRename ? (
                          <button
                            type="button"
                            className="block w-full text-left text-base font-semibold text-[#1f1c19] hover:underline"
                            data-testid={`create-workspace-rename-trigger-${ws.id}`}
                            aria-label={`Rename ${ws.title}`}
                            onClick={() => {
                              setRenameId(ws.id);
                              setRenameDraft(ws.title);
                            }}
                          >
                            {ws.title}
                          </button>
                        ) : (
                          <span className="block text-base font-semibold text-[#1f1c19]">
                            {ws.title}
                          </span>
                        )}
                        <span className="mt-0.5 block text-sm text-[#6b635a]">
                          <span className="sr-only">Work type: </span>
                          {ws.kindLabel}
                          {ws.statusLabel || ws.phaseLabel
                            ? ` · ${ws.statusLabel || ws.phaseLabel}`
                            : ""}
                        </span>
                        {ws.currentFocusTitle ? (
                          <span
                            className="mt-1 block text-sm font-medium text-[#1e4f4f]"
                            data-testid="create-workspace-current-focus"
                          >
                            Current Focus: {ws.currentFocusTitle}
                          </span>
                        ) : null}
                        {ws.progressSummary ? (
                          <span className="mt-0.5 block text-sm text-[#6b635a]">
                            {ws.progressSummary}
                          </span>
                        ) : null}
                        <span className="mt-0.5 block text-sm text-[#6b635a]">
                          Last worked: {lastWorked}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleResume(ws)}
                          disabled={busyId !== null}
                          aria-busy={busyId === ws.id}
                          className="mt-2 inline-block text-sm font-semibold text-[#1e4f4f] hover:underline disabled:cursor-wait disabled:opacity-70"
                          data-primary-action="resume"
                          data-testid={`create-workspace-continue-${ws.id}`}
                        >
                          {busyId === ws.id ? "Continuing…" : "Continue →"}
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      {managing && recoverable.length > 0 ? (
        <section
          className="mt-4 border-t border-[#e7dfd4] pt-3"
          data-testid="create-manage-recoverable"
          aria-labelledby="create-manage-recoverable-heading"
        >
          <h3
            id="create-manage-recoverable-heading"
            className="text-sm font-semibold text-[#1f1c19]"
          >
            {CREATE_ESTATE_MANAGE_RECOVERABLE_HEADING}
          </h3>
          <ul className="mt-2 flex flex-col gap-2">
            {recoverable.map((entry) => {
              const checked = selected.has(entry.workspaceId);
              return (
                <li
                  key={entry.workspaceId}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-[#e7dfd4] px-3 py-2"
                >
                  <label className="flex min-w-0 cursor-pointer items-center gap-2">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleSelected(entry.workspaceId)}
                      aria-label={`Select ${entry.title}`}
                    />
                    <span className="truncate text-sm text-[#1f1c19]">
                      {entry.title}{" "}
                      <span className="text-[#6b635a]">
                        ({entry.status === "trashed" ? "Trash" : "Archived"})
                      </span>
                    </span>
                  </label>
                  <button
                    type="button"
                    className="text-xs font-semibold text-[#1e4f4f] hover:underline"
                    data-testid={`create-manage-restore-${entry.workspaceId}`}
                    onClick={() => runBulk("restore", [entry.workspaceId])}
                  >
                    {CREATE_ESTATE_MANAGE_RESTORE}
                  </button>
                </li>
              );
            })}
          </ul>
          {selectedIds.some((id) =>
            recoverable.some((r) => r.workspaceId === id),
          ) ? (
            <div className="mt-2 flex flex-wrap gap-2">
              <button
                type="button"
                className="rounded-lg border border-[#cfc6b8] bg-white px-3 py-1.5 text-xs font-semibold text-[#3d3429]"
                onClick={() =>
                  runBulk(
                    "restore",
                    selectedIds.filter((id) =>
                      recoverable.some((r) => r.workspaceId === id),
                    ),
                  )
                }
              >
                {CREATE_ESTATE_MANAGE_RESTORE}
              </button>
              <button
                type="button"
                className="rounded-lg border border-[#e8c4c4] bg-white px-3 py-1.5 text-xs font-semibold text-[#a85c4a]"
                onClick={() =>
                  setDeleteConfirmIds(
                    selectedIds.filter((id) =>
                      recoverable.some((r) => r.workspaceId === id),
                    ),
                  )
                }
              >
                {CREATE_ESTATE_MANAGE_DELETE}
              </button>
            </div>
          ) : null}
        </section>
      ) : null}

      {feedback ? (
        <p
          role="status"
          aria-live="polite"
          className="mt-3 text-sm leading-relaxed text-[#6b635a]"
          data-testid="create-workspace-resume-feedback"
        >
          {feedback}
        </p>
      ) : null}
    </div>
  );
}
