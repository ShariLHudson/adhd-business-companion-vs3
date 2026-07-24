/**
 * Visual Thinking Studio — Adaptive Presentation Intelligence Foundation (Build 6).
 * Recommends how approved generated content should initially be experienced.
 * Does not re-interpret goals, choose deliverables, research, or generate facts.
 */

import {
  limitVisibleChoices,
  resolveAdaptivePresentation,
} from "@/lib/adaptiveCompanionIntelligence";
import type { VisualThinkingDeliverable as PlanDeliverableType } from "@/lib/cartographersStudio/visualThinkingExperienceOrchestrator";
import type { VisualThinkingExperiencePlan } from "@/lib/cartographersStudio/visualThinkingExperienceOrchestrator";
import type { VisualThinkingUnderstanding } from "@/lib/cartographersStudio/visualThinkingUnderstanding";
import type { VisualThinkingKnowledgePackage } from "@/lib/cartographersStudio/visualThinkingKnowledgeIntelligence";
import type {
  VisualThinkingContentBlock,
  VisualThinkingGeneratedDeliverable,
  VisualThinkingGenerationBundle,
  VisualThinkingGenerationRun,
} from "@/lib/cartographersStudio/visualThinkingGenerationEngine";

// ─── Presentation types ─────────────────────────────────────────────────────

export type VisualThinkingPresentationType =
  | "concise_reading"
  | "guided_reading"
  | "detailed_reading"
  | "step_by_step"
  | "checklist"
  | "process_flow"
  | "relationship_view"
  | "mind_map"
  | "timeline"
  | "decision_tree"
  | "comparison_view"
  | "report"
  | "sop"
  | "training_guide"
  | "action_plan"
  | "quick_reference"
  | "glossary"
  | "faq"
  | "user_led_canvas"
  | "split_view";

export type VisualThinkingVisualStructure =
  | "process"
  | "relationship"
  | "hierarchy"
  | "sequence"
  | "chronology"
  | "branching"
  | "comparison"
  | "cause_and_effect"
  | "journey"
  | "grouped_ideas"
  | "user_led";

export type VisualThinkingWrittenTreatment =
  | "concise"
  | "guided"
  | "detailed"
  | "reference"
  | "procedural"
  | "explanatory"
  | "instructional"
  | "comparative"
  | "executive"
  | "training";

export type VisualThinkingInformationDensity = "low" | "balanced" | "high";

export type VisualThinkingProgressiveDisclosure =
  | "start_with_summary"
  | "start_with_first_step"
  | "start_with_overview"
  | "start_with_primary_visual"
  | "reveal_by_section"
  | "reveal_by_phase"
  | "show_all";

export type VisualThinkingNavigationMode =
  | "linear"
  | "sectional"
  | "hub"
  | "split"
  | "canvas_shell";

export type VisualThinkingPresentationPlanStatus =
  | "draft"
  | "ready"
  | "active"
  | "user_adjusted"
  | "archived"
  | "failed";

export type VisualThinkingPresentationEligibility = {
  type: VisualThinkingPresentationType;
  eligible: boolean;
  reason: string | null;
  userFacingReason: string | null;
};

export type VisualThinkingPresentationOverrides = {
  activePresentation?: VisualThinkingPresentationType;
  informationDensity?: VisualThinkingInformationDensity;
  progressiveDisclosure?: VisualThinkingProgressiveDisclosure;
  preferVisualFirst?: boolean;
  showSupporting?: boolean;
  splitView?: boolean;
  expandedSectionIds?: string[];
  selectedSupportingDeliverableId?: string | null;
};

export type VisualThinkingPresentationPlan = {
  id: string;
  requestId: string;
  understandingId: string;
  experiencePlanId: string;
  knowledgePackageId: string | null;
  generationRunId: string;
  primaryDeliverableId: string;
  supportingDeliverableIds: string[];
  recommendedPresentation: VisualThinkingPresentationType;
  availablePresentations: VisualThinkingPresentationType[];
  excludedPresentations: Array<{
    type: VisualThinkingPresentationType;
    reason: string;
    userFacingReason: string;
  }>;
  initialView: VisualThinkingPresentationType;
  informationDensity: VisualThinkingInformationDensity;
  progressiveDisclosure: VisualThinkingProgressiveDisclosure;
  navigationMode: VisualThinkingNavigationMode;
  visualRecommendation: VisualThinkingVisualStructure | null;
  writtenRecommendation: VisualThinkingWrittenTreatment;
  supportingPresentationOrder: string[];
  userOverrides: VisualThinkingPresentationOverrides;
  userAdjusted: boolean;
  status: VisualThinkingPresentationPlanStatus;
  createdAt: string;
  updatedAt: string;
  plannedBy: "deterministic_v1";
  planningVersion: "vts-presentation-plan-1";
  /** Snapshot of underlying content depth — density must not alter this. */
  contentDetailLevel: "essentials" | "guided" | "detailed";
  completenessNotice: string | null;
};

