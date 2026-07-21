/**
 * Blueprint inheritance and duplication — universal ownership.
 */

import { recordBlueprintAudit } from "./auditHistory";
import { getBlueprint, registerBlueprint, requireBlueprint } from "./registry";
import type { BlueprintDefinition } from "./types";
import { ALL_BLUEPRINT_DEPTH_MODES } from "./types";

function bumpMinorVersion(version: string): string {
  const parts = version.split(".").map((n) => Number.parseInt(n, 10) || 0);
  while (parts.length < 3) parts.push(0);
  parts[1] = (parts[1] ?? 0) + 1;
  parts[2] = 0;
  return parts.join(".");
}

/** Duplicate a Blueprint as a new id (or new version if same id requested carefully). */
export function duplicateBlueprint(
  sourceBlueprintId: string,
  options: {
    newBlueprintId: string;
    title?: string;
    category?: BlueprintDefinition["category"];
    version?: string;
  },
): BlueprintDefinition {
  const source = requireBlueprint(sourceBlueprintId);
  if (options.newBlueprintId.trim() === source.blueprintId) {
    throw new Error(
      "duplicateBlueprint requires a new blueprintId to prevent accidental overwrite",
    );
  }
  if (getBlueprint(options.newBlueprintId)) {
    throw new Error(
      `Blueprint "${options.newBlueprintId}" already exists — choose a new id or use version upgrade`,
    );
  }

  const dup: BlueprintDefinition = {
    ...source,
    blueprintId: options.newBlueprintId.trim(),
    version: options.version ?? "1.0.0",
    title: options.title?.trim() || `${source.title} (copy)`,
    category: options.category ?? source.category,
    supportedDepthModes: ALL_BLUEPRINT_DEPTH_MODES,
    inheritsFromBlueprintId: source.blueprintId,
  };
  registerBlueprint(dup);
  recordBlueprintAudit({
    blueprintId: dup.blueprintId,
    blueprintVersion: dup.version,
    action: "duplicate",
    detail: `from=${source.blueprintId}@${source.version}`,
  });
  return dup;
}

/**
 * Inherit from a parent Blueprint — child overrides selected fields.
 * Registers a new versioned child definition.
 */
export function inheritBlueprint(
  parentBlueprintId: string,
  child: Partial<BlueprintDefinition> & {
    blueprintId: string;
    title: string;
  },
): BlueprintDefinition {
  const parent = requireBlueprint(parentBlueprintId);
  if (child.blueprintId.trim() === parent.blueprintId) {
    // Same id = new version via inheritance overrides
    const nextVersion = child.version ?? bumpMinorVersion(parent.version);
    const merged: BlueprintDefinition = {
      ...parent,
      ...child,
      blueprintId: parent.blueprintId,
      version: nextVersion,
      inheritsFromBlueprintId: parent.blueprintId,
      supportedDepthModes: child.supportedDepthModes ?? ALL_BLUEPRINT_DEPTH_MODES,
      compatibleWorkTypeIds:
        child.compatibleWorkTypeIds ?? parent.compatibleWorkTypeIds,
      sections: child.sections ?? parent.sections,
      adaptiveQuestions: child.adaptiveQuestions ?? parent.adaptiveQuestions,
    };
    registerBlueprint(merged);
    recordBlueprintAudit({
      blueprintId: merged.blueprintId,
      blueprintVersion: merged.version,
      action: "inherit",
      detail: `version_from=${parent.version}`,
    });
    return merged;
  }

  const merged: BlueprintDefinition = {
    ...parent,
    ...child,
    blueprintId: child.blueprintId.trim(),
    version: child.version ?? "1.0.0",
    title: child.title,
    inheritsFromBlueprintId: parent.blueprintId,
    supportedDepthModes: child.supportedDepthModes ?? ALL_BLUEPRINT_DEPTH_MODES,
    compatibleWorkTypeIds:
      child.compatibleWorkTypeIds ?? parent.compatibleWorkTypeIds,
    sections: child.sections ?? parent.sections,
    adaptiveQuestions: child.adaptiveQuestions ?? parent.adaptiveQuestions,
  };
  registerBlueprint(merged);
  recordBlueprintAudit({
    blueprintId: merged.blueprintId,
    blueprintVersion: merged.version,
    action: "inherit",
    detail: `from=${parent.blueprintId}@${parent.version}`,
  });
  return merged;
}
