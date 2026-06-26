/**
 * Global navigation back labels — ADHD Business Ecosystem™ standard.
 * Format: "Back to [Previous Page]"
 */

import type { AppSection } from "./companionUi";
import { workspaceAreaTitle } from "./workspaceMode";

export const NAV_HOME = "Home";

/** Trademarked workspace names — consistent across the ecosystem. */
export const NAV_CLEAR_MY_MIND = "Clear My Mind™";
export const NAV_MY_THOUGHTS = "My Thoughts™";
export const NAV_PLAN_MY_DAY = "Plan My Day™";
export const NAV_TODAYS_REALITY = "Today's Reality™";
/** @deprecated Use NAV_TODAYS_REALITY */
export const NAV_SHAPE_TODAY = NAV_TODAYS_REALITY;
/** @deprecated Use NAV_TODAYS_REALITY */
export const NAV_ADAPT_MY_DAY = NAV_TODAYS_REALITY;
export const NAV_FOCUS_MY_BRAIN = "Focus My Brain™";
export const NAV_PROJECTS = "Projects™";
export const NAV_CHAT = "Chat";

const TRADEMARK_SECTION_TITLES: Partial<Record<AppSection, string>> = {
  "brain-dump": NAV_CLEAR_MY_MIND,
  "plan-my-day": NAV_PLAN_MY_DAY,
  focus: NAV_FOCUS_MY_BRAIN,
  projects: NAV_PROJECTS,
};

/**
 * User-facing destination name for a workspace section.
 */
export function navigationDestinationForSection(section: AppSection): string {
  return TRADEMARK_SECTION_TITLES[section] ?? workspaceAreaTitle(section);
}

/**
 * Standard label: "Back to Clear My Mind™"
 * Pass the destination only — not the full "Back to" prefix.
 */
export function formatAppBackLabel(destination: string): string {
  const trimmed = destination.trim();
  if (!trimmed) return "Back";
  if (/^back to\b/i.test(trimmed)) return trimmed;
  return `Back to ${trimmed}`;
}

/** Strip "Back to " prefix when migrating legacy labels. */
export function normalizeBackDestination(label: string): string {
  return label.replace(/^back to\s+/i, "").trim();
}
