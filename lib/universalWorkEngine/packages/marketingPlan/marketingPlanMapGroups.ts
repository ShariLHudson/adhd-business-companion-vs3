/**
 * Marketing Plan map groups — schema config only (105).
 */

import type { BlueprintGroup } from "../../blueprints/types";

export const MARKETING_PLAN_MAP_GROUPS: readonly BlueprintGroup[] = [
  {
    groupId: "foundation",
    title: "Foundation",
    description: "What you are marketing, for whom, and why it matters.",
    order: 0,
    collapsedByDefault: false,
    sectionIds: [
      "purpose_outcome",
      "business_offer",
      "people_to_reach",
      "current_situation",
    ],
  },
  {
    groupId: "direction",
    title: "Direction",
    description: "Message, goals, and where you will show up.",
    order: 1,
    collapsedByDefault: true,
    sectionIds: [
      "positioning_message",
      "marketing_goals",
      "channels",
      "content_approach",
      "offer_path",
    ],
  },
  {
    groupId: "implementation",
    title: "Implementation",
    description: "Activity, capacity, and how you will know it helps.",
    order: 2,
    collapsedByDefault: true,
    sectionIds: [
      "activity_plan",
      "capacity",
      "measures",
      "risks_assumptions",
      "next_actions",
    ],
  },
  {
    groupId: "stewardship",
    title: "Stewardship",
    description: "Review rhythm and finished plan outputs.",
    order: 3,
    collapsedByDefault: true,
    sectionIds: ["review_rhythm", "final_plan"],
  },
];
