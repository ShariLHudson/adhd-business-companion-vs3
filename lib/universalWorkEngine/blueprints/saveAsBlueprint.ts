/**
 * Save approved Work as Personal or Company Blueprint.
 * Never converts the original Work item into the Blueprint itself.
 */

import type { CanonicalWorkId } from "../types";
import { recordBlueprintAudit } from "./auditHistory";
import { registerBlueprint, resolveBlueprintVersion, getBlueprint } from "./registry";
import { sanitizeInstanceSpecificContent } from "./sanitizeInstanceSpecific";
import { requireWorkBlueprintState } from "./workBlueprintStateStore";
import { requireBlueprint } from "./registry";
import type {
  BlueprintDefinition,
  SaveAsBlueprintReview,
} from "./types";
import { ALL_BLUEPRINT_DEPTH_MODES } from "./types";

function bumpPatchVersion(version: string): string {
  const parts = version.split(".").map((n) => Number.parseInt(n, 10) || 0);
  while (parts.length < 3) parts.push(0);
  parts[2] = (parts[2] ?? 0) + 1;
  return parts.join(".");
}

function newSavedBlueprintId(
  category: "personal" | "company",
  sourceBlueprintId: string,
): string {
  const suffix =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID().slice(0, 8)
      : Date.now().toString(36);
  const prefix = category === "personal" ? "bp-personal" : "bp-company";
  return `${prefix}-${sourceBlueprintId.replace(/^bp-/, "")}-${suffix}`;
}

export type PrepareSaveAsBlueprintInput = {
  workId: CanonicalWorkId | string;
  category: "personal" | "company";
  title?: string;
  description?: string;
  retainKeys?: readonly string[];
  confidentialTokens?: readonly string[];
  /** Update an existing personal/company Blueprint (new version). */
  existingBlueprintId?: string;
};

/** Review screen payload — must be confirmed before commit. */
export function prepareSaveAsBlueprint(
  input: PrepareSaveAsBlueprintInput,
): SaveAsBlueprintReview {
  const state = requireWorkBlueprintState(input.workId);
  const source = requireBlueprint(state.blueprintId, state.blueprintVersion);
  const { sanitized, removedFields, requiresExplicitRetain } =
    sanitizeInstanceSpecificContent(state.sectionContent, {
      retainKeys: input.retainKeys,
      confidentialTokens: input.confidentialTokens,
    });

  let proposedBlueprintId: string;
  let proposedVersion: string;

  if (input.existingBlueprintId?.trim()) {
    proposedBlueprintId = input.existingBlueprintId.trim();
    const current = getBlueprint(proposedBlueprintId);
    proposedVersion = current
      ? bumpPatchVersion(resolveBlueprintVersion(proposedBlueprintId))
      : "1.0.0";
  } else {
    proposedBlueprintId = newSavedBlueprintId(input.category, source.blueprintId);
    proposedVersion = "1.0.0";
  }

  return {
    proposedBlueprintId,
    proposedVersion,
    category: input.category,
    title: input.title?.trim() || `${source.title} (saved)`,
    description:
      input.description?.trim() ||
      `Saved from Work ${state.workId} — instance details removed.`,
    sourceWorkId: state.workId,
    sanitizedSectionDefaults: sanitized,
    removedFields,
    requiresExplicitRetain,
  };
}

export type ConfirmSaveAsBlueprintInput = {
  workId: CanonicalWorkId | string;
  review: SaveAsBlueprintReview;
  /** Member must pass the review object from prepareSaveAsBlueprint. */
  confirm: true;
};

/**
 * Commit save-as after review. Creates a new Blueprint definition.
 * Original Work remains unchanged and is never converted into the Blueprint.
 */
export function confirmSaveAsBlueprint(
  input: ConfirmSaveAsBlueprintInput,
): BlueprintDefinition {
  if (input.confirm !== true) {
    throw new Error("save-as-Blueprint requires explicit confirmation");
  }
  const state = requireWorkBlueprintState(input.workId);
  if (state.workId !== input.review.sourceWorkId) {
    throw new Error("save-as-Blueprint review does not match Work item");
  }
  if (input.review.proposedBlueprintId === state.workId) {
    throw new Error(
      "Refusing to use Work ID as Blueprint ID — accidental duplication guard",
    );
  }

  const source = requireBlueprint(state.blueprintId, state.blueprintVersion);
  const definition: BlueprintDefinition = {
    ...source,
    blueprintId: input.review.proposedBlueprintId,
    version: input.review.proposedVersion,
    category: input.review.category,
    title: input.review.title,
    description: input.review.description,
    supportedDepthModes: ALL_BLUEPRINT_DEPTH_MODES,
    defaultValues: input.review.sanitizedSectionDefaults,
    // Clear instance-tied suggestions that were completed-state oriented.
    suggestedTasks: source.suggestedTasks.map((t) => ({
      ...t,
      title: t.title.replace(/\b(?:completed|done)\b/gi, "").trim() || t.title,
    })),
  };

  registerBlueprint(definition);

  recordBlueprintAudit({
    blueprintId: definition.blueprintId,
    blueprintVersion: definition.version,
    workId: state.workId,
    action:
      input.review.category === "personal"
        ? "save_as_personal"
        : "save_as_company",
    detail: `sourceWork=${state.workId};sourceBlueprint=${source.blueprintId}`,
  });

  // Prove original Work is untouched.
  const after = requireWorkBlueprintState(input.workId);
  if (after.blueprintId !== state.blueprintId) {
    throw new Error("save-as-Blueprint must not convert the original Work");
  }

  return definition;
}