export type VisualThinkingPresentationInput = {
  understanding: VisualThinkingUnderstanding;
  experiencePlan: VisualThinkingExperiencePlan;
  knowledgePackage: VisualThinkingKnowledgePackage | null;
  generationBundle: VisualThinkingGenerationBundle;
  viewportWidth?: number;
};

export type VisualThinkingPresentationWorkspaceProjection = {
  title: string;
  activePresentationLabel: string;
  activePresentation: VisualThinkingPresentationType;
  primaryDominant: true;
  supportingLabel: "Also available" | "Helpful companion view" | "Related result";
  showSupporting: boolean;
  visibleSupportingDeliverableIds: string[];
  alternatePresentations: Array<{
    type: VisualThinkingPresentationType;
    label: string;
  }>;
  densitiyLabel: string;
  informationDensity: VisualThinkingInformationDensity;
  progressiveDisclosure: VisualThinkingProgressiveDisclosure;
  visibleBlockIds: string[];
  collapsedBlockIds: string[];
  splitViewActive: boolean;
  splitViewMode: "side_by_side" | "stacked_switch" | "unavailable";
  incompletenessVisible: boolean;
  incompletenessMessage: string | null;
  gapWarningsVisible: boolean;
  gapMessages: string[];
  userLedShell: boolean;
  userLedActions: string[];
  visualRecommendation: VisualThinkingVisualStructure | null;
  writtenRecommendation: VisualThinkingWrittenTreatment;
  showThisDifferentlyOpen: boolean;
};

const PRESENTATION_DRAFT_KEY = "companion-visual-thinking-presentation-plan-v1";

const ALL_PRESENTATIONS: VisualThinkingPresentationType[] = [
  "concise_reading",
  "guided_reading",
  "detailed_reading",
  "step_by_step",
  "checklist",
  "process_flow",
  "relationship_view",
  "mind_map",
  "timeline",
  "decision_tree",
  "comparison_view",
  "report",
  "sop",
  "training_guide",
  "action_plan",
  "quick_reference",
  "glossary",
  "faq",
  "user_led_canvas",
  "split_view",
];

const VISUAL_MAP_PRESENTATIONS: VisualThinkingPresentationType[] = [
  "relationship_view",
  "mind_map",
  "process_flow",
  "timeline",
  "decision_tree",
  "user_led_canvas",
];

function nowIso(): string {
  return new Date().toISOString();
}

function newId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function presentationLabel(
  type: VisualThinkingPresentationType,
): string {
  switch (type) {
    case "concise_reading":
      return "Concise reading";
    case "guided_reading":
      return "Guided reading";
    case "detailed_reading":
      return "Detailed reading";
    case "step_by_step":
      return "Step-by-step";
    case "checklist":
      return "Checklist";
    case "process_flow":
      return "Visual process";
    case "relationship_view":
      return "Relationship view";
    case "mind_map":
      return "Mind map";
    case "timeline":
      return "Timeline";
    case "decision_tree":
      return "Decision tree";
    case "comparison_view":
      return "Comparison";
    case "report":
      return "Report";
    case "sop":
      return "SOP";
    case "training_guide":
      return "Training guide";
    case "action_plan":
      return "Action plan";
    case "quick_reference":
      return "Quick reference";
    case "glossary":
      return "Glossary";
    case "faq":
      return "FAQ";
    case "user_led_canvas":
      return "Visual workspace";
    case "split_view":
      return "Split view";
    default:
      return "Presentation";
  }
}

// ─── Structure signals (from package + deliverables — no new content) ───────

export type PresentationStructureSignals = {
  hasOrderedSteps: boolean;
  hasProcessNodes: boolean;
  hasSemanticRelationships: boolean;
  hasEntitiesOrConcepts: boolean;
  hasChronology: boolean;
  hasDecisionStructure: boolean;
  optionCount: number;
  hasComparisonCriteria: boolean;
  hasGlossaryItems: boolean;
  hasFaqItems: boolean;
  hasSummary: boolean;
  hasWarningsOrGaps: boolean;
  isUserLedShell: boolean;
  declinesMap: boolean;
  primaryType: PlanDeliverableType;
  supportingTypes: PlanDeliverableType[];
  openGapMessages: string[];
  runIncomplete: boolean;
  runStatus: VisualThinkingGenerationRun["status"];
  researchBlocked: boolean;
};

function blocksOf(
  deliverables: VisualThinkingGeneratedDeliverable[],
): VisualThinkingContentBlock[] {
  return deliverables.flatMap((d) => d.blocks);
}

