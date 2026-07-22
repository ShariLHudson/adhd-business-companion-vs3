/**
 * Facebook Community map groups — schema config only (587–598).
 * Four groups mirror the Cursor Manifest (598) build phases.
 */

import type { BlueprintGroup } from "../../blueprints/types";

export const FACEBOOK_COMMUNITY_MAP_GROUPS: readonly BlueprintGroup[] = [
  {
    groupId: "foundation",
    title: "Foundation",
    description: "Who this is for, what it promises, and how it is set up.",
    order: 0,
    collapsedByDefault: false,
    sectionIds: [
      "purpose_and_audience",
      "positioning_and_promise",
      "community_type_and_capacity",
      "naming_and_tagline",
      "setup_privacy_and_visibility",
      "membership_questions_and_rules",
      "roles_and_moderation_setup",
    ],
  },
  {
    groupId: "brand_and_member_experience",
    title: "Brand and Member Experience",
    description: "Visual identity and what a new member sees and feels.",
    order: 1,
    collapsedByDefault: true,
    sectionIds: ["brand_and_banner", "welcome_and_onboarding", "first_week_journey"],
  },
  {
    groupId: "launch_and_content",
    title: "Launch and Content",
    description: "What you will post, and how the community will begin.",
    order: 2,
    collapsedByDefault: true,
    sectionIds: [
      "content_pillars_and_programming",
      "content_calendar",
      "launch_plan",
      "first_100_members",
    ],
  },
  {
    groupId: "operations",
    title: "Operations",
    description: "Growing, protecting, measuring, and running the community.",
    order: 3,
    collapsedByDefault: true,
    sectionIds: [
      "growth_and_referral",
      "retention_and_reengagement",
      "moderation_and_safety",
      "analytics_and_health",
      "operating_manual",
      "project_handoff",
    ],
  },
];
