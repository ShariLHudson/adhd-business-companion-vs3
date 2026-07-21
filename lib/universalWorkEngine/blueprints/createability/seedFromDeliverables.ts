import type { BlueprintDefinition } from "../types";
import { inferCreationState, inferOutputType } from "./inferOutputShape";
import { makeOutputId } from "./slugOutputId";
import {
  BLUEPRINT_CREATEABILITY_STANDARD_ID,
  type BlueprintCreateabilityManifest,
  type BlueprintOutputCreateabilityEntry,
} from "./types";

/**
 * Build a provisional createability manifest from deliverables[].
 * Honest defaults: blocked until a hand-authored path is certified (233/235).
 */
export function seedCreateabilityManifestFromDeliverables(
  blueprint: BlueprintDefinition,
): BlueprintCreateabilityManifest {
  const outputs: BlueprintOutputCreateabilityEntry[] = (
    blueprint.deliverables ?? []
  ).map((name) => {
    const trimmed = name.trim() || "Untitled output";
    const outputType = inferOutputType(trimmed);
    const creationState = inferCreationState(trimmed, outputType);
    return {
      outputId: makeOutputId(blueprint.blueprintId, trimmed),
      outputName: trimmed,
      outputType,
      creationState,
      purpose: `Promised deliverable on ${blueprint.title}`,
      userInputs: [],
      questions: [],
      capabilityOwner: "unassigned",
      contributors: [],
      creationFlow: [
        "Provisional — no certified creation path under Standard 233 yet",
      ],
      destination: "Create (unspecified)",
      sourceOfTruth: "undefined",
      editable: false,
      resumable: false,
      reusable: false,
      projectHandoff: "none",
      exportFormats: [],
      validationRules: [],
      status: "blocked",
      tests: [],
      provisional: true,
      notes:
        "Seeded from deliverables[]. Remains blocked until Output Createability Manifest is completed and certified (234/236).",
    };
  });

  return {
    blueprintId: blueprint.blueprintId,
    blueprintVersion: blueprint.version,
    standardId: BLUEPRINT_CREATEABILITY_STANDARD_ID,
    outputs,
  };
}

/** Prefer hand-authored manifest; otherwise seed from deliverables. */
export function resolveCreateabilityManifest(
  blueprint: BlueprintDefinition,
): BlueprintCreateabilityManifest {
  if (blueprint.createabilityManifest?.outputs?.length) {
    return {
      ...blueprint.createabilityManifest,
      blueprintId: blueprint.blueprintId,
      blueprintVersion: blueprint.version,
      standardId: BLUEPRINT_CREATEABILITY_STANDARD_ID,
    };
  }
  return seedCreateabilityManifestFromDeliverables(blueprint);
}
