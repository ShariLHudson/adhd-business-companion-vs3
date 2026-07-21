import { getCanonicalField } from "./canonicalFields";
import type { BlueprintProfileContextManifest } from "./types";

export type ProfileContextManifestValidationIssue = {
  dependencyId?: string;
  message: string;
};

const STATUSES = new Set([
  "connected",
  "connected_with_limits",
  "missing",
  "stale",
  "conflict",
  "blocked",
  "future",
]);

/** Structural validation for 273/274 — does not prove runtime load. */
export function validateProfileContextManifest(
  manifest: BlueprintProfileContextManifest,
): ProfileContextManifestValidationIssue[] {
  const issues: ProfileContextManifestValidationIssue[] = [];
  if (!manifest.blueprintId?.trim()) {
    issues.push({ message: "Manifest missing blueprintId" });
  }
  if (!manifest.dependencies?.length) {
    issues.push({ message: "Manifest has no context dependencies" });
  }

  const seen = new Set<string>();
  for (const d of manifest.dependencies ?? []) {
    if (!d.dependencyId?.trim()) {
      issues.push({ message: "Dependency has no ID" });
    } else if (seen.has(d.dependencyId)) {
      issues.push({
        dependencyId: d.dependencyId,
        message: "Duplicate dependency ID",
      });
    } else {
      seen.add(d.dependencyId);
    }

    if (!d.knownContextKey?.trim()) {
      issues.push({
        dependencyId: d.dependencyId,
        message: "knownContextKey missing",
      });
    }
    if (!d.canonicalFieldId?.trim()) {
      issues.push({
        dependencyId: d.dependencyId,
        message: "canonicalFieldId missing",
      });
    } else if (!getCanonicalField(d.canonicalFieldId)) {
      issues.push({
        dependencyId: d.dependencyId,
        message: `Unknown canonical field “${d.canonicalFieldId}”`,
      });
    }
    if (!STATUSES.has(d.status)) {
      issues.push({
        dependencyId: d.dependencyId,
        message: "Connection status undefined or invalid",
      });
    }
  }

  return issues;
}