export function collectPresentationStructureSignals(
  input: VisualThinkingPresentationInput,
): PresentationStructureSignals {
  const { experiencePlan: plan, knowledgePackage: pkg, generationBundle } =
    input;
  const primary =
    generationBundle.deliverables.find(
      (d) => d.id === generationBundle.run.primaryDeliverableId,
    ) ?? generationBundle.deliverables.find((d) => d.role === "primary");
  const supporting = generationBundle.deliverables.filter(
    (d) => d.role === "supporting",
  );
  const blocks = blocksOf(generationBundle.deliverables);
  const orderedSteps =
    blocks.filter((b) => b.type === "numbered_step" || b.type === "checklist_item")
      .length >= 2 ||
    (pkg?.items.filter((i) => i.type === "step" && i.sequence != null).length ??
      0) >= 2;
  const processNodes =
    blocks.some((b) => b.type === "process_node") ||
    Boolean(primary?.visualShell?.kind === "process_flow");
  const relationships =
    (pkg?.relationships.length ?? 0) >= 1 ||
    blocks.some((b) => b.type === "relationship_node") ||
    Boolean(
      primary?.visualShell?.kind === "relationship_map" &&
        (primary.visualShell.relationships?.length ?? 0) > 0,
    );
  const entities =
    relationships ||
    (pkg?.items.filter((i) => i.type === "relationship" || i.type === "step")
      .length ?? 0) >= 2 ||
    (primary?.visualShell?.nodes.length ?? 0) >= 2;
  const chronology =
    blocks.some((b) => b.type === "timeline_event") ||
    (pkg?.items.some((i) => i.type === "timeline_event") ?? false) ||
    pkg?.organizationStrategy === "chronology";
  const decision =
    blocks.some((b) => b.type === "decision_branch") ||
    (pkg?.items.some((i) => i.type === "decision_point") ?? false) ||
    primary?.visualShell?.kind === "decision_tree" ||
    plan.primaryDeliverable === "decision_tree";
  const options =
    blocks.filter((b) => b.type === "comparison_row").length ||
    (pkg?.items.filter((i) => i.type === "option").length ?? 0);
  const criteria =
    (pkg?.items.some((i) => i.type === "criterion") ?? false) ||
    blocks.some(
      (b) =>
        b.type === "comparison_row" ||
        /criteria|criterion|trade.?off/i.test(b.content),
    ) ||
    plan.primaryDeliverable === "comparison";
  const glossary =
    blocks.some((b) => b.type === "glossary_term") ||
    supporting.some((d) => d.type === "glossary");
  const faq =
    blocks.some((b) => b.type === "question") ||
    supporting.some((d) => d.type === "faq") ||
    plan.primaryDeliverable === "faq";
  const summary = blocks.some((b) => b.type === "summary" || b.type === "key_point");
  const gaps =
    pkg?.knowledgeGaps
      .filter((g) => g.status === "open" && g.priority !== "optional")
      .map((g) => g.description) ?? [];
  const warnings = blocks.some((b) => b.type === "warning" || b.type === "placeholder");
  const run = generationBundle.run;
  const incomplete =
    run.status === "awaiting_research" ||
    run.status === "awaiting_user_input" ||
    run.status === "partial" ||
    run.status === "failed" ||
    run.researchBlocked;

  return {
    hasOrderedSteps: orderedSteps,
    hasProcessNodes: processNodes,
    hasSemanticRelationships: relationships,
    hasEntitiesOrConcepts: entities,
    hasChronology: chronology,
    hasDecisionStructure: decision,
    optionCount: options,
    hasComparisonCriteria: criteria || options >= 2,
    hasGlossaryItems: glossary,
    hasFaqItems: faq,
    hasSummary: summary,
    hasWarningsOrGaps: warnings || gaps.length > 0,
    isUserLedShell:
      plan.interactionStyle === "let_me_build" ||
      primary?.sourceMode === "user_led_shell" ||
      plan.primaryDeliverable === "editable_relationship_map",
    declinesMap: plan.declinesMap,
    primaryType: plan.primaryDeliverable,
    supportingTypes: supporting.map((d) => d.type),
    openGapMessages: gaps,
    runIncomplete: incomplete,
    runStatus: run.status,
    researchBlocked: run.researchBlocked,
  };
}

// ─── Eligibility ────────────────────────────────────────────────────────────

