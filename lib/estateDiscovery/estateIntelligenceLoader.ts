/**
 * Estate Intelligence Library — reads Estate Knowledge Base (permanent source of truth).
 *
 * @deprecated Import from `@/lib/estateKnowledgeBase` directly in new code.
 */

export {
  getEstateIntelligenceRegistry,
  getEstateIntelligenceItem,
} from "@/lib/estateKnowledgeBase/loader";

import { getEstateIntelligenceItem } from "@/lib/estateKnowledgeBase/loader";
import type { DiscoveryTargetRegistry } from "./types";

export function isLiveEstateIntelligenceItem(
  item: ReturnType<typeof getEstateIntelligenceItem>,
): boolean {
  return item?.status === "Live";
}

export type { DiscoveryTargetRegistry };

export function resolveRegistryNavigationRoute(
  registry: DiscoveryTargetRegistry,
  id: string,
): string | null {
  const item = getEstateIntelligenceItem(registry, id);
  if (!item || item.status !== "Live") return null;
  return item.route;
}
