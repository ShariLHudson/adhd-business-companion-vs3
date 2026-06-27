/**
 * The Living Border — the center belongs to the guest; borders belong to the Homestead.
 * @see docs/companion-homestead/LIVING_BORDER.md
 */

import type { CompanionPlaceId } from "@/lib/companionUniverse/types";
import type { EdgeZone } from "@/lib/roomCompositionRule";
import type { WelcomeSeason, WelcomeTimeOfDay } from "@/lib/welcomeLivingRoom";
import type { WelcomeWeather } from "@/lib/companionEnvironmentIntelligence";

export const LIVING_BORDER_ELEMENT_IDS = [
  "curtain-left",
  "curtain-right",
  "trees",
  "bird",
  "steam",
  "candle",
  "lamp-glow",
  "bookshelf",
  "blanket",
  "window",
  "flowers",
  "bird-feeder",
  "coffee-mug",
  "kinsey",
  "aquarium",
  "planner",
  "craft-shelves",
  "landscape",
  "rain",
  "snow",
  "pond-water",
  "goldfish",
  "water-lilies",
  "pergola-vines",
] as const;

export type LivingBorderElementId = (typeof LIVING_BORDER_ELEMENT_IDS)[number];

export type LivingBorderElement = {
  id: LivingBorderElementId;
  label: string;
  zone: EdgeZone;
  /** CSS hook in companion.css */
  cssClass: string;
  /** May animate at border only */
  mayAnimate: boolean;
  /** May appear, disappear, or swap seasonally */
  mayEvolve: boolean;
  /**
   * CSS-gradient block without a real asset — hidden in production UI
   * unless NEXT_PUBLIC_SHOW_LIVING_BORDER_DEBUG=true.
   */
  isPlaceholder?: boolean;
};

export type LivingBorderRoomCatalog = {
  placeId: CompanionPlaceId;
  name: string;
  elements: readonly LivingBorderElementId[];
};

export type LivingBorderInput = {
  placeId?: CompanionPlaceId;
  workspaceId?: string;
  timeOfDay?: WelcomeTimeOfDay;
  season?: WelcomeSeason;
  weather?: WelcomeWeather;
  /** Hospitality flags from Living Change Set */
  warmLamp?: boolean;
  showMugSteam?: boolean;
  showBlanket?: boolean;
  wildlife?: string | null;
};

export type LivingBorderActiveElement = LivingBorderElement & {
  visible: boolean;
  animated: boolean;
};

export type LivingBorderVerdict = {
  placeId: CompanionPlaceId;
  principle: typeof LIVING_BORDER_PRINCIPLE;
  experiencePrinciple: typeof LIVING_BORDER_EXPERIENCE_PRINCIPLE;
  centerStable: true;
  mustNotDistract: true;
  activeElements: LivingBorderActiveElement[];
  animatedCount: number;
  recognitionHints: {
    season: WelcomeSeason | null;
    timeOfDay: WelcomeTimeOfDay | null;
    room: CompanionPlaceId;
  };
  dataAttributes: Record<string, string>;
};

export const LIVING_BORDER_PRINCIPLE =
  "The center belongs to the guest. The borders belong to the Homestead." as const;

export const LIVING_BORDER_HEARTBEAT =
  "The Living Border is the heartbeat of every room." as const;

export const LIVING_BORDER_EXPERIENCE_PRINCIPLE =
  "The center supports the guest. The borders support the experience." as const;

export const LIVING_BORDER_HOME_REMINDER =
  "Gently remind the guest they are inside a real home — not inside software." as const;

/** Subtle movement only — never compete with work */
export const SUBTLE_BORDER_MOVEMENT = [
  "curtain-sway",
  "tree-branches",
  "bird-at-feeder",
  "aquarium-bubbles",
  "candle-flicker",
  "lamp-warmth",
  "steam-rise",
  "leaves-outside",
  "cloud-shadow",
  "rain-on-glass",
  "light-shift",
  "kinsey-repose",
] as const;

export type SubtleBorderMovement = (typeof SUBTLE_BORDER_MOVEMENT)[number];

export const LIVING_BORDER_RULES = {
  borderMayChange: true,
  centerRemainsStable: true,
  borderCreatesDelight: true,
  centerCreatesFocus: true,
  borderTellsShariStory: true,
  centerSupportsGuestStory: true,
  borderIsObserved: true,
  centerIsUsed: true,
  mustNeverDistract: true,
  subtleMovementOnly: true,
  remindsRealHomeNotSoftware: true,
} as const;
