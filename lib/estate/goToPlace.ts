/**
 * goToPlace — single approved Estate navigation primitive (Phase C).
 *
 * Navigation law: the conversation belongs to the member; the place changes;
 * the conversation continues. Only explicit new-conversation actions reset chat.
 *
 * @see lib/estate/canonicalEstateRegistry.ts
 * @see docs/estate/PHASE_C_GOTOPLACE_REPORT.md
 */

import type { AppSection } from "@/lib/companionUi";
import type { EstateMenuActionId } from "@/lib/estateMenu/menuConfig";
import {
  getEstateDirectoryEntry,
  requireEstateDirectoryEntry,
  toCanonicalEstatePlace,
} from "./directory";
import {
  resolveCanonicalPlaceId,
  type CanonicalArrivalBehavior,
  type CanonicalEstateCategory,
  type CanonicalEstatePlace,
} from "./canonicalEstateRegistry";
import { resolveNavigationTarget } from "./estateRoutingRegistry";
import { resolveSceneViewBackgroundUrl } from "./estatePlaceSceneViews";
import type { DirectEstateVisit } from "./directEstateVisit";
import { shouldSuppressDestinationInvitationGrid } from "./estatePlaceFirstArrival";
import { onEstatePlaceArrived } from "@/lib/sparkRecognitionEngine/shellSync";

/**
 * Places that must not claim their own name until dedicated art ships.
 * Navigation lands on the honest live place (same plate the member sees).
 */
const PLACE_NAVIGATION_REDIRECTS: Readonly<Record<string, string>> = {};

export type GoToPlaceInput = {
  placeId: string;
  /** Original member phrase — preserved for memory and arrival copy */
  userIntent?: string;
  /** User messages already in thread when navigation begins */
  userMessageCountAtArrival?: number;
  /**
   * When true, member explicitly requested an activity/workspace (e.g. Clear My Mind).
   * Default false — place change only, no auto-open.
   */
  explicitActivityRequested?: boolean;
};

export type GoToPlaceResult = {
  ok: true;
  placeId: string;
  place: CanonicalEstatePlace;
  officialName: string;
  category: CanonicalEstateCategory;
  primaryFeeling: string;
  backgroundImage: string | null;
  arrivalBehavior: CanonicalArrivalBehavior;
  relatedPlaces: readonly string[];
  status: CanonicalEstatePlace["status"];
  /** Existing UI shell — adapter until unified shell routing */
  section: AppSection;
  menuActionId?: EstateMenuActionId;
  /** Navigation law — always false for room movement */
  resetConversation: false;
  preserveConversation: true;
  /** Never auto-open tools unless member explicitly requested activity */
  autoOpenActivity: boolean;
  /** Constitution Art. VIII — living places never show title plaques */
  showTitlePlaque: boolean;
  /** Living places never show object-invitation grids on arrival */
  showInvitationGrid: boolean;
  /** Metadata for existing direct-visit overlay system */
  directVisit: DirectEstateVisit;
};

export type GoToPlaceError = {
  ok: false;
  placeId: string;
  code: "unknown_place" | "not_navigable";
  message: string;
};

export type GoToPlaceOutcome = GoToPlaceResult | GoToPlaceError;

function arrivalUiFlags(
  place: CanonicalEstatePlace,
): Pick<GoToPlaceResult, "showTitlePlaque" | "showInvitationGrid"> {
  const isLiving = place.category === "living-place";
  const isTransition = place.category === "transition-space";
  return {
    showTitlePlaque: !isLiving && !isTransition && place.arrivalBehavior !== "presence-only",
    showInvitationGrid: shouldSuppressDestinationInvitationGrid()
      ? false
      : !isLiving &&
        !isTransition &&
        place.arrivalBehavior === "object-invitation",
  };
}

/** Validate canonical place id and build navigation metadata without mutating chat. */
export function goToPlace(input: GoToPlaceInput): GoToPlaceOutcome {
  const requestedId = resolveCanonicalPlaceId(input.placeId);
  const redirectedId = PLACE_NAVIGATION_REDIRECTS[requestedId] ?? requestedId;
  const navTarget = resolveNavigationTarget(redirectedId);
  const shellPlaceId = navTarget?.navigatePlaceId ?? redirectedId;
  const entry = getEstateDirectoryEntry(shellPlaceId);
  if (!entry) {
    return {
      ok: false,
      placeId: input.placeId,
      code: "unknown_place",
      message: `Unknown canonical estate place: ${input.placeId}`,
    };
  }

  if (!entry.shell.navigable || (!entry.shell.section && !entry.shell.menuActionId)) {
    return {
      ok: false,
      placeId: entry.id,
      code: "not_navigable",
      message: `No shell mapping for place: ${entry.id}`,
    };
  }

  const focusPlace = navTarget?.focusPlace ?? toCanonicalEstatePlace(entry);
  const place = focusPlace;
  const section = entry.shell.section ?? "home";
  const arrivalUi = arrivalUiFlags(toCanonicalEstatePlace(entry));
  const userIntent = input.userIntent?.trim() || `Visit ${focusPlace.officialName}`;

  const sceneViewId = navTarget?.sceneViewId;
  const backgroundImageOverride =
    sceneViewId && entry.id
      ? resolveSceneViewBackgroundUrl(entry.id, sceneViewId)
      : null;
  const focusMedia = getEstateDirectoryEntry(focusPlace.id)?.media.backgroundUrl;

  const result: GoToPlaceResult = {
    ok: true,
    placeId: focusPlace.id,
    place,
    officialName: focusPlace.officialName,
    category: place.category,
    primaryFeeling: place.primaryFeeling,
    backgroundImage:
      backgroundImageOverride ?? focusMedia ?? entry.media.backgroundUrl,
    arrivalBehavior: place.arrivalBehavior,
    relatedPlaces: place.relatedPlaces,
    status: place.status,
    section,
    menuActionId: entry.shell.menuActionId,
    resetConversation: false,
    preserveConversation: true,
    autoOpenActivity: Boolean(input.explicitActivityRequested),
    showTitlePlaque: arrivalUi.showTitlePlaque,
    showInvitationGrid: arrivalUi.showInvitationGrid,
    directVisit: {
      roomId: entry.id,
      section,
      userIntent,
      userMessageCountAtArrival: input.userMessageCountAtArrival ?? 0,
      subspaceId: navTarget?.subspaceId ?? null,
      backgroundImageOverride:
        backgroundImageOverride ?? focusMedia ?? null,
    },
  };

  // Sprint 1 — keep recognition visual_room aligned with navigation.
  onEstatePlaceArrived({ placeId: result.placeId, section: result.section });

  return result;
}

export function requireGoToPlace(input: GoToPlaceInput): GoToPlaceResult {
  const outcome = goToPlace(input);
  if (!outcome.ok) {
    throw new Error(outcome.message);
  }
  return outcome;
}

/** Background for UI — directory media first. */
export function goToPlaceBackgroundImage(placeId: string): string | null {
  const id = resolveCanonicalPlaceId(placeId);
  return getEstateDirectoryEntry(id)?.media.backgroundUrl ?? null;
}

export function isLivingPlaceNavigation(placeId: string): boolean {
  const entry = getEstateDirectoryEntry(placeId);
  return entry?.category === "living-place";
}

export function assertCanonicalPlace(placeId: string): CanonicalEstatePlace {
  return toCanonicalEstatePlace(requireEstateDirectoryEntry(placeId));
}
