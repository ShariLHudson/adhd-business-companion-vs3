/**
 * Hit areas for Destination Gallery crystals in
 * public/backgrounds/destination-gallery-background.png (1536×1024).
 * Percentages are of the aspect-locked stage (full image composition, no crop).
 *
 * Artwork already labels pillars (Schedule, Write, Save, Spark Social Media,
 * Print, Create). Hit zones are transparent — no HTML label overlays.
 */

import type { DestinationCrystalId } from "./constants";

/** Source artwork aspect — stage locks to this so pillars never crop out. */
export const DESTINATION_GALLERY_IMAGE_ASPECT = 1536 / 1024;

export type CrystalHitArea = {
  id: DestinationCrystalId;
  /**
   * Destination name for aria-label only (not rendered over artwork).
   * Artwork may use a different etched name (e.g. Write → Document).
   */
  label: string;
  /** Etched name visible in the background image (documentation / tests). */
  artworkLabel: string;
  left: string;
  top: string;
  width: string;
  height: string;
};

/** Left → right pillars in the gallery image (centers ~16.4 · 27.2 · 38 · 60.9 · 72.6 · 83.9%). */
export const DESTINATION_CRYSTAL_HIT_AREAS: readonly CrystalHitArea[] = [
  {
    id: "schedule",
    label: "Schedule",
    artworkLabel: "Schedule",
    left: "12%",
    top: "44%",
    width: "9%",
    height: "34%",
  },
  {
    id: "write",
    label: "Document",
    artworkLabel: "Write",
    left: "22.5%",
    top: "43%",
    width: "9.5%",
    height: "35%",
  },
  {
    id: "save",
    label: "Store",
    artworkLabel: "Save",
    left: "33.2%",
    top: "44%",
    width: "9.5%",
    height: "34%",
  },
  {
    id: "spark-social-media",
    label: "Share",
    artworkLabel: "Spark Social Media",
    left: "56.2%",
    top: "43%",
    width: "9.5%",
    height: "35%",
  },
  {
    id: "print",
    label: "Print",
    artworkLabel: "Print",
    left: "68%",
    top: "44%",
    width: "9%",
    height: "34%",
  },
  {
    id: "create",
    label: "Design",
    artworkLabel: "Create",
    left: "79%",
    top: "43%",
    width: "9.5%",
    height: "35%",
  },
] as const;

export function crystalHitAreaFor(
  id: DestinationCrystalId,
): CrystalHitArea | undefined {
  return DESTINATION_CRYSTAL_HIT_AREAS.find((area) => area.id === id);
}

export function crystalAriaLabel(area: CrystalHitArea): string {
  return `Open ${area.label} destination`;
}
