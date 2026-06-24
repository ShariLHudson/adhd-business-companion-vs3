import { listActiveVisualFocusMaps } from "./store";
import type { VisualFocusMap } from "./types";
import { isMomentumEligibleMap } from "./lifecycle";

export const CONTINUE_THINKING_MAX = 3;

/** Active momentum maps — not pinned, not archived, not completed, not storage. */
export function listContinueThinkingMaps(): VisualFocusMap[] {
  return listActiveVisualFocusMaps()
    .filter(isMomentumEligibleMap)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, CONTINUE_THINKING_MAX);
}

export function isContinueThinkingMap(map: VisualFocusMap): boolean {
  const ids = new Set(listContinueThinkingMaps().map((m) => m.id));
  return ids.has(map.id);
}
