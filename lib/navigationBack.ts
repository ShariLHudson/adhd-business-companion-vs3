/**
 * Global navigation back labels — ADHD Business Ecosystem standard.
 * Format: "Back to [Previous Page]"
 *
 * Pure label helpers: navigationBackLabels (Create-graph safe).
 * Section ↔ title mapping may load workspaceMode — keep off Project Homes.
 */

import type { AppSection } from "./companionUi";
import { workspaceAreaTitle } from "./workspaceMode";

export {
  BACK_TO_ESTATE,
  WELCOME_HOME_NAV_LABEL,
  formatAppBackLabel,
  isEstateHomeDestination,
  normalizeBackDestination,
} from "./navigationBackLabels";

/** Destination key when returning from a room to Welcome Home (estate entrance). */
export const NAV_HOME = "Estate";

/** Trademarked workspace names — consistent across the ecosystem. */
export const NAV_CLEAR_MY_MIND = "Clear My Mind";
export const NAV_MY_THOUGHTS = "My Thoughts";
export const NAV_PLAN_MY_DAY = "Plan My Day";
export const NAV_TODAYS_REALITY = "Today's Reality";
/** @deprecated Use NAV_TODAYS_REALITY */
export const NAV_SHAPE_TODAY = NAV_TODAYS_REALITY;
/** @deprecated Use NAV_TODAYS_REALITY */
export const NAV_ADAPT_MY_DAY = NAV_TODAYS_REALITY;
export const NAV_FOCUS_MY_BRAIN = "Focus My Brain";
export const NAV_PROJECTS = "Projects";
export const NAV_CHAT = "Chat";
export const NAV_LIFE_EXPERIENCE = "Life Experience Room";

export const NAV_THE_GALLERY = "The Gallery";

/** Full-page rooms that render their own back-to-chat control. */
export const SECTIONS_WITH_EMBEDDED_CHAT_BACK: readonly AppSection[] = [
  "brain-dump",
  "life-experience",
  "the-gallery",
  "plan-my-day",
] as const;

export function sectionHasEmbeddedChatBack(section: AppSection): boolean {
  return (SECTIONS_WITH_EMBEDDED_CHAT_BACK as readonly string[]).includes(
    section,
  );
}

const TRADEMARK_SECTION_TITLES: Partial<Record<AppSection, string>> = {
  "brain-dump": NAV_CLEAR_MY_MIND,
  "plan-my-day": NAV_PLAN_MY_DAY,
  focus: NAV_FOCUS_MY_BRAIN,
  projects: NAV_PROJECTS,
  "life-experience": NAV_LIFE_EXPERIENCE,
  "the-gallery": NAV_THE_GALLERY,
};

/**
 * User-facing destination name for a workspace section.
 */
export function navigationDestinationForSection(section: AppSection): string {
  return TRADEMARK_SECTION_TITLES[section] ?? workspaceAreaTitle(section);
}
