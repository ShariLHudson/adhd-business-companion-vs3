/**
 * Simulated stroll — plate slides in pixels for smooth GPU motion.
 * Wall memories ride the plate and reveal as you pass.
 */

import {
  GALLERY_PLATE_FRAME,
  GALLERY_WALK_CYCLE_MS,
  GALLERY_WALK_ENTRANCE,
} from "./galleryRoom";
import type { GalleryWalkFrame } from "./types";

/** Forward-only 0→1 — steady stroll to the far end, then hold. */
export function galleryWalkProgress(elapsedMs: number): number {
  if (elapsedMs <= 0) return 0;
  return Math.min(1, elapsedMs / GALLERY_WALK_CYCLE_MS);
}

/** Pixel translate for the hallway plate — avoids jittery %-scale combos. */
export function galleryPlateTranslatePx(
  walkProgress: number,
  plateWidthPx: number,
  viewportWidthPx: number,
): number {
  const travel = Math.max(0, plateWidthPx - viewportWidthPx);
  return -walkProgress * travel;
}

export function galleryWalkFrame(
  elapsedMs: number,
  reducedMotion = false,
): GalleryWalkFrame {
  if (reducedMotion) {
    return {
      walkProgress: 0,
      objectPosition: `${GALLERY_WALK_ENTRANCE.objectXPercent}% ${GALLERY_WALK_ENTRANCE.objectYPercent}%`,
    };
  }

  return {
    walkProgress: galleryWalkProgress(elapsedMs),
    objectPosition: `${GALLERY_WALK_ENTRANCE.objectXPercent}% ${GALLERY_WALK_ENTRANCE.objectYPercent}%`,
  };
}

export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Static crop on the camera — set once in CSS, not animated per frame. */
export const GALLERY_RIG_SCALE = GALLERY_PLATE_FRAME.hallwayScale;
