/**
 * Discovery Companion Response™ — curated Spark voice after a Discovery button tap.
 */

import type { DiscoveryEngineSelection, DiscoveryLibraryItem } from "./types";

export function resolveDiscoveryCompanionResponse(
  item: Pick<DiscoveryLibraryItem, "companionResponse" | "title" | "discoveryText" | "whyItMatters">,
): string | null {
  const curated = item.companionResponse?.trim();
  if (curated) return curated;
  return null;
}

/** Fallback when no curated companion line exists (conversation / help paths). */
export function formatDiscoveryCompanionFallback(
  pick: Pick<
    DiscoveryEngineSelection,
    "title" | "discoveryText" | "whyItMatters" | "companionResponse"
  >,
): string {
  const curated = pick.companionResponse?.trim();
  if (curated) return curated;

  const lines = [pick.discoveryText];
  if (pick.whyItMatters) {
    lines.push(pick.whyItMatters);
  }
  return lines.join("\n\n");
}