export function evaluatePresentationEligibility(
  type: VisualThinkingPresentationType,
  signals: PresentationStructureSignals,
): VisualThinkingPresentationEligibility {
  const deny = (
    reason: string,
    userFacingReason: string,
  ): VisualThinkingPresentationEligibility => ({
    type,
    eligible: false,
    reason,
    userFacingReason,
  });
  const allow = (): VisualThinkingPresentationEligibility => ({
    type,
    eligible: true,
    reason: null,
    userFacingReason: null,
  });

  if (signals.declinesMap && VISUAL_MAP_PRESENTATIONS.includes(type)) {
    return deny(
      "declines_map",
      "A visual map isn't part of this result.",
    );
  }

  switch (type) {
    case "step_by_step":
    case "checklist":
    case "sop":
    case "process_flow":
      if (!signals.hasOrderedSteps && !signals.hasProcessNodes) {
        return deny(
          "missing_ordered_steps",
          "There aren't enough ordered steps for this view yet.",
        );
      }
      if (type === "process_flow" && signals.declinesMap) {
        return deny("declines_map", "A visual map isn't part of this result.");
      }
      return allow();
    case "relationship_view":
    case "mind_map":
      if (!signals.hasSemanticRelationships || !signals.hasEntitiesOrConcepts) {
        return deny(
          "missing_relationships",
          "There aren't enough connected ideas for a relationship view yet.",
        );
      }
      return allow();
    case "timeline":
      if (!signals.hasChronology) {
        return deny(
          "missing_chronology",
          "A timeline needs dates, periods, or a clear sequence of time.",
        );
      }
      return allow();
    case "decision_tree":
      if (!signals.hasDecisionStructure) {
        return deny(
          "missing_decision_structure",
          "A decision tree needs a decision question and branches.",
        );
      }
      return allow();
    case "comparison_view":
      if (signals.optionCount < 2 || !signals.hasComparisonCriteria) {
        return deny(
          "missing_comparison_structure",
          "A comparison needs at least two options and a criterion.",
        );
      }
      return allow();
    case "glossary":
      if (!signals.hasGlossaryItems) {
        return deny(
          "missing_glossary",
          "A glossary isn't available for this result yet.",
        );
      }
      return allow();
    case "faq":
      if (!signals.hasFaqItems) {
        return deny(
          "missing_faq",
          "An FAQ isn't available for this result yet.",
        );
      }
      return allow();
    case "user_led_canvas":
      if (!signals.isUserLedShell && signals.primaryType !== "editable_relationship_map") {
        // Still eligible as alternate only when visual shell exists conceptually
        if (!signals.hasEntitiesOrConcepts && !signals.hasOrderedSteps) {
          return deny(
            "not_user_led",
            "This result isn't set up as a build-yourself visual.",
          );
        }
      }
      if (signals.declinesMap) {
        return deny("declines_map", "A visual map isn't part of this result.");
      }
      return allow();
    case "split_view":
      // Eligible when at least one written + one visual-capable view exist
      if (
        signals.declinesMap ||
        (!signals.hasOrderedSteps && !signals.hasSemanticRelationships)
      ) {
        return deny(
          "split_unavailable",
          "Split view needs both a written and a visual-ready structure.",
        );
      }
      return allow();
    case "concise_reading":
    case "guided_reading":
    case "detailed_reading":
    case "report":
    case "training_guide":
    case "action_plan":
    case "quick_reference":
      return allow();
    default:
      return allow();
  }
}

export function listPresentationEligibilities(
  signals: PresentationStructureSignals,
): VisualThinkingPresentationEligibility[] {
  return ALL_PRESENTATIONS.map((t) =>
    evaluatePresentationEligibility(t, signals),
  );
}

// ─── Initial selection & recommendations ────────────────────────────────────

function primaryPresentationForDeliverable(
  type: PlanDeliverableType,
  detail: VisualThinkingExperiencePlan["detailLevel"],
  signals: PresentationStructureSignals,
): VisualThinkingPresentationType {
  if (signals.isUserLedShell) return "user_led_canvas";
  switch (type) {
    case "step_by_step_guide":
      return "step_by_step";
    case "checklist":
      return "checklist";
    case "sop":
      return "sop";
    case "process":
    case "process_flow":
      return signals.declinesMap ? "step_by_step" : "process_flow";
    case "relationship_visualization":
    case "editable_relationship_map":
      return signals.declinesMap ? "guided_reading" : "relationship_view";
    case "timeline":
      return "timeline";
    case "decision_tree":
      return "decision_tree";
    case "comparison":
      return "comparison_view";
    case "report":
      return detail === "essentials"
        ? "concise_reading"
        : detail === "detailed"
          ? "detailed_reading"
          : "guided_reading";
    case "training_guide":
    case "learning_guide":
      return "training_guide";
    case "action_plan":
      return "action_plan";
    case "glossary":
      return "glossary";
    case "faq":
      return "faq";
    case "quick_reference":
    case "reference_card":
      return "quick_reference";
    case "summary":
    case "concise_explanation":
      return "concise_reading";
    default:
      return detail === "detailed" ? "detailed_reading" : "guided_reading";
  }
}

export function recommendVisualStructure(
  signals: PresentationStructureSignals,
  recommended: VisualThinkingPresentationType,
): VisualThinkingVisualStructure | null {
  if (signals.declinesMap) return null;
  if (signals.isUserLedShell) return "user_led";
  switch (recommended) {
    case "process_flow":
    case "step_by_step":
    case "sop":
    case "checklist":
      return signals.hasOrderedSteps || signals.hasProcessNodes
        ? "process"
        : "sequence";
    case "relationship_view":
    case "mind_map":
      return "relationship";
    case "timeline":
      return "chronology";
    case "decision_tree":
      return "branching";
    case "comparison_view":
      return "comparison";
    case "user_led_canvas":
      return "user_led";
    default:
      if (signals.hasSemanticRelationships) return "relationship";
      if (signals.hasOrderedSteps) return "sequence";
      return null;
  }
}

