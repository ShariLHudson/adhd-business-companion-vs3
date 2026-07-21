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
} from "./types";

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
