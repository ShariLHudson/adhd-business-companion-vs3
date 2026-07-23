/**
 * Structural + readiness validation for CreationRegistryItem collections.
 * Prefer explicit invocation (tests / CI) — does not throw on import.
 */

import { isCreateRegistryCategoryId } from "./categories";
import { getCreateRegistrySubcategory } from "./subcategories";
import { computeIsUserVisible, hasRequiredVerificationFlags } from "./visibility";
import type {
  CreationRegistryItem,
  CreationRegistryValidationIssue,
  CreationRegistryValidationResult,
} from "./types";

/**
 * Known project template ids the registry may reference.
 * Empty in foundation PR — any set defaultProjectTemplateId is currently invalid.
 */
export const KNOWN_PROJECT_TEMPLATE_IDS = new Set<string>([]);

function issue(
  code: CreationRegistryValidationIssue["code"],
  message: string,
  itemId?: string,
  path?: string,
): CreationRegistryValidationIssue {
  return { code, message, itemId, path };
}

function validateAudienceRules(
  item: CreationRegistryItem,
): CreationRegistryValidationIssue[] {
  if (item.audienceSensitivity === "none") return [];

  const issues: CreationRegistryValidationIssue[] = [];
  const hasProfileFields = item.helpfulBusinessProfileFields.length > 0;
  const hasContextQuestions = item.minimumContextQuestions.length > 0;

  if (!hasProfileFields && !hasContextQuestions) {
    issues.push(
      issue(
        "audience_rules_missing",
        `Audience-sensitive item "${item.id}" needs helpfulBusinessProfileFields or minimumContextQuestions.`,
        item.id,
        "audienceSensitivity",
      ),
    );
  }

  if (
    item.supportsMultipleAvatars &&
    (!item.multiAvatarModes || item.multiAvatarModes.length === 0)
  ) {
    issues.push(
      issue(
        "audience_rules_missing",
        `Item "${item.id}" supports multiple avatars but multiAvatarModes is empty.`,
        item.id,
        "multiAvatarModes",
      ),
    );
  }

  return issues;
}

