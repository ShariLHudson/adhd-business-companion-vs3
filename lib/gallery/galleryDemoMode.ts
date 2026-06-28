/**
 * The Gallery™ Demo Mode — experience the vision without years of user data.
 * Nothing here is connected to real user information.
 */

import { GALLERY_DEMO_SCENES } from "./galleryDemoCatalog";
import type { GalleryWallMemory } from "./galleryWallMemories";

export type GalleryDemoSceneId =
  | "beginning"
  | "three-months"
  | "portfolio"
  | "impact"
  | "anniversary"
  | "difficult-week"
  | "five-years";

export type GalleryDemoScene = {
  id: GalleryDemoSceneId;
  label: string;
  periodLabel: string;
  mood: string;
  /** Companion whisper when entering the scene — never explains Demo Mode. */
  companionWhisper: string | null;
  exhibits: readonly GalleryWallMemory[];
};

export const GALLERY_DEMO_SCENE_ORDER: readonly GalleryDemoSceneId[] = [
  "beginning",
  "three-months",
  "portfolio",
  "impact",
  "anniversary",
  "difficult-week",
  "five-years",
] as const;

/** Simulated archive — production holds hundreds; demo scripts a subset per scene. */
export const GALLERY_DEMO_ARCHIVE_SIZE = 240 as const;
export const GALLERY_DEMO_VISIBLE_MIN = 12 as const;
export const GALLERY_DEMO_VISIBLE_MAX = 20 as const;

export const GALLERY_DEMO_DISCLAIMER =
  "Demo vision — sample journey, not your personal data." as const;

export const GALLERY_DEMO_QUERY_PARAM = "galleryDemo" as const;

/** Founder preview link — opens Growth / Gallery with scripted demo scenes. */
export const COMPANION_GALLERY_DEMO_HREF =
  `/companion?nav=growth&${GALLERY_DEMO_QUERY_PARAM}=1` as const;

export function readGalleryDemoQuery(
  search: string | URLSearchParams | null | undefined,
): boolean {
  if (!search) return false;
  const params =
    typeof search === "string"
      ? new URLSearchParams(search.startsWith("?") ? search.slice(1) : search)
      : search;
  const value = params.get(GALLERY_DEMO_QUERY_PARAM)?.trim().toLowerCase();
  return value === "1" || value === "true" || value === "yes";
}

/** Demo only when `?galleryDemo=1` — the live Gallery uses seed wall memories. */
export function isGalleryDemoMode(
  search?: string | URLSearchParams | null,
): boolean {
  if (search !== undefined) return readGalleryDemoQuery(search);
  if (typeof window === "undefined") return false;
  return readGalleryDemoQuery(window.location.search);
}

export function resolveGalleryDemoScene(
  sceneId: GalleryDemoSceneId,
): GalleryDemoScene {
  return GALLERY_DEMO_SCENES[sceneId];
}

export function defaultGalleryDemoSceneId(): GalleryDemoSceneId {
  return "beginning";
}
