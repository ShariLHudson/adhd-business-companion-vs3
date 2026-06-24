"use client";

import { useState } from "react";

export function VisualFocusSaveMenu({
  pinned,
  archived,
  versionCount = 0,
  onSave,
  onSaveAs,
  onRename,
  onDuplicate,
  onSaveVersion,
  onVersionHistory,
  onPin,
  onArchive,
  onUnarchive,
  onDelete,
}: {
  pinned?: boolean;
  archived?: boolean;
  versionCount?: number;
  onSave: () => void;
  onSaveAs: () => void;
  onRename: () => void;
  onDuplicate: () => void;
  onSaveVersion: () => void;
  onVersionHistory: () => void;
  onPin: () => void;
  onArchive: () => void;
  onUnarchive?: () => void;
  onDelete: () => void;
}) {
  const [open, setOpen] = useState(false);

  function act(fn: () => void) {
    fn();
    setOpen(false);
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="rounded-xl border border-[#e7dfd4] bg-white px-3 py-2 text-sm font-semibold text-[#1e4f4f] hover:bg-[#faf7f2]"
        data-testid="visual-focus-save-menu"
      >
        Save ▾
      </button>
      {open ? (
        <div className="absolute right-0 z-20 mt-2 min-w-[200px] rounded-xl border border-[#e7dfd4] bg-white py-1 shadow-lg">
          <button
            type="button"
            className="block w-full px-4 py-2 text-left text-sm hover:bg-[#faf7f2]"
            onClick={() => act(onSave)}
          >
            Save
          </button>
          <button
            type="button"
            className="block w-full px-4 py-2 text-left text-sm hover:bg-[#faf7f2]"
            onClick={() => act(onSaveAs)}
          >
            Save As…
          </button>
          <button
            type="button"
            className="block w-full px-4 py-2 text-left text-sm hover:bg-[#faf7f2]"
            onClick={() => act(onRename)}
          >
            Rename
          </button>
          <button
            type="button"
            className="block w-full px-4 py-2 text-left text-sm hover:bg-[#faf7f2]"
            onClick={() => act(onDuplicate)}
          >
            Duplicate
          </button>
          <button
            type="button"
            className="block w-full px-4 py-2 text-left text-sm hover:bg-[#faf7f2]"
            onClick={() => act(onSaveVersion)}
          >
            Save Version™
          </button>
          <button
            type="button"
            className="block w-full px-4 py-2 text-left text-sm hover:bg-[#faf7f2]"
            onClick={() => act(onVersionHistory)}
          >
            Version History{versionCount > 0 ? ` (${versionCount})` : ""}
          </button>
          <button
            type="button"
            className="block w-full px-4 py-2 text-left text-sm hover:bg-[#faf7f2]"
            onClick={() => act(onPin)}
          >
            {pinned ? "Unpin" : "⭐ Pin"}
          </button>
          {archived && onUnarchive ? (
            <button
              type="button"
              className="block w-full px-4 py-2 text-left text-sm hover:bg-[#faf7f2]"
              onClick={() => act(onUnarchive)}
            >
              Restore from Archive
            </button>
          ) : (
            <button
              type="button"
              className="block w-full px-4 py-2 text-left text-sm hover:bg-[#faf7f2]"
              onClick={() => act(onArchive)}
            >
              Archive
            </button>
          )}
          <button
            type="button"
            className="block w-full px-4 py-2 text-left text-sm text-red-700 hover:bg-red-50"
            onClick={() => act(onDelete)}
          >
            Delete
          </button>
        </div>
      ) : null}
    </div>
  );
}
