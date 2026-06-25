/**
 * Organic Shari Presence — context-aware profile image selection.
 *
 * Priority (highest wins):
 * 1. Birthday / personal celebration
 * 2. App anniversary / milestone / recognition win
 * 3. Recovery support
 * 4. Emotional support (overwhelmed, encouragement)
 * 5. Focus mode
 * 6. Time of day (morning, afternoon, evening)
 * 7. Seasonal (late-night fallback)
 * 8. Default
 *
 * To add art: update SHARI_IMAGE_ASSETS paths for each state.
 * Until files exist, every state points at the default Shari image.
 */

import type { EmotionalState } from "@/lib/companionEmotions";
import {
  pickCompanionPhoto,
  shariImageStateToPhotoContext,
} from "@/lib/companionPhotoLibrary";
import { ASSETS } from "@/lib/companionUi";

export type ShariImageState =
  | "default"
  | "morning"
  | "afternoon"
  | "evening"
  | "support"
  | "encouragement"
  | "overwhelmed_support"
  | "celebration"
  | "birthday"
  | "app_anniversary"
  | "anniversary"
  | "recovery"
  | "focus"
  | "seasonal_spring"
  | "seasonal_summer"
  | "seasonal_fall"
  | "seasonal_winter";

export type ShariPersonalCelebration = "birthday";

export type ShariMilestoneCelebration = "app_anniversary" | "milestone";

export type ShariImageStateInput = {
  now?: Date;
  emotion?: EmotionalState;
  /** Month/day (1-based) — wire from user profile when available. */
  userBirthday?: { month: number; day: number } | null;
  personalCelebration?: ShariPersonalCelebration | null;
  milestoneCelebration?: ShariMilestoneCelebration | null;
  /** Gentle recovery day / lighter-day support is active. */
  recoveryMode?: boolean;
  /** Focus timer or focus workspace is active. */
  focusMode?: boolean;
  /** User win / recognition moment — proud Shari. */
  recognitionWin?: boolean;
};

export type ShariImageStateResult = {
  state: ShariImageState;
  src: string;
  reason: string;
};

/** Future dedicated assets: /public/images/shari/states/{state}.jpg */
export const SHARI_STATE_IMAGE_ROOT = "/images/shari/states";

const DEFAULT_SRC = ASSETS.profile;

/**
 * Image path per state. All use DEFAULT_SRC until dedicated art ships.
 * To enable: set e.g. morning: `${SHARI_STATE_IMAGE_ROOT}/morning.jpg`
 */
export const SHARI_IMAGE_ASSETS: Record<ShariImageState, string> = {
  default: DEFAULT_SRC,
  morning: DEFAULT_SRC,
  afternoon: DEFAULT_SRC,
  evening: DEFAULT_SRC,
  support: DEFAULT_SRC,
  encouragement: DEFAULT_SRC,
  overwhelmed_support: DEFAULT_SRC,
  celebration: DEFAULT_SRC,
  birthday: DEFAULT_SRC,
  app_anniversary: DEFAULT_SRC,
  anniversary: DEFAULT_SRC,
  recovery: DEFAULT_SRC,
  focus: DEFAULT_SRC,
  seasonal_spring: DEFAULT_SRC,
  seasonal_summer: DEFAULT_SRC,
  seasonal_fall: DEFAULT_SRC,
  seasonal_winter: DEFAULT_SRC,
};

export function resolveShariImageSrc(state: ShariImageState): string {
  const dedicated = SHARI_IMAGE_ASSETS[state];
  if (dedicated && dedicated !== DEFAULT_SRC) {
    return dedicated;
  }
  return pickCompanionPhoto(shariImageStateToPhotoContext(state), {
    preferSessionContinuity: true,
  });
}

function isUserBirthdayToday(
  birthday: { month: number; day: number } | null | undefined,
  now: Date,
): boolean {
  if (!birthday) return false;
  return birthday.month === now.getMonth() + 1 && birthday.day === now.getDate();
}

function timeOfDayState(now: Date): ShariImageState {
  const hour = now.getHours();
  if (hour >= 5 && hour < 12) return "morning";
  if (hour >= 12 && hour < 17) return "afternoon";
  if (hour >= 17 && hour < 22) return "evening";
  return "default";
}

function seasonalState(now: Date): ShariImageState {
  const month = now.getMonth();
  if (month >= 2 && month <= 4) return "seasonal_spring";
  if (month >= 5 && month <= 7) return "seasonal_summer";
  if (month >= 8 && month <= 10) return "seasonal_fall";
  return "seasonal_winter";
}

function emotionalSupportState(
  emotion: EmotionalState | undefined,
): ShariImageState | null {
  if (!emotion || emotion === "unclear") return null;
  if (emotion === "overwhelmed") return "overwhelmed_support";
  if (emotion === "stuck" || emotion === "emotional") return "support";
  if (emotion === "building" || emotion === "focused") return "encouragement";
  return null;
}

function result(state: ShariImageState, reason: string): ShariImageStateResult {
  return { state, src: resolveShariImageSrc(state), reason };
}

/** Pick the organic Shari image state from context. */
export function getShariImageState(
  input: ShariImageStateInput = {},
): ShariImageStateResult {
  const now = input.now ?? new Date();

  if (
    input.personalCelebration === "birthday" ||
    isUserBirthdayToday(input.userBirthday, now)
  ) {
    return result("birthday", "personal celebration");
  }

  if (input.milestoneCelebration === "app_anniversary") {
    return result("app_anniversary", "app anniversary");
  }
  if (input.milestoneCelebration === "milestone") {
    return result("anniversary", "milestone");
  }

  if (input.recognitionWin) {
    return result("celebration", "recognition win");
  }

  if (input.recoveryMode) {
    return result("recovery", "recovery support");
  }

  const emotional = emotionalSupportState(input.emotion);
  if (emotional) {
    return result(emotional, `emotional support (${input.emotion})`);
  }

  if (input.focusMode) {
    return result("focus", "focus mode");
  }

  const timeOfDay = timeOfDayState(now);
  if (timeOfDay !== "default") {
    return result(timeOfDay, "time of day");
  }

  return result(seasonalState(now), "seasonal");
}
