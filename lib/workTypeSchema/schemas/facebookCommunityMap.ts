/**
 * Leaf data only — no imports from Create runtime (avoids circular deps).
 * Facebook Community section order (587–598).
 *
 * Phases mirror the Cursor Manifest (598): Foundation → Brand & Member
 * Experience → Launch & Content → Operations. Grouped in
 * `facebookCommunityMapGroups.ts`.
 */

import type { WorkTypeMapSectionDef } from "../types";

export const FACEBOOK_COMMUNITY_MAP_SECTIONS: readonly WorkTypeMapSectionDef[] = [
  { id: "purpose_and_audience", title: "Purpose and Who It's For" },
  { id: "positioning_and_promise", title: "Positioning and Promise" },
  {
    id: "community_type_and_capacity",
    title: "Community Type and Founder Capacity",
  },
  { id: "naming_and_tagline", title: "Name and Tagline" },
  { id: "brand_and_banner", title: "Brand, Banner, and Profile Image" },
  {
    id: "setup_privacy_and_visibility",
    title: "Setup, Privacy, and Visibility",
  },
  {
    id: "membership_questions_and_rules",
    title: "Membership Questions and Rules",
  },
  {
    id: "roles_and_moderation_setup",
    title: "Roles, Permissions, and Automation",
  },
  { id: "welcome_and_onboarding", title: "Welcome and Onboarding Kit" },
  { id: "first_week_journey", title: "First Week Journey" },
  {
    id: "content_pillars_and_programming",
    title: "Content Pillars and Programming",
  },
  { id: "content_calendar", title: "Content Calendar" },
  { id: "launch_plan", title: "Launch Plan" },
  { id: "first_100_members", title: "First 100 Members" },
  { id: "growth_and_referral", title: "Growth and Referral System" },
  { id: "retention_and_reengagement", title: "Retention and Re-engagement" },
  {
    id: "moderation_and_safety",
    title: "Moderation, Safety, and Governance",
  },
  { id: "analytics_and_health", title: "Analytics and Community Health" },
  { id: "operating_manual", title: "Community Operating Manual" },
  { id: "project_handoff", title: "Create-to-Project Handoff" },
];

export const FACEBOOK_COMMUNITY_DEFAULT_FOCUS: readonly string[] = [
  "purpose_and_audience",
  "positioning_and_promise",
  "naming_and_tagline",
  "setup_privacy_and_visibility",
  "welcome_and_onboarding",
  "launch_plan",
];

export const FACEBOOK_COMMUNITY_WORK_TYPE_ID = "facebook_community" as const;
