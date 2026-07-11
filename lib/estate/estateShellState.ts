/**
 * SparkEstateShell state — maps `goToPlace` to shell props (Phase D.1).
 *
 * @see docs/estate/PHASE_D_UNIFIED_ESTATE_SHELL.md
 * @see docs/estate/P0_CANON_ERRATA.md
 */

import type { AppSection } from "@/lib/companionUi";
import {
  getCanonicalEstatePlaceById,
  resolveCanonicalPlaceId,
  type CanonicalArrivalBehavior,
  type CanonicalEstateCategory,
} from "./canonicalEstateRegistry";
import { goToPlace, type GoToPlaceInput } from "./goToPlace";
import { resolveCanonicalPlaceBackground } from "./estatePlaceMedia";
import { isProfileEstateRoomId } from "@/lib/growth/profileEstateRooms";

export type EstateShellState = {
  /** Canonical place id (legacy ids normalized) */
  placeId: string;
  officialName: string;
  category: CanonicalEstateCategory | "profile-estate";
  primaryFeeling: string;
  backgroundImage: string | null;
  section: AppSection;
  arrivalBehavior: CanonicalArrivalBehavior | null;
  showTitlePlaque: boolean;
  showInvitationGrid: boolean;
  /** Living / transition — conversation only, no invitation grid */
  livingPlaceMode: boolean;
  /** Use EstateRoomChatChrome instead of visit chrome */
  conversationOnly: boolean;
  preserveConversation: true;
  autoOpenActivity: boolean;
};

export type ResolveEstateShellStateInput = GoToPlaceInput & {
  /** Profile menu estate rooms — always conversation-only */
  profileEstateMode?: boolean;
};

function shellFromPlace(
  placeId: string,
  opts: {
    section: AppSection;
    autoOpenActivity: boolean;
    category: CanonicalEstateCategory | "profile-estate";
    officialName: string;
    primaryFeeling: string;
    backgroundImage: string | null;
    arrivalBehavior: CanonicalArrivalBehavior | null;
    showTitlePlaque: boolean;
    showInvitationGrid: boolean;
  },
): EstateShellState {
  const livingPlaceMode =
    opts.category === "living-place" ||
    opts.category === "transition-space" ||
    opts.category === "profile-estate";

  return {
    placeId,
    officialName: opts.officialName,
    category: opts.category,
    primaryFeeling: opts.primaryFeeling,
    backgroundImage: opts.backgroundImage,
    section: opts.section,
    arrivalBehavior: opts.arrivalBehavior,
    showTitlePlaque: opts.showTitlePlaque,
    showInvitationGrid: opts.showInvitationGrid,
    livingPlaceMode,
    conversationOnly: livingPlaceMode || !opts.showInvitationGrid,
    preserveConversation: true,
    autoOpenActivity: opts.autoOpenActivity,
  };
}

/**
 * Resolve canonical shell state for a place visit.
 * Returns null when the place cannot be navigated.
 */
export function resolveEstateShellState(
  rawPlaceId: string,
  input: ResolveEstateShellStateInput = { placeId: rawPlaceId },
): EstateShellState | null {
  const placeId = resolveCanonicalPlaceId(rawPlaceId);

  if (input.profileEstateMode && isProfileEstateRoomId(placeId)) {
    const canonical = getCanonicalEstatePlaceById(placeId);
    const outcome = goToPlace({ ...input, placeId });
    const section = outcome.ok ? outcome.section : "home";
    return shellFromPlace(placeId, {
      section,
      autoOpenActivity: false,
      category: "profile-estate",
      officialName: canonical?.officialName ?? placeId,
      primaryFeeling: canonical?.primaryFeeling ?? "Belonging",
      backgroundImage:
        resolveCanonicalPlaceBackground(placeId) ??
        canonical?.backgroundImage ??
        null,
      arrivalBehavior: canonical?.arrivalBehavior ?? "ambient-crossfade",
      showTitlePlaque: false,
      showInvitationGrid: false,
    });
  }

  const outcome = goToPlace({ ...input, placeId });
  if (!outcome.ok) {
    const place = getCanonicalEstatePlaceById(placeId);
    if (!place) return null;
    return shellFromPlace(placeId, {
      section: "home",
      autoOpenActivity: Boolean(input.explicitActivityRequested),
      category: place.category,
      officialName: place.officialName,
      primaryFeeling: place.primaryFeeling,
      backgroundImage:
        resolveCanonicalPlaceBackground(placeId) ?? place.backgroundImage,
      arrivalBehavior: place.arrivalBehavior,
      showTitlePlaque: place.category !== "living-place",
      showInvitationGrid: false,
    });
  }

  return shellFromPlace(outcome.placeId, {
    section: outcome.section,
    autoOpenActivity: outcome.autoOpenActivity,
    category: outcome.category,
    officialName: outcome.officialName,
    primaryFeeling: outcome.primaryFeeling,
    backgroundImage: outcome.backgroundImage,
    arrivalBehavior: outcome.arrivalBehavior,
    showTitlePlaque: outcome.showTitlePlaque,
    showInvitationGrid: outcome.showInvitationGrid,
  });
}
