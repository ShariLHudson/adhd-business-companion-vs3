/**
 * Plan My Day — The Kitchen Planning Nook / Planning Table
 * @see docs/companion-homestead/PLANNING_TABLE.md
 */

import type { WelcomeSeason, WelcomeTimeOfDay } from "@/lib/welcomeLivingRoom";
import type { WelcomeWeather } from "@/lib/companionEnvironmentIntelligence";

export const PLANNING_TABLE_TITLE = "Plan My Day" as const;
export const PLANNING_TABLE_SUBTITLE =
  "We'll figure today out together." as const;

export const PLANNING_TABLE_PLACE_ID = "planning-table" as const;

export const PLANNING_TABLE_EMOTIONAL_PROMISE =
  "My day suddenly feels more manageable." as const;

export const PLANNING_TABLE_ROOM_WHISPERS = [
  "There is enough time.",
  "There is no pressure.",
  "We'll figure it out together.",
  "We'll figure today out together.",
] as const;

export const PLANNING_TABLE_SUCCESS_TEST =
  "You don't have to solve everything right now. We're just going to decide what today needs." as const;

export const PLANNING_TABLE_SIGNATURE_OBJECT_ID = "sig-planning-notebook" as const;
export const PLANNING_TABLE_FEATURE_OBJECT_ID = "plan-my-day" as const;

export type PlanningTableTimeProfile = WelcomeTimeOfDay | "rain" | "winter";

export type PlanningTableZone = "left-border" | "center" | "right-border" | "lower-right";

export type PlanningTableLayoutZone = {
  zone: PlanningTableZone;
  elements: readonly string[];
};

export type PlanningTableInput = {
  now?: Date;
  timeOfDay?: WelcomeTimeOfDay;
  season?: WelcomeSeason;
  weather?: WelcomeWeather;
  chapter?: string;
};

export type PlanningTableVerdict = {
  placeId: typeof PLANNING_TABLE_PLACE_ID;
  title: string;
  subtitle: string;
  emotionalPromise: typeof PLANNING_TABLE_EMOTIONAL_PROMISE;
  roomWhisper: string;
  timeProfile: PlanningTableTimeProfile;
  signatureObjectId: typeof PLANNING_TABLE_SIGNATURE_OBJECT_ID;
  sharisPresenceState: "beside-you";
  layout: PlanningTableLayoutZone[];
  borderMotion: readonly string[];
  memoryTriggerHints: readonly string[];
  adhdForbidden: readonly string[];
  cssVars: Record<string, string>;
  dataAttributes: Record<string, string>;
};

export const PLANNING_TABLE_PRINCIPLE =
  "It is not where productivity begins. It is where clarity begins." as const;
