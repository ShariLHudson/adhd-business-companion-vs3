/**
 * Estate rooms that own the viewport — no frosted companion-panel-surface wrapper.
 */

import type { AppSection } from "@/lib/companionUi";
import { isGrowPanelSection } from "@/lib/growNavigation";
import { isGrowthPanelSection } from "@/lib/growthNavigation";

export const ESTATE_CORE_FULL_BLEED_PANEL_SECTIONS = [
  "brain-dump",
  "visual-focus",
  "chamber-of-momentum",
  "boardroom",
  "project-homes",
  "life-experience",
  "the-gallery",
  "destination-gallery",
  "plan-my-day",
  "adapt-plan-my-day",
  "reminders",
  "rhythms",
  "reminders-rhythms",
  "calendar",
  "parking-lot",
  "talk-it-out",
  "research-library",
  "creation-workspace",
  "spin-wheel",
  "focus-audio",
  "games",
  "quick-recharge",
  "playbook",
  "create",
  // My Personal Library owns the viewport so the canonical browse room
  // (PersonalLibraryRoom) — including the Find/Search + Recent controls near the
  // bottom of the artwork — renders full-bleed instead of inside the max-width
  // companion-panel-surface. Pairs with its dedicated-panel entry so every entry
  // path (Spark Card, chat, Wander) produces the identical full room.
  "personal-library",
  // Client Avatar is a room (Contextual Workspace pattern): it owns the viewport
  // so WorkspaceShell's room background fills the full height instead of sitting
  // inside the max-w-3xl white/80 companion-panel-surface (which reads as a gray
  // block below the content).
  "client-avatars",
] as const satisfies readonly AppSection[];

export function isEstateCoreFullBleedPanelSection(
  section: AppSection,
): boolean {
  return (ESTATE_CORE_FULL_BLEED_PANEL_SECTIONS as readonly string[]).includes(
    section,
  );
}

export function isEstateFullBleedPanelSection(section: AppSection): boolean {
  return (
    isEstateCoreFullBleedPanelSection(section) ||
    isGrowthPanelSection(section) ||
    isGrowPanelSection(section)
  );
}
