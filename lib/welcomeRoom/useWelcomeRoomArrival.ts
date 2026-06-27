"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  prefersReducedMotion,
  WELCOME_ROOM_INTRO_DOLLY_MS,
  WELCOME_ROOM_READY_ELAPSED_MS,
  welcomeRoomArrivalPhase,
  welcomeRoomCinematicDollyProgress,
  welcomeRoomDarkOpacity,
  welcomeRoomDollyFrame,
  welcomeRoomFadeOpacity,
  welcomeRoomShowReadOffer,
  type WelcomeRoomArrivalPhase,
  type WelcomeRoomDollyFrame,
} from "./arrival";

export type WelcomeRoomArrivalState = {
  phase: WelcomeRoomArrivalPhase;
  fadeOpacity: number;
  darkOpacity: number;
  dolly: WelcomeRoomDollyFrame;
  elapsedMs: number;
  showReadOffer: boolean;
  walkComplete: boolean;
};

type Options = {
  /** Read mode — hold the current frame. */
  frozen?: boolean;
  /** Play pressed — slow dolly begins. */
  cinematicActive?: boolean;
  /** Pause — hold dolly and audio together. */
  cinematicPaused?: boolean;
};

const REDUCED_MOTION_STATE: WelcomeRoomArrivalState = {
  phase: "settled",
  fadeOpacity: 1,
  darkOpacity: 0,
  dolly: welcomeRoomDollyFrame(1),
  elapsedMs: WELCOME_ROOM_READY_ELAPSED_MS,
  showReadOffer: true,
  walkComplete: true,
};

function frameAt(
  roomMs: number,
  cinematicMs: number,
  cinematicActive: boolean,
): WelcomeRoomArrivalState {
  const dollyProgress = cinematicActive
    ? welcomeRoomCinematicDollyProgress(cinematicMs)
    : 0;

  return {
    phase: welcomeRoomArrivalPhase(
      roomMs,
      false,
      cinematicActive ? cinematicMs : 0,
    ),
    fadeOpacity: welcomeRoomFadeOpacity(roomMs),
    darkOpacity: welcomeRoomDarkOpacity(roomMs),
    dolly: welcomeRoomDollyFrame(dollyProgress),
    elapsedMs: roomMs,
    showReadOffer: welcomeRoomShowReadOffer(roomMs, false),
    walkComplete:
      cinematicActive && cinematicMs >= WELCOME_ROOM_INTRO_DOLLY_MS,
  };
}

export function useWelcomeRoomArrival(
  options: Options = {},
): WelcomeRoomArrivalState & { resetCinematic: () => void } {
  const frozen = options.frozen ?? false;
  const cinematicActive = options.cinematicActive ?? false;
  const cinematicPaused = options.cinematicPaused ?? false;

  const [state, setState] = useState<WelcomeRoomArrivalState>(() =>
    prefersReducedMotion() ? REDUCED_MOTION_STATE : frameAt(0, 0, false),
  );
  const roomOriginRef = useRef<number | null>(null);
  const roomElapsedRef = useRef(0);
  const cinematicOriginRef = useRef<number | null>(null);
  const cinematicElapsedRef = useRef(0);
  const [resetToken, setResetToken] = useState(0);

  const resetCinematic = useCallback(() => {
    cinematicOriginRef.current = null;
    cinematicElapsedRef.current = 0;
    setResetToken((token) => token + 1);
    setState((prev) => ({
      ...prev,
      phase: welcomeRoomArrivalPhase(prev.elapsedMs, false, 0),
      dolly: welcomeRoomDollyFrame(0),
      walkComplete: false,
    }));
  }, []);

  useEffect(() => {
    if (prefersReducedMotion()) {
      setState(REDUCED_MOTION_STATE);
      return;
    }

    if (frozen || cinematicPaused) {
      setState(
        frameAt(
          roomElapsedRef.current,
          cinematicElapsedRef.current,
          cinematicActive,
        ),
      );
      return;
    }

    if (roomOriginRef.current === null) {
      roomOriginRef.current = performance.now();
    }

    if (cinematicActive) {
      if (cinematicOriginRef.current === null) {
        cinematicOriginRef.current = performance.now();
      }
    } else {
      cinematicOriginRef.current = null;
      cinematicElapsedRef.current = 0;
    }

    let frame = 0;
    const tick = (now: number) => {
      const roomMs = now - (roomOriginRef.current ?? now);
      roomElapsedRef.current = roomMs;
      const cinematicMs =
        cinematicActive && cinematicOriginRef.current !== null
          ? now - cinematicOriginRef.current
          : 0;
      cinematicElapsedRef.current = cinematicMs;
      setState(frameAt(roomMs, cinematicMs, cinematicActive));
      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [frozen, cinematicActive, cinematicPaused, resetToken]);

  return { ...state, resetCinematic };
}
