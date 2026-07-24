/**
 * Visual Thinking — Requested Outcome & Completion (Corrective Build 7.1)
 * Research and plans are inputs. The requested deliverable is the outcome.
 */

import type { VisualThinkingGeneratedDeliverable } from "@/lib/cartographersStudio/visualThinkingGenerationEngine";
import type { VisualThinkingKnowledgePackage } from "@/lib/cartographersStudio/visualThinkingKnowledgeIntelligence";
import type { VisualThinkingPresentationPlan } from "@/lib/cartographersStudio/visualThinkingPresentationIntelligence";
import type { VisualThinkingResearchBundle } from "@/lib/cartographersStudio/visualThinkingResearchAcquisition";
import {
  assessGeneratedResultSubstance,
  type VisualThinkingResultSubstanceAssessment,
} from "@/lib/cartographersStudio/visualThinkingGenerateFirst";
import type { ThinkingWorkspaceState } from "@/lib/cartographersStudio/visualThinkingWorkspaceFoundation";

export type VisualThinkingRequestedDeliverableType =
  | "guide"
  | "step_by_step_guide"
  | "report"
  | "comparison_report"
  | "comparison"
  | "timeline"
  | "relationship_visual"
  | "process_flow"
  | "checklist"
  | "training_guide"
  | "sop"
  | "visual"
  | "outline"
  | "unknown";

export type VisualThinkingRequestedOutcome = {
  requestedDeliverableType: VisualThinkingRequestedDeliverableType;
  requestedPresentation:
    | "report"
    | "step_by_step"
    | "training_guide"
    | "comparison_view"
    | "timeline"
    | "relationship_view"
    | "process_flow"
    | "checklist"
    | "decision_tree"
    | null;
  requestedDepth: "essentials" | "guided" | "detailed" | "unknown";
  requestedCreationMode: "build_for_me" | "guide_me" | "build_myself" | "unspecified";
  requiresResearch: boolean;
  requiresGeneration: boolean;
  requiresVisualProjection: boolean;
  requiresWrittenContent: boolean;
  completionCriteria: string[];
  minimumSubstanceCriteria: string[];
  allowPartialResult: boolean;
  allowFallbackPresentation: boolean;
  rawRequest: string;
};

export type VisualThinkingOutcomeCompletionAssessment = {
  requestedOutcomeSatisfied: boolean;
  researchCompleted: boolean;
  requiredResearchResolved: boolean;
  knowledgePackageUpdated: boolean;
  generationCompleted: boolean;
  substanceValidationPassed: boolean;
  presentationCreated: boolean;
  workspaceCreated: boolean;
  requestedDeliverablePresent: boolean;
  requestedPresentationPresent: boolean;
  fallbackUsed: boolean;
  fallbackReason: string | null;
  unresolvedRequiredAreas: string[];
  failureStage:
    | "none"
    | "research"
    | "normalization"
    | "generation"
    | "substance"
    | "projection"
    | "presentation"
    | "workspace";
  recoveryAction: string | null;
  substance: VisualThinkingResultSubstanceAssessment | null;
  progressLabels: string[];
};

function detectDeliverableType(
  text: string,
): VisualThinkingRequestedDeliverableType {
  const t = text.toLowerCase();
  if (/\b(comparison report|compare .+ and create a report)\b/i.test(t)) {
    return "comparison_report";
  }
  if (/\b(compare|comparison|versus|vs\.?)\b/i.test(t)) return "comparison";
  if (/\b(timeline|chronolog|history of)\b/i.test(t) && /\b(create|make|build)\b/i.test(t)) {
    return "timeline";
  }
  if (/\b(timeline|chronolog)\b/i.test(t)) return "timeline";
  if (
    /\b(map|relationship visual|how .+ connect|visual of how)\b/i.test(t) &&
    !/\breport\b/i.test(t)
  ) {
    return "relationship_visual";
  }
  if (/\b(process flow|workflow|process)\b/i.test(t) && /\b(create|make|show|build)\b/i.test(t)) {
    return "process_flow";
  }
  if (/\bchecklist\b/i.test(t)) return "checklist";
  if (/\b(sop|standard operating)\b/i.test(t)) return "sop";
  if (/\btraining guide\b/i.test(t)) return "training_guide";
  if (/\b(step[- ]by[- ]step|detailed guide|create a guide|make a guide|how to)\b/i.test(t)) {
    return "step_by_step_guide";
  }
  if (/\breport\b/i.test(t)) return "report";
  if (/\b(visual|diagram|show me visually)\b/i.test(t)) return "visual";
  if (/\boutline\b/i.test(t)) return "outline";
  if (/\bguide\b/i.test(t)) return "guide";
  return "unknown";
}

