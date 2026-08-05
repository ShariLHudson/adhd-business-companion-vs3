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

/**
 * Version 1 priority builds (SOP, Checklist, Email, Proposal, Offer, Client
 * Onboarding, Workshop) — kept in a separate file/array from items.seed.ts
 * deliberately; see items.v1Priority.seed.ts's header for why. Marketing
 * Plan, the 8th V1 priority build, is already in items.seed.ts.
 */
export {
  V1_PRIORITY_REGISTRY_IDS,
  V1_PRIORITY_REGISTRY_ITEMS,
  getV1PriorityRegistryItem,
  listV1PriorityRegistryItems,
  type V1PriorityRegistryId,
} from "./items.v1Priority.seed";

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

/** Category → Subcategory → Build lookup helpers (Phase 1 prep, unwired to UI). */
export {
  buildTreeForCategory,
  itemsForCategory,
  itemsForSubcategory,
  type CategoryBuildTree,
} from "./lookup";

/** Registry item → existing Create confirm shape (Phase 1 prep, unwired to UI). */
export { registryItemToConfirmShape } from "./confirmAdapter";

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
import { V1_PRIORITY_REGISTRY_ITEMS } from "./items.v1Priority.seed";
import type { CreationRegistryItem } from "./types";
import { computeIsUserVisible } from "./visibility";

/**
 * Current dual-read registry surface = the 4 guided UWE seeds + the 7 V1
 * priority builds (2026-08-05 Phase 1). Still additive only — nothing
 * outside lib/createRegistry/ reads this yet (verified: zero external
 * consumers at the time this was added).
 */
export function listCreationRegistryItems(): readonly CreationRegistryItem[] {
  return [...CREATION_REGISTRY_SEED_ITEMS, ...V1_PRIORITY_REGISTRY_ITEMS];
}

export function getCreationRegistryItem(
  id: string,
): CreationRegistryItem | undefined {
  return listCreationRegistryItems().find((item) => item.id === id);
}

export function listVisibleCreationRegistryItems(): CreationRegistryItem[] {
  return listCreationRegistryItems().filter((item) =>
    computeIsUserVisible(item),
  );
}
