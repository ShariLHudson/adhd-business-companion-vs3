/**
 * Focus My Brain — The Focus Landscape
 * Six-space cognitive countryside inside one unified ecosystem.
 * @see docs/companion-homestead/FOCUS_LANDSCAPE.md
 */

import type { CompanionPlaceId } from "@/lib/companionUniverse/types";
import type { FocusFeelingId } from "@/lib/focusHub";

/** Primary landscape spaces — each is a place the brain enters, not a screen */
export const FOCUS_LANDSCAPE_SPACE_IDS = [
  "garden-path",
  "meadow-lake",
  "meadow-stretch",
  "forest-pavilion",
  "meadow-object-field",
  "horizon-trail",
  "deep-forest",
] as const;

export type FocusLandscapeSpaceId = (typeof FOCUS_LANDSCAPE_SPACE_IDS)[number];

export type FocusLandscapeHubRole = "center" | "entry" | "subspace";

export type FocusLandscapeSpace = {
  id: FocusLandscapeSpaceId;
  name: string;
  /** Hub position in the master map */
  hubRole: FocusLandscapeHubRole;
  emotionalStates: readonly string[];
  emotionalPurpose: string;
  environment: string;
  movementLanguage: readonly string[];
  uiFunctionCluster: readonly string[];
  placeId: CompanionPlaceId;
  sharisPresence: "nearby" | "ambient";
  /** Parent space when this is a subspace of Meadow/Lake */
  parentSpaceId?: FocusLandscapeSpaceId;
};

export type FocusLandscapeInput = {
  workspaceId?: "focus-hub" | "focus-category" | string;
  focusCategoryId?: FocusFeelingId | string;
  toolId?: string;
  now?: Date;
};

export type FocusLandscapeTransition =
  | "walk-forward"
  | "path-shift"
  | "terrain-change"
  | "weather-shift";

export type FocusLandscapeVerdict = {
  spaceId: FocusLandscapeSpaceId;
  space: FocusLandscapeSpace;
  placeId: CompanionPlaceId;
  title: string;
  subtitle: string;
  landscapeWhisper: string;
  transition: FocusLandscapeTransition;
  connectedSpaces: readonly FocusLandscapeSpaceId[];
  toolId: string | null;
  cssVars: Record<string, string>;
  dataAttributes: Record<string, string>;
};

export const FOCUS_LANDSCAPE_PRINCIPLE =
  "A cognitive landscape where ADHD attention can move safely between states of mind." as const;

export const FOCUS_LANDSCAPE_INSIGHT =
  "Each space is not a screen. Each space is a place the brain can enter depending on what it needs." as const;
