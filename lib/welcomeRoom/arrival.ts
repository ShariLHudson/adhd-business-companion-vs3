/**
 * Welcome Room arrival — full-screen cover dolly-in (not a picture resizing in the window).
 * Image always fills the viewport; scale 1 → ~1.85 crops inward toward Shari.
 */

/** Full black hold — let the visitor arrive. */
export const WELCOME_ROOM_DARK_MS = 1800 as const;

/** Room fades in after the dark pause. */
export const WELCOME_ROOM_REVEAL_MS = 800 as const;

/** @deprecated Use WELCOME_ROOM_REVEAL_MS */
export const WELCOME_ROOM_FADE_MS = WELCOME_ROOM_REVEAL_MS;

/** Legacy long dolly — letter pacing only. */
export const WELCOME_ROOM_DOLLY_MS = 210000 as const;

/** Cinematic walk-in — doorway to seating (~72s, starts when room reveals). */
export const WELCOME_ROOM_INTRO_DOLLY_MS = 72000 as const;

/** Focal point for dolly scale — Shari, chairs, and Kinsey. */
export const WELCOME_ROOM_WALK_TRANSFORM_ORIGIN = "66% 52%" as const;

/** Room breathes before music (after Step Inside). */
export const WELCOME_ROOM_SILENCE_MS = 2000 as const;

/** Soft music begins ~2s after the experience starts. */
export const WELCOME_ROOM_PLAY_MUSIC_START_MS = 2000 as const;

/** Shari's voice begins ~4s after the experience starts. */
export const WELCOME_ROOM_PLAY_VOICE_START_MS = 4000 as const;

/** @deprecated Use WELCOME_ROOM_PLAY_MUSIC_START_MS */
export const WELCOME_ROOM_MUSIC_START_MS = WELCOME_ROOM_DARK_MS;

/** @deprecated Use WELCOME_ROOM_PLAY_VOICE_START_MS */
export const WELCOME_ROOM_VOICE_START_MS = WELCOME_ROOM_DARK_MS + 2000;

export const WELCOME_ROOM_INVITE_DELAY_MS = 8000 as const;

export const WELCOME_ROOM_PAUSE_MS = 0 as const;
export const WELCOME_ROOM_LETTER_DELAY_MS =
  WELCOME_ROOM_DARK_MS + WELCOME_ROOM_REVEAL_MS + WELCOME_ROOM_DOLLY_MS;
export const WELCOME_ROOM_ARRIVAL_MS = WELCOME_ROOM_LETTER_DELAY_MS;
export const WELCOME_ROOM_WALK_IN_MS = WELCOME_ROOM_DOLLY_MS;
export const WELCOME_ROOM_OUTSIDE_HOLD_MS = WELCOME_ROOM_DARK_MS;

/** Room visible, camera held at the doorway — waiting for Play. */
export const WELCOME_ROOM_READY_ELAPSED_MS =
  WELCOME_ROOM_DARK_MS + WELCOME_ROOM_REVEAL_MS;

/** Widest full-screen crop — fan, walls, console, and plants all visible. */
export const WELCOME_ROOM_ENTRANCE_VIEW = {
  imageScale: 1,
  translateXPercent: 0,
  translateYPercent: 0,
  objectXPercent: 50,
  objectYPercent: 30,
} as const;

/** Inside the room — fan, side walls, and perimeter furnishings crop away. */
export const WELCOME_ROOM_CHAIR_VIEW = {
  imageScale: 1.85,
  translateXPercent: -12,
  translateYPercent: 4,
  objectXPercent: 72,
  objectYPercent: 48,
} as const;

/** @deprecated Use WELCOME_ROOM_ENTRANCE_VIEW */
export const WELCOME_ROOM_DOORWAY_VIEW = WELCOME_ROOM_ENTRANCE_VIEW;

/** @deprecated */
export const WELCOME_ROOM_ARRIVAL_ZOOM = 0;

/** @deprecated */
export const WELCOME_ROOM_PERSPECTIVE_PX = 1100 as const;

/** @deprecated */
export const WELCOME_ROOM_CONTAIN_TO_COVER_PROGRESS = 0 as const;

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

/** When skipIntro is set, never rewind below the settled reveal — returning users stay visible. */
export function welcomeRoomElapsedForFrame(
  roomElapsedMs: number,
  skipIntro: boolean,
): number {
  if (skipIntro && roomElapsedMs < WELCOME_ROOM_READY_ELAPSED_MS) {
    return WELCOME_ROOM_READY_ELAPSED_MS;
  }
  return roomElapsedMs;
}

