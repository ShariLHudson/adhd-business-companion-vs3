/**
 * Global navigation back labels — ADHD Business Ecosystem standard.
 * Format: "Back to [Previous Page]"
 */

import type { AppSection } from "./companionUi";
import { workspaceAreaTitle } from "./workspaceMode";

/**
 * Persistent top-left return control (106–108).
 * Prefer this label everywhere — one authoritative Welcome Home action.
 */
export const WELCOME_HOME_NAV_LABEL = "Welcome Home";

/** @deprecated Prefer WELCOME_HOME_NAV_LABEL — kept for legacy string matches. */
export const BACK_TO_ESTATE = WELCOME_HOME_NAV_LABEL;

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

/** True when a back destination means the Spark Estate home. */
export function isEstateHomeDestination(
  destination: string | null | undefined,
): boolean {
  if (!destination) return false;
  const normalized = normalizeBackDestination(destination).toLowerCase();
  return (
    normalized === "home" ||
    normalized === "estate" ||
    normalized === "welcome home" ||
    normalized === "return to estate" ||
    normalized === "back to estate" ||
    normalized === "back to welcome home"
  );
}

/**
 * Standard label: "Back to Clear My Mind"
 * Pass the destination only — not the full "Back to" prefix.
 */
export function formatAppBackLabel(destination: string): string {
  const trimmed = destination.trim();
  if (!trimmed) return "Back";
  if (isEstateHomeDestination(trimmed)) return BACK_TO_ESTATE;
  if (/^back to\b/i.test(trimmed)) return trimmed;
  return `Back to ${trimmed}`;
}

/** Strip "Back to " prefix when migrating legacy labels. */
export function normalizeBackDestination(label: string | null | undefined): string {
  if (!label) return "";
  return label.replace(/^back to\s+/i, "").trim();
}
