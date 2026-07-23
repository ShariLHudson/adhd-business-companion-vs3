"use client";

import { useCallback, useEffect, useState } from "react";
import { ConfirmDialog } from "@/components/companion/ConfirmDialog";
import {
  CREATE_DRAFT_LIBRARY_UPDATED_EVENT,
  listCreateDraftEntries,
  type CreateDraftLibraryEntry,
} from "@/lib/createDraftLibrary";
import { userFacingCreateTypeLabel } from "@/lib/createTypePickers";

type CreateDraftResumeListProps = {
  onOpen: (id: string) => void;
  onRename: (id: string, title: string) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
  /**
   * Create Simplification — narrow to a subset (e.g. Recent vs Older Work)
   * without duplicating the open/rename/duplicate/delete list logic.
   * Omit to show every saved draft (unchanged default behavior).
   */
  filter?: (entry: CreateDraftLibraryEntry) => boolean;
  /** Override the "Resume a saved draft" label — used when grouped under Find Previous Work. */
  listLabel?: string;
};

function formatRelativeDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "Recently";
  const diffMs = Date.now() - date.getTime();
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function CreateDraftResumeList({
  onOpen,
  onRename,
  onDuplicate,
  onDelete,
  filter,
  listLabel = "Resume a saved draft",
}: CreateDraftResumeListProps) {
  const [drafts, setDrafts] = useState<CreateDraftLibraryEntry[]>([]);
  const [renameId, setRenameId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const refresh = useCallback(() => {
    const all = listCreateDraftEntries();
    setDrafts(filter ? all.filter(filter) : all);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- filter is expected to be stable per call site
  }, [filter]);

  useEffect(() => {
    refresh();
    window.addEventListener(CREATE_DRAFT_LIBRARY_UPDATED_EVENT, refresh);
    return () =>
      window.removeEventListener(CREATE_DRAFT_LIBRARY_UPDATED_EVENT, refresh);
  }, [refresh]);

  if (drafts.length === 0) return null;

  const deleteTarget = deleteId
    ? drafts.find((d) => d.id === deleteId)
    : null;

  function confirmRename() {
    if (!renameId || !renameValue.trim()) return;
    onRename(renameId, renameValue.trim());
    setRenameId(null);
    setRenameValue("");
  }

  return (
    <>
      <ConfirmDialog
        open={Boolean(deleteId)}
        title="Delete this draft permanently?"
        message={
          deleteTarget
            ? `"${deleteTarget.title}" will be removed and cannot be recovered.`
            : "This cannot be undone."
        }
        confirmLabel="Delete"
        cancelLabel="Cancel"
        destructive
        onCancel={() => setDeleteId(null)}
        onConfirm={() => {
          if (deleteId) onDelete(deleteId);
          setDeleteId(null);
        }}
      />

      <div className="mx-4 mb-4 rounded-2xl border border-[#d4cdc3] bg-white/90 p-4 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-wide text-[#9a8f82]">
          {listLabel}
        </p>
        <ul className="mt-3 flex flex-col gap-2">
          {drafts.map((draft) => (
            <li
              key={draft.id}
              className="rounded-xl border border-[#e7dfd4] bg-[#faf7f2]/80 px-3 py-2.5"
            >
              {renameId === draft.id ? (
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <input
                    type="text"
                    value={renameValue}
                    onChange={(e) => setRenameValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") confirmRename();
                      if (e.key === "Escape") setRenameId(null);
                    }}
                    autoFocus
                    className="min-w-0 flex-1 rounded-lg border border-[#d4cdc3] bg-white px-3 py-2 text-sm text-[#1f1c19] outline-none focus:border-[#1e4f4f]"
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={confirmRename}
                      className="rounded-lg bg-[#1e4f4f] px-3 py-1.5 text-sm font-semibold text-white"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => setRenameId(null)}
                      className="rounded-lg px-3 py-1.5 text-sm font-semibold text-[#6b635a]"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-[#1f1c19]">
                        {draft.title}
                      </p>
                      <p className="mt-0.5 text-xs text-[#9a8f82]">
                        {draft.itemType
                          ? userFacingCreateTypeLabel(draft.itemType) ??
                            draft.itemType
                          : "Draft"}{" "}
                        · {formatRelativeDate(draft.updatedAt)}
                      </p>
                    </div>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => onOpen(draft.id)}
                      className="rounded-lg bg-[#1e4f4f] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#163a3a]"
                    >
                      Open
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setRenameId(draft.id);
                        setRenameValue(draft.title);
                      }}
                      className="rounded-lg border border-[#d4cdc3] bg-white px-3 py-1.5 text-xs font-semibold text-[#4b463f] hover:bg-[#faf7f2]"
                    >
                      Rename
                    </button>
                    <button
                      type="button"
                      onClick={() => onDuplicate(draft.id)}
                      className="rounded-lg border border-[#d4cdc3] bg-white px-3 py-1.5 text-xs font-semibold text-[#4b463f] hover:bg-[#faf7f2]"
                    >
                      Duplicate
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteId(draft.id)}
                      className="rounded-lg border border-[#e8c4c4] bg-white px-3 py-1.5 text-xs font-semibold text-[#a85c4a] hover:bg-[#fdf5f5]"
                    >
                      Delete
                    </button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
