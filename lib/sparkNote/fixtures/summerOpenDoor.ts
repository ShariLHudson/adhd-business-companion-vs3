/**
 * Regression fixture — Summer's Open Door (SPARK-SEA-SUMMER).
 * Live and print must resolve the same garden-door hero + caption.
 */

import type { SparkNoteDailyCard } from "../types";

export const SUMMER_OPEN_DOOR_CARD_ID = "SPARK-SEA-SUMMER";

export const SUMMER_OPEN_DOOR_CAPTION = "Adventure can be close to home.";

/** Commons file title fragment expected in the resolved thumb URL. */
export const SUMMER_OPEN_DOOR_IMAGE_FRAGMENT =
  "Arch_door_and_portal_in_Walled_Garden_at_Goodnestone_Park";

export const summerOpenDoorCard: SparkNoteDailyCard = {
  id: SUMMER_OPEN_DOOR_CARD_ID,
  category: "personal_growth",
  categoryLabel: "Seasonal Spark",
  sparkType: "quick",
  title: "Summer's Open Door",
  shortTitle: "Summer's Open Door",
  teaser: "Adventure can be close to home.",
  whatHappened: "Longer days invite exploration.",
  whyItMatters: "Wonder does not require a distant destination.",
  sparkApplication: "What nearby door could you open this week?",
  tags: ["seasonal", "summer", "adventure"],
  source: "library",
};
