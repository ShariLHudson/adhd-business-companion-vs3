/**
 * Estate Immersive Layout — full-viewport rooms with no app chrome.
 * One navigable world: edge-to-edge imagery, no sidebar, no top bar, no brown framing.
 */

import type { AppSection } from "./companionUi";
import { GROW_PANEL_SECTIONS, isGrowPanelSection } from "./growNavigation";
import {
  GROWTH_PANEL_SECTIONS,
  isGrowthPanelSection,
} from "./growthNavigation";

/** Standalone estate rooms — photographic full-bleed scenes. */
export const STANDALONE_ESTATE_ROOM_SECTIONS: readonly AppSection[] = [
  "brain-dump",
  "life-experience",
  "the-gallery",
  "plan-my-day",
  "focus-audio",
  "games",
  "quick-recharge",
  "energy",
  "breathe",
  "focus",
  "visual-focus",
  "chamber-of-momentum",
  "boardroom",
  "project-homes",
  "momentum-builder",
  "momentum-institute",
  "stables",
  "time-block",
  "spin-wheel",
  "guided-exercises",
  ...GROWTH_PANEL_SECTIONS,
  ...GROW_PANEL_SECTIONS,
] as const;

export function isStandaloneEstateRoomSection(
  section: AppSection | null | undefined,
): boolean {
  return (
    section != null &&
    (STANDALONE_ESTATE_ROOM_SECTIONS as readonly string[]).includes(section)
  );
}

export type EstateImmersiveLayoutContext = {
  activeSection: AppSection;
  workspacePanel: AppSection | null;
  welcomeHomePrimary: boolean;
  momentumBuilderPrimary: boolean;
  momentumInstitutePrimary?: boolean;
  stablesPrimary?: boolean;
  profileEstateChromeActive?: boolean;
  overlay: string | null;
  focusSanctuaryFullBleed: boolean;
};

/** True when the member is inside a full-screen estate room (not home chat shell). */
export function isEstateImmersiveRoom(
  ctx: EstateImmersiveLayoutContext,
): boolean {
  if (ctx.welcomeHomePrimary) return false;
  if (ctx.activeSection === "home") return false;
  return true;
}

/**
 * Standalone estate rooms render from `activeSection`, not the home chat shell.
 * Keep the current section while chatting inside those rooms.
 */
export function shouldPreserveEstateRoomSectionDuringChat(
  section: AppSection | null | undefined,
): boolean {
  return isStandaloneEstateRoomSection(section);
}

/** Upper-left Home control — every navigable estate room and overlay. */
export function shouldShowEstateRoomHomeLink(
  ctx: EstateImmersiveLayoutContext,
): boolean {
  if (ctx.welcomeHomePrimary) return false;
  if (ctx.overlay === "signin") return false;
  if (ctx.profileEstateChromeActive) return true;
  if (ctx.momentumInstitutePrimary) return true;
  if (ctx.stablesPrimary) return true;
  if (ctx.momentumBuilderPrimary) return true;
  if (ctx.overlay) return true;
  return isEstateImmersiveRoom(ctx);
}
