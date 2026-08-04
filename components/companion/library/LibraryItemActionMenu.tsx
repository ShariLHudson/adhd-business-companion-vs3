"use client";

import {
  useId,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
} from "react";
import { useExclusivePopover } from "@/lib/windowDismiss/useExclusivePopover";
import {
  labelForLibraryAction,
  menuActionsForItem,
} from "@/lib/sparkLibraryCollection/capabilities";
import type {
  LibraryItem,
  SparkLibraryCardActionId,
} from "@/lib/sparkLibraryCollection/types";

type Props = {
  item: LibraryItem;
  onAction: (action: SparkLibraryCardActionId, item: LibraryItem) => void;
};

/**
 * Always-visible three-dot menu — never hover-only (133).
 */
export function LibraryItemActionMenu({ item, onAction }: Props) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuId = useId();
  const actions = menuActionsForItem(item);

  // Escape, outside-click, exclusivity and focus return are shared behavior.
  useExclusivePopover({
    overlayId: `library-item-menu:${item.id}`,
    open,
    onClose: () => setOpen(false),
    rootRef,
    triggerRef,
  });

  function stopCardOpen(e: ReactMouseEvent | ReactKeyboardEvent) {
    e.stopPropagation();
    e.preventDefault();
  }

  if (actions.length === 0) return null;

  return (
    <div
      className="spark-library-menu"
      ref={rootRef}
      data-testid={`library-menu-${item.id}`}
    >
      <button
        ref={triggerRef}
        type="button"
        className="spark-library-menu__trigger"
        aria-label={`Actions for ${item.title}`}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        data-testid={`library-menu-trigger-${item.id}`}
        onClick={(e) => {
          stopCardOpen(e);
          setOpen((v) => !v);
        }}
      >
        ⋯
      </button>
      {open ? (
        <div
          id={menuId}
          role="menu"
          className="spark-library-menu__panel"
          data-testid={`library-menu-panel-${item.id}`}
          onClick={stopCardOpen}
        >
          {actions.map((action) => (
            <button
              key={action}
              type="button"
              role="menuitem"
              className={
                action === "trash" || action === "delete"
                  ? "spark-library-menu__item spark-library-menu__item--danger"
                  : "spark-library-menu__item"
              }
              data-testid={`library-menu-action-${item.id}-${action}`}
              onClick={(e) => {
                stopCardOpen(e);
                setOpen(false);
                triggerRef.current?.focus();
                onAction(action, item);
              }}
            >
              {action === "duplicate" && item.kind === "project"
                ? "Duplicate Project"
                : labelForLibraryAction(action)}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
