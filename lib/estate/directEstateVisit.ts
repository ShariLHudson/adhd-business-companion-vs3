/**
 * Direct estate visit — member named a destination; app navigates without triage.
 *
 * **Phase C — adapter:** Visit state should be created from `goToPlace().directVisit`.
 *
 * @see lib/estate/goToPlace.ts
 */

import type { AppSection } from "@/lib/companionUi";

export type DirectEstateVisit = {
  roomId: string;
  section: AppSection;
  userIntent: string;
  /** User messages already in thread when this visit began */
  userMessageCountAtArrival: number;
  /** Member-chosen scene view background (observatory, pool terrace, etc.) */
  backgroundImageOverride?: string | null;
  /** Subspace or object focus within roomId (registry-driven). */
  subspaceId?: string | null;
};

/** Rooms with dedicated full-page panels (not the chat-navigation overlay). */
export const DEDICATED_ESTATE_ROOM_PANEL_SECTIONS: readonly AppSection[] = [
  "stables",
  "momentum-institute",
  "momentum-builder",
  "growth-journal",
  /** Evidence Vault — door/key entrance ritual + Discovery File room (EST-001) */
  "evidence-bank",
  /** Clear My Mind — interactive capture workspace, never frosted chat overlay */
  "brain-dump",
  /** Cartographer's Studio — orientation + framed maps, never Focus Studio invitation chrome */
  "visual-focus",
  /** Chamber of Momentum — member gallery, never frosted invitation overlay */
  "chamber-of-momentum",
] as const;

export function isDedicatedEstateRoomPanelSection(
  section: AppSection,
): boolean {
  return (DEDICATED_ESTATE_ROOM_PANEL_SECTIONS as readonly string[]).includes(
    section,
  );
}

/** Full-bleed scene + frosted invitation/chat for direct navigation. */
export function shouldShowDirectEstateVisitOverlay(
  visit: DirectEstateVisit | null,
  activeSection: AppSection,
): boolean {
  if (!visit) return false;
  if (visit.section !== activeSection) return false;
  return !isDedicatedEstateRoomPanelSection(activeSection);
}
