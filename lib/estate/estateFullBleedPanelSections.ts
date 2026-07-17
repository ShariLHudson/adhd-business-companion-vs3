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
  "spin-wheel",
  "focus-audio",
  "games",
  "quick-recharge",
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