export function recommendWrittenTreatment(
  plan: VisualThinkingExperiencePlan,
  recommended: VisualThinkingPresentationType,
): VisualThinkingWrittenTreatment {
  switch (recommended) {
    case "concise_reading":
    case "quick_reference":
      return "concise";
    case "guided_reading":
      return "guided";
    case "detailed_reading":
    case "report":
      return plan.detailLevel === "detailed" ? "detailed" : "explanatory";
    case "step_by_step":
    case "sop":
    case "checklist":
    case "process_flow":
      return "procedural";
    case "training_guide":
      return "training";
    case "comparison_view":
      return "comparative";
    case "action_plan":
      return "instructional";
    default:
      if (plan.detailLevel === "essentials") return "concise";
      if (plan.detailLevel === "detailed") return "detailed";
      return "guided";
  }
}

export function selectInformationDensity(
  plan: VisualThinkingExperiencePlan,
  adaptiveSummaryFirst: boolean,
  override?: VisualThinkingInformationDensity,
): VisualThinkingInformationDensity {
  if (override) return override;
  if (plan.interactionStyle === "let_me_build") return "low";
  if (adaptiveSummaryFirst) return "low";
  if (plan.detailLevel === "detailed") return "high";
  if (plan.detailLevel === "essentials") return "balanced";
  return "balanced";
}

export function selectProgressiveDisclosure(
  recommended: VisualThinkingPresentationType,
  density: VisualThinkingInformationDensity,
  signals: PresentationStructureSignals,
  adaptiveSummaryFirst: boolean,
  override?: VisualThinkingProgressiveDisclosure,
): VisualThinkingProgressiveDisclosure {
  if (override) return override;
  if (density === "high") return "show_all";
  if (signals.isUserLedShell) return "start_with_primary_visual";
  if (
    recommended === "step_by_step" ||
    recommended === "sop" ||
    recommended === "checklist" ||
    recommended === "training_guide"
  ) {
    return adaptiveSummaryFirst || density === "low"
      ? "start_with_first_step"
      : "start_with_overview";
  }
  if (
    recommended === "report" ||
    recommended === "guided_reading" ||
    recommended === "detailed_reading"
  ) {
    return "start_with_summary";
  }
  if (
    recommended === "relationship_view" ||
    recommended === "mind_map" ||
    recommended === "process_flow"
  ) {
    return "start_with_overview";
  }
  if (recommended === "comparison_view") return "start_with_overview";
  return adaptiveSummaryFirst ? "start_with_summary" : "reveal_by_section";
}

function navigationFor(
  recommended: VisualThinkingPresentationType,
  split: boolean,
): VisualThinkingNavigationMode {
  if (recommended === "user_led_canvas") return "canvas_shell";
  if (split) return "split";
  if (
    recommended === "relationship_view" ||
    recommended === "mind_map" ||
    recommended === "comparison_view"
  ) {
    return "hub";
  }
  if (
    recommended === "step_by_step" ||
    recommended === "sop" ||
    recommended === "checklist" ||
    recommended === "training_guide"
  ) {
    return "linear";
  }
  return "sectional";
}

function completenessNotice(signals: PresentationStructureSignals): string | null {
  if (signals.researchBlocked || signals.runStatus === "awaiting_research") {
    return "Some sections are waiting for verified information before they can be filled in.";
  }
  if (signals.runStatus === "awaiting_user_input") {
    return "The structure is ready. A few details still need your input.";
  }
  if (signals.runStatus === "partial") {
    return "This result is partially complete — unfinished sections stay marked.";
  }
  if (signals.runStatus === "failed") {
    return "Something interrupted creation. What we finished is still here.";
  }
  return null;
}

/** Guard for tests — presentation must not invent deliverables or mutate upstream. */
export function presentationEngineConsumesUpstreamOnly(
  plan: VisualThinkingExperiencePlan,
  understanding: VisualThinkingUnderstanding,
  packageId: string | null,
): boolean {
  return Boolean(
    plan.primaryDeliverable &&
      understanding.primaryGoal &&
      understanding.successDefinition &&
      (packageId === null || typeof packageId === "string"),
  );
}

