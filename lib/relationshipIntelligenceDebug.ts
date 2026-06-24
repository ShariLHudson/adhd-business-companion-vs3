/**
 * Development diagnostics — what relationship intelligence reaches the LLM.
 * Console prefix: [relationship-intelligence-debug]
 */

import { isPhase8AutonomousPreparationActive } from "./autonomousPreparation";
import { isPhase7BusinessIntelligenceEcosystemActive } from "./businessIntelligenceEcosystem";
import { getCurrentRelationshipPhase } from "./companionRelationshipPhases";
import { isPhase11EcosystemIntelligenceActive } from "./ecosystemIntelligence";
import { isPhase1OnboardingComplete } from "./phase1Onboarding";
import { isPhase5CompanionIntelligenceEcosystemActive } from "./phase5CompanionIntelligenceEcosystem";
import { isPhase6CompanionIntelligenceNetworkActive } from "./phase6CompanionIntelligenceNetwork";
import { isPhase10TransformationIntelligenceActive } from "./transformationIntelligence";
import { isPhase9WisdomIntelligenceActive } from "./wisdomIntelligence";
import {
  assessRelationshipMemoryConfidence,
  buildRelationshipIntelligencePromptAudit,
} from "./relationshipIntelligencePrompt";

const ENABLED =
  typeof process !== "undefined" && process.env.NODE_ENV === "development";

export type RelationshipIntelligenceDebugPayload = ReturnType<
  typeof buildRelationshipIntelligencePromptAudit
>;

export function logRelationshipIntelligenceDebug(
  userText: string,
  input: {
    businessContext?: string;
    intentHint?: string;
    relationshipPriorityBlock?: string | null;
  },
): void {
  if (!ENABLED) return;

  const audit = buildRelationshipIntelligencePromptAudit({
    userText,
    businessContext: input.businessContext,
    intentHint: input.intentHint,
    relationshipPriorityBlock: input.relationshipPriorityBlock,
  });

  console.debug("[relationship-intelligence-debug]", {
    userText: userText.slice(0, 120),
    currentPhase: audit.currentPhase,
    currentPhaseName: audit.currentPhaseName,
    memoryConfidence: audit.confidence,
    phase1Complete: isPhase1OnboardingComplete(),
    activePhaseFlags: audit.flags,
    relationshipProfileSummary: audit.relationshipProfileSummary,
    patternSummary: audit.patternSummary,
    wisdomSummary: audit.wisdomSummary,
    transformationSummary: audit.transformationSummary,
    ecosystemSummary: audit.ecosystemSummary,
    fullRelationshipMemoryBlock: audit.fullRelationshipMemoryBlock,
    relationshipPriorityBlockLength: audit.relationshipPriorityBlock?.length ?? 0,
    relationshipPriorityBlockPreview: audit.relationshipPriorityBlock?.slice(0, 800),
    promptSections: audit.promptSections,
    finalPromptLengthEstimate: audit.finalPromptLengthEstimate,
  });
}

/** @deprecated Use logRelationshipIntelligenceDebug */
export function logRelationshipIntelligenceForTurn(
  label: string,
  _snapshot: unknown,
): void {
  if (!ENABLED) return;
  console.debug(`[relationship-intelligence-debug] legacy ${label}`, {
    currentPhase: getCurrentRelationshipPhase().number,
    flags: {
      phase5: isPhase5CompanionIntelligenceEcosystemActive(),
      phase6: isPhase6CompanionIntelligenceNetworkActive(),
      phase7: isPhase7BusinessIntelligenceEcosystemActive(),
      phase8: isPhase8AutonomousPreparationActive(),
      phase9: isPhase9WisdomIntelligenceActive(),
      phase10: isPhase10TransformationIntelligenceActive(),
      phase11: isPhase11EcosystemIntelligenceActive(),
    },
    memoryConfidence: assessRelationshipMemoryConfidence(),
  });
}
