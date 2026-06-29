import type { EstateSignId } from "./signpostLayout";

/** Carved garden-marker copy — fades in beneath each flag on hover. */
export const GARDEN_FLAG_PLAQUE: Record<EstateSignId, string> = {
  focus: "Sharpen your attention",
  calming: "Quiet your thoughts",
  energize: "Restore your energy",
  unwind: "Release the day",
  "my-places": "Return to places you love",
} as const;

/** Uniform sign system — depth reads from path position, not component scale. */
export const GARDEN_FLAG_DEPTH_SCALE: Record<EstateSignId, number> = {
  focus: 1,
  calming: 1,
  energize: 1,
  unwind: 1,
  "my-places": 1,
} as const;

export function gardenFlagPlaqueFor(id: EstateSignId): string {
  return GARDEN_FLAG_PLAQUE[id];
}

export function gardenFlagDepthScaleFor(id: EstateSignId): number {
  return GARDEN_FLAG_DEPTH_SCALE[id];
}
