/**
 * Companion Objects Design System — master catalog API.
 * @see docs/companion-homestead/COMPANION_OBJECTS_DESIGN_SYSTEM.md
 */

export {
  COMPANION_OBJECT_COLLECTIONS,
  COMPANION_OBJECT_MATERIALS,
  type CompanionObjectAnimation,
  type CompanionObjectCatalogEntry,
  type CompanionObjectCollection,
  type CompanionObjectCollectionMeta,
  type CompanionObjectMaterial,
} from "./types";

export {
  ANIMATION_LANGUAGE,
  DEFAULT_ILLUSTRATION_NOTES,
  DEFAULT_OBJECT_PALETTE,
  ILLUSTRATION_STYLE,
  ILLUSTRATION_STYLE_NAME,
  MATERIAL_PALETTE_AVOID,
  MATERIAL_PALETTE_PREFER,
} from "./illustrationStyle";

export {
  COMPANION_OBJECT_COLLECTION_META,
  collectionMetaById,
} from "./collections";

export {
  COMPANION_OBJECTS_MASTER_CATALOG,
  BUSINESS_OBJECT_SEEDS,
  COFFEE_COMFORT_OBJECT_SEEDS,
  CREATIVE_OBJECT_SEEDS,
  HOME_OBJECT_SEEDS,
  HOSPITALITY_OBJECT_SEEDS,
  KINSEY_OBJECT_SEEDS,
  NATURE_OBJECT_SEEDS,
  READING_OBJECT_SEEDS,
  SEASONAL_OBJECT_SEEDS,
  WRITING_OBJECT_SEEDS,
} from "./catalog";

import type { CompanionObjectCatalogEntry, CompanionObjectCollection } from "./types";
import type { CompanionPlaceId } from "@/lib/companionUniverse/types";
import { COMPANION_OBJECTS_MASTER_CATALOG } from "./catalog";

export const COMPANION_OBJECTS_CATALOG_TARGET_MIN = 200;
export const COMPANION_OBJECTS_CATALOG_TARGET_MAX = 300;

export function companionObjectCatalogById(
  id: string,
): CompanionObjectCatalogEntry | undefined {
  return COMPANION_OBJECTS_MASTER_CATALOG.find((o) => o.id === id);
}

export function companionObjectsByCollection(
  collection: CompanionObjectCollection,
): CompanionObjectCatalogEntry[] {
  return COMPANION_OBJECTS_MASTER_CATALOG.filter((o) => o.collection === collection);
}

export function companionObjectsForRoom(
  room: CompanionPlaceId,
): CompanionObjectCatalogEntry[] {
  return COMPANION_OBJECTS_MASTER_CATALOG.filter((o) => o.primaryRoom === room);
}

export function companionObjectsWithAnimation(): CompanionObjectCatalogEntry[] {
  return COMPANION_OBJECTS_MASTER_CATALOG.filter((o) => o.animationCapability);
}

export function companionObjectCatalogSummary() {
  const byCollection = Object.fromEntries(
    (["writing", "coffee-comfort", "nature", "creative", "business", "reading", "home", "kinsey", "hospitality", "seasonal"] as const).map(
      (c) => [c, companionObjectsByCollection(c).length],
    ),
  ) as Record<CompanionObjectCollection, number>;

  return {
    total: COMPANION_OBJECTS_MASTER_CATALOG.length,
    byCollection,
    withAnimation: companionObjectsWithAnimation().length,
    withFeatureLink: COMPANION_OBJECTS_MASTER_CATALOG.filter((o) => o.featureObjectId).length,
  };
}

export function findCompanionObjectByName(
  name: string,
): CompanionObjectCatalogEntry | undefined {
  const lower = name.toLowerCase();
  return COMPANION_OBJECTS_MASTER_CATALOG.find((o) => o.name.toLowerCase() === lower);
}

export {
  DESIGNER_STORIES,
  designerStoryForObjectId,
  resolveDesignerStory,
} from "./catalog/designerStories";
