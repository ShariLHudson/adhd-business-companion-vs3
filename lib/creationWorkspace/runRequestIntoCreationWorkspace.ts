import {
  runUniversalRequestToOutcome,
  type CreationPackage,
  type DynamicCreationBlueprint,
  type ResearchCollection,
  type UniversalRequestToOutcomeResult,
  type UniversalRequestUnderstanding,
} from "@/lib/universalRequestOutcome";
import { decideCreationWorkspaceOpen } from "./openDecision";
import { reviewMissingPieces } from "./missingPieces";
import { saveCreationWorkspace } from "./persistence";
import { projectCreationPackageToWorkspace } from "./projectPackage";
import { validateCreationWorkspaceSubstance } from "./substanceValidation";
import { trackCreationWorkspaceEvent } from "./observability";
import type {
  CreationWorkspace,
  CreationWorkspaceOpenDecision,
  CreationWorkspaceSubstanceValidation,
} from "./types";

export type CreationWorkspacePipelineResult = {
  understanding: UniversalRequestUnderstanding;
  blueprint: DynamicCreationBlueprint;
  researchCollection: ResearchCollection | null;
  creationPackage: CreationPackage | null;
  universal: UniversalRequestToOutcomeResult;
  openDecision: CreationWorkspaceOpenDecision;
  substance: CreationWorkspaceSubstanceValidation | null;
  workspace: CreationWorkspace | null;
};

/**
 * End-to-end: understand → package → decide open/bypass → project → validate → persist.
 */
export function runRequestIntoCreationWorkspace(
  rawRequest: string,
  options?: {
    sourceExperience?: string | null;
    fromResearchUse?: boolean;
    userAskedToKeepWorking?: boolean;
    explicitDestination?:
      | "create"
      | "projects"
      | "visual_thinking"
      | "research"
      | null;
    persist?: boolean;
  },
): CreationWorkspacePipelineResult {
  const universal = runUniversalRequestToOutcome(rawRequest, {
    sourceExperience: options?.sourceExperience ?? "creation_workspace",
    // An explicit "Use This Research → build …" handoff is explicit creation
    // intent even without a deliverable noun; the strict classifier still owns
    // every ordinary turn (fromResearchUse is only set by that explicit action).
    explicitCreateHandoff: options?.fromResearchUse === true,
  });

  const openDecision = decideCreationWorkspaceOpen({
    understanding: universal.understanding,
    hasSubstantivePackage: Boolean(
      universal.creationPackage &&
        (universal.outcomeValidation?.passed ||
          (universal.creationPackage.sections?.length ?? 0) >= 3),
    ),
    explicitDestination: options?.explicitDestination ?? null,
    userAskedToKeepWorking: options?.userAskedToKeepWorking,
    fromResearchUse: options?.fromResearchUse,
    // ADR-013 — only Create Begin ("create") gets the narrowed boundary.
    sourceExperience: options?.sourceExperience ?? null,
  });

  trackCreationWorkspaceEvent("workspace_pipeline_ran", {
    open: openDecision.open,
    family: universal.understanding.creationFamily,
  });

  if (!openDecision.open || !universal.creationPackage) {
    return {
      understanding: universal.understanding,
      blueprint: universal.blueprint,
      researchCollection: universal.researchCollection,
      creationPackage: universal.creationPackage,
      universal,
      openDecision,
      substance: null,
      workspace: null,
    };
  }

  let workspace = projectCreationPackageToWorkspace({
    creationPackage: universal.creationPackage,
    blueprint: universal.blueprint,
    understanding: universal.understanding,
    researchCollections: universal.researchCollection
      ? [universal.researchCollection]
      : [],
    sourceExperience: options?.sourceExperience ?? "creation_workspace",
  });

  trackCreationWorkspaceEvent("creation_package_projected");

  let substance = validateCreationWorkspaceSubstance({
    workspace,
    creationPackage: universal.creationPackage,
    understanding: universal.understanding,
  });

  if (!substance.valid) {
    // Attempt a soft repair: if package has substance but projection flagged lightly, still open when package validation passed
    if (
      universal.outcomeValidation?.passed &&
      !substance.warningOnlyDetected &&
      !substance.requestEchoDetected &&
      substance.substantiveItemCount >= 2
    ) {
      substance = { ...substance, valid: true };
    } else {
      trackCreationWorkspaceEvent("substance_validation_failed", {
        failures: substance.validationFailures.length,
      });
      return {
        understanding: universal.understanding,
        blueprint: universal.blueprint,
        researchCollection: universal.researchCollection,
        creationPackage: universal.creationPackage,
        universal,
        openDecision: {
          open: false,
          reason: substance.validationFailures.join(" ") || "Substance failed.",
          bypassTo: "create",
        },
        substance,
        workspace: null,
      };
    }
  }

  workspace = reviewMissingPieces({
    workspace,
    blueprint: universal.blueprint,
  });

  trackCreationWorkspaceEvent("substance_validation_passed");
  trackCreationWorkspaceEvent("workspace_created");

  if (options?.persist !== false) {
    saveCreationWorkspace(workspace);
  }

  return {
    understanding: universal.understanding,
    blueprint: universal.blueprint,
    researchCollection: universal.researchCollection,
    creationPackage: universal.creationPackage,
    universal,
    openDecision: { open: true, reason: openDecision.reason },
    substance,
    workspace,
  };
}

/**
 * Project an existing Creation Package (e.g. from Research Use This Research).
 */
export function openWorkspaceFromCreationPackage(input: {
  creationPackage: CreationPackage;
  blueprint?: DynamicCreationBlueprint | null;
  understanding?: UniversalRequestUnderstanding | null;
  researchCollection?: ResearchCollection | null;
  sourceExperience?: string | null;
  persist?: boolean;
}): {
  workspace: CreationWorkspace | null;
  substance: CreationWorkspaceSubstanceValidation;
} {
  let workspace = projectCreationPackageToWorkspace({
    creationPackage: input.creationPackage,
    blueprint: input.blueprint,
    understanding: input.understanding,
    researchCollections: input.researchCollection
      ? [input.researchCollection]
      : [],
    sourceExperience: input.sourceExperience ?? "research_library",
  });
  const substance = validateCreationWorkspaceSubstance({
    workspace,
    creationPackage: input.creationPackage,
    understanding: input.understanding,
  });
  if (!substance.valid && substance.warningOnlyDetected) {
    return { workspace: null, substance };
  }
  workspace = reviewMissingPieces({
    workspace,
    blueprint: input.blueprint,
  });
  if (input.persist !== false) saveCreationWorkspace(workspace);
  trackCreationWorkspaceEvent("workspace_created", { from: "package" });
  return { workspace, substance: { ...substance, valid: true } };
}
