/**
 * Estate Chrome Policy (Phase E) — what app chrome may appear in Estate mode.
 *
 * Authority: Constitution Art. VIII · Phase D shell · `goToPlace` arrival flags.
 *
 * @see docs/estate/PHASE_E_REMOVE_APPLICATION_CHROME_REPORT.md
 */

import type { AppSection } from "@/lib/companionUi";
import { getCanonicalEstatePlaceById } from "./canonicalEstateRegistry";
import { goToPlace, type GoToPlaceResult } from "./goToPlace";

export type EstateChromePolicy = {
  /** Sidebar, top bar, workspace tabs, back button */
  hideApplicationChrome: boolean;
  /** Upper-left “Home” pill — software navigation */
  hideEstateHomeLink: boolean;
  /** “While you're here…” invitation grids */
  hideInvitationGrid: boolean;
  /** Title / motto arrival plaques */
  hideTitlePlaque: boolean;
  /** Subtle floating Estate menu (settings, profile) */
  showSubtleEstateMenu: boolean;
  /** Guidebook scene anchor */
  showGuidebook: boolean;
  /** Living Place — background + chat + objects only */
  livingPlaceMode: boolean;
};

export type EstateChromeContext = {
  placeId?: string | null;
  /** Primary chat home — hide app chrome even when a workspace panel is beside chat. */
  activeSection?: AppSection;
  welcomeHomePrimary?: boolean;
  profileEstateChromeActive?: boolean;
  estateImmersiveActive?: boolean;
  showDirectEstateOverlay?: boolean;
  momentumInstitutePrimary?: boolean;
  stablesPrimary?: boolean;
  momentumBuilderPrimary?: boolean;
  overlay?: string | null;
};

/** Estate-first chat at `/companion` home — not legacy dashboard shell. */
export function isEstateHomeChatSection(ctx: EstateChromeContext): boolean {
  return ctx.activeSection === "home" && ctx.overlay !== "signin";
}

function policyFromGoToPlace(result: GoToPlaceResult): EstateChromePolicy {
  const livingPlaceMode = result.category === "living-place";
  return {
    hideApplicationChrome: true,
    hideEstateHomeLink: false,
    hideInvitationGrid: !result.showInvitationGrid,
    hideTitlePlaque: !result.showTitlePlaque,
    showSubtleEstateMenu: true,
    showGuidebook: true,
    livingPlaceMode,
  };
}

const ESTATE_PLACE_DEFAULT: EstateChromePolicy = {
  hideApplicationChrome: true,
  hideEstateHomeLink: false,
  hideInvitationGrid: true,
  hideTitlePlaque: true,
  showSubtleEstateMenu: true,
  showGuidebook: true,
  livingPlaceMode: false,
};

const APPLICATION_DEFAULT: EstateChromePolicy = {
  hideApplicationChrome: false,
  hideEstateHomeLink: false,
  hideInvitationGrid: false,
  hideTitlePlaque: false,
  showSubtleEstateMenu: true,
  showGuidebook: true,
  livingPlaceMode: false,
};

/** True when member is inside an Estate place (not generic app layout). */
export function isEstatePlaceChromeActive(ctx: EstateChromeContext): boolean {
  return Boolean(
    isEstateHomeChatSection(ctx) ||
      ctx.welcomeHomePrimary ||
      ctx.profileEstateChromeActive ||
      ctx.estateImmersiveActive ||
      ctx.showDirectEstateOverlay ||
      ctx.momentumInstitutePrimary ||
      ctx.stablesPrimary ||
      ctx.momentumBuilderPrimary,
  );
}

export function resolveEstateChromePolicy(
  ctx: EstateChromeContext,
): EstateChromePolicy {
  if (ctx.overlay === "signin") {
    return {
      ...APPLICATION_DEFAULT,
      hideApplicationChrome: false,
      showSubtleEstateMenu: false,
      showGuidebook: false,
    };
  }

  if (ctx.placeId) {
    const outcome = goToPlace({ placeId: ctx.placeId });
    if (outcome.ok) {
      return policyFromGoToPlace(outcome);
    }
    const place = getCanonicalEstatePlaceById(ctx.placeId);
    if (place?.category === "living-place") {
      return { ...ESTATE_PLACE_DEFAULT, livingPlaceMode: true };
    }
  }

  if (isEstateHomeChatSection(ctx)) {
    return ESTATE_PLACE_DEFAULT;
  }

  if (isEstatePlaceChromeActive(ctx)) {
    return ESTATE_PLACE_DEFAULT;
  }

  return APPLICATION_DEFAULT;
}

export function shouldSuppressEstateInvitationGrid(placeId: string): boolean {
  const outcome = goToPlace({ placeId });
  if (outcome.ok) return !outcome.showInvitationGrid;
  return getCanonicalEstatePlaceById(placeId)?.category === "living-place";
}

export function shouldSuppressEstateTitlePlaque(placeId: string): boolean {
  const outcome = goToPlace({ placeId });
  if (outcome.ok) return !outcome.showTitlePlaque;
  const place = getCanonicalEstatePlaceById(placeId);
  return (
    place?.category === "living-place" || place?.category === "transition-space"
  );
}
