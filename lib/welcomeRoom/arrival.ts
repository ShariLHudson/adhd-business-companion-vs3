/**
 * Welcome Room arrival — dark pause, reveal, perspective walk toward the chair.
 * Dolly advances after Step Inside / Play — pans through the photo, not a center zoom.
 */

/** Full black hold — let the visitor arrive. */
export const WELCOME_ROOM_DARK_MS = 1800 as const;

/** Room fades in after the dark pause. */
export const WELCOME_ROOM_REVEAL_MS = 800 as const;

/** @deprecated Use WELCOME_ROOM_REVEAL_MS */
export const WELCOME_ROOM_FADE_MS = WELCOME_ROOM_REVEAL_MS;

/** Slow forward walk — paced for the full welcome letter (~3+ minutes of voice). */
export const WELCOME_ROOM_DOLLY_MS = 210000 as const;

/** Physical walk-in — doorway to chair (~5–6s). Not a slow zoom. */
export const WELCOME_ROOM_INTRO_DOLLY_MS = 5800 as const;

/** CSS perspective on the dolly rig — pairs with translateZ + fill compensation. */
export const WELCOME_ROOM_PERSPECTIVE_PX = 1100 as const;

/** Music begins when the visitor presses Play. */
export const WELCOME_ROOM_PLAY_MUSIC_START_MS = 0 as const;

/** Shari speaks ~2.5s after Play — room and music settle first. */
export const WELCOME_ROOM_PLAY_VOICE_START_MS = 2500 as const;

/** @deprecated Use WELCOME_ROOM_PLAY_MUSIC_START_MS */
export const WELCOME_ROOM_MUSIC_START_MS = WELCOME_ROOM_DARK_MS;

/** @deprecated Use WELCOME_ROOM_PLAY_VOICE_START_MS */
export const WELCOME_ROOM_VOICE_START_MS = WELCOME_ROOM_DARK_MS + 2000;

export const WELCOME_ROOM_SILENCE_MS = 0;

export const WELCOME_ROOM_INVITE_DELAY_MS = 8000 as const;

export const WELCOME_ROOM_PAUSE_MS = 0 as const;
export const WELCOME_ROOM_LETTER_DELAY_MS =
  WELCOME_ROOM_DARK_MS + WELCOME_ROOM_REVEAL_MS + WELCOME_ROOM_DOLLY_MS;
export const WELCOME_ROOM_ARRIVAL_MS = WELCOME_ROOM_LETTER_DELAY_MS;
export const WELCOME_ROOM_WALK_IN_MS = WELCOME_ROOM_DOLLY_MS;
export const WELCOME_ROOM_OUTSIDE_HOLD_MS = WELCOME_ROOM_DARK_MS;

/** Room visible, dolly held at the doorway — waiting for Play. */
export const WELCOME_ROOM_READY_ELAPSED_MS =
  WELCOME_ROOM_DARK_MS + WELCOME_ROOM_REVEAL_MS;

export const WELCOME_ROOM_ENTRANCE_VIEW = {
  /** Farther back — widest practical view from just outside the sunroom. */
  translateZ: -340,
  objectXPercent: 50,
  objectYPercent: 34,
} as const;

export const WELCOME_ROOM_CHAIR_VIEW = {
  translateZ: 0,
  objectXPercent: 50,
  objectYPercent: 44,
} as const;

/** @deprecated Use WELCOME_ROOM_ENTRANCE_VIEW */
export const WELCOME_ROOM_DOORWAY_VIEW = WELCOME_ROOM_ENTRANCE_VIEW;

/** @deprecated Wide entrance framing — use WELCOME_ROOM_ENTRANCE_VIEW.translateZ */
export const WELCOME_ROOM_ARRIVAL_ZOOM = WELCOME_ROOM_ENTRANCE_VIEW.translateZ;

export type WelcomeRoomArrivalPhase = "dark" | "revealing" | "walking" | "settled";

export function welcomeRoomMotionElapsed(elapsedMs: number): number {
  return Math.max(0, elapsedMs - WELCOME_ROOM_DARK_MS);
}

