/**
 * Spark Estate Guidebook™ — Treehouse Possibility House section (back of the book).
 *
 * Full Treehouse arc: curiosity → perspective → story → wonder → significance.
 * Placed after the main Estate tour so the Treehouse reads as one continuous journey.
 */

import { POSSIBILITY_CABINET_OF_CHAPTERS_GUIDE_SPREAD } from "./possibilityCabinetOfChapters";
import { POSSIBILITY_DISCOVERY_CHEST_GUIDE_SPREAD } from "./possibilityDiscoveryChest";
import { POSSIBILITY_HOUSE_GUIDE_SPREAD } from "./possibilityHouse";
import { POSSIBILITY_LEGACY_ROOM_GUIDE_SPREAD } from "./possibilityLegacyRoom";
import { POSSIBILITY_OBSERVATORY_GUIDE_SPREAD } from "./possibilityObservatory";
import { POSSIBILITY_REFLECTION_DESK_GUIDE_SPREAD } from "./possibilityReflectionDesk";
import { POSSIBILITY_STAIRCASE_GUIDE_SPREAD } from "./possibilityStaircase";
import { POSSIBILITY_STUDIO_GUIDE_SPREAD } from "./possibilityStudio";
import type { EstateGuideSpreadData } from "@/lib/estate/estateGuideEditorial";

/** Ordered spreads for the Treehouse section — appended at the back of the guidebook. */
export const POSSIBILITY_HOUSE_GUIDE_CHAPTERS: readonly EstateGuideSpreadData[] = [
  POSSIBILITY_HOUSE_GUIDE_SPREAD,
  POSSIBILITY_STAIRCASE_GUIDE_SPREAD,
  POSSIBILITY_STUDIO_GUIDE_SPREAD,
  POSSIBILITY_REFLECTION_DESK_GUIDE_SPREAD,
  POSSIBILITY_OBSERVATORY_GUIDE_SPREAD,
  POSSIBILITY_CABINET_OF_CHAPTERS_GUIDE_SPREAD,
  POSSIBILITY_DISCOVERY_CHEST_GUIDE_SPREAD,
  POSSIBILITY_LEGACY_ROOM_GUIDE_SPREAD,
];
