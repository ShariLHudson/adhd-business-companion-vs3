import { getObjectType } from "./objectTypes";
import type { BlueprintSharedObjectManifest } from "./types";

export type SharedObjectManifestValidationIssue = {
  dependencyId?: string;
  message: string;
};

const AUTHORITIES = new Set([
  "fully_create",
  "prepare",
  "user_provided",
  "completed_elsewhere",
]);

const STATUSES = new Set([
  "connected",
  "connected_with_limits",
  "missing",
  "duplicate_risk",
  "blocked",
  "future",
]);

export function validateSharedObjectManifest(
  manifest: BlueprintSharedObjectManifest,
): SharedObjectManifestValidationIssue[] {
  const issues: SharedObjectManifestValidationIssue[] = [];
  if (!manifest.blueprintId?.trim()) {
    issues.push({ message: "Manifest missing blueprintId" });
  }
  if (!manifest.dependencies?.length) {
    issues.push({ message: "Manifest has no shared-object dependencies" });
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

    if (!getObjectType(d.objectTypeId)) {
      issues.push({
        dependencyId: d.dependencyId,
        message: `Unknown object type “${d.objectTypeId}”`,
      });
    }
    if (!AUTHORITIES.has(d.creationAuthority)) {
      issues.push({
        dependencyId: d.dependencyId,
        message: "creationAuthority missing or invalid",
      });
    }
    if (!STATUSES.has(d.status)) {
      issues.push({
        dependencyId: d.dependencyId,
        message: "Connection status missing or invalid",
      });
    }
  }

  const types = new Set((manifest.dependencies ?? []).map((d) => d.objectTypeId));
  for (const required of ["business", "universal_work", "create_artifact"] as const) {
    if (!types.has(required)) {
      issues.push({
        message: `Missing required shared object dependency: ${required}`,
      });
    }
  }

  return issues;
}