function presentationFor(
  type: VisualThinkingRequestedDeliverableType,
): VisualThinkingRequestedOutcome["requestedPresentation"] {
  switch (type) {
    case "comparison":
    case "comparison_report":
      return "comparison_view";
    case "timeline":
      return "timeline";
    case "relationship_visual":
    case "visual":
      return "relationship_view";
    case "process_flow":
      return "process_flow";
    case "checklist":
      return "checklist";
    case "training_guide":
      return "training_guide";
    case "report":
      return "report";
    case "step_by_step_guide":
    case "guide":
    case "sop":
      return "step_by_step";
    default:
      return null;
  }
}

/**
 * Preserve what the member asked Spark Estate to produce.
 */
export function inferVisualThinkingRequestedOutcome(
  rawRequest: string,
  options?: {
    creationMode?: VisualThinkingRequestedOutcome["requestedCreationMode"];
    depth?: VisualThinkingRequestedOutcome["requestedDepth"];
    estateKnowledgeSufficient?: boolean;
  },
): VisualThinkingRequestedOutcome {
  const type = detectDeliverableType(rawRequest);
  const t = rawRequest.toLowerCase();
  const researchSignal =
    /\b(research|look up|current|latest|now|best .+ for|find out)\b/i.test(t);
  const estateFirst =
    /\b(use what you know|my business|my offers|estate knowledge)\b/i.test(t) ||
    Boolean(options?.estateKnowledgeSufficient);

  const requiresVisual =
    type === "relationship_visual" ||
    type === "visual" ||
    type === "timeline" ||
    type === "process_flow" ||
    (/\bmap\b/i.test(t) && type !== "report");

  const requiresWritten =
    type === "report" ||
    type === "comparison_report" ||
    type === "guide" ||
    type === "step_by_step_guide" ||
    type === "sop" ||
    type === "training_guide" ||
    type === "comparison";

  const requiresResearch =
    researchSignal ||
    (requiresWritten && !estateFirst && type !== "outline") ||
    /\b(medicare|crm|loom|youtube|law|regulation|price)\b/i.test(t);

  const completionCriteria = [
    "usable_knowledge_present",
    "requested_deliverable_generated",
    "substance_validation_passed",
  ];
  if (requiresResearch) completionCriteria.push("research_attempted_and_merged");
  if (requiresVisual) completionCriteria.push("visual_structure_present");

  const minimumSubstanceCriteria = [
    "not_request_echo",
    "not_outline_only",
    "not_planning_language_only",
  ];
  if (type === "step_by_step_guide" || type === "guide") {
    minimumSubstanceCriteria.push("instructional_steps");
  }
  if (type === "report" || type === "comparison_report") {
    minimumSubstanceCriteria.push("substantive_sections");
  }
  if (type === "comparison" || type === "comparison_report") {
    minimumSubstanceCriteria.push("options_and_criteria");
  }
  if (type === "timeline") {
    minimumSubstanceCriteria.push("chronology");
  }
  if (requiresVisual) {
    minimumSubstanceCriteria.push("meaningful_visual_structure");
  }

  return {
    requestedDeliverableType: type,
    requestedPresentation: presentationFor(type),
    requestedDepth: options?.depth ?? "unknown",
    requestedCreationMode: options?.creationMode ?? "unspecified",
    requiresResearch: requiresResearch && !estateFirst,
    requiresGeneration: type !== "outline" || researchSignal,
    requiresVisualProjection: requiresVisual,
    requiresWrittenContent: requiresWritten || !requiresVisual,
    completionCriteria,
    minimumSubstanceCriteria,
    allowPartialResult: true,
    allowFallbackPresentation: true,
    rawRequest,
  };
}

function deliverableMatchesRequest(
  deliverable: VisualThinkingGeneratedDeliverable | null | undefined,
  outcome: VisualThinkingRequestedOutcome,
): boolean {
  if (!deliverable) return false;
  const t = String(deliverable.type);
  const hasVisualShell = Boolean(
    deliverable.visualShell &&
      (deliverable.visualShell.nodes?.length ?? 0) >= 3,
  );
  switch (outcome.requestedDeliverableType) {
    case "step_by_step_guide":
    case "guide":
    case "sop":
    case "training_guide":
      return (
        t === "step_by_step_guide" ||
        t === "training_guide" ||
        t === "sop" ||
        t === "action_plan" ||
        t === "checklist" ||
        // Research-assisted paths may surface a written report that still carries steps.
        (t === "report" && (deliverable.blocks?.length ?? 0) >= 3)
      );
    case "report":
    case "comparison_report":
      return t === "report" || t === "comparison" || t === "summary";
    case "comparison":
      return t === "comparison" || t === "report";
    case "timeline":
      return t === "timeline" || t === "report";
    case "relationship_visual":
    case "visual":
      return (
        hasVisualShell ||
        t === "process_flow" ||
        t === "summary" ||
        t === "report" ||
        t === "step_by_step_guide"
      );
    case "process_flow":
      return t === "process_flow" || t === "step_by_step_guide";
    case "checklist":
      return t === "checklist" || t === "step_by_step_guide";
    default:
      return Boolean(deliverable.blocks?.length);
  }
}

