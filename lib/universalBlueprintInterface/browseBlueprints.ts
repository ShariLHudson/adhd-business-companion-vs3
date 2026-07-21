/**
 * Universal Blueprint browser — registry lookup only (no private catalog).
 */

import {
  getBlueprint,
  isBlueprintCompatibleWithWorkType,
  listBlueprints,
  UnknownBlueprintError,
  type BlueprintDefinition,
} from "@/lib/universalWorkEngine";
import type {
  BlueprintBrowserItem,
  BlueprintBrowserQuery,
  BlueprintBrowserSourceFilter,
} from "./types";

/** Spec 127 — never leave an empty guided-structure search. */
export const BLUEPRINT_SOURCE_BROADEN_ORDER: readonly BlueprintBrowserSourceFilter[] =
  ["company", "personal", "spark", "recommended", "all"];

function matchesSearch(bp: BlueprintDefinition, search: string): boolean {
  const q = search.trim().toLowerCase();
  if (!q) return true;
  const hay = [
    bp.title,
    bp.description,
    bp.intendedUse,
    bp.blueprintId,
    ...bp.deliverables,
  ]
    .join(" ")
    .toLowerCase();
  return hay.includes(q);
}

function toItem(
  bp: BlueprintDefinition,
  query: BlueprintBrowserQuery,
): BlueprintBrowserItem {
  const recommendedIds = new Set(query.recommendedBlueprintIds ?? []);
  const recentIds = new Set(query.recentBlueprintIds ?? []);
  return {
    blueprintId: bp.blueprintId,
    version: bp.version,
    title: bp.title,
    description: bp.description,
    category: bp.category,
    complexity: bp.complexity,
    supportedDepthModes: bp.supportedDepthModes,
    recommended: recommendedIds.has(bp.blueprintId),
    recentlyUsed: recentIds.has(bp.blueprintId),
  };
}

/**
 * List Blueprints compatible with the selected/inferred Work Type.
 * Incompatible and unknown IDs are excluded (or fail visibly when resolved).
 */
export function browseCompatibleBlueprints(
  query: BlueprintBrowserQuery,
): BlueprintBrowserItem[] {
  const workTypeId = query.workTypeId.trim();
  if (!workTypeId) return [];

  let items = listBlueprints({ workTypeId }).map((bp) => toItem(bp, query));

  const source = query.source ?? "all";
  if (source === "recommended") {
    items = items.filter((i) => i.recommended);
  } else if (source === "spark") {
    items = items.filter((i) => i.category === "spark");
  } else if (source === "personal") {
    items = items.filter((i) => i.category === "personal");
  } else if (source === "company") {
    items = items.filter((i) => i.category === "company");
  } else if (source === "recent") {
    items = items.filter((i) => i.recentlyUsed);
  } else if (source === "previous_work") {
    items = items.filter((i) => i.category === "from_previous_work");
  }

  if (query.complexity && query.complexity !== "all") {
    items = items.filter((i) => i.complexity === query.complexity);
  }

  if (query.depthMode && query.depthMode !== "all") {
    items = items.filter((i) => i.supportedDepthModes.includes(query.depthMode!));
  }

  if (query.search?.trim()) {
    items = items.filter((i) => {
      const bp = getBlueprint(i.blueprintId, i.version);
      return bp ? matchesSearch(bp, query.search!) : false;
    });
  }

  // Recommended first, then recent, then title.
  items.sort((a, b) => {
    if (a.recommended !== b.recommended) return a.recommended ? -1 : 1;
    if (a.recentlyUsed !== b.recentlyUsed) return a.recentlyUsed ? -1 : 1;
    return a.title.localeCompare(b.title);
  });

  return items;
}

export type BroadenedBlueprintBrowse = {
  items: BlueprintBrowserItem[];
  /** Source actually used after auto-broaden (may differ from request). */
  effectiveSource: BlueprintBrowserSourceFilter;
  /** True when filters were widened because the first pass was empty. */
  broadened: boolean;
  /** Human note when results were widened — no empty dead-end. */
  broadenNote: string | null;
};

/**
 * Spec 127 — Never empty Blueprint/structure search.
 * Auto-broaden: Company → Personal → Spark → Recommended → All.
 */
export function browseCompatibleBlueprintsAutoBroaden(
  query: BlueprintBrowserQuery,
): BroadenedBlueprintBrowse {
  const requested = query.source ?? "recommended";
  const startIdx = Math.max(
    0,
    BLUEPRINT_SOURCE_BROADEN_ORDER.indexOf(
      requested === "recent" || requested === "previous_work"
        ? "all"
        : requested,
    ),
  );

  // Always try requested first (including recent / previous_work), then broaden.
  const firstPass = browseCompatibleBlueprints(query);
  if (firstPass.length > 0) {
    return {
      items: firstPass,
      effectiveSource: requested,
      broadened: false,
      broadenNote: null,
    };
  }

  for (let i = startIdx; i < BLUEPRINT_SOURCE_BROADEN_ORDER.length; i++) {
    const source = BLUEPRINT_SOURCE_BROADEN_ORDER[i]!;
    if (source === requested) continue;
    const items = browseCompatibleBlueprints({ ...query, source });
    if (items.length > 0) {
      return {
        items,
        effectiveSource: source,
        broadened: true,
        broadenNote:
          "I widened the list so you still have options — nothing matching that filter yet.",
      };
    }
  }

  // Last resort: clear search + all sources.
  if (query.search?.trim()) {
    const items = browseCompatibleBlueprints({
      ...query,
      search: "",
      source: "all",
    });
    if (items.length > 0) {
      return {
        items,
        effectiveSource: "all",
        broadened: true,
        broadenNote:
          "Nothing matched that search, so here are the structures that fit this kind of work.",
      };
    }
  }

  return {
    items: [],
    effectiveSource: "all",
    broadened: true,
    broadenNote: null,
  };
}

/** Resolve a Blueprint for preview/use — fail safely and visibly. */
export function resolveBrowserBlueprint(
  blueprintId: string,
  workTypeId: string,
  version?: string | null,
): BlueprintDefinition {
  const bp = getBlueprint(blueprintId, version);
  if (!bp) {
    throw new UnknownBlueprintError(blueprintId);
  }
  if (!isBlueprintCompatibleWithWorkType(blueprintId, workTypeId, version)) {
    throw new Error(
      `That Blueprint isn’t a match for this kind of work. Choose one listed for this Work Type.`,
    );
  }
  return bp;
}

/** Recommend Event Spark Blueprints when no personalized list exists. */
export function defaultRecommendedBlueprintIds(
  workTypeId: string,
): string[] {
  return listBlueprints({ workTypeId, category: "spark" })
    .slice(0, 3)
    .map((bp) => bp.blueprintId);
}
