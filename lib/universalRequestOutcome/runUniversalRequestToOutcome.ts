/**
 * End-to-end: understand → validate → blueprint → research → generate → validate → next uses.
 */

import { buildDynamicCreationBlueprint } from "./dynamicBlueprint";
import { generateCreationPackage } from "./generateSubstantive";
import {
  createResearchCollection,
  resolveUseThisResearchOptions,
} from "./researchCollection";
import {
  buildProjectProposalFromPackage,
  resolveContextualNextUses,
  type ProjectProposalDraft,
} from "./nextUses";
import {
  understandUniversalRequest,
  shouldPreferUniversalUnderstanding,
} from "./understandRequest";
import { validateRequestInterpretation } from "./validateInterpretation";
import { validateOutcomeSubstance } from "./validateOutcome";
import type {
  CreationPackage,
  DynamicCreationBlueprint,
  OutcomeSubstanceValidation,
  RequestInterpretationValidation,
  ResearchCollection,
  UniversalRequestUnderstanding,
} from "./types";

export type UniversalRequestToOutcomeResult = {
  understanding: UniversalRequestUnderstanding;
  interpretationValidation: RequestInterpretationValidation;
  blueprint: DynamicCreationBlueprint;
  researchCollection: ResearchCollection | null;
  useThisResearchOptions: string[];
  creationPackage: CreationPackage | null;
  outcomeValidation: OutcomeSubstanceValidation | null;
  nextUses: string[];
  projectProposal: ProjectProposalDraft | null;
  /** Preferred Create catalog label — never a collapsed single post when plan/series. */
  createArtifactType: string | null;
  preferOverCatalog: boolean;
};

/**
 * Shared request-to-outcome pipeline for Create, VT, Projects, and Shari.
 */
export function runUniversalRequestToOutcome(
  rawRequest: string,
  options?: {
    sourceExperience?: string | null;
    /** When false, research-only — skip automatic package generation. */
    generatePackage?: boolean;
    /** Explicit research→creation handoff — see understandUniversalRequest. */
    explicitCreateHandoff?: boolean;
  },
): UniversalRequestToOutcomeResult {
  const understanding = understandUniversalRequest(rawRequest, {
    explicitCreateHandoff: options?.explicitCreateHandoff === true,
  });
  const interpretationValidation =
    validateRequestInterpretation(understanding);
  const blueprint = buildDynamicCreationBlueprint(understanding);

  let researchCollection: ResearchCollection | null = null;
  if (understanding.requiresResearch) {
    researchCollection = createResearchCollection({
      understanding,
      topic: understanding.normalizedRequest.slice(0, 120),
      purpose: understanding.desiredOutcome,
      sourceExperience: options?.sourceExperience ?? null,
      stableFindings: [
        {
          title: "Stable domain notes",
          content:
            "Current live research was unavailable. Stable practices were used to continue; verify time-sensitive claims before publishing.",
          source: "Stable instructional knowledge",
        },
      ],
    });
  }

  const researchOnly =
    understanding.primaryIntent === "research" &&
    !understanding.secondaryIntents.includes("create") &&
    !understanding.qualifiers.stepByStep &&
    understanding.creationFamily === "unknown";

  const shouldGenerate =
    options?.generatePackage !== false &&
    !researchOnly &&
    (understanding.primaryIntent !== "unknown" ||
      understanding.creationFamily !== "unknown");

  let creationPackage: CreationPackage | null = null;
  let outcomeValidation: OutcomeSubstanceValidation | null = null;
  let nextUses: string[] = [];
  let projectProposal: ProjectProposalDraft | null = null;

  if (shouldGenerate) {
    creationPackage = generateCreationPackage({
      understanding,
      blueprint,
      researchCollection,
      sourceExperience: options?.sourceExperience ?? null,
    });
    outcomeValidation = validateOutcomeSubstance(
      understanding,
      creationPackage,
    );
    creationPackage = {
      ...creationPackage,
      status: outcomeValidation.passed ? "substantive" : "partial",
      validationResults: outcomeValidation.failureReasons,
      availableHandoffs: resolveContextualNextUses(
        understanding,
        creationPackage,
      ),
    };
    nextUses = creationPackage.availableHandoffs;
    if (
      understanding.requiresExecutionPlanning ||
      understanding.primaryIntent === "project" ||
      nextUses.includes("Turn Into a Project")
    ) {
      projectProposal = buildProjectProposalFromPackage(
        understanding,
        creationPackage,
      );
    }
  }

  const useThisResearchOptions = researchCollection
    ? resolveUseThisResearchOptions(researchCollection, understanding)
    : [];

  return {
    understanding,
    interpretationValidation,
    blueprint,
    researchCollection,
    useThisResearchOptions,
    creationPackage,
    outcomeValidation,
    nextUses,
    projectProposal,
    createArtifactType: understanding.createArtifactType,
    preferOverCatalog: shouldPreferUniversalUnderstanding(understanding),
  };
}
