"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type UseIdleChromeRevealOptions = {
  /** Idle before fade when not in browser fullscreen. */
  idleMs?: number;
  /** Idle before fade in browser fullscreen — usually shorter. */
  fullscreenIdleMs?: number;
  /** When false, chrome stays fully visible (no idle timer). */
  enabled?: boolean;
  /** When true, idle fade runs only while browser fullscreen is active. */
  onlyWhenFullscreen?: boolean;
  /** When false, chrome starts hidden until pointer activity (Presence Mode). */
  initialVisible?: boolean;
};

/**
 * Fade estate chrome after idle; shorter delay in fullscreen.
 * Pointer activity or Escape brings it back.
 */
export function useIdleChromeReveal(options: UseIdleChromeRevealOptions = {}) {
  const {
    idleMs = 8000,
    fullscreenIdleMs = 3500,
    enabled = true,
    onlyWhenFullscreen = false,
    initialVisible = true,
  } = options;

  const [visible, setVisible] = useState(initialVisible);
  const [fullscreen, setFullscreen] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fadeActive = enabled && (!onlyWhenFullscreen || fullscreen);

  useEffect(() => {
    const sync = () => setFullscreen(Boolean(document.fullscreenElement));
    sync();
    document.addEventListener("fullscreenchange", sync);
    return () => document.removeEventListener("fullscreenchange", sync);
  }, []);

  const bumpVisibility = useCallback(() => {
    setVisible(true);
    if (!fadeActive) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    const delay = fullscreen ? fullscreenIdleMs : idleMs;
    timerRef.current = setTimeout(() => setVisible(false), delay);
  }, [fadeActive, fullscreen, fullscreenIdleMs, idleMs]);

  useEffect(() => {
    if (!fadeActive) {
      setVisible(true);
      if (timerRef.current) clearTimeout(timerRef.current);
      return;
    }

    if (initialVisible) {
      bumpVisibility();
    }

    const onActivity = () => bumpVisibility();
    window.addEventListener("mousemove", onActivity, { passive: true });
    window.addEventListener("touchstart", onActivity, { passive: true });
    window.addEventListener("keydown", onActivity);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      window.removeEventListener("mousemove", onActivity);
      window.removeEventListener("touchstart", onActivity);
      window.removeEventListener("keydown", onActivity);
    };
  }, [bumpVisibility, fadeActive, initialVisible]);

  useEffect(() => {
    if (fadeActive && initialVisible) bumpVisibility();
  }, [fullscreen, fadeActive, bumpVisibility, initialVisible]);

  return {
    visible,
    fullscreen,
    bumpVisibility,
    faded: fadeActive && !visible,
  };
}