export function welcomeRoomRevealOpacitiesAt(
  roomElapsedMs: number,
  skipIntro: boolean,
): { fadeOpacity: number; darkOpacity: number } {
  const ms = welcomeRoomElapsedForFrame(roomElapsedMs, skipIntro);
  return {
    fadeOpacity: welcomeRoomFadeOpacity(ms),
    darkOpacity: welcomeRoomDarkOpacity(ms),
  };
}

/** Elapsed walk-in time after the room has fully revealed. */
export function welcomeRoomWalkElapsedMs(roomElapsedMs: number): number {
  return Math.max(0, roomElapsedMs - WELCOME_ROOM_READY_ELAPSED_MS);
}

/** Progress 0–1 for the walk-in after the room reveals. */
export function welcomeRoomCinematicDollyProgress(walkMs: number): number {
  if (walkMs >= WELCOME_ROOM_INTRO_DOLLY_MS) return 1;
  if (walkMs <= 0) return 0;
  return walkMs / WELCOME_ROOM_INTRO_DOLLY_MS;
}

/** @deprecated Use welcomeRoomCinematicDollyProgress after Play. */
export function welcomeRoomDollyProgress(elapsedMs: number): number {
  return welcomeRoomCinematicDollyProgress(
    Math.max(0, welcomeRoomMotionElapsed(elapsedMs) - WELCOME_ROOM_REVEAL_MS),
  );
}

/** @deprecated */
export function welcomeRoomWalkScale(translateZ: number): number {
  const p = WELCOME_ROOM_PERSPECTIVE_PX;
  return p / (p - translateZ);
}

/** @deprecated */
export function welcomeRoomPerspectiveFillScale(translateZ: number): number {
  const p = WELCOME_ROOM_PERSPECTIVE_PX;
  return (p - translateZ) / p;
}

export function welcomeRoomArrivalPhase(
  roomElapsedMs: number,
  reducedMotion: boolean,
  walkMs = 0,
): WelcomeRoomArrivalPhase {
  if (reducedMotion) return "settled";
  if (roomElapsedMs < WELCOME_ROOM_DARK_MS) return "dark";
  if (roomElapsedMs < WELCOME_ROOM_DARK_MS + WELCOME_ROOM_REVEAL_MS) return "revealing";
  if (walkMs > 0 && walkMs < WELCOME_ROOM_INTRO_DOLLY_MS) return "walking";
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
  /** Always >= 1 — full-screen cover, never a smaller picture in the window. */
  imageScale: number;
  translateXPercent: number;
  translateYPercent: number;
  transformOrigin: string;
  objectPosition: string;
  objectFit: "cover";
  imageTransform: string;
  /** @deprecated Use imageScale */
  photoScale: number;
  /** @deprecated Unused — flat camera rig */
  translateZ: number;
};

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/** Slow ease-out — periphery clears steadily, gentle settle at the chairs. */
function welcomeRoomWalkEase(t: number): number {
  const p = Math.max(0, Math.min(1, t));
  return 1 - (1 - p) ** 2;
}

export function welcomeRoomDollyFrame(progress: number): WelcomeRoomDollyFrame {
  const eased = welcomeRoomWalkEase(progress);
  const imageScale = lerp(
    WELCOME_ROOM_ENTRANCE_VIEW.imageScale,
    WELCOME_ROOM_CHAIR_VIEW.imageScale,
    eased,
  );
  const translateXPercent = lerp(
    WELCOME_ROOM_ENTRANCE_VIEW.translateXPercent,
    WELCOME_ROOM_CHAIR_VIEW.translateXPercent,
    eased,
  );
  const translateYPercent = lerp(
    WELCOME_ROOM_ENTRANCE_VIEW.translateYPercent,
    WELCOME_ROOM_CHAIR_VIEW.translateYPercent,
    eased,
  );
  const x = lerp(
    WELCOME_ROOM_ENTRANCE_VIEW.objectXPercent,
    WELCOME_ROOM_CHAIR_VIEW.objectXPercent,
    eased,
  );
  const y = lerp(
    WELCOME_ROOM_ENTRANCE_VIEW.objectYPercent,
    WELCOME_ROOM_CHAIR_VIEW.objectYPercent,
    eased,
  );
  const transformOrigin = WELCOME_ROOM_WALK_TRANSFORM_ORIGIN;

  return {
    imageScale,
    translateXPercent,
    translateYPercent,
    transformOrigin,
    objectPosition: `${x}% ${y}%`,
    objectFit: "cover",
    imageTransform: `scale(${imageScale}) translate3d(${translateXPercent}%, ${translateYPercent}%, 0)`,
    photoScale: imageScale,
    translateZ: 0,
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