export function planVisualThinkingPresentation(
  input: VisualThinkingPresentationInput,
): VisualThinkingPresentationPlan {
  const { understanding, experiencePlan: plan, knowledgePackage: pkg, generationBundle } =
    input;
  const run = generationBundle.run;
  const primary =
    generationBundle.deliverables.find((d) => d.id === run.primaryDeliverableId) ??
    generationBundle.deliverables.find((d) => d.role === "primary");
  if (!primary) {
    return {
      id: newId("vtpp"),
      requestId: understanding.requestId,
      understandingId: understanding.id,
      experiencePlanId: plan.id,
      knowledgePackageId: pkg?.id ?? null,
      generationRunId: run.id,
      primaryDeliverableId: "",
      supportingDeliverableIds: [],
      recommendedPresentation: "guided_reading",
      availablePresentations: ["guided_reading"],
      excludedPresentations: [],
      initialView: "guided_reading",
      informationDensity: "balanced",
      progressiveDisclosure: "start_with_summary",
      navigationMode: "sectional",
      visualRecommendation: null,
      writtenRecommendation: "guided",
      supportingPresentationOrder: [],
      userOverrides: {},
      userAdjusted: false,
      status: "failed",
      createdAt: nowIso(),
      updatedAt: nowIso(),
      plannedBy: "deterministic_v1",
      planningVersion: "vts-presentation-plan-1",
      contentDetailLevel: plan.detailLevel,
      completenessNotice: "No primary result is available to present.",
    };
  }

  const signals = collectPresentationStructureSignals(input);
  const adaptive = resolveAdaptivePresentation({
    destinationHint: "visual_thinking_studio",
  });
  const preferred = primaryPresentationForDeliverable(
    plan.primaryDeliverable,
    plan.detailLevel,
    signals,
  );
  const preferredEligibility = evaluatePresentationEligibility(preferred, signals);
  // Align with primary deliverable; fall back only if structurally ineligible
  let recommended = preferred;
  if (!preferredEligibility.eligible) {
    const fallbacks: VisualThinkingPresentationType[] = [
      "guided_reading",
      "detailed_reading",
      "concise_reading",
      "step_by_step",
      "report",
    ];
    recommended =
      fallbacks.find((t) => evaluatePresentationEligibility(t, signals).eligible) ??
      "guided_reading";
  }

  // Primary deliverable type must stay primary — do not replace with a different result type
  // Prefer written presentation of the approved primary when visual would swap dominance
  if (
    preferred === "report" ||
    preferred === "guided_reading" ||
    preferred === "detailed_reading" ||
    preferred === "training_guide" ||
    preferred === "step_by_step" ||
    preferred === "sop" ||
    preferred === "comparison_view"
  ) {
    if (preferredEligibility.eligible) {
      recommended = preferred;
    }
  }

  const eligibilities = listPresentationEligibilities(signals);
  const available = eligibilities
    .filter((e) => e.eligible)
    .map((e) => e.type)
    .filter((t) => t !== "split_view"); // split is mode, not primary menu default
  // Always include recommended
  if (!available.includes(recommended)) available.unshift(recommended);

  const excluded = eligibilities
    .filter((e) => !e.eligible && e.userFacingReason)
    .map((e) => ({
      type: e.type,
      reason: e.reason ?? "ineligible",
      userFacingReason: e.userFacingReason ?? "Not available for this result.",
    }));

  const density = selectInformationDensity(plan, adaptive.summaryFirst);
  const disclosure = selectProgressiveDisclosure(
    recommended,
    density,
    signals,
    adaptive.summaryFirst,
  );
  const visual = recommendVisualStructure(signals, recommended);
  const written = recommendWrittenTreatment(plan, recommended);

  return {
    id: newId("vtpp"),
    requestId: understanding.requestId,
    understandingId: understanding.id,
    experiencePlanId: plan.id,
    knowledgePackageId: pkg?.id ?? null,
    generationRunId: run.id,
    primaryDeliverableId: primary.id,
    supportingDeliverableIds: run.supportingDeliverableIds.slice(),
    recommendedPresentation: recommended,
    availablePresentations: available,
    excludedPresentations: excluded,
    initialView: recommended,
    informationDensity: density,
    progressiveDisclosure: disclosure,
    navigationMode: navigationFor(recommended, false),
    visualRecommendation: visual,
    writtenRecommendation: written,
    supportingPresentationOrder: run.supportingDeliverableIds.slice(),
    userOverrides: {},
    userAdjusted: false,
    status: "ready",
    createdAt: nowIso(),
    updatedAt: nowIso(),
    plannedBy: "deterministic_v1",
    planningVersion: "vts-presentation-plan-1",
    contentDetailLevel: plan.detailLevel,
    completenessNotice: completenessNotice(signals),
  };
}

export type PresentationOverride =
  | { kind: "set_presentation"; presentation: VisualThinkingPresentationType }
  | { kind: "set_density"; density: VisualThinkingInformationDensity }
  | {
      kind: "set_disclosure";
      disclosure: VisualThinkingProgressiveDisclosure;
    }
  | { kind: "set_prefer_visual_first"; value: boolean }
  | { kind: "set_show_supporting"; value: boolean }
  | { kind: "set_split_view"; value: boolean }
  | { kind: "toggle_section"; sectionId: string; expanded: boolean }
  | {
      kind: "select_supporting";
      deliverableId: string | null;
    };