function validateItemStructure(
  item: CreationRegistryItem,
  byId: Map<string, CreationRegistryItem>,
): CreationRegistryValidationIssue[] {
  const issues: CreationRegistryValidationIssue[] = [];

  if (!item.id?.trim()) {
    issues.push(issue("structural", "Item is missing id.", item.id, "id"));
  }
  if (!item.name?.trim()) {
    issues.push(
      issue("structural", `Item "${item.id}" is missing name.`, item.id, "name"),
    );
  }
  if (!item.singularLabel?.trim()) {
    issues.push(
      issue(
        "structural",
        `Item "${item.id}" is missing singularLabel.`,
        item.id,
        "singularLabel",
      ),
    );
  }
  if (!item.route?.trim()) {
    issues.push(
      issue("structural", `Item "${item.id}" is missing route.`, item.id, "route"),
    );
  }
  if (!item.shortDescription?.trim() || !item.userOutcome?.trim()) {
    issues.push(
      issue(
        "structural",
        `Item "${item.id}" needs shortDescription and userOutcome.`,
        item.id,
      ),
    );
  }

  if (!isCreateRegistryCategoryId(item.categoryId)) {
    issues.push(
      issue(
        "invalid_category",
        `Item "${item.id}" has unknown categoryId "${item.categoryId}".`,
        item.id,
        "categoryId",
      ),
    );
  }

  const sub = getCreateRegistrySubcategory(item.subcategoryId);
  if (!sub) {
    issues.push(
      issue(
        "invalid_subcategory",
        `Item "${item.id}" has unknown subcategoryId "${item.subcategoryId}".`,
        item.id,
        "subcategoryId",
      ),
    );
  } else if (sub.categoryId !== item.categoryId) {
    issues.push(
      issue(
        "invalid_subcategory",
        `Item "${item.id}" subcategory "${item.subcategoryId}" belongs to "${sub.categoryId}", not "${item.categoryId}".`,
        item.id,
        "subcategoryId",
      ),
    );
  }

  if (item.parentCreationId && !byId.has(item.parentCreationId)) {
    issues.push(
      issue(
        "missing_parent",
        `Item "${item.id}" parentCreationId "${item.parentCreationId}" is not in the registry.`,
        item.id,
        "parentCreationId",
      ),
    );
  }

  for (const subtypeId of item.subtypeIds ?? []) {
    if (!byId.has(subtypeId)) {
      issues.push(
        issue(
          "missing_subtype",
          `Item "${item.id}" subtypeIds references missing "${subtypeId}".`,
          item.id,
          "subtypeIds",
        ),
      );
    }
  }

  for (const relatedId of item.relatedCreationIds) {
    if (!byId.has(relatedId)) {
      issues.push(
        issue(
          "missing_related",
          `Item "${item.id}" relatedCreationIds references missing "${relatedId}".`,
          item.id,
          "relatedCreationIds",
        ),
      );
    }
  }

  for (const togetherId of item.usuallyCreatedTogetherIds) {
    if (!byId.has(togetherId)) {
      issues.push(
        issue(
          "missing_usually_together",
          `Item "${item.id}" usuallyCreatedTogetherIds references missing "${togetherId}".`,
          item.id,
          "usuallyCreatedTogetherIds",
        ),
      );
    }
  }

  if (
    item.defaultProjectTemplateId &&
    !KNOWN_PROJECT_TEMPLATE_IDS.has(item.defaultProjectTemplateId)
  ) {
    issues.push(
      issue(
        "unknown_project_template",
        `Item "${item.id}" defaultProjectTemplateId "${item.defaultProjectTemplateId}" is not a known template.`,
        item.id,
        "defaultProjectTemplateId",
      ),
    );
  }

  issues.push(...validateAudienceRules(item));

  if (item.lifecycleStatus === "ready" && !hasRequiredVerificationFlags(item)) {
    issues.push(
      issue(
        "ready_missing_verification",
        `Item "${item.id}" is ready but missing required verification flags.`,
        item.id,
        "lifecycleStatus",
      ),
    );
  }

  return issues;
}

/**
 * When a caller claims certain ids are user-visible, ensure each passes the
 * master readiness gate (catches drifted menus / dual-write mistakes).
 */
export function validateClaimedUserVisible(
  items: readonly CreationRegistryItem[],
  claimedVisibleIds: readonly string[],
): CreationRegistryValidationResult {
  const byId = new Map(items.map((item) => [item.id, item] as const));
  const issues: CreationRegistryValidationIssue[] = [];

  for (const id of claimedVisibleIds) {
    const item = byId.get(id);
    if (!item) {
      issues.push(
        issue(
          "visible_fails_readiness",
          `Claimed-visible id "${id}" is not in the registry.`,
          id,
        ),
      );
      continue;
    }
    if (!computeIsUserVisible(item)) {
      issues.push(
        issue(
          "visible_fails_readiness",
          `Item "${id}" is claimed user-visible but fails the readiness gate.`,
          id,
        ),
      );
    }
  }

  return { ok: issues.length === 0, issues };
}

/**
 * Validate a registry collection. Does not throw.
 */
export function validateCreationRegistry(
  items: readonly CreationRegistryItem[],
): CreationRegistryValidationResult {
  const issues: CreationRegistryValidationIssue[] = [];
  const seen = new Set<string>();
  const byId = new Map<string, CreationRegistryItem>();

  for (const item of items) {
    if (seen.has(item.id)) {
      issues.push(
        issue(
          "duplicate_id",
          `Duplicate registry id "${item.id}".`,
          item.id,
          "id",
        ),
      );
    }
    seen.add(item.id);
    byId.set(item.id, item);
  }

  for (const item of items) {
    issues.push(...validateItemStructure(item, byId));
  }

  return { ok: issues.length === 0, issues };
}

/** Convenience: items that currently pass the master visibility gate. */
export function listUserVisibleCreationItems(
  items: readonly CreationRegistryItem[],
): CreationRegistryItem[] {
  return items.filter((item) => computeIsUserVisible(item));
}
