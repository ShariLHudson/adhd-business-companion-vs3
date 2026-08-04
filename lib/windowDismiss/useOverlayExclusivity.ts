"use client";

import { useEffect, useRef, type RefObject } from "react";
import { openExclusiveOverlay } from "@/lib/windowDismiss/overlayRegistry";

export type UseOverlayExclusivityOptions = {
  /** Must match the id this window registered with useDismissibleWindow. */
  overlayId: string;
  open: boolean;
  /**
   * Element focus returns to on close — typically the control that opened
   * this window, or (when no such control is reachable, e.g. a dialog opened
   * from a menu item that has since unmounted) whatever was focused right
   * before this window took focus.
   */
  triggerRef: RefObject<HTMLElement | null>;
};

/**
 * Shared "claim exclusive focus on open, restore focus on close" behavior —
 * independent of *how* a window detects outside-click or Escape (that stays
 * useDismissibleWindow's job). Any overlay kind can use this: a bare popover
 * via useExclusivePopover, or a backdrop+panel dialog wiring it directly
 * alongside its own onBackdropClick.
 *
 * Claiming exclusivity here is what makes "opening this window asks other
 * eligible temporary overlays to close" true — registering alone does not;
 * lib/windowDismiss/overlayRegistry.ts's openExclusiveOverlay is what a
 * caller must invoke.
 */
export function useOverlayExclusivity({
  overlayId,
  open,
  triggerRef,
}: UseOverlayExclusivityOptions) {
  useEffect(() => {
    if (!open) return;
    openExclusiveOverlay(overlayId);
  }, [open, overlayId]);

  // Only on a real open → closed transition, so mounting already-closed
  // does not steal focus.
  const wasOpenRef = useRef(false);
  useEffect(() => {
    if (wasOpenRef.current && !open) {
      triggerRef.current?.focus();
    }
    wasOpenRef.current = open;
  }, [open, triggerRef]);
}
