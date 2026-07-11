/**
 * Chat-navigated estate rooms — frosted conversation + optional ambience.
 *
 * **Phase C — adapter:** Should eventually key off `goToPlace` metadata only.
 *
 * @see lib/estate/goToPlace.ts
 */

import type { AppSection } from "@/lib/companionUi";
import { isDirectEstateRoomRequest } from "@/lib/estateIntelligence/estateCommandRouter";
import { loadEstatePendingTransition } from "@/lib/estateMemory";
import type { DirectEstateVisit } from "./directEstateVisit";
import {
  isDedicatedEstateRoomPanelSection,
  shouldShowDirectEstateVisitOverlay,
} from "./directEstateVisit";
import { getEstateRoomForRoute } from "./estateRoomRegistry";

/**
 * @deprecated Chat-navigation overlay list — Clear My Mind is a dedicated panel
 * (`isDedicatedEstateRoomPanelSection`), not frosted chat.
 */
export const ESTATE_CHAT_NAVIGATION_OVERLAY_SECTIONS: readonly AppSection[] = [] as const;

export function estateSectionUsesChatNavigationOverlay(
  section: AppSection,
): boolean {
  return (ESTATE_CHAT_NAVIGATION_OVERLAY_SECTIONS as readonly string[]).includes(
    section,
  );
}

/** Pending direct go-to-room — member already said where; app should navigate. */
export function isActiveDirectEstateNavigation(): boolean {
  const pending = loadEstatePendingTransition();
  if (!pending?.originalUserIntent?.trim()) return false;
  return isDirectEstateRoomRequest(pending.originalUserIntent);
}

export { shouldShowDirectEstateVisitOverlay };

/**
 * Layer 1 ambience follows the place on screen — not a stale direct-visit ref.
 * Coffee House audio must stop when the overlay/section no longer matches.
 * Welcome Home lobby is not immersive presence — pass welcomeHomePrimary so
 * Room menu Sound on/off can drive welcome-room ambience.
 */
export function resolveEstatePlaceAudioHostPlaceId(input: {
  directEstateVisit: DirectEstateVisit | null;
  showDirectEstateOverlay: boolean;
  estatePresenceRoomId: string | null;
  showGlobalEstatePresence: boolean;
  welcomeHomePrimary?: boolean;
}): string | null {
  if (input.showDirectEstateOverlay && input.directEstateVisit?.roomId) {
    return input.directEstateVisit.roomId;
  }
  if (input.showGlobalEstatePresence && input.estatePresenceRoomId) {
    return input.estatePresenceRoomId;
  }
  if (input.welcomeHomePrimary) {
    return "welcome-home";
  }
  return null;
}

/** Full-bleed room + frosted chat for any direct navigation except dedicated panels. */
export function shouldShowDirectEstateOverlay(
  section: AppSection,
  visit?: DirectEstateVisit | null,
): boolean {
  if (visit) {
    return shouldShowDirectEstateVisitOverlay(visit, section);
  }
  if (!isActiveDirectEstateNavigation()) return false;
  return !isDedicatedEstateRoomPanelSection(section);
}

/** @deprecated use isActiveDirectEstateNavigation or visit state */
export function isDirectEstateChatArrival(section: AppSection): boolean {
  if (!isActiveDirectEstateNavigation()) return false;
  const pending = loadEstatePendingTransition();
  if (!pending) return false;
  return (
    pending.destinationSection === section ||
    shouldShowDirectEstateOverlay(section)
  );
}

export function directEstateChatRoomId(
  section: AppSection,
  visit?: DirectEstateVisit | null,
): string {
  if (visit?.roomId) return visit.roomId;
  const pending = loadEstatePendingTransition();
  if (pending?.destinationEntryId) return pending.destinationEntryId;
  return getEstateRoomForRoute(section)?.id ?? section;
}
