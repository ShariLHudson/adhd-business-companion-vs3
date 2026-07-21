import { BLUEPRINT_OUTPUT_TYPES, type BlueprintCreateabilityManifest } from "./types";

export type ManifestValidationIssue = {
  outputId?: string;
  message: string;
};

const CREATION_STATES = new Set([
  "direct",
  "structured",
  "composed",
  "connected",
  "draft_only",
  "future",
]);

const STATUSES = new Set([
  "available",
  "available_with_limits",
  "connected",
  "draft_only",
  "blocked",
  "future",
]);

/** Structural validation for 234 — does not prove runtime capability. */
export function validateCreateabilityManifest(
  manifest: BlueprintCreateabilityManifest,
): ManifestValidationIssue[] {
  const issues: ManifestValidationIssue[] = [];
  if (!manifest.blueprintId?.trim()) {
    issues.push({ message: "Manifest missing blueprintId" });
  }
  if (!manifest.outputs?.length) {
    issues.push({ message: "Manifest has no outputs" });
  }

  const seen = new Set<string>();
  for (const o of manifest.outputs ?? []) {
    if (!o.outputId?.trim()) {
      issues.push({ message: "Output has no ID" });
    } else if (seen.has(o.outputId)) {
      issues.push({
        outputId: o.outputId,
        message: "Duplicate output ID",
      });
    } else {
      seen.add(o.outputId);
    }

    if (!o.outputName?.trim()) {
      issues.push({
        outputId: o.outputId,
        message: "Output name missing",
      });
    }
    if (!CREATION_STATES.has(o.creationState)) {
      issues.push({
        outputId: o.outputId,
        message: "Creation state undefined or invalid",
      });
    }
    if (!STATUSES.has(o.status)) {
      issues.push({
        outputId: o.outputId,
        message: "Status undefined or invalid",
      });
    }
    if (!BLUEPRINT_OUTPUT_TYPES.includes(o.outputType)) {
      issues.push({
        outputId: o.outputId,
        message: `Unknown output type: ${o.outputType}`,
      });
    }
    if (!o.destination?.trim()) {
      issues.push({
        outputId: o.outputId,
        message: "Destination missing",
      });
    }
    if (!o.sourceOfTruth?.trim()) {
      issues.push({
        outputId: o.outputId,
        message: "Source of truth missing",
      });
    }
    if (!o.creationFlow?.length) {
      issues.push({
        outputId: o.outputId,
        message: "Creation flow missing",
      });
    }
    if (
      (o.status === "available" || o.status === "available_with_limits") &&
      (o.creationState === "future" || o.creationState === "draft_only")
    ) {
      issues.push({
        outputId: o.outputId,
        message:
          "Status honesty: available status cannot pair with future/draft_only creation state without declared limits path",
      });
    }
    if (
      (o.status === "available" || o.status === "available_with_limits") &&
      o.provisional
    ) {
      issues.push({
        outputId: o.outputId,
        message: "Provisional seed cannot be marked available",
      });
    }
  }
  return issues;
}
