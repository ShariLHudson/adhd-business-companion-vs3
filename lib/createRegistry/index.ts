/**
 * Canonical Create Registry foundation.
 *
 * @see ./README.md
 * @see docs/create-experience/CREATE_MASTER_INVENTORY_AND_REGISTRY.md
 */

export type {
  CreationAudienceSensitivity,
  CreationBuilderType,
  CreationLifecycleStatus,
  CreationMultiAvatarMode,
  CreationPriority,
  CreationRegistryCategory,
  CreationRegistryItem,
  CreationRegistrySubcategory,
  CreationRegistryValidationIssue,
  CreationRegistryValidationIssueCode,
  CreationRegistryValidationResult,
} from "./types";

export {
  CREATE_REGISTRY_CATEGORIES,
  CREATE_REGISTRY_CATEGORY_IDS,
  getCreateRegistryCategory,
  isCreateRegistryCategoryId,
  type CreateRegistryCategoryId,
} from "./categories";

export {
  CREATE_REGISTRY_SUBCATEGORIES,
  getCreateRegistrySubcategory,
  isCreateRegistrySubcategoryId,
  subcategoriesForCategory,
} from "./subcategories";

export {
  CREATION_REGISTRY_SEED_ITEMS,
  GUIDED_CREATION_REGISTRY_IDS,
  getCreationRegistrySeedItem,
  listCreationRegistrySeedItems,
  type GuidedCreationRegistryId,
} from "./items.seed";

export {
  computeIsUserVisible,
  hasRequiredVerificationFlags,
} from "./visibility";

export {
  KNOWN_PROJECT_TEMPLATE_IDS,
  listUserVisibleCreationItems,
  validateClaimedUserVisible,
  validateCreationRegistry,
} from "./validation";

export {
  findRegistryItemByLegacyLabel,
  registryItemFromCatalogItem,
  registryItemFromParentType,
} from "./adapters";

export {
  GUIDED_CREATE_CERTIFICATION_SNAPSHOTS,
  getGuidedCertificationSnapshot,
  type GuidedCertCheckStatus,
  type GuidedCertDimension,
  type GuidedCertDimensionResult,
  type GuidedCertEvidenceLevel,
  type GuidedTypeCertificationSnapshot,
} from "./certification/guidedCreateCertification";

import { CREATION_REGISTRY_SEED_ITEMS } from "./items.seed";
import type { CreationRegistryItem } from "./types";
import { computeIsUserVisible } from "./visibility";

/** Current dual-read registry surface = foundation seeds only. */
export function listCreationRegistryItems(): readonly CreationRegistryItem[] {
  return CREATION_REGISTRY_SEED_ITEMS;
}

export function getCreationRegistryItem(
  id: string,
): CreationRegistryItem | undefined {
  return CREATION_REGISTRY_SEED_ITEMS.find((item) => item.id === id);
}

export function listVisibleCreationRegistryItems(): CreationRegistryItem[] {
  return CREATION_REGISTRY_SEED_ITEMS.filter((item) =>
    computeIsUserVisible(item),
  );
}
