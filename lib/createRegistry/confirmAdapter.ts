/**
 * Registry Item → existing Create confirm shape.
 *
 * Phase 1 prep only (2026-08-05) — not called from any live path yet. Exists
 * so a future Browse Categories migration can resolve a registry Build into
 * exactly the CreateCatalogItem shape CreateEstateEntrancePanel.tsx's
 * requestCatalogConfirm() / resolveCatalogCreateConfirm() already expect,
 * without those functions or the confirm gate changing at all.
 *
 * Deliberately does NOT touch:
 *   - the confirm gate itself (resolveCreateBeginOutcome.ts,
 *     createIntentConfirmation.ts)
 *   - routing (lib/creationWorkspace/openDecision.ts, ADR-013 boundary)
 *   - Begin's classification ladder
 * Those all key off the resulting CreateCatalogItem.label / matchTerms /
 * route — this adapter's only job is producing that shape correctly.
 */

import type { CreateCatalogItem } from "@/lib/createCatalogData";
import type { CreationRegistryItem } from "./types";

/**
 * Fallback for registry items that don't yet carry an `emoji` (the field is
 * optional/additive — see types.ts). Never used for the 7 V1 priority items,
 * which all set a real emoji; only relevant for the 4 guided UWE seeds,
 * which don't need a confirm-shape emoji yet since they aren't reachable
 * through this adapter's caller in any live path.
 */
const DEFAULT_EMOJI = "📝";

/**
 * Convert a canonical registry item into the shape the existing Begin
 * confirm flow expects. `route` is intentionally omitted: CreateCatalogItem's
 * `route` is a specific AppSection enum member ("opens a non–content-
 * generator workspace") — a different concept from CreationRegistryItem's
 * own `route` field (a descriptive execution-path string like
 * "create/estate/sop" or "create/uwe/event_plan"). Mapping one onto the
 * other would be both a type error and semantically wrong; every registry
 * item here opens the standard Current Focus / content-generator flow, so
 * CreateCatalogItem.route correctly stays undefined.
 */
export function registryItemToConfirmShape(
  item: CreationRegistryItem,
): CreateCatalogItem {
  return {
    label: item.singularLabel,
    emoji: item.emoji ?? DEFAULT_EMOJI,
    matchTerms: item.searchTerms,
  };
}
