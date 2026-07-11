/**
 * Gallery wall memories — framed items along the hallway plate.
 * V1: seed beginning-zone frames. Future engines append without layout redesign.
 */

import { GALLERY_BEGINNING_WALL_COPY } from "./galleryArchitecture";
import type { GalleryMemory, GalleryMemoryKind } from "./types";

export type GalleryWallMemoryVariant =
  | "quote"
  | "botanical"
  | "empty"
  | "milestone"
  | "photo"
  | "lesson"
  | "portfolio"
  | "impact"
  | "anniversary";

export type GalleryWallMemory = GalleryMemory & {
  id: string;
  walkPosition: number;
  wallSide: "left" | "right";
  wallTopPercent: number;
  variant: GalleryWallMemoryVariant;
  /** Demo / curator accents — flowers, quiet rotation. */
  accent?: "flowers" | "quiet-rotate";
};

const SEED_CREATED = "2026-01-01T00:00:00.000Z";

function seedWallMemory(
  memory: Omit<GalleryWallMemory, "createdAt" | "title"> &
    Partial<Pick<GalleryWallMemory, "createdAt" | "title">>,
): GalleryWallMemory {
  return {
    ...memory,
    createdAt: memory.createdAt ?? SEED_CREATED,
    title: memory.title ?? "",
  };
}

const SEED_WALL_MEMORIES: readonly GalleryWallMemory[] = [
  seedWallMemory({
    id: "gallery-welcome-quote",
    kind: "quote",
    walkPosition: 0.1,
    wallSide: "left",
    wallTopPercent: 27,
    variant: "quote",
    title: GALLERY_BEGINNING_WALL_COPY.welcomeQuote,
    plaque: "Welcome",
  }),
  seedWallMemory({
    id: "gallery-journey-botanical",
    kind: "personal-photo",
    walkPosition: 0.16,
    wallSide: "right",
    wallTopPercent: 30,
    variant: "botanical",
    plaque: "The Journey Begins",
  }),
  seedWallMemory({
    id: "gallery-still-being-written",
    kind: "milestone",
    walkPosition: 0.28,
    wallSide: "left",
    wallTopPercent: 29,
    variant: "empty",
    plaque: GALLERY_BEGINNING_WALL_COPY.emptyFramePlaque,
  }),
  seedWallMemory({
    id: "gallery-small-steps",
    kind: "quote",
    walkPosition: 0.36,
    wallSide: "right",
    wallTopPercent: 32,
    variant: "quote",
    body: "Progress is built one small step at a time.",
  }),
  seedWallMemory({
    id: "gallery-first-win",
    kind: "achievement",
    walkPosition: 0.48,
    wallSide: "left",
    wallTopPercent: 28,
    variant: "milestone",
    title: "First win remembered",
    subtitle: "Evidence Vault",
    plaque: "Growing",
  }),
  seedWallMemory({
    id: "gallery-proof-frame",
    kind: "testimonial",
    walkPosition: 0.58,
    wallSide: "right",
    wallTopPercent: 30,
    variant: "photo",
    title: "Proof on the wall",
    subtitle: "Highlights & Evidence",
    plaque: "Confidence",
  }),
  seedWallMemory({
    id: "gallery-published-work",
    kind: "published-work",
    walkPosition: 0.7,
    wallSide: "left",
    wallTopPercent: 29,
    variant: "milestone",
    title: "Published work",
    plaque: "Portfolio",
  }),
  seedWallMemory({
    id: "gallery-reflection-branch",
    kind: "journal-entry",
    walkPosition: 0.82,
    wallSide: "right",
    wallTopPercent: 31,
    variant: "quote",
    body: "Quiet reflection lives just ahead.",
    plaque: "Journal",
  }),
];

/** Wall items sorted along the stroll — demo curator or seed memories. */
export function resolveGalleryWallMemories(
  additions: readonly GalleryWallMemory[] = [],
): GalleryWallMemory[] {
  const merged = [...SEED_WALL_MEMORIES, ...additions];
  return merged.sort((a, b) => a.walkPosition - b.walkPosition);
}

export function galleryWallMemoryLayout(memory: GalleryWallMemory): {
  leftPercent: number;
  topPercent: number;
} {
  const corridorOffset = memory.wallSide === "left" ? 4.5 : 33.5;
  return {
    leftPercent: corridorOffset + memory.walkPosition * 54,
    topPercent: memory.wallTopPercent,
  };
}

export function galleryWallMemoryKindLabel(kind: GalleryMemoryKind): string {
  switch (kind) {
    case "journal-entry":
      return "Journal";
    case "testimonial":
      return "Testimonial";
    case "published-work":
      return "Published";
    case "achievement":
      return "Achievement";
    case "quote":
      return "Quote";
    default:
      return "Memory";
  }
}
