"use client";

import { useEffect, useRef, useState } from "react";
import { PROJECTS_CONTINUE_LABEL } from "@/lib/projects/activeWork";
import type { ActiveWorkCardModel } from "@/lib/projects/activeWork";
import { formatProjectHomeDate } from "@/lib/projectHomes/sampleProjects";

type Props = {
  work: ActiveWorkCardModel;
  onContinue: (work: ActiveWorkCardModel) => void;
  /** 073 — rename preserves Workspace ID */
  onRename?: (work: ActiveWorkCardModel, nextTitle: string) => void;
  /** 084 — Archive (recoverable, preserves Work ID) */
  onArchive?: (work: ActiveWorkCardModel) => void;
  /** 084 — Move to Trash (recoverable default) */
  onTrash?: (work: ActiveWorkCardModel) => void;
  /** @deprecated Prefer onTrash — still wired as Move to Trash */
  onRemove?: (work: ActiveWorkCardModel) => void;
};

/**
 * 057 / 073 / 084 — Active Work card. No Project Home / technical IDs.
 */
export function ActiveWorkCard({
  work,
  onContinue,
  onRename,
  onArchive,
  onTrash,
  onRemove,
}: Props) {
  const trashHandler = onTrash ?? onRemove;
  const [menuOpen, setMenuOpen] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [confirmTrash, setConfirmTrash] = useState(false);
  const [renameDraft, setRenameDraft] = useState(work.name);
  const menuRef = useRef<HTMLDivElement>(null);
  const showMenu = Boolean(onRename || onArchive || trashHandler);

  useEffect(() => {
    if (!menuOpen) return;
    function onDocPointer(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
        setConfirmTrash(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setMenuOpen(false);
        setConfirmTrash(false);
      }
    }
    document.addEventListener("mousedown", onDocPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  return (
    <article
      className="project-home-card active-work-card"
      data-testid={`active-work-card-${work.id}`}
      data-workspace-id={work.id}
    >
      <div className="project-home-card__body active-work-card__body">
        <div className="flex items-start justify-between gap-2">
          {renaming ? (
            <form
              className="flex flex-1 flex-wrap items-center gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                const next = renameDraft.trim();
                if (next && onRename) onRename(work, next);
                setRenaming(false);
                setMenuOpen(false);
              }}
            >
              <input
                value={renameDraft}
                onChange={(e) => setRenameDraft(e.target.value)}
                className="min-w-0 flex-1 rounded-lg border border-[#cfc6b8] px-2 py-1 text-base font-semibold"
                aria-label="Rename this work"
                data-testid={`active-work-rename-input-${work.id}`}
                autoFocus
              />
              <button type="submit" className="text-sm font-semibold">
                Save
              </button>
            </form>
          ) : (
            <h3 className="active-work-card__title">{work.name}</h3>
          )}
          {showMenu ? (
            <div className="relative shrink-0" ref={menuRef}>
              <button
                type="button"
                className="rounded px-2 py-1 text-sm text-[#6b635a]"
                aria-label="Work options"
                aria-expanded={menuOpen}
                data-testid={`active-work-menu-${work.id}`}
                onClick={() => {
                  setConfirmTrash(false);
                  setMenuOpen((o) => !o);
                }}
              >
                ···
              </button>
              {menuOpen ? (
                <div
                  className="absolute right-0 z-10 mt-1 min-w-[11rem] rounded-lg border border-[#d4cdc3] bg-white p-1 shadow-md"
                  role="menu"
                >
                  {confirmTrash ? (
                    <div
                      className="px-2 py-2"
                      data-testid={`active-work-trash-confirm-${work.id}`}
                    >
                      <p className="mb-2 text-sm text-[#3d3830]">
                        Move to Trash? You can restore it later with the same Work ID.
                      </p>
                      <div className="flex flex-col gap-1">
                        <button
                          type="button"
                          role="menuitem"
                          className="block w-full rounded px-3 py-2 text-left text-sm hover:bg-[#f5f0e8]"
                          onClick={() => setConfirmTrash(false)}
                        >
                          Keep it
                        </button>
                        <button
                          type="button"
                          role="menuitem"
                          className="block w-full rounded px-3 py-2 text-left text-sm text-[#8b3a3a] hover:bg-[#f8ecec]"
                          data-testid={`active-work-trash-confirm-yes-${work.id}`}
                          onClick={() => {
                            trashHandler?.(work);
                            setMenuOpen(false);
                            setConfirmTrash(false);
                          }}
                        >
                          Move to Trash
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      {onRename ? (
                        <button
                          type="button"
                          role="menuitem"
                          className="block w-full rounded px-3 py-2 text-left text-sm hover:bg-[#f5f0e8]"
                          data-testid={`active-work-rename-${work.id}`}
                          onClick={() => {
                            setRenameDraft(work.name);
                            setRenaming(true);
                            setMenuOpen(false);
                          }}
                        >
                          Rename
                        </button>
                      ) : null}
                      {onArchive ? (
                        <button
                          type="button"
                          role="menuitem"
                          className="block w-full rounded px-3 py-2 text-left text-sm hover:bg-[#f5f0e8]"
                          data-testid={`active-work-archive-${work.id}`}
                          onClick={() => {
                            onArchive(work);
                            setMenuOpen(false);
                          }}
                        >
                          Archive
                        </button>
                      ) : null}
                      {trashHandler ? (
                        <button
                          type="button"
                          role="menuitem"
                          className="block w-full rounded px-3 py-2 text-left text-sm text-[#8b3a3a] hover:bg-[#f8ecec]"
                          data-testid={`active-work-delete-${work.id}`}
                          onClick={() => setConfirmTrash(true)}
                        >
                          Move to Trash
                        </button>
                      ) : null}
                    </>
                  )}
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
        <p className="active-work-card__meta">
          {work.creationType}
          {work.statusLabel ? ` · ${work.statusLabel}` : ""}
        </p>
        {work.currentFocus ? (
          <p className="active-work-card__focus">
            <span className="active-work-card__label">Current focus</span>
            {work.currentFocus}
          </p>
        ) : null}
        {work.progressPercent != null ? (
          <p className="active-work-card__progress">
            Progress {work.progressPercent}%
          </p>
        ) : null}
        {work.nextRecommendedStep ? (
          <p className="active-work-card__next">
            <span className="active-work-card__label">Next</span>
            {work.nextRecommendedStep}
          </p>
        ) : null}
        {work.waitingItems.length > 0 ? (
          <p className="active-work-card__waiting">
            Waiting: {work.waitingItems.join(" · ")}
          </p>
        ) : null}
        <p className="active-work-card__date text-xs text-[#9a8f82]">
          {formatProjectHomeDate(work.lastWorkedAt)}
        </p>
        <button
          type="button"
          className="active-work-card__continue mt-2 w-full rounded-xl bg-[#1e4f4f] px-3 py-2 text-sm font-semibold text-white"
          data-testid={`active-work-continue-${work.id}`}
          onClick={() => onContinue(work)}
        >
          {PROJECTS_CONTINUE_LABEL}
        </button>
      </div>
    </article>
  );
}
