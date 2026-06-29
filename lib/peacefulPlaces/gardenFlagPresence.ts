import type { EstateSignId } from "./signpostLayout";

export const GARDEN_PATH_WALK_MS = 600 as const;
export const GARDEN_PATH_FADE_MS = 350 as const;

export function gardenFlagHoverSide(id: EstateSignId | null): "left" | "right" | null {
  if (!id) return null;
  if (id === "focus" || id === "calming") return "left";
  return "right";
}

export function delayMs(ms: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}