export function applyPresentationOverride(
  plan: VisualThinkingPresentationPlan,
  override: PresentationOverride,
  signals?: PresentationStructureSignals,
): VisualThinkingPresentationPlan {
  const nextOverrides = { ...plan.userOverrides };
  let available = plan.availablePresentations;
  let excluded = plan.excludedPresentations;
  let initialView = plan.initialView;
  let density = plan.informationDensity;
  let disclosure = plan.progressiveDisclosure;
  let navigation = plan.navigationMode;
  let visual = plan.visualRecommendation;

  if (override.kind === "set_presentation") {
    const eligibility = signals
      ? evaluatePresentationEligibility(override.presentation, signals)
      : { eligible: available.includes(override.presentation), reason: null, userFacingReason: null, type: override.presentation };
    if (!eligibility.eligible) {
      // Do not invent structure — keep plan, record exclusion note
      return {
        ...plan,
        updatedAt: nowIso(),
        status: "user_adjusted",
        userAdjusted: true,
        excludedPresentations: [
          ...excluded.filter((e) => e.type !== override.presentation),
          {
            type: override.presentation,
            reason: eligibility.reason ?? "ineligible",
            userFacingReason:
              eligibility.userFacingReason ??
              "That view needs more structure before it can open.",
          },
        ],
      };
    }
    nextOverrides.activePresentation = override.presentation;
    initialView = override.presentation;
    if (signals) {
      visual = recommendVisualStructure(signals, override.presentation);
      disclosure = selectProgressiveDisclosure(
        override.presentation,
        density,
        signals,
        false,
        nextOverrides.progressiveDisclosure,
      );
    }
    navigation = navigationFor(
      override.presentation,
      Boolean(nextOverrides.splitView),
    );
  } else if (override.kind === "set_density") {
    nextOverrides.informationDensity = override.density;
    density = override.density;
    // Content depth unchanged — contentDetailLevel stays
  } else if (override.kind === "set_disclosure") {
    nextOverrides.progressiveDisclosure = override.disclosure;
    disclosure = override.disclosure;
  } else if (override.kind === "set_prefer_visual_first") {
    nextOverrides.preferVisualFirst = override.value;
  } else if (override.kind === "set_show_supporting") {
    nextOverrides.showSupporting = override.value;
  } else if (override.kind === "set_split_view") {
    nextOverrides.splitView = override.value;
    navigation = navigationFor(initialView, override.value);
  } else if (override.kind === "toggle_section") {
    const set = new Set(nextOverrides.expandedSectionIds ?? []);
    if (override.expanded) set.add(override.sectionId);
    else set.delete(override.sectionId);
    nextOverrides.expandedSectionIds = [...set];
  } else if (override.kind === "select_supporting") {
    nextOverrides.selectedSupportingDeliverableId = override.deliverableId;
  }

  void available;
  return {
    ...plan,
    userOverrides: nextOverrides,
    userAdjusted: true,
    status: "user_adjusted",
    initialView,
    informationDensity: density,
    progressiveDisclosure: disclosure,
    navigationMode: navigation,
    visualRecommendation: visual,
    updatedAt: nowIso(),
  };
}

export function visibleAlternatePresentations(
  plan: VisualThinkingPresentationPlan,
  options?: { showAll?: boolean },
): Array<{ type: VisualThinkingPresentationType; label: string }> {
  const active =
    plan.userOverrides.activePresentation ?? plan.recommendedPresentation;
  const alts = plan.availablePresentations
    .filter((t) => t !== active && t !== "split_view")
    .map((t) => ({ type: t, label: presentationLabel(t) }));
  if (options?.showAll) return alts;
  const adaptive = resolveAdaptivePresentation({
    destinationHint: "visual_thinking_studio",
  });
  return limitVisibleChoices(alts, adaptive).visible;
}

export function resolveSplitViewMode(
  plan: VisualThinkingPresentationPlan,
  viewportWidth = 1024,
): "side_by_side" | "stacked_switch" | "unavailable" {
  const wantsSplit = Boolean(plan.userOverrides.splitView);
  if (!wantsSplit) return "unavailable";
  if (
    !plan.availablePresentations.includes("split_view") &&
    !plan.availablePresentations.some((t) => VISUAL_MAP_PRESENTATIONS.includes(t))
  ) {
    return "unavailable";
  }
  if (viewportWidth < 768) return "stacked_switch";
  return "side_by_side";
}

export function projectVisibleBlocks(
  deliverable: VisualThinkingGeneratedDeliverable,
  plan: VisualThinkingPresentationPlan,
): { visible: string[]; collapsed: string[] } {
  const blocks = [...deliverable.blocks].sort((a, b) => a.order - b.order);
  const allIds = blocks.map((b) => b.id);
  const density =
    plan.userOverrides.informationDensity ?? plan.informationDensity;
  const disclosure =
    plan.userOverrides.progressiveDisclosure ?? plan.progressiveDisclosure;
  const expanded = new Set(plan.userOverrides.expandedSectionIds ?? []);

  // Never hide warnings / placeholders / incompleteness
  const alwaysVisible = new Set(
    blocks
      .filter(
        (b) =>
          b.type === "warning" ||
          b.type === "placeholder" ||
          b.type === "question",
      )
      .map((b) => b.id),
  );

  if (density === "high" || disclosure === "show_all") {
    return { visible: allIds, collapsed: [] };
  }

  let seed: VisualThinkingContentBlock[] = [];
  if (
    disclosure === "start_with_first_step" ||
    disclosure === "start_with_overview"
  ) {
    const firstStep = blocks.find(
      (b) =>
        b.type === "numbered_step" ||
        b.type === "checklist_item" ||
        b.type === "heading" ||
        b.type === "summary",
    );
    seed = firstStep ? [firstStep] : blocks.slice(0, 1);
  } else if (disclosure === "start_with_summary") {
    const summary = blocks.find(
      (b) => b.type === "summary" || b.type === "paragraph" || b.type === "heading",
    );
    seed = summary ? [summary] : blocks.slice(0, 1);
  } else if (disclosure === "start_with_primary_visual") {
    seed = blocks.slice(0, Math.min(2, blocks.length));
  } else {
    seed = blocks.slice(0, Math.min(2, blocks.length));
  }

  const visible = new Set([
    ...seed.map((b) => b.id),
    ...alwaysVisible,
    ...[...expanded],
  ]);
  // Low density: one primary section; balanced: seed + always
  if (density === "balanced") {
    for (const b of blocks.slice(0, Math.min(4, blocks.length))) {
      visible.add(b.id);
    }
  }
  const collapsed = allIds.filter((id) => !visible.has(id));
  return { visible: [...visible], collapsed };
}

