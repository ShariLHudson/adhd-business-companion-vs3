/**
 * Visual Thinking Studio — Experience Orchestrator (Build 3).
 * Transforms VisualThinkingUnderstanding into an execution plan.
 * Does not generate results. Does not re-interpret the raw request.
 */

import {
  limitVisibleChoices,
  resolveAdaptivePresentation,
} from "@/lib/adaptiveCompanionIntelligence";
import type {
  VisualThinkingCreationMode,
  VisualThinkingPrimaryExperience,
  VisualThinkingPrimaryGoal,
  VisualThinkingResearchNeed,
  VisualThinkingUnderstanding,
  VisualThinkingUnderstandingOutput,
} from "@/lib/cartographersStudio/visualThinkingUnderstanding";
import { outputLabel } from "@/lib/cartographersStudio/visualThinkingUnderstanding";

/** Member-facing experience kinds recommended by the Orchestrator. */
export type VisualThinkingOrchestratorExperience =
  | "learning"
  | "research"
  | "understanding"
  | "organization"
  | "comparison"
  | "decision_support"
  | "planning"
  | "creation"
  | "teaching"
  | "troubleshooting"
  | "documentation"
  | "exploration"
  | "visual_thinking";

export type VisualThinkingDeliverable =
  | "step_by_step_guide"
  | "report"
  | "checklist"
  | "process"
  | "relationship_visualization"
  | "comparison"
  | "timeline"
  | "decision_tree"
  | "training_guide"
  | "sop"
  | "action_plan"
  | "learning_guide"
  | "summary"
  | "glossary"
  | "faq"
  | "examples"
  | "templates"
  | "practice_exercise"
  | "reference_card"
  | "common_mistakes"
  | "decision_criteria"
  | "editable_relationship_map"
  | "process_flow"
  | "gap_analysis"
  | "suggested_next_areas"
  | "quick_reference"
  | "concise_explanation"
  | "questions_to_consider";

export type VisualThinkingGenerationStage =
  | "research"
  | "organize"
  | "prepare_user_led_canvas"
  | "create_primary"
  | "create_supporting"
  | "review"
  | "return_to_user";

export type VisualThinkingResearchPosition =
  | "before_generation"
  | "during_generation"
  | "not_at_all";

export type VisualThinkingInteractionStyle =
  | "build_for_me"
  | "guide_me"
  | "collaborate"
  | "let_me_build";

export type VisualThinkingEditingCapability =
  | "editing"
  | "expansion"
  | "simplification"
  | "replacement"
  | "reordering"
  | "conversion";

export type VisualThinkingHandoffTarget =
  | "projects"
  | "create"
  | "board"
  | "chamber_members"
  | "business_estate"
  | "knowledge_library"
  | "journal";

export type VisualThinkingPlanComplexity = "light" | "moderate" | "substantial";
export type VisualThinkingPlanTime = "brief" | "moderate" | "extended";

export type VisualThinkingExperiencePlanStatus =
  | "planned"
  | "user_adjusted"
  | "confirmed"
  | "ready_to_generate";

export type VisualThinkingPlanOverrides = {
  primaryExperience?: VisualThinkingOrchestratorExperience;
  primaryDeliverable?: VisualThinkingDeliverable;
  supportingDeliverables?: VisualThinkingDeliverable[];
  interactionStyle?: VisualThinkingInteractionStyle;
  researchPosition?: VisualThinkingResearchPosition;
  detail?: "essentials" | "guided" | "detailed";
  removedSupporting?: VisualThinkingDeliverable[];
};

