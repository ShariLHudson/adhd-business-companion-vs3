"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { EnjoyEstateFlame } from "@/components/companion/estate/EnjoyEstateFlame";
import { toggleEstateBrowserFullscreen } from "@/lib/estate/estateBrowserFullscreen";
import {
  ENJOY_ESTATE_CURSOR_HIDE_MS,
  ESTATE_CHROME_IDLE_HINT_FULLSCREEN,
  JUST_BE_HERE_CONTROLS_IDLE_MS,
  JUST_BE_HERE_FULLSCREEN_CONTROLS_IDLE_MS,
} from "@/lib/estate/justBeHere";
import { useIdleChromeReveal } from "@/lib/estate/useIdleChromeReveal";

export type EnjoyEstateVisitorChromeProps = {
  soundEnabled: boolean;
  soundAvailable: boolean;
  chatVisible: boolean;
  onReturnToEstate: () => void;
  onToggleChat: () => void;
  onToggleSound: () => void;
};

/**
 * Presence Mode chrome — top-right; labeled controls on pointer activity.
 */
export function EnjoyEstateVisitorChrome({
  soundEnabled,
  soundAvailable,
  chatVisible,
  onReturnToEstate,
  onToggleChat,
  onToggleSound,
}: EnjoyEstateVisitorChromeProps) {
  const [mounted, setMounted] = useState(false);
  const [cursorHidden, setCursorHidden] = useState(false);
  const cursorTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { faded, bumpVisibility, fullscreen } = useIdleChromeReveal({
    idleMs: JUST_BE_HERE_CONTROLS_IDLE_MS,
    fullscreenIdleMs: JUST_BE_HERE_FULLSCREEN_CONTROLS_IDLE_MS,
    enabled: true,
    initialVisible: false,
  });

  useEffect(() => setMounted(true), []);

  const scheduleCursorHide = useCallback(() => {
    setCursorHidden(false);
    if (cursorTimerRef.current) clearTimeout(cursorTimerRef.current);
    cursorTimerRef.current = setTimeout(() => {
      setCursorHidden(true);
    }, ENJOY_ESTATE_CURSOR_HIDE_MS);
  }, []);

  useEffect(() => {
    scheduleCursorHide();
    const onActivity = () => scheduleCursorHide();
    window.addEventListener("mousemove", onActivity, { passive: true });
    window.addEventListener("touchstart", onActivity, { passive: true });
    window.addEventListener("keydown", onActivity);
    return () => {
      if (cursorTimerRef.current) clearTimeout(cursorTimerRef.current);
      window.removeEventListener("mousemove", onActivity);
      window.removeEventListener("touchstart", onActivity);
      window.removeEventListener("keydown", onActivity);
    };
  }, [scheduleCursorHide]);

  useEffect(() => {
    const root = document.querySelector(".companion-root");
    if (!root) return;
    if (cursorHidden) {
      root.setAttribute("data-enjoy-estate-cursor-idle", "true");
    } else {
      root.removeAttribute("data-enjoy-estate-cursor-idle");
    }
    return () => root.removeAttribute("data-enjoy-estate-cursor-idle");
  }, [cursorHidden]);

  const handleActivity = useCallback(() => {
    bumpVisibility();
    scheduleCursorHide();
  }, [bumpVisibility, scheduleCursorHide]);

  const handleChatToggle = useCallback(() => {
    handleActivity();
    onToggleChat();
  }, [handleActivity, onToggleChat]);

  const handleToggleFullscreen = useCallback(async () => {
    handleActivity();
    await toggleEstateBrowserFullscreen();
  }, [handleActivity]);

  if (!mounted) return null;

  return createPortal(
    <div
      className={[
        "enjoy-estate-visitor",
        faded ? "enjoy-estate-visitor--flame-only" : "enjoy-estate-visitor--strip-visible",
        fullscreen ? "enjoy-estate-visitor--browser-fullscreen" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      role="presentation"
      onMouseMove={handleActivity}
      onTouchStart={handleActivity}
    >
      {!faded ? (
        <div
          className="enjoy-estate-visitor__strip"
          role="toolbar"
          aria-label="Enjoy the Estate"
        >
          <button
            type="button"
            className={[
              "enjoy-estate-visitor__action",
              "enjoy-estate-visitor__action--primary",
              chatVisible ? "enjoy-estate-visitor__action--active" : "",
            ]
              .filter(Boolean)
              .join(" ")}
            aria-pressed={chatVisible}
            aria-label={chatVisible ? "Chat off" : "Chat on"}
            onClick={handleChatToggle}
          >
            <span className="enjoy-estate-visitor__action-icon" aria-hidden>
              💬
            </span>
            <span className="enjoy-estate-visitor__action-label">
              {chatVisible ? "Chat off" : "Chat on"}
            </span>
          </button>
          <button
            type="button"
            className="enjoy-estate-visitor__action"
            aria-label="Return to Estate"
            onClick={() => {
              handleActivity();
              onReturnToEstate();
            }}
          >
            <span className="enjoy-estate-visitor__action-icon" aria-hidden>
              🏠
            </span>
            <span className="enjoy-estate-visitor__action-label">
              Return to Estate
            </span>
          </button>
          {soundAvailable ? (
            <button
              type="button"
              className={[
                "enjoy-estate-visitor__action",
                soundEnabled ? "enjoy-estate-visitor__action--active" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              aria-pressed={soundEnabled}
              aria-label={soundEnabled ? "Room sound on" : "Room sound off"}
              onClick={() => {
                handleActivity();
                onToggleSound();
              }}
            >
              <span className="enjoy-estate-visitor__action-icon" aria-hidden>
                🎵
              </span>
              <span className="enjoy-estate-visitor__action-label">
                {soundEnabled ? "Room sound on" : "Room sound off"}
              </span>
            </button>
          ) : null}
          <button
            type="button"
            className="enjoy-estate-visitor__action"
            aria-label={fullscreen ? "Exit full screen" : "Enter full screen"}
            onClick={() => {
              void handleToggleFullscreen();
            }}
          >
            <span className="enjoy-estate-visitor__action-icon" aria-hidden>
              {fullscreen ? "⤡" : "⛶"}
            </span>
            <span className="enjoy-estate-visitor__action-label">
              {fullscreen ? "Exit full screen" : "Full screen"}
            </span>
          </button>
          <EnjoyEstateFlame
            className="enjoy-estate-visitor__flame enjoy-estate-visitor__flame--inline"
            ariaLabel={chatVisible ? "Chat off" : "Chat on"}
            onClick={handleChatToggle}
          />
        </div>
      ) : fullscreen ? (
        <button
          type="button"
          className="enjoy-estate-visitor__hint enjoy-estate-visitor__hint--fullscreen"
          aria-label="Show menu — move mouse or tap"
          onClick={handleActivity}
        >
          {ESTATE_CHROME_IDLE_HINT_FULLSCREEN}
        </button>
      ) : (
        <EnjoyEstateFlame
          ariaLabel={chatVisible ? "Chat off" : "Chat on"}
          onClick={handleChatToggle}
        />
      )}
    </div>,
    document.body,
  );
}
