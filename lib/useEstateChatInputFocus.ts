"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import type { RefObject } from "react";
import {
  ESTATE_CHAT_INPUT_FOCUS_DELAY_MS,
  ESTATE_CHAT_INPUT_FOCUS_DELAY_NAV_MS,
  ESTATE_CHAT_INPUT_FOCUS_DELAY_STARTUP_MS,
  scheduleEstateChatInputFocus,
  shouldRoutePrintableKeyToChatInput,
  type EstateChatInputFocusOptions,
} from "@/lib/estateChatInputFocus";

export type UseEstateChatInputFocusOptions = {
  inputRef: RefObject<HTMLTextAreaElement | null>;
  /** Chat footer is mounted and auto-focus is allowed. */
  enabled: boolean;
  hydrated: boolean;
  isLoading: boolean;
  activeSection: string;
  workspacePanel: string | null;
  overlay: string | null;
  freshStartDialog: string | null;
  freshStartRevision: number;
  /** Changes on estate navigation (section, room, panel). */
  estateNavigationKey: string;
};

export function useEstateChatInputFocus({
  inputRef,
  enabled,
  hydrated,
  isLoading,
  activeSection,
  workspacePanel,
  overlay,
  freshStartDialog,
  freshStartRevision,
  estateNavigationKey,
}: UseEstateChatInputFocusOptions) {
  const cancelFocusRef = useRef<(() => void) | null>(null);
  const wasLoadingRef = useRef(false);
  const hadOverlayRef = useRef(false);
  const startupFocusedRef = useRef(false);

  const requestChatInputFocus = useCallback(
    (opts?: EstateChatInputFocusOptions) => {
      if (!enabled) return;
      cancelFocusRef.current?.();
      cancelFocusRef.current = scheduleEstateChatInputFocus(inputRef, opts);
    },
    [enabled, inputRef],
  );

  const navigationDelay = useMemo(
    () => ({
      delayMs: ESTATE_CHAT_INPUT_FOCUS_DELAY_NAV_MS,
      preventScroll: true as const,
    }),
    [],
  );

  // App startup — once hydrated and chat is ready.
  useEffect(() => {
    if (!enabled || !hydrated || startupFocusedRef.current) return;
    startupFocusedRef.current = true;
    requestChatInputFocus({
      delayMs: ESTATE_CHAT_INPUT_FOCUS_DELAY_STARTUP_MS,
      preventScroll: true,
    });
  }, [enabled, hydrated, requestChatInputFocus]);

  // After Spark finishes responding.
  useEffect(() => {
    if (!enabled) return;
    if (wasLoadingRef.current && !isLoading) {
      requestChatInputFocus({
        delayMs: ESTATE_CHAT_INPUT_FOCUS_DELAY_MS,
        preventScroll: true,
      });
    }
    wasLoadingRef.current = isLoading;
  }, [enabled, isLoading, requestChatInputFocus]);

  // Navigation: section, workspace panel, estate room.
  useEffect(() => {
    if (!enabled || !hydrated) return;
    requestChatInputFocus(navigationDelay);
  }, [enabled, hydrated, estateNavigationKey, requestChatInputFocus, navigationDelay]);

  // Overlay / dialog closed — return focus to chat.
  useEffect(() => {
    if (!enabled) return;
    const hadOverlay = hadOverlayRef.current;
    hadOverlayRef.current = Boolean(overlay || freshStartDialog);
    if (hadOverlay && !overlay && !freshStartDialog) {
      requestChatInputFocus(navigationDelay);
    }
  }, [
    enabled,
    overlay,
    freshStartDialog,
    requestChatInputFocus,
    navigationDelay,
  ]);

  // New conversation / new day.
  useEffect(() => {
    if (!enabled || freshStartRevision === 0) return;
    requestChatInputFocus(navigationDelay);
  }, [enabled, freshStartRevision, requestChatInputFocus, navigationDelay]);

  // Estate-wide type-to-talk (not only home).
  useEffect(() => {
    if (!enabled) return;

    function onKeyDown(event: KeyboardEvent) {
      if (!shouldRoutePrintableKeyToChatInput(event, inputRef.current)) return;
      cancelFocusRef.current?.();
      cancelFocusRef.current = scheduleEstateChatInputFocus(inputRef, {
        delayMs: 0,
        preventScroll: true,
        placeCursorAtEnd: false,
      });
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [enabled, inputRef]);

  useEffect(() => {
    return () => {
      cancelFocusRef.current?.();
    };
  }, []);

  return { requestChatInputFocus };
}