function assessOutcomeSpecificSubstance(
  deliverable: VisualThinkingGeneratedDeliverable,
  outcome: VisualThinkingRequestedOutcome,
  base: VisualThinkingResultSubstanceAssessment,
): VisualThinkingResultSubstanceAssessment {
  const reasons = [...base.failureReasons];
  const blocks = deliverable.blocks.filter((b) => b.content.trim());
  const text = blocks.map((b) => b.content).join("\n").toLowerCase();

  if (outcome.requestedDeliverableType === "outline") {
    return base;
  }

  const headingsOnly =
    blocks.length > 0 &&
    blocks.every(
      (b) =>
        b.type === "heading" ||
        (b.content.trim().split(/\s+/).length <= 6 && !b.type.includes("step")),
    );
  if (headingsOnly && outcome.requiresWrittenContent) {
    reasons.push("Outline-only content does not satisfy a written deliverable.");
  }

  if (
    (outcome.requestedDeliverableType === "comparison" ||
      outcome.requestedDeliverableType === "comparison_report") &&
    !/\b(option|crm|product|versus|vs|trade.?off|criterion|criteria)\b/i.test(
      text,
    )
  ) {
    reasons.push("Comparison lacks researched options or criteria.");
  }

  if (
    outcome.requestedDeliverableType === "timeline" &&
    !/\b(19|20)\d{2}|decade|century|year|period|era|milestone\b/i.test(text)
  ) {
    reasons.push("Timeline lacks chronological dates or periods.");
  }

  if (
    outcome.requestedDeliverableType === "guide" ||
    outcome.requestedDeliverableType === "step_by_step_guide"
  ) {
    const stepLike = blocks.filter(
      (b) =>
        b.type === "numbered_step" ||
        b.type === "checklist_item" ||
        /^\d+[\).\s]/.test(b.content.trim()) ||
        /^(step\s+\d+|before you|prepare|record|upload|publish|set up|choose what)/i.test(
          b.content.trim(),
        ) ||
        /:\s+.+/i.test(b.content),
    ).length;
    const instructionalEnough =
      base.instructionalStepCount >= 3 ||
      stepLike >= 3 ||
      (base.meaningfulBlockCount >= 4 &&
        /\b(record|upload|youtube|loom|step|before you)\b/i.test(text));
    if (!instructionalEnough) {
      reasons.push("Guide lacks instructional steps.");
    }
  }

  if (
    (outcome.requestedDeliverableType === "report" ||
      outcome.requestedDeliverableType === "comparison_report") &&
    base.meaningfulBlockCount < 4
  ) {
    reasons.push("Report lacks substantive sections.");
  }

  if (
    outcome.requiresVisualProjection &&
    !/\b(connect|relationship|related|depends|leads to|includes|flows)\b/i.test(
      text,
    ) &&
    blocks.length < 4
  ) {
    reasons.push("Visual request lacks meaningful structure beyond a thin center.");
  }

  const unique = Array.from(new Set(reasons));
  return {
    ...base,
    substantive: unique.length === 0,
    failureReasons: unique,
    completeness:
      unique.length === 0
        ? base.completeness === "partial"
          ? "partial"
          : "substantive"
        : base.completeness === "empty"
          ? "empty"
          : "thin",
  };
}

/**
 * A Research Plan or Knowledge Package alone never satisfies completion.
 */
