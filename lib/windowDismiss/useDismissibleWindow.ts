"use client";

import { useCallback, useEffect, useId, useRef } from "react";
import {
  createDismissibleWindowId,
  isTopDismissibleWindow,
  pushDismissibleWindow,
  requestWindowDismiss,
  type RequestWindowDismissOptions,
} from "@/lib/windowDismiss/dismissPolicy";

export type UseDismissibleWindowOptions = {
  open: boolean;
  onClose: () => void;
  /** When false, neither Escape nor outside-click dismiss (rare). */
  enabled?: boolean;
  isDirty?: boolean;
  requiresExplicitDecision?: boolean;
  confirmDiscard?: () => boolean;
  /**
   * When true (default), Escape closes this window if it is the topmost
   * dismissible layer.
   */
  closeOnEscape?: boolean;
};

/**
 * Shared Spark Estate window dismiss behavior.
 * Use for dialogs, sheets, popovers, and floating panels.
 */
export function useDismissibleWindow({
  open,
  onClose,
  enabled = true,
  isDirty = false,
  requiresExplicitDecision = false,
  confirmDiscard,
  closeOnEscape = true,
}: UseDismissibleWindowOptions) {
  const reactId = useId();
  const windowIdRef = useRef(`${createDismissibleWindowId()}-${reactId}`);
  const optionsRef = useRef<RequestWindowDismissOptions>({});
  optionsRef.current = {
    isDirty,
    requiresExplicitDecision,
    confirmDiscard,
  };

  const requestClose = useCallback(() => {
    if (!enabled) return false;
    return requestWindowDismiss(onClose, optionsRef.current);
  }, [enabled, onClose]);

  useEffect(() => {
    if (!open || !enabled) return;
    const id = windowIdRef.current;
    return pushDismissibleWindow({
      id,
      requestDismiss: () => {
        requestClose();
      },
    });
  }, [open, enabled, requestClose]);

  useEffect(() => {
    if (!open || !enabled || !closeOnEscape) return;
    const id = windowIdRef.current;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      if (!isTopDismissibleWindow(id)) return;
      // Do not steal Escape from text fields or native menus (106 accessibility).
      const target = event.target;
      if (target instanceof HTMLElement) {
        const tag = target.tagName;
        if (
          tag === "INPUT" ||
          tag === "TEXTAREA" ||
          tag === "SELECT" ||
          target.isContentEditable
        ) {
          return;
        }
        if (
          target.closest(
            '[role="listbox"], [role="combobox"][aria-expanded="true"], [data-radix-popper-content-wrapper]',
          )
        ) {
          return;
        }
      }
      // Confirmation dialogs: Escape does not dismiss (explicit buttons only).
      if (optionsRef.current.requiresExplicitDecision) {
        event.preventDefault();
        event.stopPropagation();
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      requestClose();
    }

    window.addEventListener("keydown", onKeyDown, true);
    return () => window.removeEventListener("keydown", onKeyDown, true);
  }, [open, enabled, closeOnEscape, requestClose]);

  const onBackdropClick = useCallback(
    (event?: { stopPropagation?: () => void }) => {
      event?.stopPropagation?.();
      requestClose();
    },
    [requestClose],
  );

  return {
    windowId: windowIdRef.current,
    requestClose,
    onBackdropClick,
  };
}
