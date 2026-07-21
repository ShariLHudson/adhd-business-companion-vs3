/**
 * Event Plan Workshop Map groups — schema config only (099).
 * Maps existing EVENT_PLAN_MAP_SECTIONS into collapsible groups.
 */

import type { BlueprintGroup } from "../../blueprints/types";

export const EVENT_PLAN_MAP_GROUPS: readonly BlueprintGroup[] = [
  {
    groupId: "foundation",
    title: "Foundation",
    description: "Why this gathering exists and who it serves.",
    order: 0,
    collapsedByDefault: false,
    sectionIds: [
      "event_type",
      "purpose",
      "outcomes",
      "audience",
      "format",
    ],
  },
  {
    groupId: "planning",
    title: "Planning",
    description: "When, where, and what it costs.",
    order: 1,
    collapsedByDefault: true,
    sectionIds: [
      "dates",
      "venue",
      "budget",
      "revenue_pricing",
      "technology",
      "accessibility",
    ],
  },
  {
    groupId: "program",
    title: "Program",
    description: "What people experience.",
    order: 2,
    collapsedByDefault: true,
    sectionIds: [
      "agenda",
      "speakers",
      "attendee_experience",
      "hospitality",
      "swag",
      "supplies",
    ],
  },
  {
    groupId: "promotion",
    title: "Promotion",
    description: "How people find and join.",
    order: 3,
    collapsedByDefault: true,
    sectionIds: [
      "registration",
      "marketing",
      "sponsors",
      "communications",
    ],
  },
  {
    groupId: "event_day",
    title: "Event Day",
    description: "Delivery and on-site care.",
    order: 4,
    collapsedByDefault: true,
    sectionIds: [
      "staff",
      "volunteers",
      "vendors",
      "safety",
      "contingencies",
      "run_of_show",
      "production",
      "day_of_operations",
    ],
  },
  {
    groupId: "after_the_event",
    title: "After the Event",
    description: "Follow-through and learning.",
    order: 5,
    collapsedByDefault: true,
    sectionIds: [
      "post_event_follow_up",
      "measurement",
      "archive_and_reuse",
      "final_review",
    ],
  },
];