export type VisualThinkingExperiencePlan = {
  id: string;
  understandingId: string;
  primaryExperience: VisualThinkingOrchestratorExperience;
  primaryDeliverable: VisualThinkingDeliverable;
  supportingDeliverables: VisualThinkingDeliverable[];
  experienceOrder: VisualThinkingOrchestratorExperience[];
  generationStages: VisualThinkingGenerationStage[];
  researchStage: VisualThinkingResearchPosition;
  interactionStyle: VisualThinkingInteractionStyle;
  editingMode: VisualThinkingEditingCapability[];
  reviewPoints: string[];
  handoffTargets: VisualThinkingHandoffTarget[];
  estimatedComplexity: VisualThinkingPlanComplexity;
  estimatedTime: VisualThinkingPlanTime;
  userOverrides: VisualThinkingPlanOverrides;
  /** Future conversion targets without restarting understanding. */
  convertibleTo: VisualThinkingDeliverable[];
  declinesMap: boolean;
  detailLevel: "essentials" | "guided" | "detailed";
  status: VisualThinkingExperiencePlanStatus;
  planVersion: "vts-experience-plan-1";
  createdAt: string;
  updatedAt: string;
};

export type ExperiencePlanOverride =
  | { kind: "set_primary_experience"; experience: VisualThinkingOrchestratorExperience }
  | { kind: "set_primary_deliverable"; deliverable: VisualThinkingDeliverable }
  | { kind: "remove_supporting"; deliverable: VisualThinkingDeliverable }
  | { kind: "set_supporting"; deliverables: VisualThinkingDeliverable[] }
  | { kind: "set_interaction_style"; style: VisualThinkingInteractionStyle }
  | { kind: "set_research_position"; position: VisualThinkingResearchPosition }
  | { kind: "set_detail"; detail: "essentials" | "guided" | "detailed" }
  | { kind: "confirm" };

export type ExperiencePlanPreviewProjection = {
  experienceLine: string;
  primaryDeliverableLine: string;
  supportingLines: string[];
  researchLine: string | null;
  interactionLine: string | null;
  stagesSummary: string;
  showSupporting: boolean;
};

function nowIso(): string {
  return new Date().toISOString();
}

