/**
 * Estate place navigation audit — canonical place × mount × media × goToPlace.
 */

import { getAllEstateDirectoryEntries } from "./directory";
import { goToPlace } from "./goToPlace";
import { getEstateMountByPlaceId } from "./estateMountRegistry";
import { resolveCanonicalPlaceAmbience } from "./estatePlaceMedia";
import type { CanonicalEstateStatus } from "./canonicalEstateRegistry";

export type EstatePlaceAuditStatus = "live" | "partial" | "planned" | "future";

export type EstatePlaceNavigationAuditRow = {
  placeId: string;
  publicName: string;
  status: EstatePlaceAuditStatus;
  appSection: string | null;
  mountExists: boolean;
  backgroundExists: boolean;
  ambienceExists: boolean;
  goToPlaceCanOpen: boolean;
  ifNoWhy: string | null;
  recommendedFix: string | null;
};

function mapAuditStatus(status: CanonicalEstateStatus): EstatePlaceAuditStatus {
  if (status === "needs-asset") return "partial";
  return status;
}

export function auditEstatePlaceNavigation(): EstatePlaceNavigationAuditRow[] {
  return getAllEstateDirectoryEntries().map((entry) => {
    const mount = getEstateMountByPlaceId(entry.id);
    const ambience = resolveCanonicalPlaceAmbience(entry.id);
    const outcome = goToPlace({ placeId: entry.id });

    const backgroundExists = Boolean(entry.media.backgroundUrl);
    const ambienceExists = Boolean(ambience?.src);
    const goToPlaceCanOpen = outcome.ok;

    let ifNoWhy: string | null = null;
    let recommendedFix: string | null = null;

    if (!goToPlaceCanOpen) {
      ifNoWhy = outcome.ok ? null : outcome.message;
      if (outcome.ok === false && outcome.code === "not_navigable") {
        recommendedFix = `Add shell.section or menuActionId in directory/shell for ${entry.id}`;
      } else if (outcome.ok === false && outcome.code === "unknown_place") {
        recommendedFix = `Register ${entry.id} in canonical registry and directory`;
      }
    } else if (!mount) {
      recommendedFix = `Optional: add ${entry.id} to estateMountRegistry for tier metadata`;
    } else if (!backgroundExists && entry.status !== "planned") {
      recommendedFix = `Add background plate in estatePlaceMedia for ${entry.id}`;
    }

    return {
      placeId: entry.id,
      publicName: entry.officialName,
      status: mapAuditStatus(entry.status),
      appSection: entry.shell.section ?? mount?.appSection ?? null,
      mountExists: Boolean(mount),
      backgroundExists,
      ambienceExists,
      goToPlaceCanOpen,
      ifNoWhy,
      recommendedFix,
    };
  });
}
