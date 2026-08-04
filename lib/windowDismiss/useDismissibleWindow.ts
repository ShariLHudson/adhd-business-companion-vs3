"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  type RefObject,
} from "react";
import {
  createDismissibleWindowId,
  isTopDismissibleWindow,
  pushDismissibleWindow,
  requestWindowDismiss,
  type RequestWindowDismissOptions,
} from "@/lib/windowDismiss/dismissPolicy";
import { isScrollbarPointerTarget } from "@/lib/planMyDay/morningRoomOutsideDismiss";
import {
  registerOverlay,
  type OverlayKind,
} from "@/lib/windowDismiss/overlayRegistry";

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
  /**
   * Opt in to outside-click dismissal by passing the element that defines
   * "inside" — usually the panel/dialog itself. Pointer presses outside it
   * take the same guarded path as Escape (`requestWindowDismiss`), so
   * explicit-decision dialogs, uploads, active operations, unsaved work, and
   * voice sessions are honored identically.
   *
   * Omit to leave outside-click off — existing consumers are unchanged.
   */
  outsideClickRef?: RefObject<HTMLElement | null>;
  /**
   * When true (default), an outside pointer press closes this window if it is
   * the topmost dismissible layer. Requires `outsideClickRef`.
   */
  closeOnOutsideClick?: boolean;
  /**
   * Opt in to the Estate overlay registry under a stable id — lets the Estate
   * tell this surface apart from a primary workspace, and lets an unsaved-work
   * guard registered under the same id protect it.
   *
   * Requires `overlayKind`. Registering alone closes nothing; exclusivity is
   * claimed explicitly via `openExclusiveOverlay`.
   */
  overlayId?: string;
  /** What this surface is. Required alongside `overlayId`. */
  overlayKind?: OverlayKind;
  /**
   * CSS selector for content that belongs to this window but lives outside
   * `outsideClickRef` in the DOM — typically a panel portaled to `document.body`.
   * Pointer presses matching it count as inside.
   */
  outsideClickIgnore?: string;
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
  outsideClickRef,
  closeOnOutsideClick = true,
  overlayId,
  overlayKind,
  outsideClickIgnore,
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

  /**
   * Stack position must depend only on open/enabled. Callers commonly pass an
   * inline `onClose`, so keying the push effect on `requestClose` would pop and
   * re-push this window on every parent render — silently promoting a lower
   * layer above the one actually on top.
   */
  const requestCloseRef = useRef(requestClose);
  requestCloseRef.current = requestClose;

  useEffect(() => {
    if (!open || !enabled) return;
    const id = windowIdRef.current;
    return pushDismissibleWindow({
      id,
      requestDismiss: () => {
        requestCloseRef.current();
      },
    });
  }, [open, enabled]);

  /**
   * Overlay registry membership. Same reasoning as the stack push: keyed on
   * identity only, never on `requestClose`, so render churn cannot reorder it.
   */
  useEffect(() => {
    if (!open || !enabled || !overlayId || !overlayKind) return;
    return registerOverlay({
      id: overlayId,
      kind: overlayKind,
      requestDismiss: () => requestCloseRef.current(),
    });
  }, [open, enabled, overlayId, overlayKind]);

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

  useEffect(() => {
    if (!open || !enabled || !closeOnOutsideClick || !outsideClickRef) return;
    const id = windowIdRef.current;

    function onPointerDown(event: MouseEvent | TouchEvent) {
      if (!isTopDismissibleWindow(id)) return;
      const container = outsideClickRef?.current;
      if (!container) return;

      const target = event.target;
      if (!(target instanceof Node)) return;
      if (container.contains(target)) return;

      // Content this window owns but portals elsewhere in the DOM.
      if (
        outsideClickIgnore &&
        target instanceof Element &&
        target.closest(outsideClickIgnore)
      ) {
        return;
      }

      // Scrollbar track/thumb is not an outside click (106). Only an element
      // that actually overflows can own a scrollbar — checking that first
      // keeps zero-layout elements from matching the geometry test.
      if (
        target instanceof Element &&
        "clientX" in event &&
        (target.scrollHeight > target.clientHeight ||
          target.scrollWidth > target.clientWidth) &&
        isScrollbarPointerTarget(event, target)
      ) {
        return;
      }

      // Portaled menus owned by this window (select popups, comboboxes) sit
      // outside the container in the DOM but are not "outside" to the member.
      if (
        target instanceof HTMLElement &&
        target.closest(
          '[role="listbox"], [role="combobox"][aria-expanded="true"], [data-radix-popper-content-wrapper]',
        )
      ) {
        return;
      }

      // Same guarded path as Escape — policy decides, not the caller.
      requestClose();
    }

    document.addEventListener("mousedown", onPointerDown, true);
    document.addEventListener("touchstart", onPointerDown, true);
    return () => {
      document.removeEventListener("mousedown", onPointerDown, true);
      document.removeEventListener("touchstart", onPointerDown, true);
    };
  }, [
    open,
    enabled,
    closeOnOutsideClick,
    outsideClickRef,
    outsideClickIgnore,
    requestClose,
  ]);

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
