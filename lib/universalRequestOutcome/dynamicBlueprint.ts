import type {
  DynamicCreationBlueprint,
  UniversalRequestUnderstanding,
} from "./types";

function newId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random()
    .toString(36)
    .slice(2, 8)}`;
}

/**
 * Build a creation blueprint whether or not an exact template exists.
 */
export function buildDynamicCreationBlueprint(
  u: UniversalRequestUnderstanding,
): DynamicCreationBlueprint {
  const dayCount =
    u.requestedDuration?.unit === "day"
      ? u.requestedDuration.value
      : u.requestedQuantity && u.creationFamily === "content_plan"
        ? u.requestedQuantity
        : null;

  const requiredSections: string[] = [];
  const inferredSections: string[] = [];
  const optionalSections: string[] = [];
  const requiredItems: string[] = [];
  const sequence: string[] = [];
  let itemCount = dayCount ?? u.requestedQuantity;

  if (u.creationFamily === "content_plan") {
    requiredSections.push(
      "overall_purpose",
      "audience_assumption",
      "content_progression",
      "engagement_strategy",
    );
    const days = dayCount ?? 5;
    itemCount = days;
    for (let d = 1; d <= days; d++) {
      requiredSections.push(`day_${d}`);
      requiredItems.push(
        `day_${d}_objective`,
        `day_${d}_topic`,
        `day_${d}_format`,
        `day_${d}_caption`,
        `day_${d}_cta`,
        `day_${d}_visual`,
      );
      sequence.push(`Day ${d}`);
    }
    optionalSections.push("metrics", "hashtags", "repurposing");
  } else if (
    u.creationFamily === "step_by_step_instructions" ||
    u.creationFamily === "guide"
  ) {
    requiredSections.push(
      "purpose",
      "what_is_needed",
      "preparation",
      "ordered_steps",
      "decision_points",
      "common_mistakes",
      "troubleshooting",
      "completion_check",
    );
    inferredSections.push("examples", "next_uses");
    sequence.push("Prepare", "Do", "Review", "Finish");
    itemCount = itemCount ?? 8;
  } else if (u.creationFamily === "program") {
    requiredSections.push(
      "purpose",
      "roles",
      "structure",
      "training",
      "schedule",
      "safety",
      "communication",
      "evaluation",
    );
    sequence.push("Design", "Prepare", "Run", "Evaluate");
  } else if (u.creationFamily === "handbook") {
    requiredSections.push(
      "welcome",
      "roles_expectations",
      "policies",
      "procedures",
      "resources",
      "contacts",
    );
  } else if (u.creationFamily === "comparison") {
    requiredSections.push("criteria", "options", "tradeoffs", "recommendation");
  } else if (u.creationFamily === "project_plan") {
    requiredSections.push(
      "phases",
      "milestones",
      "tasks",
      "dependencies",
      "decisions",
      "risks",
    );
  } else {
    requiredSections.push("purpose", "core_content", "next_steps");
    dynamicallyInferGenericSections(u, inferredSections);
  }

  return {
    id: newId("dcb"),
    requestUnderstandingId: u.id,
    creationFamily: u.creationFamily,
    creationSubtype: u.primaryDeliverable,
    purpose: u.desiredOutcome,
    intendedAudience: u.intendedAudience,
    desiredOutcome: u.desiredOutcome,
    primaryDeliverable: u.primaryDeliverable,
    supportingDeliverables: u.supportingDeliverables,
    requiredSections,
    inferredSections,
    optionalSections,
    requiredItems,
    itemCount,
    sequence,
    dependencies: [],
    researchRequirements: u.requiresResearch
      ? ["current_or_stable_domain_knowledge"]
      : [],
    userInformationRequirements: u.unresolvedEssentialQuestions,
    qualityCriteria: [
      "preserves_explicit_qualifiers",
      "substantive_not_outline_only",
      "no_single_artifact_collapse_when_series",
    ],
    completionCriteria: [
      "primary_deliverable_populated",
      "substance_validation_passed",
    ],
    substanceCriteria:
      u.creationFamily === "content_plan"
        ? [
            "distinct_day_count_matches_request",
            "each_day_has_objective_topic_format_caption_cta_visual",
            "plan_level_purpose_present",
          ]
        : u.qualifiers.stepByStep
          ? [
              "multiple_ordered_steps",
              "preparation_and_completion",
              "not_outline_only",
            ]
          : ["meaningful_sections"],
    specializedProfileId: null,
    reusablePatternId:
      u.creationFamily === "content_plan"
        ? "pattern_content_plan_multi_day"
        : u.qualifiers.stepByStep
          ? "pattern_step_by_step_guide"
          : null,
    dynamicallyInferred: true,
    destinationOptions: [
      "create",
      "projects",
      "visual_thinking",
      "strategic_planning",
      "research",
    ],
  };
}

function dynamicallyInferGenericSections(
  u: UniversalRequestUnderstanding,
  inferred: string[],
): void {
  inferred.push("context", "main_body", "practical_application");
  if (u.requiresResearch) inferred.push("evidence_notes");
  if (u.requiresExecutionPlanning) inferred.push("implementation_outline");
}
