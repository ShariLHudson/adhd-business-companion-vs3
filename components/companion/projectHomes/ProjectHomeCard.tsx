"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
} from "react";
import {
  formatProjectHomeDate,
  getProjectHomeRoom,
  getProjectHomeBackgroundUrl,
  isSampleProjectHome,
  shortPurpose,
  type ProjectHomeRecord,
} from "@/lib/projectHomes";

export type ProjectHomeCardAction =
  | "open"
  | "rename"
  | "duplicate"
  | "archive"
  | "delete";

type Props = {
  project: ProjectHomeRecord;
  onOpen: (id: string) => void;
  onAction?: (action: ProjectHomeCardAction, id: string) => void;
};

/**
 * Project Home card — room artwork is the visual focus.
 * Whole card opens; Options menu uses stopPropagation.
 */
export function ProjectHomeCard({ project, onOpen, onAction }: Props) {
  const room = getProjectHomeRoom(project.projectHomeId);
  const cover = getProjectHomeBackgroundUrl(project);
  const sample = isSampleProjectHome(project);
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!menuOpen) return;
    function onDocPointer(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
        setConfirmDelete(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setMenuOpen(false);
        setConfirmDelete(false);
      }
    }
    document.addEventListener("mousedown", onDocPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  function handleCardActivate() {
    onOpen(project.id);
  }

  function handleOptionsClick(e: ReactMouseEvent) {
    e.stopPropagation();
    e.preventDefault();
    setConfirmDelete(false);
    setMenuOpen((open) => !open);
  }

  function runAction(action: ProjectHomeCardAction, e: ReactMouseEvent) {
    e.stopPropagation();
    e.preventDefault();
    if (action === "delete") {
      if (!confirmDelete) {
        setConfirmDelete(true);
        return;
      }
      onAction?.("delete", project.id);
      setMenuOpen(false);
      setConfirmDelete(false);
      return;
    }
    onAction?.(action, project.id);
    setMenuOpen(false);
    setConfirmDelete(false);
  }

  return (
    <div
      role="button"
      tabIndex={0}
      className="project-home-card"
      onClick={handleCardActivate}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleCardActivate();
        }
      }}
      data-testid={`project-home-card-${project.id}`}
      aria-label={`Open ${project.name}`}
    >
      <span
        className="project-home-card__cover"
        style={{ backgroundImage: `url(${cover})` }}
        aria-hidden
      />
      <span className="project-home-card__veil" aria-hidden />
      <span className="project-home-card__body">
        <span className="project-home-card__top">
          {sample ? (
            <span
              className="project-home-card__sample-badge"
              data-testid={`project-home-sample-badge-${project.id}`}
            >
              Sample
            </span>
          ) : (
            <span />
          )}
          <span className="project-home-card__menu" ref={menuRef}>
            <button
              type="button"
              className="project-home-card__options"
              aria-label={`Options for ${project.name}`}
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              aria-controls={menuId}
              data-testid={`project-home-options-${project.id}`}
              onClick={handleOptionsClick}
            >
              ⋯
            </button>
            {menuOpen ? (
              <div
                id={menuId}
                role="menu"
                className="project-home-card__menu-panel"
                data-testid={`project-home-menu-${project.id}`}
                onClick={(e) => e.stopPropagation()}
              >
                {confirmDelete ? (
                  <div
                    className="project-home-card__delete-confirm"
                    data-testid={`project-home-delete-confirm-${project.id}`}
                  >
                    <p>Delete this project?</p>
                    <div className="project-home-card__delete-actions">
                      <button
                        type="button"
                        role="menuitem"
                        className="project-home-card__menu-item"
                        onClick={(e) => {
                          e.stopPropagation();
                          setConfirmDelete(false);
                        }}
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        role="menuitem"
                        className="project-home-card__menu-item project-home-card__menu-item--danger"
                        data-testid={`project-home-delete-confirm-yes-${project.id}`}
                        onClick={(e) => runAction("delete", e)}
                      >
                        Delete Project
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <button
                      type="button"
                      role="menuitem"
                      className="project-home-card__menu-item"
                      onClick={(e) => runAction("open", e)}
                    >
                      Open
                    </button>
                    <button
                      type="button"
                      role="menuitem"
                      className="project-home-card__menu-item"
                      data-testid={`project-home-rename-${project.id}`}
                      onClick={(e) => runAction("rename", e)}
                    >
                      Rename
                    </button>
                    <button
                      type="button"
                      role="menuitem"
                      className="project-home-card__menu-item"
                      data-testid={`project-home-duplicate-${project.id}`}
                      onClick={(e) => runAction("duplicate", e)}
                    >
                      Duplicate
                    </button>
                    <button
                      type="button"
                      role="menuitem"
                      className="project-home-card__menu-item"
                      data-testid={`project-home-archive-${project.id}`}
                      onClick={(e) => runAction("archive", e)}
                    >
                      Archive
                    </button>
                    {!sample ? (
                      <button
                        type="button"
                        role="menuitem"
                        className="project-home-card__menu-item project-home-card__menu-item--danger"
                        data-testid={`project-home-delete-${project.id}`}
                        onClick={(e) => runAction("delete", e)}
                      >
                        Delete
                      </button>
                    ) : null}
                  </>
                )}
              </div>
            ) : null}
          </span>
        </span>
        <span className="project-home-card__name">{project.name}</span>
        <span className="project-home-card__room">
          Project Home · {room.name}
        </span>
        <span className="project-home-card__purpose">
          {shortPurpose(project.purpose)}
        </span>
        <span className="project-home-card__meta">
          <span className="project-home-card__meta-row">
            <span className="project-home-card__meta-label">Focus</span>
            {project.currentFocus}
          </span>
          <span className="project-home-card__meta-row">
            <span className="project-home-card__meta-label">Last worked</span>
            {formatProjectHomeDate(project.lastWorkedAt)}
          </span>
          <span className="project-home-card__meta-row">
            <span className="project-home-card__meta-label">Next</span>
            {project.nextSuggestedStep}
          </span>
        </span>
        <span className="project-home-card__open" aria-hidden>
          Open
        </span>
      </span>
    </div>
  );
}
