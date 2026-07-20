/**
 * 062 companion artifact templates (064 / 065).
 * Copy these when implementing a capability — do not invent ad-hoc formats.
 */

export const IMPLEMENTATION_SPEC_TEMPLATE_PATH =
  "docs/create-experience/standards/064_IMPLEMENTATION_SPECIFICATION_TEMPLATE.md" as const;

export const CERTIFICATION_SPEC_TEMPLATE_PATH =
  "docs/create-experience/standards/065_CERTIFICATION_TEST_SPECIFICATION_TEMPLATE.md" as const;

export const TRACEABILITY_MATRIX_DOC_PATH =
  "docs/create-experience/standards/063_STANDARD_IMPLEMENTATION_TRACEABILITY_MATRIX.md" as const;

export const CERTIFICATION_STANDARD_DOC_PATH =
  "docs/create-experience/standards/062_IMPLEMENTATION_AND_CERTIFICATION_STANDARD.md" as const;

/** Recommended filled-spec naming pattern. */
export function implementationSpecFilename(
  standardId: string,
  capabilitySlug: string,
): string {
  return `docs/create-experience/specs/${standardId}_${capabilitySlug}_IMPLEMENTATION_SPECIFICATION.md`;
}

export function certificationSpecFilename(
  standardId: string,
  capabilitySlug: string,
): string {
  return `docs/create-experience/specs/${standardId}_${capabilitySlug}_CERTIFICATION_SPECIFICATION.md`;
}

export type CompanionArtifactSet = {
  governingStandard: string;
  implementationSpec: string | null;
  certificationSpec: string | null;
  traceabilityUpdated: boolean;
};

/**
 * 062 — A capability is not artifact-complete without all four companions.
 */
export function assessCompanionArtifacts(
  set: CompanionArtifactSet,
): { complete: boolean; missing: string[] } {
  const missing: string[] = [];
  if (!set.governingStandard.trim()) missing.push("governing standard");
  if (!set.implementationSpec?.trim()) missing.push("implementation specification");
  if (!set.certificationSpec?.trim()) missing.push("certification specification");
  if (!set.traceabilityUpdated) missing.push("traceability matrix update");
  return { complete: missing.length === 0, missing };
}