function newId(): string {
  return `vtep_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function isMapDeliverable(d: VisualThinkingDeliverable): boolean {
  return (
    d === "relationship_visualization" ||
    d === "editable_relationship_map" ||
    d === "process_flow" ||
    d === "decision_tree"
  );
}

function uniqueDeliverables(
  items: VisualThinkingDeliverable[],
): VisualThinkingDeliverable[] {
  return [...new Set(items)];
}

/** Map Understanding output vocabulary → Orchestrator deliverable vocabulary. */
export function mapUnderstandingOutputToDeliverable(
  output: VisualThinkingUnderstandingOutput,
): VisualThinkingDeliverable {
  switch (output) {
    case "step_by_step_guide":
      return "step_by_step_guide";
    case "report":
      return "report";
    case "checklist":
      return "checklist";
    case "process_flow":
      return "process_flow";
    case "relationship_map":
      return "relationship_visualization";
    case "editable_visual_map":
    case "visual_thinking_map":
    case "mind_map":
      return "editable_relationship_map";
    case "comparison":
      return "comparison";
    case "timeline":
      return "timeline";
    case "decision_tree":
      return "decision_tree";
    case "training_guide":
      return "training_guide";
    case "sop":
      return "sop";
    case "action_plan":
      return "action_plan";
    case "learning_guide":
      return "learning_guide";
    case "simple_explanation":
    case "concise_explanation":
      return "concise_explanation";
    case "detailed_explanation":
      return "report";
    case "glossary":
      return "glossary";
    case "faq":
      return "faq";
    case "examples":
      return "examples";
    case "common_mistakes":
      return "common_mistakes";
    case "practice_activity":
      return "practice_exercise";
    case "quick_reference":
      return "quick_reference";
    case "questions_to_consider":
      return "questions_to_consider";
    case "cause_effect_map":
      return "relationship_visualization";
    default:
      return "summary";
  }
}

export function deliverableLabel(d: VisualThinkingDeliverable): string {
  const labels: Record<VisualThinkingDeliverable, string> = {
    step_by_step_guide: "step-by-step guide",
    report: "report",
    checklist: "checklist",
    process: "process",
    relationship_visualization: "relationship visualization",
    comparison: "comparison",
    timeline: "timeline",
    decision_tree: "decision tree",
    training_guide: "training guide",
    sop: "SOP",
    action_plan: "action plan",
    learning_guide: "learning guide",
    summary: "summary",
    glossary: "glossary",
    faq: "FAQ",
    examples: "examples",
    templates: "templates",
    practice_exercise: "practice exercise",
    reference_card: "reference card",
    common_mistakes: "common mistakes",
    decision_criteria: "decision criteria",
    editable_relationship_map: "editable relationship map",
    process_flow: "movable visual process",
    gap_analysis: "gap analysis",
    suggested_next_areas: "suggested next areas",
    quick_reference: "quick-reference summary",
    concise_explanation: "clear explanation",
    questions_to_consider: "questions to consider",
  };
  return labels[d] ?? d.replace(/_/g, " ");
}

export function experienceLabel(
  experience: VisualThinkingOrchestratorExperience,
): string {
  const labels: Record<VisualThinkingOrchestratorExperience, string> = {
    learning: "Guided Learning",
    research: "Research",
    understanding: "Understanding",
    organization: "Organization",
    comparison: "Comparison",
    decision_support: "Decision Support",
    planning: "Planning",
    creation: "Creation",
    teaching: "Teaching",
    troubleshooting: "Troubleshooting",
    documentation: "Documentation",
    exploration: "Exploration",
    visual_thinking: "Visual Thinking",
  };
  return labels[experience];
}

/**
 * Select ONE primary experience from Understanding fields only.
 * Does not parse rawRequest for goals or tasks.
 */
export function selectPrimaryExperience(
  understanding: VisualThinkingUnderstanding,
): VisualThinkingOrchestratorExperience {
  if (understanding.creationMode === "build_myself") {
    return "visual_thinking";
  }

  // Prefer goal when Understanding already classified it (no raw re-parse).
  switch (understanding.primaryGoal) {
    case "learn_how":
      return "learning";
    case "teach_others":
      return "teaching";
    case "document_process":
      return "documentation";
    case "research_topic":
      return "research";
    case "understand_topic":
    case "explain_something":
      return "understanding";
    case "organize_information":
      return "organization";
    case "see_relationships":
      return "visual_thinking";
    case "compare_options":
      return "comparison";
    case "make_decision":
      return "decision_support";
    case "plan_something":
      return "planning";
    case "troubleshoot":
      return "troubleshooting";
    case "create_something":
      return "creation";
    case "explore_possibilities":
      return "exploration";
    default:
      break;
  }

  return mapUnderstandingExperience(understanding.primaryExperience);
}

function mapUnderstandingExperience(
  experience: VisualThinkingPrimaryExperience,
): VisualThinkingOrchestratorExperience {
  switch (experience) {
    case "teaching":
      return "teaching";
    case "research":
      return "research";
    case "guided_creation":
      return "creation";
    case "user_led_creation":
      return "visual_thinking";
    case "visual_organization":
      return "organization";
    case "comparison":
      return "comparison";
    case "decision_support":
      return "decision_support";
    case "planning":
      return "planning";
    case "process_development":
      return "learning";
    case "explanation":
      return "understanding";
    case "troubleshooting":
      return "troubleshooting";
    default:
      return "understanding";
  }
}

export function selectResearchPosition(
  researchNeed: VisualThinkingResearchNeed,
  interactionStyle: VisualThinkingInteractionStyle,
): VisualThinkingResearchPosition {
  if (interactionStyle === "let_me_build") return "not_at_all";
  switch (researchNeed) {
    case "required":
      return "before_generation";
    case "optional":
      return "during_generation";
    case "not_needed":
      return "not_at_all";
    case "unclear":
      return "not_at_all";
    default:
      return "not_at_all";
  }
}

export function selectInteractionStyle(
  creationMode: VisualThinkingCreationMode,
): VisualThinkingInteractionStyle {
  switch (creationMode) {
    case "build_for_me":
      return "build_for_me";
    case "guide_me":
      return "guide_me";
    case "build_myself":
      return "let_me_build";
    case "unspecified":
    default:
      return "collaborate";
  }
}

function defaultEditingMode(): VisualThinkingEditingCapability[] {
  return [
    "editing",
    "expansion",
    "simplification",
    "replacement",
    "reordering",
    "conversion",
  ];
}

/** Future switching targets from the current primary deliverable. */
export function convertibleDeliverables(
  primary: VisualThinkingDeliverable,
  declinesMap: boolean,
): VisualThinkingDeliverable[] {
  const base: VisualThinkingDeliverable[] = (() => {
    switch (primary) {
      case "step_by_step_guide":
        return [
          "checklist",
          "process_flow",
          "training_guide",
          "sop",
          "summary",
          "quick_reference",
        ];
      case "training_guide":
      case "sop":
        return [
          "step_by_step_guide",
          "checklist",
          "process_flow",
          "summary",
          "learning_guide",
        ];
      case "report":
        return [
          "summary",
          "glossary",
          "faq",
          "relationship_visualization",
          "action_plan",
        ];
      case "comparison":
        return ["decision_tree", "decision_criteria", "summary", "report"];
      case "decision_tree":
        return ["comparison", "decision_criteria", "action_plan", "summary"];
      case "editable_relationship_map":
      case "relationship_visualization":
        return ["summary", "gap_analysis", "suggested_next_areas", "checklist"];
      case "checklist":
        return ["step_by_step_guide", "process_flow", "summary", "quick_reference"];
      default:
        return ["summary", "checklist", "report"];
    }
  })();

  return uniqueDeliverables(
    declinesMap ? base.filter((d) => !isMapDeliverable(d)) : base,
  ).filter((d) => d !== primary);
}

function suggestHandoffTargets(
  experience: VisualThinkingOrchestratorExperience,
): VisualThinkingHandoffTarget[] {
  switch (experience) {
    case "teaching":
    case "documentation":
      return ["knowledge_library", "create", "projects"];
    case "planning":
    case "decision_support":
      return ["projects", "board", "chamber_members"];
    case "research":
    case "understanding":
      return ["knowledge_library", "journal", "board"];
    case "visual_thinking":
    case "organization":
      return ["create", "business_estate", "projects"];
    case "creation":
      return ["create", "projects"];
    default:
      return ["knowledge_library", "journal"];
  }
}

function buildGenerationStages(input: {
  researchStage: VisualThinkingResearchPosition;
  interactionStyle: VisualThinkingInteractionStyle;
  primaryExperience: VisualThinkingOrchestratorExperience;
  hasSupporting: boolean;
}): VisualThinkingGenerationStage[] {
  if (input.interactionStyle === "let_me_build") {
    return ["prepare_user_led_canvas", "review", "return_to_user"];
  }

  const stages: VisualThinkingGenerationStage[] = [];
  if (input.researchStage === "before_generation") {
    stages.push("research");
  }
  if (
    input.primaryExperience === "organization" ||
    input.primaryExperience === "visual_thinking"
  ) {
    stages.push("organize");
  }
  if (input.researchStage === "during_generation") {
    stages.push("research");
  }
  stages.push("create_primary");
  if (input.hasSupporting) {
    stages.push("create_supporting");
  }
  stages.push("review", "return_to_user");
  return stages;
}

function estimateComplexity(input: {
  researchStage: VisualThinkingResearchPosition;
  supportingCount: number;
  detail: "essentials" | "guided" | "detailed";
  interactionStyle: VisualThinkingInteractionStyle;
}): VisualThinkingPlanComplexity {
  if (input.interactionStyle === "let_me_build") return "light";
  if (
    input.researchStage === "before_generation" ||
    input.supportingCount >= 3 ||
    input.detail === "detailed"
  ) {
    return "substantial";
  }
  if (input.supportingCount >= 1 || input.detail === "guided") {
    return "moderate";
  }
  return "light";
}

function estimateTime(
  complexity: VisualThinkingPlanComplexity,
): VisualThinkingPlanTime {
  switch (complexity) {
    case "light":
      return "brief";
    case "moderate":
      return "moderate";
    case "substantial":
      return "extended";
  }
}

function reviewPointsFor(input: {
  researchStage: VisualThinkingResearchPosition;
  interactionStyle: VisualThinkingInteractionStyle;
  hasSupporting: boolean;
}): string[] {
  if (input.interactionStyle === "let_me_build") {
    return ["Confirm the blank canvas is ready", "Member begins mapping"];
  }
  const points = ["Confirm primary deliverable before generation"];
  if (input.researchStage !== "not_at_all") {
    points.push("Review research need before drafting");
  }
  if (input.hasSupporting) {
    points.push("Confirm which supporting pieces to include");
  }
  points.push("Member reviews before any save or handoff");
  return points;
}

function experienceOrderFor(
  primary: VisualThinkingOrchestratorExperience,
): VisualThinkingOrchestratorExperience[] {
  return [primary];
}

/**
 * Build the execution plan from a canonical Understanding.
 * Never re-interprets rawRequest for goals, tasks, research, or knowledge.
 */
export function orchestrateVisualThinkingExperience(
  understanding: VisualThinkingUnderstanding,
): VisualThinkingExperiencePlan {
  const declinesMap = understanding.declinesMap;
  const interactionStyle = selectInteractionStyle(understanding.creationMode);
  const primaryExperience = selectPrimaryExperience(understanding);
  const researchStage = selectResearchPosition(
    understanding.researchNeed,
    interactionStyle,
  );

  let primaryDeliverable = mapUnderstandingOutputToDeliverable(
    understanding.recommendedPrimaryOutput,
  );
  let supportingDeliverables = uniqueDeliverables(
    understanding.recommendedSupportingOutputs.map(
      mapUnderstandingOutputToDeliverable,
    ),
  ).filter((d) => d !== primaryDeliverable);

  // Explicit exclusions from Understanding (no-map, build-myself).
  if (declinesMap) {
    if (isMapDeliverable(primaryDeliverable)) {
      primaryDeliverable =
        understanding.recommendedPrimaryOutput === "report"
          ? "report"
          : "summary";
    }
    supportingDeliverables = supportingDeliverables.filter(
      (d) => !isMapDeliverable(d),
    );
  }

  if (interactionStyle === "let_me_build") {
    primaryDeliverable = "editable_relationship_map";
    supportingDeliverables = [];
  }

  // Adaptive Companion limits visibility in preview — never mutates the plan set.

  const detailLevel: "essentials" | "guided" | "detailed" =
    understanding.effectiveDepth === "essentials"
      ? "essentials"
      : understanding.effectiveDepth === "detailed"
        ? "detailed"
        : "guided";

  const generationStages = buildGenerationStages({
    researchStage,
    interactionStyle,
    primaryExperience,
    hasSupporting: supportingDeliverables.length > 0,
  });

  const estimatedComplexity = estimateComplexity({
    researchStage,
    supportingCount: supportingDeliverables.length,
    detail: detailLevel,
    interactionStyle,
  });

  const timestamp = nowIso();
  return {
    id: newId(),
    understandingId: understanding.id,
    primaryExperience,
    primaryDeliverable,
    supportingDeliverables,
    experienceOrder: experienceOrderFor(primaryExperience),
    generationStages,
    researchStage,
    interactionStyle,
    editingMode: defaultEditingMode(),
    reviewPoints: reviewPointsFor({
      researchStage,
      interactionStyle,
      hasSupporting: supportingDeliverables.length > 0,
    }),
    handoffTargets: suggestHandoffTargets(primaryExperience),
    estimatedComplexity,
    estimatedTime: estimateTime(estimatedComplexity),
    userOverrides: {},
    convertibleTo: convertibleDeliverables(primaryDeliverable, declinesMap),
    declinesMap,
    detailLevel,
    status: "planned",
    planVersion: "vts-experience-plan-1",
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

/**
 * Apply a plan-level override without rebuilding Understanding.
 * Recomputes stages / convertible targets from the updated plan fields.
 */
export function applyExperiencePlanOverride(
  plan: VisualThinkingExperiencePlan,
  override: ExperiencePlanOverride,
): VisualThinkingExperiencePlan {
  const next: VisualThinkingExperiencePlan = {
    ...plan,
    userOverrides: { ...plan.userOverrides },
    status: "user_adjusted",
    updatedAt: nowIso(),
  };

  switch (override.kind) {
    case "set_primary_experience":
      next.primaryExperience = override.experience;
      next.userOverrides.primaryExperience = override.experience;
      next.experienceOrder = experienceOrderFor(override.experience);
      next.handoffTargets = suggestHandoffTargets(override.experience);
      break;
    case "set_primary_deliverable":
      next.primaryDeliverable = override.deliverable;
      next.userOverrides.primaryDeliverable = override.deliverable;
      next.supportingDeliverables = next.supportingDeliverables.filter(
        (d) => d !== override.deliverable,
      );
      next.convertibleTo = convertibleDeliverables(
        override.deliverable,
        next.declinesMap,
      );
      break;
    case "remove_supporting":
      next.supportingDeliverables = next.supportingDeliverables.filter(
        (d) => d !== override.deliverable,
      );
      next.userOverrides.removedSupporting = [
        ...(next.userOverrides.removedSupporting ?? []),
        override.deliverable,
      ];
      next.userOverrides.supportingDeliverables = next.supportingDeliverables;
      break;
    case "set_supporting":
      next.supportingDeliverables = uniqueDeliverables(
        override.deliverables.filter((d) => d !== next.primaryDeliverable),
      );
      if (next.declinesMap) {
        next.supportingDeliverables = next.supportingDeliverables.filter(
          (d) => !isMapDeliverable(d),
        );
      }
      next.userOverrides.supportingDeliverables = next.supportingDeliverables;
      break;
    case "set_interaction_style":
      next.interactionStyle = override.style;
      next.userOverrides.interactionStyle = override.style;
      if (override.style === "let_me_build") {
        next.primaryDeliverable = "editable_relationship_map";
        next.supportingDeliverables = [];
        next.researchStage = "not_at_all";
        next.primaryExperience = "visual_thinking";
        next.experienceOrder = ["visual_thinking"];
      }
      break;
    case "set_research_position":
      next.researchStage = override.position;
      next.userOverrides.researchPosition = override.position;
      break;
    case "set_detail":
      next.detailLevel = override.detail;
      next.userOverrides.detail = override.detail;
      break;
    case "confirm":
      next.status = "ready_to_generate";
      break;
  }

  next.generationStages = buildGenerationStages({
    researchStage: next.researchStage,
    interactionStyle: next.interactionStyle,
    primaryExperience: next.primaryExperience,
    hasSupporting: next.supportingDeliverables.length > 0,
  });
  next.estimatedComplexity = estimateComplexity({
    researchStage: next.researchStage,
    supportingCount: next.supportingDeliverables.length,
    detail: next.detailLevel,
    interactionStyle: next.interactionStyle,
  });
  next.estimatedTime = estimateTime(next.estimatedComplexity);
  next.reviewPoints = reviewPointsFor({
    researchStage: next.researchStage,
    interactionStyle: next.interactionStyle,
    hasSupporting: next.supportingDeliverables.length > 0,
  });
  next.convertibleTo = convertibleDeliverables(
    next.primaryDeliverable,
    next.declinesMap,
  );

  if (override.kind === "confirm") {
    next.status = "ready_to_generate";
  }

  return next;
}

/** Adaptive Companion visibility only — does not mutate the plan. */
export function visibleSupportingDeliverables(
  plan: VisualThinkingExperiencePlan,
): VisualThinkingDeliverable[] {
  const presentation = resolveAdaptivePresentation();
  return limitVisibleChoices(plan.supportingDeliverables, presentation).visible;
}

export function projectExperiencePlanPreview(
  plan: VisualThinkingExperiencePlan,
  understanding: VisualThinkingUnderstanding,
): ExperiencePlanPreviewProjection {
  const visible = visibleSupportingDeliverables(plan);
  const supportingLines = visible.map((d) => deliverableLabel(d));

  let researchLine: string | null = null;
  if (plan.researchStage === "before_generation") {
    researchLine =
      understanding.researchReason ??
      "I'll gather current information before building the primary result.";
  } else if (plan.researchStage === "during_generation") {
    researchLine =
      understanding.researchReason ??
      "I'll verify current details while building this.";
  }

  let interactionLine: string | null = null;
  switch (plan.interactionStyle) {
    case "let_me_build":
      interactionLine =
        "You'll build it yourself — Spark will prepare a blank editable space, not a finished result.";
      break;
    case "guide_me":
      interactionLine = "I'll walk you through creating this, step by step.";
      break;
    case "build_for_me":
      interactionLine = "I'll build the primary result for you to review.";
      break;
    case "collaborate":
      interactionLine = null;
      break;
  }

  const stagesSummary = plan.generationStages
    .map((s) => s.replace(/_/g, " "))
    .join(" → ");

  return {
    experienceLine: experienceLabel(plan.primaryExperience),
    primaryDeliverableLine: `A ${deliverableLabel(plan.primaryDeliverable)}.`,
    supportingLines,
    researchLine,
    interactionLine,
    stagesSummary,
    showSupporting:
      plan.supportingDeliverables.length > 0 &&
      plan.interactionStyle !== "let_me_build",
  };
}

/** Sync Understanding-facing recommendation copy from a plan (optional bridge). */
export function planPrimaryOutputLabel(plan: VisualThinkingExperiencePlan): string {
  return deliverableLabel(plan.primaryDeliverable);
}

/** Expose Understanding output labels for panel remove buttons that still use Understanding ids. */
export function understandingOutputsStillOnPlan(
  understanding: VisualThinkingUnderstanding,
  plan: VisualThinkingExperiencePlan,
): VisualThinkingUnderstandingOutput[] {
  const planned = new Set(plan.supportingDeliverables);
  return understanding.recommendedSupportingOutputs.filter((o) =>
    planned.has(mapUnderstandingOutputToDeliverable(o)),
  );
}

export function experiencePlanHonorsUnderstandingExclusions(
  plan: VisualThinkingExperiencePlan,
  understanding: VisualThinkingUnderstanding,
): boolean {
  if (understanding.declinesMap) {
    if (isMapDeliverable(plan.primaryDeliverable)) return false;
    if (plan.supportingDeliverables.some(isMapDeliverable)) return false;
  }
  if (understanding.creationMode === "build_myself") {
    if (plan.interactionStyle !== "let_me_build") return false;
    if (plan.researchStage !== "not_at_all") return false;
    if (plan.supportingDeliverables.length > 0) return false;
  }
  // Orchestrator must not invent extras beyond Understanding + intentional user-led map shell.
  if (plan.interactionStyle !== "let_me_build") {
    const allowed = new Set(
      [
        understanding.recommendedPrimaryOutput,
        ...understanding.recommendedSupportingOutputs,
      ].map(mapUnderstandingOutputToDeliverable),
    );
    if (!allowed.has(plan.primaryDeliverable) && plan.userOverrides.primaryDeliverable == null) {
      // Allow summary fallback when map declined
      if (!(understanding.declinesMap && plan.primaryDeliverable === "summary")) {
        return false;
      }
    }
    for (const s of plan.supportingDeliverables) {
      if (!allowed.has(s) && !(plan.userOverrides.supportingDeliverables ?? []).includes(s)) {
        return false;
      }
    }
  }
  return true;
}

/** Guard used in tests: Orchestrator must not call for raw-request goal inference. */
export function orchestratorConsumesUnderstandingContract(
  understanding: VisualThinkingUnderstanding,
): boolean {
  return Boolean(
    understanding.primaryGoal &&
      understanding.successDefinition &&
      understanding.cognitiveTasks &&
      understanding.userKnowledgeLevel &&
      understanding.effectiveDepth &&
      understanding.creationMode &&
      understanding.researchNeed &&
      understanding.recommendedPrimaryOutput,
  );
}

export function formatUnderstandingOutputForPlan(
  output: VisualThinkingUnderstandingOutput,
): string {
  return outputLabel(output);
}

/** Map goal type for typing completeness — unused by runtime orchestration path. */
export type _OrchestratorGoalPassthrough = VisualThinkingPrimaryGoal;