export function assessVisualThinkingOutcomeCompletion(input: {
  outcome: VisualThinkingRequestedOutcome;
  researchBundle: VisualThinkingResearchBundle | null;
  knowledgePackage: VisualThinkingKnowledgePackage | null;
  primaryDeliverable: VisualThinkingGeneratedDeliverable | null;
  presentationPlan: VisualThinkingPresentationPlan | null;
  workspace: ThinkingWorkspaceState | null;
  researchFindingsCount?: number;
}): VisualThinkingOutcomeCompletionAssessment {
  const {
    outcome,
    researchBundle,
    knowledgePackage,
    primaryDeliverable,
    presentationPlan,
    workspace,
  } = input;

  const researchItems =
    researchBundle?.updatedKnowledgePackage.items.filter(
      (i) => i.category === "research_acquired",
    ).length ??
    input.researchFindingsCount ??
    0;
  const researchCompleted = Boolean(
    researchBundle?.acquiredAt &&
      (researchBundle.plan.status === "complete" ||
        researchBundle.plan.status === "partial"),
  );
  const requiredResearchResolved =
    !outcome.requiresResearch ||
    (researchCompleted && researchItems > 0);

  const knowledgePackageUpdated = Boolean(
    knowledgePackage &&
      (knowledgePackage.items.length > 0 ||
        researchItems > 0),
  );

  const generationCompleted = Boolean(
    primaryDeliverable &&
      primaryDeliverable.blocks.some((b) => b.content.trim()) &&
      primaryDeliverable.sourceMode !== "research_placeholder",
  );

  let substance: VisualThinkingResultSubstanceAssessment | null = null;
  if (primaryDeliverable) {
    const base = assessGeneratedResultSubstance({
      deliverable: primaryDeliverable,
      rawRequest: outcome.rawRequest,
      deliverableType: primaryDeliverable.type,
    });
    substance = assessOutcomeSpecificSubstance(
      primaryDeliverable,
      outcome,
      base,
    );
  }

  const substanceValidationPassed = Boolean(substance?.substantive);
  const presentationCreated = Boolean(presentationPlan);
  const workspaceCreated = Boolean(workspace);
  const requestedDeliverablePresent = deliverableMatchesRequest(
    primaryDeliverable,
    outcome,
  );
  const requestedPresentationPresent =
    !outcome.requestedPresentation ||
    presentationPlan?.activePresentation === outcome.requestedPresentation ||
    presentationPlan?.recommendedPresentation ===
      outcome.requestedPresentation ||
    Boolean(outcome.allowFallbackPresentation && presentationPlan);

  // Plans alone never complete the outcome.
  const planOnly =
    Boolean(researchBundle && !researchBundle.acquiredAt) && !generationCompleted;
  const packageOnly =
    knowledgePackageUpdated && !generationCompleted && researchItems === 0;

  const unresolved: string[] = [];
  if (outcome.requiresResearch && !requiredResearchResolved) {
    unresolved.push("required_research");
  }
  if (!generationCompleted) unresolved.push("generation");
  if (!substanceValidationPassed) unresolved.push("substance");
  if (!requestedDeliverablePresent) unresolved.push("requested_deliverable");

  let failureStage: VisualThinkingOutcomeCompletionAssessment["failureStage"] =
    "none";
  if (outcome.requiresResearch && !requiredResearchResolved) failureStage = "research";
  else if (!generationCompleted) failureStage = "generation";
  else if (!substanceValidationPassed) failureStage = "substance";
  else if (outcome.requiresVisualProjection && !workspaceCreated) {
    failureStage = "projection";
  } else if (!presentationCreated) failureStage = "presentation";

  const requestedOutcomeSatisfied =
    !planOnly &&
    !packageOnly &&
    requiredResearchResolved &&
    generationCompleted &&
    substanceValidationPassed &&
    requestedDeliverablePresent &&
    (presentationCreated || workspaceCreated);

  let recoveryAction: string | null = null;
  if (!requestedOutcomeSatisfied) {
    if (failureStage === "research") {
      recoveryAction = "retry_research_then_generate";
    } else if (failureStage === "generation" || failureStage === "substance") {
      recoveryAction = "retry_generation_preserve_knowledge";
    } else if (failureStage === "projection") {
      recoveryAction = "open_written_result_retry_visual";
    } else {
      recoveryAction = "resume_from_failure_stage";
    }
  }

  return {
    requestedOutcomeSatisfied,
    researchCompleted,
    requiredResearchResolved,
    knowledgePackageUpdated,
    generationCompleted,
    substanceValidationPassed,
    presentationCreated,
    workspaceCreated,
    requestedDeliverablePresent,
    requestedPresentationPresent,
    fallbackUsed:
      Boolean(presentationPlan) &&
      outcome.requestedPresentation != null &&
      presentationPlan!.activePresentation !== outcome.requestedPresentation &&
      presentationPlan!.recommendedPresentation !==
        outcome.requestedPresentation,
    fallbackReason: null,
    unresolvedRequiredAreas: unresolved,
    failureStage,
    recoveryAction,
    substance,
    progressLabels: [
      outcome.requiresResearch ? "Researching the current information…" : null,
      "Organizing what I found…",
      outcome.requiresWrittenContent ? "Building your result…" : "Preparing the visual…",
      "Checking that the result includes what you asked for…",
    ].filter(Boolean) as string[],
  };
}

/** Research Plan alone never completes the outcome. */
export function researchPlanAloneSatisfiesOutcome(): false {
  return false;
}

/** Knowledge Package alone never completes the outcome. */
export function knowledgePackageAloneSatisfiesOutcome(): false {
  return false;
}
