/**
 * Canonical Create Registry — types (Phase 2 foundation).
 *
 * Product SoT: docs/create-experience/CREATE_MASTER_INVENTORY_AND_REGISTRY.md
 * Visibility is computed — do not treat a stored isUserVisible flag as authority.
 */

export type CreationLifecycleStatus =
  | "inventory-only"
  | "defined"
  | "builder-needed"
  | "in-development"
  | "needs-audit"
  | "testing"
  | "ready"
  | "paused"
  | "retired";

export type CreationAudienceSensitivity =
  | "none"
  | "helpful"
  | "recommended"
  | "required";

export type CreationMultiAvatarMode =
  | "shared-version"
  | "primary-plus-secondary"
  | "adapted-versions"
  | "separate-versions";

export type CreationBuilderType =
  | "guided-conversation"
  | "structured-form"
  | "hybrid"
  | "research-assisted"
  | "multi-asset-workspace";

export type CreationPriority =
  | "release-essential"
  | "next"
  | "later"
  | "future";

export type CreationRegistryCategory = {
  id: string;
  label: string;
  /** Short calm cue — domain purpose only (not Browse UI). */
  hint: string;
  sortOrder: number;
};

export type CreationRegistrySubcategory = {
  id: string;
  categoryId: string;
  label: string;
  sortOrder: number;
};

/**
 * One canonical creation type. Registry is the future SoT; legacy catalog /
 * parent types remain during dual-read migration.
 */
export type CreationRegistryItem = {
  id: string;
  name: string;
  singularLabel: string;
  pluralLabel?: string;

  categoryId: string;
  subcategoryId: string;
  parentCreationId?: string;
  subtypeIds?: string[];

  shortDescription: string;
  userOutcome: string;
  searchTerms: string[];

  relevantBusinessTypes: string[];
  relevantBusinessStages?: string[];
  relevantGoals?: string[];

  audienceSensitivity: CreationAudienceSensitivity;
  supportsMultipleAvatars: boolean;
  multiAvatarModes?: CreationMultiAvatarMode[];

  helpfulBusinessProfileFields: string[];
  minimumContextQuestions: string[];

  relatedCreationIds: string[];
  usuallyCreatedTogetherIds: string[];

  canBecomeProject: boolean;
  defaultProjectTemplateId?: string;
  createToProjectBehavior?: string;

  recommendedChamberMemberIds: string[];
  recommendedMapTypes: string[];
  recommendedBoardRoles: string[];

  builderType: CreationBuilderType;
  /** Stable route key — not necessarily a Next.js path yet. */
  route: string;
  lifecycleStatus: CreationLifecycleStatus;
  priority: CreationPriority;

  routeVerified: boolean;
  saveVerified: boolean;
  reopenVerified: boolean;
  printVerified: boolean;
  exportVerified: boolean;
  projectHandoffVerified: boolean;
  requiredActionsVerified: boolean;

  owner?: string;
  dependencies?: string[];
  implementationNotes?: string[];
  auditNotes?: string[];

  /**
   * Dual-read seam only — Browse parent id from createParentTypes when known.
   * Not a product-facing field.
   */
  legacyParentTypeId?: string;
  /** Dual-read seam — catalog labels this registry id represents. */
  legacyCatalogLabels?: string[];
};

export type CreationRegistryValidationIssueCode =
  | "duplicate_id"
  | "invalid_category"
  | "invalid_subcategory"
  | "missing_parent"
  | "missing_subtype"
  | "missing_related"
  | "missing_usually_together"
  | "visible_fails_readiness"
  | "ready_missing_verification"
  | "audience_rules_missing"
  | "unknown_project_template"
  | "structural";

export type CreationRegistryValidationIssue = {
  code: CreationRegistryValidationIssueCode;
  message: string;
  itemId?: string;
  path?: string;
};

export type CreationRegistryValidationResult = {
  ok: boolean;
  issues: CreationRegistryValidationIssue[];
};
