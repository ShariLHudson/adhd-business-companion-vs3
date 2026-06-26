/**
 * Focus My Brain™ — The Sunroom Over The Pond™
 * @see docs/companion-homestead/SUNROOM_OVER_THE_POND.md
 */

import type { WelcomeSeason, WelcomeTimeOfDay } from "@/lib/welcomeLivingRoom";
import type { WelcomeWeather } from "@/lib/companionEnvironmentIntelligence";

export const SUNROOM_PLACE_ID = "sunroom-over-pond" as const;

export const SUNROOM_TITLE = "Focus My Brain™" as const;
export const SUNROOM_SUBTITLE =
  "My mind slows down here without trying." as const;

export const SUNROOM_EMOTIONAL_PROMISE =
  "My mind slows down here without trying." as const;

export const SUNROOM_CORE_FORCES = [
  "water",
  "plants",
  "enclosure",
] as const;

export const SUNROOM_ROOM_WHISPERS = [
  "The water is always moving — never urgent.",
  "You are inside nature, not looking at it.",
  "The pond holds your attention without asking for it.",
  "I can finally stay with one thought.",
] as const;

export const SUNROOM_SUCCESS_TEST =
  "I can finally stay with one thought." as const;

export const SUNROOM_SIGNATURE_OBJECT_ID = "sig-pond-anchor" as const;
export const SUNROOM_FEATURE_OBJECT_ID = "focus-my-brain" as const;

export type SunroomTimeProfile = WelcomeTimeOfDay | "after-rain";

export type SunroomZone =
  | "sunroom-frame"
  | "left-border"
  | "center"
  | "right-border"
  | "pond-anchor"
  | "pergola-arc";

export type SunroomLayoutZone = {
  zone: SunroomZone;
  elements: readonly string[];
};

export type SunroomInput = {
  now?: Date;
  timeOfDay?: WelcomeTimeOfDay;
  season?: WelcomeSeason;
  weather?: WelcomeWeather;
  focusCategory?: string;
};

export type SunroomVerdict = {
  placeId: typeof SUNROOM_PLACE_ID;
  title: string;
  subtitle: string;
  emotionalPromise: typeof SUNROOM_EMOTIONAL_PROMISE;
  roomWhisper: string;
  timeProfile: SunroomTimeProfile;
  signatureObjectId: typeof SUNROOM_SIGNATURE_OBJECT_ID;
  sharisPresenceState: "nearby";
  layout: SunroomLayoutZone[];
  borderMotion: readonly string[];
  sensoryMemoryHints: readonly string[];
  cognitiveForbidden: readonly string[];
  cssVars: Record<string, string>;
  dataAttributes: Record<string, string>;
};

export const SUNROOM_PRINCIPLE =
  "It is not a workspace. It is an attention-regulating environment built from memory, water, enclosure, and calm motion." as const;