export function welcomeRoomDarkOpacity(elapsedMs: number): number {
  if (elapsedMs < WELCOME_ROOM_DARK_MS) return 1;
  const fadeOut = elapsedMs - WELCOME_ROOM_DARK_MS;
  return Math.max(0, 1 - fadeOut / WELCOME_ROOM_REVEAL_MS);
}

export function welcomeRoomFadeOpacity(elapsedMs: number): number {
  if (elapsedMs < WELCOME_ROOM_DARK_MS) return 0;
  const reveal = elapsedMs - WELCOME_ROOM_DARK_MS;
  return Math.min(1, reveal / WELCOME_ROOM_REVEAL_MS);
}

/** Progress 0–1 for the walk-in after Play. */
export function welcomeRoomCinematicDollyProgress(cinematicMs: number): number {
  if (cinematicMs >= WELCOME_ROOM_INTRO_DOLLY_MS) return 1;
  if (cinematicMs <= 0) return 0;
  return cinematicMs / WELCOME_ROOM_INTRO_DOLLY_MS;
}

/** @deprecated Use welcomeRoomCinematicDollyProgress after Play. */
export function welcomeRoomDollyProgress(elapsedMs: number): number {
  return welcomeRoomCinematicDollyProgress(
    Math.max(0, welcomeRoomMotionElapsed(elapsedMs) - WELCOME_ROOM_REVEAL_MS),
  );
}

/** Counter-scale so perspective dolly pans through the photo — never scales the frame like zoom. */
export function welcomeRoomPerspectiveFillScale(translateZ: number): number {
  const p = WELCOME_ROOM_PERSPECTIVE_PX;
  return (p - translateZ) / p;
}

export function welcomeRoomArrivalPhase(
  roomElapsedMs: number,
  reducedMotion: boolean,
  cinematicMs = 0,
): WelcomeRoomArrivalPhase {
  if (reducedMotion) return "settled";
  if (roomElapsedMs < WELCOME_ROOM_DARK_MS) return "dark";
  if (roomElapsedMs < WELCOME_ROOM_DARK_MS + WELCOME_ROOM_REVEAL_MS) return "revealing";
  if (cinematicMs > 0 && cinematicMs < WELCOME_ROOM_INTRO_DOLLY_MS) return "walking";
  return "settled";
}

export function welcomeRoomShowReadOffer(
  roomElapsedMs: number,
  reducedMotion: boolean,
): boolean {
  if (reducedMotion) return true;
  return roomElapsedMs >= WELCOME_ROOM_INVITE_DELAY_MS;
}

export type WelcomeRoomDollyFrame = {
  translateZ: number;
  /** Compensates perspective shrink so the image does not grow like a zoom. */
  photoScale: number;
  objectPosition: string;
};

export function welcomeRoomDollyFrame(progress: number): WelcomeRoomDollyFrame {
  const p = Math.max(0, Math.min(1, progress));
  const eased = 1 - (1 - p) ** 3;
  const translateZ =
    WELCOME_ROOM_ENTRANCE_VIEW.translateZ +
    (WELCOME_ROOM_CHAIR_VIEW.translateZ - WELCOME_ROOM_ENTRANCE_VIEW.translateZ) *
      eased;
  const y =
    WELCOME_ROOM_ENTRANCE_VIEW.objectYPercent +
    (WELCOME_ROOM_CHAIR_VIEW.objectYPercent -
      WELCOME_ROOM_ENTRANCE_VIEW.objectYPercent) *
      eased;
  return {
    translateZ,
    photoScale: welcomeRoomPerspectiveFillScale(translateZ),
    objectPosition: `${WELCOME_ROOM_ENTRANCE_VIEW.objectXPercent}% ${y}%`,
  };
}

export function welcomeRoomDollyEase(t: number): number {
  return welcomeRoomCinematicDollyProgress(t * WELCOME_ROOM_INTRO_DOLLY_MS);
}

export function easeOutCubic(t: number): number {
  const clamped = Math.max(0, Math.min(1, t));
  return 1 - (1 - clamped) ** 3;
}

export function welcomeRoomShowInvite(
  roomElapsedMs: number,
  reducedMotion: boolean,
): boolean {
  return welcomeRoomShowReadOffer(roomElapsedMs, reducedMotion);
}

export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
