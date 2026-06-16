"use client";

import { useEffect, useRef, useState } from "react";
import { CATEGORY_PICKER_EMPTY_LIST_HINT, NO_CATEGORY } from "@/lib/categoryRevealUx";
import { CategoryPickerSelect } from "@/components/companion/CategoryPickerSelect";
import { ConfirmDialog } from "@/components/companion/ConfirmDialog";
import {
  archiveSavedWork,
  deleteSavedWork,
  duplicateSavedWork,
  getActiveSavedWork,
  getArchivedSavedWork,
  getSavedWork,
  unarchiveSavedWork,
  updateSavedWork,
  type SavedWorkItem,
  type SavedWorkStatus,
} from "@/lib/savedWorkStore";
import type { CreationWorkspaceInput } from "@/lib/workspaceCreation";

type SavedWorkAction = "rename" | "duplicate" | "archive" | "unarchive" | "delete";

const STATUS_OPTIONS: { value: SavedWorkStatus | "archived"; label: string }[] = [
  { value: "archived", label: "Archived" },
  { value: "draft", label: "Drafts" },
  { value: "exported", label: "Exported" },
  { value: "saved", label: "Saved" },
];

function SavedWorkItemMenu({
  item,
  onAction,
}: {
  item: SavedWorkItem;
  onAction: (action: SavedWorkAction, item: SavedWorkItem) => void;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const archived = item.status === "archived";

  useEffect(() => {
    if (!open) return;
    function onDocClick(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open]);

  function pick(action: SavedWorkAction) {
    setOpen(false);
    onAction(action, item);
  }

  return (
    <div ref={rootRef} className="relative shrink-0">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="Item actions"
        className="rounded-lg border border-[#d4cdc3] bg-white px-2 py-1 text-sm font-semibold text-[#6b635a] hover:bg-[#faf7f2]"
      >
        ⋯
      </button>
      {open ? (
        <div
          role="menu"
          className="absolute right-0 z-20 mt-1 min-w-[10rem] overflow-hidden rounded-xl border border-[#d4cdc3] bg-white py-1 shadow-lg"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            role="menuitem"
            onClick={() => pick("rename")}
            className="block w-full px-4 py-2 text-left text-sm font-medium text-[#1f1c19] hover:bg-[#f5f0e8]"
          >
            Rename
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() => pick("duplicate")}
            className="block w-full px-4 py-2 text-left text-sm font-medium text-[#1f1c19] hover:bg-[#f5f0e8]"
          >
            Duplicate
          </button>
          {archived ? (
            <button
              type="button"
              role="menuitem"
              onClick={() => pick("unarchive")}
              className="block w-full px-4 py-2 text-left text-sm font-medium text-[#1f1c19] hover:bg-[#f5f0e8]"
            >
              Unarchive
            </button>
          ) : (
            <button
              type="button"
              role="menuitem"
              onClick={() => pick("archive")}
              className="block w-full px-4 py-2 text-left text-sm font-medium text-[#1f1c19] hover:bg-[#f5f0e8]"
            >
              Archive
            </button>
          )}
          <button
            type="button"
            role="menuitem"
            onClick={() => pick("delete")}
            className="block w-full px-4 py-2 text-left text-sm font-medium text-[#a85c4a] hover:bg-[#a85c4a]/8"
          >
            Delete
          </button>
        </div>
      ) : null}
    </div>
  );
}

export function SavedWorkLibrary({
  onBack,
  onOpenInCreate,
}: {
  onBack?: () => void;
  onOpenInCreate?: (input: CreationWorkspaceInput) => void;
}) {
  const [items, setItems] = useState<SavedWorkItem[]>([]);
  const [status, setStatus] = useState<
    SavedWorkStatus | "archived" | typeof NO_CATEGORY
  >(NO_CATEGORY);
  const [query, setQuery] = useState("");
  const [viewId, setViewId] = useState<string | null>(null);
  const [renaming, setRenaming] = useState<SavedWorkItem | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<SavedWorkItem | null>(null);

  function refresh() {
    setItems(getSavedWork());
  }

  useEffect(() => {
    refresh();
  }, []);

  const baseList =
    status === NO_CATEGORY
      ? []
      : status === "archived"
        ? getArchivedSavedWork()
        : getActiveSavedWork().filter((w) => w.status === status);

  const visible = baseList.filter((w) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      w.title.toLowerCase().includes(q) ||
      w.artifactType.toLowerCase().includes(q) ||
      w.preview.toLowerCase().includes(q)
    );
  });

  const viewing = viewId ? items.find((w) => w.id === viewId) : null;

  function handleItemAction(action: SavedWorkAction, item: SavedWorkItem) {
    if (action === "rename") {
      setRenaming(item);
      setRenameValue(item.title);
      return;
    }
    if (action === "duplicate") {
      duplicateSavedWork(item.id);
      refresh();
      return;
    }
    if (action === "archive") {
      archiveSavedWork(item.id);
      refresh();
      if (viewId === item.id) setViewId(null);
      return;
    }
    if (action === "unarchive") {
      unarchiveSavedWork(item.id);
      refresh();
      return;
    }
    if (action === "delete") {
      setDeleteTarget(item);
    }
  }

  function confirmRename() {
    if (!renaming) return;
    const title = renameValue.trim() || "Untitled";
    updateSavedWork(renaming.id, { title });
    setRenaming(null);
    setRenameValue("");
    refresh();
  }

  function confirmDelete() {
    if (!deleteTarget) return;
    deleteSavedWork(deleteTarget.id);
    if (viewId === deleteTarget.id) setViewId(null);
    setDeleteTarget(null);
    refresh();
  }

  return (
    <div className="companion-fade-in mx-auto flex h-full max-w-3xl flex-col px-6 py-8">
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete this item permanently?"
        message="This removes it from Saved Work. This cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        destructive
        onCancel={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />

      {renaming ? (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4"
          role="presentation"
          onClick={() => setRenaming(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="rename-dialog-title"
            className="w-full max-w-sm rounded-2xl border border-[#d4cdc3] bg-white p-5 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2
              id="rename-dialog-title"
              className="text-lg font-semibold text-[#1f1c19]"
            >
              Rename
            </h2>
            <input
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              autoFocus
              className="mt-3 w-full rounded-lg border border-[#c9bfb0] bg-white px-3 py-2 text-base outline-none focus:border-[#1e4f4f]"
              onKeyDown={(e) => {
                if (e.key === "Enter") confirmRename();
                if (e.key === "Escape") setRenaming(null);
              }}
            />
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setRenaming(null)}
                className="rounded-lg border border-[#c9bfb0] bg-white px-4 py-2 text-sm font-semibold text-[#4b463f]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmRename}
                className="rounded-lg bg-[#1e4f4f] px-4 py-2 text-sm font-semibold text-white"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-2xl font-semibold text-[#1f1c19]">📂 Saved Work</p>
          <p className="mt-1 text-base text-[#6b635a]">
            Your created documents — proposals, SOPs, plans, and more. Archive to
            hide from active views; recover anytime from Archived.
          </p>
        </div>
        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            className="shrink-0 text-sm font-semibold text-[#1e4f4f] hover:underline"
          >
            ← Back
          </button>
        ) : null}
      </div>

      <CategoryPickerSelect
        label="Show"
        value={status === NO_CATEGORY ? NO_CATEGORY : status}
        onChange={(v) => setStatus(v === NO_CATEGORY ? NO_CATEGORY : v)}
        options={STATUS_OPTIONS}
        placeholder="Select…"
        className="mt-4"
      />

      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search saved work…"
        className="mt-3 w-full rounded-lg border border-[#c9bfb0] bg-white px-3 py-2 text-base outline-none focus:border-[#1e4f4f]"
      />

      {viewing ? (
        <div className="mt-6 flex min-h-0 flex-1 flex-col rounded-2xl border border-[#e7dfd4] bg-white p-4">
          <div className="flex items-start justify-between gap-2">
            <button
              type="button"
              onClick={() => setViewId(null)}
              className="text-sm font-semibold text-[#1e4f4f] hover:underline"
            >
              ← All saved work
            </button>
            <SavedWorkItemMenu item={viewing} onAction={handleItemAction} />
          </div>
          <p className="mt-2 text-xs font-bold uppercase tracking-wide text-[#6b635a]">
            {viewing.artifactType} · {viewing.status}
          </p>
          <h2 className="text-xl font-semibold text-[#1f1c19]">{viewing.title}</h2>
          <p className="mt-1 text-sm text-[#6b635a]">{viewing.savedLocation}</p>
          {viewing.projectName ? (
            <p className="text-sm text-[#6b635a]">Project: {viewing.projectName}</p>
          ) : null}
          <pre className="mt-4 min-h-0 flex-1 overflow-y-auto whitespace-pre-wrap rounded-xl bg-[#faf7f2] p-4 text-sm leading-relaxed text-[#2d2926]">
            {viewing.body}
          </pre>
          <div className="mt-3 flex flex-wrap gap-2">
            {onOpenInCreate && viewing.status !== "archived" ? (
              <button
                type="button"
                onClick={() =>
                  onOpenInCreate({
                    itemType: viewing.artifactType,
                    title: viewing.title,
                    draftContent: viewing.body,
                    stage: "editing draft",
                    source: "generated",
                    templateId: viewing.id,
                  })
                }
                className="rounded-lg bg-[#1e4f4f] px-4 py-2 text-sm font-semibold text-white"
              >
                Open in Create
              </button>
            ) : null}
            {viewing.googleDocUrl ? (
              <a
                href={viewing.googleDocUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg border border-[#1e4f4f]/40 px-4 py-2 text-sm font-semibold text-[#1e4f4f]"
              >
                Open Google Doc
              </a>
            ) : null}
          </div>
        </div>
      ) : (
        <ul className="mt-4 flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto">
          {visible.length === 0 ? (
            <li className="rounded-xl border border-dashed border-[#e7dfd4] p-6 text-center text-sm text-[#6b635a]">
              {status === NO_CATEGORY
                ? CATEGORY_PICKER_EMPTY_LIST_HINT
                : status === "archived"
                  ? "No archived items — archive something to hide it from active views."
                  : "No saved work in this category yet."}
            </li>
          ) : (
            visible.map((w) => (
              <li key={w.id}>
                <div className="flex items-stretch gap-1 rounded-xl border border-[#e7dfd4] bg-white hover:border-[#1e4f4f]/30">
                  <button
                    type="button"
                    onClick={() => setViewId(w.id)}
                    className="min-w-0 flex-1 px-4 py-3 text-left"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-semibold text-[#1f1c19]">{w.title}</p>
                      <span className="shrink-0 text-xs font-bold uppercase text-[#6b635a]">
                        {w.status}
                      </span>
                    </div>
                    <p className="mt-0.5 text-sm text-[#6b635a]">
                      {w.artifactType} · {w.savedLocation}
                    </p>
                    <p className="mt-1 line-clamp-2 text-sm text-[#9a8f82]">
                      {w.preview}
                    </p>
                  </button>
                  <div className="flex items-start px-2 py-3">
                    <SavedWorkItemMenu item={w} onAction={handleItemAction} />
                  </div>
                </div>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
