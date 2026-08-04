"use client";

import { useEffect, useRef, type RefObject } from "react";
import { useDismissibleWindow } from "@/lib/windowDismiss/useDismissibleWindow";
import { openExclusiveOverlay } from "@/lib/windowDismiss/overlayRegistry";

export type UseExclusivePopoverOptions = {
  /** Stable, unique id. Per-instance for menus rendered in a list. */
  overlayId: string;
  open: boolean;
  onClose: () => void;
  /** Element that defines "inside" — the popover root, trigger included. */
  rootRef: RefObject<HTMLElement | null>;
  /** Control that opened it; focus returns here on close. */
  triggerRef: RefObject<HTMLElement | null>;
  /**
   * CSS selector for panel content portaled outside `rootRef`.
   * Presses matching it count as inside.
   */
  outsideClickIgnore?: string;
};

/**
 * Shared behavior for temporary popovers and menus.
 *
 * One place owns what every menu in the Estate previously re-implemented by
 * hand — and mostly got wrong:
 *
 * - Escape and outside-click take the shared guarded path, so uploads, active
 *   operations, voice sessions and explicit-decision blocks are honored.
 * - Only the topmost registered layer responds.
 * - Opening claims exclusive focus: other clean temporary overlays close.
 *   Dirty overlays, dialogs, workspaces and utilities are never touched.
 * - Focus returns to the opening control on close, so keyboard users are not
 *   stranded at the top of the document.
 */
export function useExclusivePopover({
  overlayId,
  open,
  onClose,
  rootRef,
  triggerRef,
  outsideClickIgnore,
}: UseExclusivePopoverOptions) {
  const { requestClose } = useDismissibleWindow({
    open,
    onClose,
    outsideClickRef: rootRef,
    outsideClickIgnore,
    overlayId,
    overlayKind: "popover",
  });

  /**
   * Claim exclusivity after registration. useDismissibleWindow is called
   * first, so this popover is already in the registry and cannot close itself.
   */
  useEffect(() => {
    if (!open) return;
    openExclusiveOverlay(overlayId);
  }, [open, overlayId]);

  // Return focus to the opener — only on a real open → closed transition.
  const wasOpenRef = useRef(false);
  useEffect(() => {
    if (wasOpenRef.current && !open) {
      triggerRef.current?.focus();
    }
    wasOpenRef.current = open;
  }, [open, triggerRef]);

  return { requestClose };
}
