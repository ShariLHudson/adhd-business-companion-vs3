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
  welcomeRoomWalkElapsedMs,
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
  /** Pause — hold dolly (audio pause uses the same flag). */
  walkPaused?: boolean;
  /** Skip the opening black hold — sunroom visible immediately. */
  skipIntro?: boolean;
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
  frozen: boolean,
  walkPaused: boolean,
  walkHoldMs: number,
): WelcomeRoomArrivalState {
  const rawWalkMs = welcomeRoomWalkElapsedMs(roomMs);
  const walkMs =
    frozen || walkPaused ? walkHoldMs : rawWalkMs;
  const dollyProgress = welcomeRoomCinematicDollyProgress(walkMs);

  return {
    phase: welcomeRoomArrivalPhase(roomMs, false, walkMs),
    fadeOpacity: welcomeRoomFadeOpacity(roomMs),
    darkOpacity: welcomeRoomDarkOpacity(roomMs),
    dolly: welcomeRoomDollyFrame(dollyProgress),
    elapsedMs: roomMs,
    showReadOffer: welcomeRoomShowReadOffer(roomMs, false),
    walkComplete: walkMs >= WELCOME_ROOM_INTRO_DOLLY_MS,
  };
}

export function useWelcomeRoomArrival(
  options: Options = {},
): WelcomeRoomArrivalState & { resetCinematic: () => void } {
  const frozen = options.frozen ?? false;
  const walkPaused = options.walkPaused ?? false;
  const skipIntro = options.skipIntro ?? false;

  const [state, setState] = useState<WelcomeRoomArrivalState>(() => {
    if (prefersReducedMotion()) return REDUCED_MOTION_STATE;
    if (skipIntro) {
      return frameAt(WELCOME_ROOM_READY_ELAPSED_MS, false, false, 0);
    }
    return frameAt(0, false, false, 0);
  });
  const roomOriginRef = useRef<number | null>(
    skipIntro ? performance.now() - WELCOME_ROOM_READY_ELAPSED_MS : null,
  );
  const roomElapsedRef = useRef(0);
  const walkHoldRef = useRef(0);
  const [resetToken, setResetToken] = useState(0);

  const resetCinematic = useCallback(() => {
    walkHoldRef.current = 0;
    roomOriginRef.current = performance.now() - WELCOME_ROOM_READY_ELAPSED_MS;
    roomElapsedRef.current = WELCOME_ROOM_READY_ELAPSED_MS;
    setResetToken((token) => token + 1);
    setState(frameAt(WELCOME_ROOM_READY_ELAPSED_MS, false, false, 0));
  }, []);

  useEffect(() => {
    if (prefersReducedMotion()) {
      setState(REDUCED_MOTION_STATE);
      return;
    }

    if (frozen || walkPaused) {
      setState(
        frameAt(
          roomElapsedRef.current,
          frozen,
          walkPaused,
          walkHoldRef.current,
        ),
      );
      return;
    }

    if (roomOriginRef.current === null) {
      roomOriginRef.current = skipIntro
        ? performance.now() - WELCOME_ROOM_READY_ELAPSED_MS
        : performance.now();
    }

    let frame = 0;
    const tick = (now: number) => {
      const roomMs = now - (roomOriginRef.current ?? now);
      roomElapsedRef.current = roomMs;
      walkHoldRef.current = welcomeRoomWalkElapsedMs(roomMs);
      setState(frameAt(roomMs, false, false, walkHoldRef.current));
      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [frozen, walkPaused, resetToken, skipIntro]);

  return { ...state, resetCinematic };
}