export function projectPresentationWorkspace(
  plan: VisualThinkingPresentationPlan,
  generationBundle: VisualThinkingGenerationBundle,
  options?: {
    showThisDifferentlyOpen?: boolean;
    showAllAlternates?: boolean;
    viewportWidth?: number;
  },
): VisualThinkingPresentationWorkspaceProjection {
  const primary =
    generationBundle.deliverables.find(
      (d) => d.id === plan.primaryDeliverableId,
    ) ?? generationBundle.deliverables.find((d) => d.role === "primary");
  const active =
    plan.userOverrides.activePresentation ?? plan.recommendedPresentation;
  const showSupporting = plan.userOverrides.showSupporting !== false;
  const supportingIds = showSupporting
    ? plan.supportingPresentationOrder
    : [];
  const alts = visibleAlternatePresentations(plan, {
    showAll: options?.showAllAlternates,
  });
  const blockProj = primary
    ? projectVisibleBlocks(primary, plan)
    : { visible: [] as string[], collapsed: [] as string[] };
  const splitMode = resolveSplitViewMode(plan, options?.viewportWidth ?? 1024);
  const incomplete = Boolean(plan.completenessNotice);
  const gaps = plan.completenessNotice
    ? [plan.completenessNotice]
    : [];

  return {
    title: primary?.title ?? "Your result",
    activePresentationLabel: presentationLabel(active),
    activePresentation: active,
    primaryDominant: true,
    supportingLabel: "Also available",
    showSupporting,
    visibleSupportingDeliverableIds: supportingIds,
    alternatePresentations: alts,
    densitiyLabel:
      (plan.userOverrides.informationDensity ?? plan.informationDensity) ===
      "low"
        ? "Focus"
        : (plan.userOverrides.informationDensity ?? plan.informationDensity) ===
            "high"
          ? "Show more"
          : "Balanced",
    informationDensity:
      plan.userOverrides.informationDensity ?? plan.informationDensity,
    progressiveDisclosure:
      plan.userOverrides.progressiveDisclosure ?? plan.progressiveDisclosure,
    visibleBlockIds: blockProj.visible,
    collapsedBlockIds: blockProj.collapsed,
    splitViewActive: splitMode !== "unavailable",
    splitViewMode: splitMode,
    incompletenessVisible: incomplete,
    incompletenessMessage: plan.completenessNotice,
    gapWarningsVisible: incomplete || (primary?.blocks.some((b) => b.type === "placeholder" || b.type === "warning") ?? false),
    gapMessages: gaps,
    userLedShell:
      active === "user_led_canvas" || primary?.sourceMode === "user_led_shell",
    userLedActions: [
      "Add Idea",
      "Ask Shari",
      "Reorganize",
      "Fit View",
      "Open Previous Work",
    ],
    visualRecommendation: plan.visualRecommendation,
    writtenRecommendation: plan.writtenRecommendation,
    showThisDifferentlyOpen: Boolean(options?.showThisDifferentlyOpen),
  };
}

/** Density change must not alter stored content detail. */
export function densityPreservesContentDepth(
  before: VisualThinkingPresentationPlan,
  after: VisualThinkingPresentationPlan,
): boolean {
  return before.contentDetailLevel === after.contentDetailLevel;
}

// ─── Persistence ────────────────────────────────────────────────────────────

export function savePresentationPlan(
  plan: VisualThinkingPresentationPlan,
): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(PRESENTATION_DRAFT_KEY, JSON.stringify(plan));
  } catch {
    /* ignore */
  }
}

export function loadPresentationPlan(): VisualThinkingPresentationPlan | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(PRESENTATION_DRAFT_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as VisualThinkingPresentationPlan;
  } catch {
    return null;
  }
}

export function clearPresentationPlan(): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(PRESENTATION_DRAFT_KEY);
  } catch {
    /* ignore */
  }
}

export { PRESENTATION_DRAFT_KEY };
