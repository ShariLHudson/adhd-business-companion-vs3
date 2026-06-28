/**
 * Gallery Curator Intelligence™ — decides today's exhibition.
 * Demo Mode uses scripted scenes; production will rotate from the full archive.
 */

import type { GalleryWallMemory } from "./galleryWallMemories";
import { resolveGalleryWallMemories } from "./galleryWallMemories";
import {
  GALLERY_DEMO_ARCHIVE_SIZE,
  GALLERY_DEMO_VISIBLE_MAX,
  GALLERY_DEMO_VISIBLE_MIN,
  resolveGalleryDemoScene,
  type GalleryDemoSceneId,
} from "./galleryDemoMode";

export type GalleryCuratorSignals = {
  anniversaries?: boolean;
  encouragementNeeded?: boolean;
  currentGoals?: string[];
  season?: string;
  daysSinceLastVisit?: number;
};

/**
 * V1 demo curator — returns the scene's visible exhibition (12–20 pieces when rich).
 * Production: filter archive by signals + rotation schedule.
 */
export function curateGalleryExhibition(options: {
  demoMode: boolean;
  demoSceneId: GalleryDemoSceneId;
  archive?: readonly GalleryWallMemory[];
  signals?: GalleryCuratorSignals;
}): GalleryWallMemory[] {
  if (options.demoMode) {
    return resolveGalleryDemoScene(options.demoSceneId).exhibits;
  }

  return resolveGalleryWallMemories(options.archive ?? []);
}

export const GALLERY_CURATOR_ROTATION_FACTORS = [
  "anniversaries",
  "encouragement needed",
  "current goals",
  "seasons",
  "business milestones",
  "important memories",
  "time since last displayed",
] as const;

/** Full collection size in demo — hundreds exist behind the scenes in production. */
export function galleryDemoArchiveFootnote(): string {
  return `${GALLERY_DEMO_ARCHIVE_SIZE} memories in the archive · ${GALLERY_DEMO_VISIBLE_MIN}–${GALLERY_DEMO_VISIBLE_MAX} on display today`;
}
