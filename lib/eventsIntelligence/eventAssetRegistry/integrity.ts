import { getCreateAssetById } from "@/lib/createAssets";
import { EVENT_ASSET_DEFINITIONS } from "./definitions";
import type { EventAssetDefinition } from "./types";

const CREATION_MODES = new Set([
  "native_structured_editor",
  "native_rich_text_editor",
  "native_table_editor",
  "native_form_builder",
  "native_checklist_builder",
  "native_timeline_builder",
  "native_presentation_builder",
  "generated_file_with_native_source",
  "external_integration_required",
  "reference_only",
]);

/**
 * Validate registry integrity. Empty array = healthy.
 */
export function assertEventAssetRegistryIntegrity(): string[] {
  const errors: string[] = [];
  const ids = new Set<string>();

  for (const d of EVENT_ASSET_DEFINITIONS) {
    if (ids.has(d.assetTypeId)) {
      errors.push(`Duplicate assetTypeId: ${d.assetTypeId}`);
    }
    ids.add(d.assetTypeId);

    if (!/^[a-z][a-z0-9_]*$/.test(d.assetTypeId)) {
      errors.push(`Invalid assetTypeId format: ${d.assetTypeId}`);
    }

    if (!CREATION_MODES.has(d.creationMode)) {
      errors.push(`${d.assetTypeId}: unknown creationMode ${d.creationMode}`);
    }

    if (d.editableInPlatform && d.creationMode === "reference_only") {
      errors.push(
        `${d.assetTypeId}: reference_only cannot be editableInPlatform`,
      );
    }

    if (
      !d.editableInPlatform &&
      d.creationMode.startsWith("native_") &&
      d.creationMode !== "reference_only"
    ) {
      // native_* should usually be editable — warn as soft error
      errors.push(
        `${d.assetTypeId}: native creationMode should set editableInPlatform true`,
      );
    }

    for (const dep of d.dependencies) {
      if (!ids.has(dep.assetTypeId) && !EVENT_ASSET_DEFINITIONS.some((x) => x.assetTypeId === dep.assetTypeId)) {
        // dependency may appear later in list — check full registry
      }
    }

    if (d.createAssetRegistryId) {
      const bridged = getCreateAssetById(d.createAssetRegistryId);
      if (!bridged) {
        errors.push(
          `${d.assetTypeId}: createAssetRegistryId ${d.createAssetRegistryId} missing from Create Asset Registry`,
        );
      }
    }
  }

  // Second pass: dependency targets exist
  for (const d of EVENT_ASSET_DEFINITIONS) {
    for (const dep of d.dependencies) {
      if (!ids.has(dep.assetTypeId)) {
        errors.push(
          `${d.assetTypeId}: dependency ${dep.assetTypeId} not in registry`,
        );
      }
    }
    for (const related of d.relatedAssetTypeIds) {
      if (!ids.has(related)) {
        errors.push(
          `${d.assetTypeId}: relatedAssetTypeId ${related} not in registry`,
        );
      }
    }
  }

  // No subtype-duplicated confirmation emails
  const confirmationAliases = EVENT_ASSET_DEFINITIONS.filter((d) =>
    d.aliases.some((a) => /confirmation email/i.test(a)),
  );
  if (confirmationAliases.length > 1) {
    errors.push(
      "Multiple assets claim confirmation-email aliases — must be one canonical definition",
    );
  }

  return errors;
}

/** Map Event Asset → Create Asset Registry id when bridged. */
export function createAssetIdForEventAsset(
  assetTypeId: string,
): string | null {
  const d = EVENT_ASSET_DEFINITIONS.find((x) => x.assetTypeId === assetTypeId);
  return d?.createAssetRegistryId ?? null;
}

export function presentationLabelForEvent(
  def: EventAssetDefinition,
  eventTypeLabel: string,
): string {
  // Adapt presentation — never invent a new asset type id
  if (def.assetTypeId === "registration_confirmation_email") {
    return `${eventTypeLabel} Confirmation Email`.replace(/\s+/g, " ").trim();
  }
  return def.userFacingName;
}
