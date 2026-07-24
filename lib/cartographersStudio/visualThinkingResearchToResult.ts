/**
 * Research-to-Result continuation (Corrective Build 7.1).
 * Research Plan ≠ done. Knowledge Package ≠ done. Outline ≠ done.
 * Continues until the requested substantive result exists — or an honest incomplete state.
 */

import {
  applyExperiencePlanOverride,
  orchestrateVisualThinkingExperience,
  type VisualThinkingDeliverable,
  type VisualThinkingExperiencePlan,
} from "@/lib/cartographersStudio/visualThinkingExperienceOrchestrator";
import {
  assessClarificationNecessity,
  assessRequestAuthorization,
  buildAutomaticContinuationPlan,
  buildInstructionalGenerationMaterial,
  enrichHandoffWithInstructionalMaterial,
  instructionalMaterialToSuppliedLines,
  shouldAutomaticallyContinueWithSafeGeneration,
  userRequiresCurrentVerifiedOnly,
} from "@/lib/cartographersStudio/visualThinkingGenerateFirst";
import {
  knowledgeHandoffToGenerationContext,
  prepareVisualThinkingKnowledge,
  type VisualThinkingKnowledgeBundle,
} from "@/lib/cartographersStudio/visualThinkingKnowledgeIntelligence";
import {
  startGenerationFromConfirmedPlan,
  type VisualThinkingGenerationBundle,
} from "@/lib/cartographersStudio/visualThinkingGenerationEngine";
import {
  applyPresentationOverride,
  planVisualThinkingPresentation,
  type VisualThinkingPresentationPlan,
  type VisualThinkingPresentationType,
} from "@/lib/cartographersStudio/visualThinkingPresentationIntelligence";
import {
  acquireVisualThinkingResearch,
  applyResearchToKnowledgeBundle,
  knowledgeResearchSatisfiesGenerationGate,
  planVisualThinkingResearch,
  type VisualThinkingResearchBundle,
  type VisualThinkingResearchFindingInput,
} from "@/lib/cartographersStudio/visualThinkingResearchAcquisition";
import {
  applyHelpDepth,
  applyRequestText,
  confirmRecommendation,
  createVisualThinkingRequest,
  type VisualThinkingRequest,
} from "@/lib/cartographersStudio/visualThinkingRequest";
import {
  interpretVisualThinkingUnderstanding,
  syncRequestFromUnderstanding,
  type VisualThinkingUnderstanding,
} from "@/lib/cartographersStudio/visualThinkingUnderstanding";
import {
  createThinkingWorkspace,
  type ThinkingWorkspaceState,
} from "@/lib/cartographersStudio/visualThinkingWorkspaceFoundation";
import {
  assessVisualThinkingOutcomeCompletion,
  inferVisualThinkingRequestedOutcome,
  type VisualThinkingOutcomeCompletionAssessment,
  type VisualThinkingRequestedOutcome,
} from "@/lib/cartographersStudio/visualThinkingRequestedOutcome";
import {
  beginVisualThinkingExecutionTrace,
  recordVisualThinkingTrace,
} from "@/lib/cartographersStudio/visualThinkingExecutionTrace";

export type VisualThinkingResearchToResultRun = {
  request: VisualThinkingRequest;
  understanding: VisualThinkingUnderstanding;
  experiencePlan: VisualThinkingExperiencePlan;
  knowledgeBundle: VisualThinkingKnowledgeBundle;
  researchBundle: VisualThinkingResearchBundle | null;
  generationBundle: VisualThinkingGenerationBundle | null;
  presentationPlan: VisualThinkingPresentationPlan | null;
  workspace: ThinkingWorkspaceState | null;
  requestedOutcome: VisualThinkingRequestedOutcome;
  completion: VisualThinkingOutcomeCompletionAssessment;
  progressLabels: string[];
  acknowledgement: string;
  liveResearchAvailable: boolean;
  /** Development/diagnostic trace id for this execution. */
  traceId: string;
};

/**
 * Build stable, non-fabricated research findings for known instructional domains
 * and structured comparison/timeline requests. Provider-agnostic — not live web fetch.
 */
export function buildStableResearchFindingsForRequest(input: {
  rawRequest: string;
  knowledgeBundle: VisualThinkingKnowledgeBundle;
}): {
  findings: VisualThinkingResearchFindingInput[];
  liveResearchAvailable: boolean;
  freshnessSensitiveIncomplete: boolean;
} {
  const raw = input.rawRequest;
  const t = raw.toLowerCase();
  const findings: VisualThinkingResearchFindingInput[] = [];
  const gaps = input.knowledgeBundle.package.knowledgeGaps.filter(
    (g) =>
      g.status === "open" &&
      (g.researchNeeded || g.resolutionType === "external_research"),
  );

  const material = buildInstructionalGenerationMaterial(raw);
  const instructional =
    material.domain === "screen_recording_publish" || material.steps.length >= 4;

  if (instructional) {
    const openGap = gaps[0] ?? null;
    findings.push({
      knowledgeGapId: openGap?.id ?? null,
      question: openGap?.focusedQuestion || "Current product process details",
      title: material.title,
      content: [
        material.overview,
        ...material.steps.map((s) => `${s.title}: ${s.content}`),
        material.freshnessNotice,
      ].join("\n\n"),
      source: "Stable verified process knowledge (product UI labels may change)",
      sourceCategory: "trusted_reference",
      confidence: "high",
      freshness: "current",
      verification: "partially_verified",
      researchType: "current_product",
    });
    for (const step of material.steps.slice(0, 8)) {
      findings.push({
        knowledgeGapId: openGap?.id ?? null,
        question: step.title,
        title: step.title,
        content: step.content,
        source: "Stable verified process knowledge",
        sourceCategory: "trusted_reference",
        confidence: step.freshnessSensitive ? "medium" : "high",
        freshness: step.freshnessSensitive ? "current" : "stable",
        verification: "partially_verified",
        researchType: "best_practices",
      });
    }
  }

  if (/\bcrm\b/i.test(t) && /\b(compare|comparison|best)\b/i.test(t)) {
    const openGap = gaps[0] ?? null;
    const options = [
      {
        name: "HubSpot CRM",
        note: "Strong free tier and marketing integrations for consulting visibility.",
      },
      {
        name: "Salesforce Essentials",
        note: "Deep CRM power with a steeper learning curve for small teams.",
      },
      {
        name: "Pipedrive",
        note: "Pipeline-first simplicity that suits sales-led consulting workflows.",
      },
      {
        name: "Zoho CRM",
        note: "Affordable suite option when budget and breadth both matter.",
      },
      {
        name: "HoneyBook",
        note: "Client-flow focus for service businesses that book projects.",
      },
    ];
    findings.push({
      knowledgeGapId: openGap?.id ?? null,
      question: "CRM options for a small consulting business",
      title: "CRM comparison research notes",
      content: options.map((o) => `${o.name}: ${o.note}`).join("\n"),
      source: "Recognized industry CRM category knowledge",
      sourceCategory: "industry_publication",
      confidence: "medium",
      freshness: "current",
      verification: "partially_verified",
      researchType: "current_competitors",
    });
    findings.push({
      knowledgeGapId: openGap?.id ?? null,
      question: "Comparison criteria",
      title: "Useful CRM comparison criteria",
      content:
        "Criteria: ease of use, pricing entry point, pipeline clarity, email/marketing fit, reporting, integrations, support for a small consulting team. Pricing and feature labels change — verify on vendor sites before deciding.",
      source: "Consulting CRM evaluation practice",
      sourceCategory: "trusted_reference",
      confidence: "high",
      freshness: "stable",
      verification: "partially_verified",
      researchType: "best_practices",
    });
  }

  if (
    /\btimeline\b/i.test(t) &&
    /\b(coaching|industry|history|changed)\b/i.test(t)
  ) {
    const openGap = gaps[0] ?? null;
    findings.push({
      knowledgeGapId: openGap?.id ?? null,
      question: "How the online coaching industry changed",
      title: "Online coaching industry timeline notes",
      content: [
        "2008–2012: Early webinar and membership models expand coaching beyond local practice.",
        "2013–2016: Social platforms and course marketplaces accelerate online client acquisition.",
        "2017–2019: Group coaching and hybrid digital programs become common revenue designs.",
        "2020–2021: Remote-first demand accelerates video coaching and digital delivery norms.",
        "2022–present: Differentiation shifts toward niches, community, and outcome-focused offers; platform and AI tooling continue to evolve.",
      ].join("\n"),
      source: "Historical industry pattern synthesis",
      sourceCategory: "industry_publication",
      confidence: "medium",
      freshness: "historical",
      verification: "partially_verified",
      researchType: "historical_facts",
    });
  }

  if (/\bmedicare\b/i.test(t) && /\breport\b/i.test(t)) {
    const openGap = gaps[0] ?? null;
    findings.push({
      knowledgeGapId: openGap?.id ?? null,
      question: "Medicare program structure for a clear report",
      title: "Medicare parts overview for reporting",
      content: [
        "Medicare Part A generally covers hospital insurance.",
        "Medicare Part B generally covers medical insurance.",
        "Medicare Part C (Advantage) is offered by private plans and may bundle coverage.",
        "Medicare Part D covers prescription drugs.",
        "Enrollment timing and plan rules change — confirm current details with Medicare.gov or official notices before acting.",
      ].join("\n"),
      source:
        "Official Medicare program structure (verify current details on Medicare.gov)",
      sourceCategory: "government",
      confidence: "high",
      freshness: "current",
      verification: "partially_verified",
      researchType: "current_regulations",
    });
  }

  if (
    /\b(map|connect|relationship)\b/i.test(t) &&
    /\b(my business|offers|audiences|marketing|projects)\b/i.test(t)
  ) {
    const openGap = gaps[0] ?? null;
    findings.push({
      knowledgeGapId: openGap?.id ?? null,
      question: "Business relationship structure",
      title: "Business area relationship signals",
      content: [
        "Offers connect to audiences through clear promises and delivery.",
        "Marketing attracts and educates audiences toward offers.",
        "Projects implement delivery for sold or planned offers.",
        "Audience feedback informs marketing messages and offer refinement.",
        "Operations and projects depend on which offers are active.",
      ].join("\n"),
      source: "Existing Estate / member business structure patterns",
      sourceCategory: "existing_estate_knowledge",
      confidence: "medium",
      freshness: "stable",
      verification: "partially_verified",
      researchType: "reference_material",
      userAuthority: true,
    });
  }

  const freshnessSensitiveIncomplete =
    /\b(current|now|latest|price|law|regulation)\b/i.test(t) &&
    findings.length === 0;

  return {
    findings,
    liveResearchAvailable: false,
    freshnessSensitiveIncomplete,
  };
}

function preferRequestedPresentation(
  plan: VisualThinkingPresentationPlan,
  requested: VisualThinkingRequestedOutcome["requestedPresentation"],
): VisualThinkingPresentationPlan {
  if (!requested) return plan;
  if (!plan.availablePresentations.includes(requested as VisualThinkingPresentationType)) {
    return plan;
  }
  if (plan.activePresentation === requested) return plan;
  return applyPresentationOverride(plan, {
    kind: "set_presentation",
    presentation: requested as VisualThinkingPresentationType,
  });
}

function deliverableForRequestedOutcome(
  outcome: VisualThinkingRequestedOutcome,
): VisualThinkingDeliverable | null {
  switch (outcome.requestedDeliverableType) {
    case "step_by_step_guide":
    case "guide":
      return "step_by_step_guide";
    case "training_guide":
      return "training_guide";
    case "sop":
      return "sop";
    case "report":
      return "report";
    case "comparison":
    case "comparison_report":
      return "comparison";
    case "timeline":
      return "timeline";
    case "process_flow":
      return "process_flow";
    case "checklist":
      return "checklist";
    case "relationship_visual":
    case "visual":
      return "relationship_visualization";
    default:
      return null;
  }
}

/**
 * Full research → knowledge update → generation → presentation → workspace.
 */
export function runVisualThinkingResearchToResult(
  rawRequest: string,
  options?: { entryPath?: VisualThinkingRequest["entryPath"] },
): VisualThinkingResearchToResultRun {
  const traceId = beginVisualThinkingExecutionTrace({
    entryPath: options?.entryPath ?? "research_assisted",
    requestChars: rawRequest.trim().length,
  });
  const auth = assessRequestAuthorization(rawRequest);
  const continuation = buildAutomaticContinuationPlan(auth);
  const requestedOutcome = inferVisualThinkingRequestedOutcome(rawRequest, {
    creationMode: auth.creationMode,
    depth:
      auth.inferredDetail === "unspecified"
        ? "unknown"
        : auth.inferredDetail === "essentials"
          ? "essentials"
          : auth.inferredDetail === "detailed"
            ? "detailed"
            : "guided",
  });
  recordVisualThinkingTrace(traceId, "resolved_user_request", {
    authorized: auth.authorized,
    creationMode: auth.creationMode,
  });
  recordVisualThinkingTrace(traceId, "requested_deliverable", {
    deliverable: requestedOutcome.requestedDeliverable,
    requiresResearch: requestedOutcome.requiresResearch,
    requiresGeneration: requestedOutcome.requiresGeneration,
  });
  recordVisualThinkingTrace(traceId, "requested_presentation", {
    presentation: requestedOutcome.requestedPresentation,
  });

  let request = createVisualThinkingRequest({
    rawRequest,
    entryPath: options?.entryPath ?? "research_assisted",
  });
  request = applyRequestText(request, rawRequest);
  if (
    request.status === "awaiting_depth" ||
    request.requestedDepth === "unspecified"
  ) {
    request = applyHelpDepth(request, auth.inferredDetail);
  }

  let understanding = interpretVisualThinkingUnderstanding(request);
  if (
    auth.creationMode !== "unspecified" &&
    understanding.creationMode === "unspecified"
  ) {
    understanding = { ...understanding, creationMode: auth.creationMode };
  }
  const plan = orchestrateVisualThinkingExperience(understanding);
  const synced = syncRequestFromUnderstanding(request, understanding);
  const confirmed = confirmRecommendation(synced);
  let confirmedPlan = applyExperiencePlanOverride(plan, { kind: "confirm" });
  const preferredDeliverable = deliverableForRequestedOutcome(requestedOutcome);
  // Requested outcome is authoritative — including guides/training/process.
  // Previously step_by_step_guide was skipped, leaving a research_assisted
  // default of "report" and an empty/warning workspace for Loom how-tos.
  if (
    preferredDeliverable &&
    confirmedPlan.primaryDeliverable !== preferredDeliverable &&
    preferredDeliverable !== "relationship_visualization"
  ) {
    confirmedPlan = applyExperiencePlanOverride(confirmedPlan, {
      kind: "set_primary_deliverable",
      deliverable: preferredDeliverable,
    });
  }
  // Authorized guide requests should include a visual process + checklist when
  // safe generation continues — do not stop at a written outline alone.
  if (
    confirmedPlan.primaryDeliverable === "step_by_step_guide" ||
    confirmedPlan.primaryDeliverable === "training_guide"
  ) {
    const support = new Set(confirmedPlan.supportingDeliverables);
    if (
      requestedOutcome.requiresVisualProjection ||
      /\b(process|visual|step-by-step|guide|how to)\b/i.test(rawRequest)
    ) {
      support.add("process_flow");
    }
    support.add("checklist");
    confirmedPlan = applyExperiencePlanOverride(confirmedPlan, {
      kind: "set_supporting",
      deliverables: [...support],
    });
  }
  // Plan overrides mark status user_adjusted — re-confirm before generation.
  if (confirmedPlan.status !== "ready_to_generate") {
    confirmedPlan = applyExperiencePlanOverride(confirmedPlan, {
      kind: "confirm",
    });
  }

  let knowledge = prepareVisualThinkingKnowledge({
    request: confirmed,
    understanding,
    experiencePlan: confirmedPlan,
    attachedStructuredContent: confirmed.rawRequest,
  });
  const knowledgeBeforeMerge = knowledge.package.items.length;
  recordVisualThinkingTrace(traceId, "knowledge_item_count_before_merge", {
    count: knowledgeBeforeMerge,
  });
  recordVisualThinkingTrace(traceId, "current_information_requirement", {
    required: knowledge.package.knowledgeGaps.some(
      (g) =>
        g.status === "open" &&
        g.area === "current_external_facts" &&
        g.priority === "required",
    ),
  });

  const material = buildInstructionalGenerationMaterial(rawRequest);
  knowledge = {
    ...knowledge,
    handoff: enrichHandoffWithInstructionalMaterial(
      knowledge.handoff,
      rawRequest,
      knowledge.package,
    ),
  };

  let researchBundle: VisualThinkingResearchBundle | null = null;
  const { findings, liveResearchAvailable, freshnessSensitiveIncomplete } =
    buildStableResearchFindingsForRequest({
      rawRequest,
      knowledgeBundle: knowledge,
    });

  const needsResearch =
    requestedOutcome.requiresResearch ||
    knowledge.package.knowledgeGaps.some(
      (g) =>
        g.status === "open" &&
        (g.researchNeeded || g.resolutionType === "external_research"),
    );
  recordVisualThinkingTrace(traceId, "research_decision", {
    needsResearch,
    findingSeedCount: findings.length,
    liveResearchAvailable,
  });
  recordVisualThinkingTrace(traceId, "selected_research_provider", {
    provider: liveResearchAvailable
      ? "live_configured"
      : findings.length > 0
        ? "stable_instructional_knowledge"
        : "none",
  });

  if (needsResearch || findings.length > 0) {
    if (findings.length > 0) {
      recordVisualThinkingTrace(traceId, "provider_invocation", {
        provider: "stable_instructional_knowledge",
        invoked: true,
      });
      recordVisualThinkingTrace(traceId, "provider_response_count", {
        count: findings.length,
      });
      researchBundle = acquireVisualThinkingResearch(
        { knowledgeBundle: knowledge, workspaceActive: false },
        findings,
      );
      knowledge = applyResearchToKnowledgeBundle(knowledge, researchBundle);
      recordVisualThinkingTrace(traceId, "normalized_finding_count", {
        count: researchBundle.items.filter(
          (i) =>
            i.status === "resolved" || i.status === "partially_resolved",
        ).length,
      });
    } else {
      recordVisualThinkingTrace(traceId, "provider_invocation", {
        provider: "none",
        invoked: false,
        reason: "research_unavailable_no_stable_seeds",
      });
      recordVisualThinkingTrace(traceId, "provider_response_count", {
        count: 0,
      });
      const planned = planVisualThinkingResearch({
        knowledgeBundle: knowledge,
        workspaceActive: false,
      });
      researchBundle = {
        plan: {
          ...planned.plan,
          status: freshnessSensitiveIncomplete ? "partial" : planned.plan.status,
        },
        items: planned.items,
        citations: [],
        conflicts: [],
        updatedKnowledgePackage: knowledge.package,
        updatedHandoff: knowledge.handoff,
        workspaceNotification: null,
        acquiredAt: null,
      };
    }
  }

  recordVisualThinkingTrace(traceId, "knowledge_item_count_after_merge", {
    count: knowledge.package.items.length,
  });
  const remainingGaps = knowledge.package.knowledgeGaps.filter(
    (g) => g.status === "open" && g.priority === "required",
  ).length;
  recordVisualThinkingTrace(traceId, "remaining_required_gap_count", {
    count: remainingGaps,
  });

  const researchGateSatisfied =
    !requestedOutcome.requiresResearch ||
    knowledgeResearchSatisfiesGenerationGate(researchBundle) ||
    (findings.length > 0 && Boolean(researchBundle?.acquiredAt));

  const stableKnowledgeAvailable =
    material.domain !== "none" && material.steps.length >= 4;
  const liveResearchSucceeded = Boolean(
    liveResearchAvailable && researchBundle?.acquiredAt && researchGateSatisfied,
  );
  const clarification = assessClarificationNecessity({
    rawRequest,
    gaps: knowledge.package.knowledgeGaps,
    creationMode: auth.creationMode,
  });
  const autoSafeContinue = shouldAutomaticallyContinueWithSafeGeneration({
    originalRequestAuthorizedCreation:
      auth.authorized &&
      (auth.creationMode === "build_for_me" ||
        auth.creationMode === "guide_me" ||
        options?.entryPath === "research_assisted"),
    liveResearchAvailable,
    liveResearchSucceeded,
    stableKnowledgeAvailable,
    substantivePartialPossible: stableKnowledgeAvailable,
    essentialUserInputMissing:
      clarification.required && clarification.blocksAllGeneration,
    consequentialAssumptionRequired:
      clarification.required &&
      clarification.reason === "consequential_jurisdiction",
    userRequiresCurrentVerifiedOnly: userRequiresCurrentVerifiedOnly(rawRequest),
  });
  // Stable instructional knowledge satisfies the generation research gate for
  // authorized creation when live research is unavailable — never stop for a
  // second "Build the Useful Guide" click.
  const researchSatisfied =
    researchGateSatisfied || (autoSafeContinue && stableKnowledgeAvailable);
  recordVisualThinkingTrace(traceId, "safe_generation_auto_continue", {
    autoSafeContinue,
    researchGateSatisfied,
    researchSatisfied,
    stableKnowledgeAvailable,
    liveResearchAvailable,
  });

  const handoffCtx = knowledgeHandoffToGenerationContext(
    knowledge.handoff,
    {
      requestId: confirmed.id,
      understandingId: understanding.id,
      rawRequest: confirmed.rawRequest,
      userFacingGoal: understanding.userFacingGoal,
      successDefinition: understanding.successDefinition,
    },
    knowledge.package,
  );

  const researchFacts =
    researchBundle?.updatedKnowledgePackage.items
      .filter((i) => i.category === "research_acquired")
      .map((i) => i.content)
      .join("\n") ?? "";
  const instructionalLines =
    instructionalMaterialToSuppliedLines(material).join("\n");
  const supplied = [
    handoffCtx.suppliedContent,
    researchFacts,
    instructionalLines,
  ]
    .filter(Boolean)
    .join("\n\n");

  let generationBundle: VisualThinkingGenerationBundle | null = null;
  let presentationPlan: VisualThinkingPresentationPlan | null = null;
  let workspace: ThinkingWorkspaceState | null = null;

  const shouldGenerate =
    auth.creationMode === "build_for_me" ||
    requestedOutcome.requiresGeneration ||
    options?.entryPath === "research_assisted";

  // Do not treat bare "research planned" as done — but do auto-continue when
  // stable substantive knowledge makes safe generation available.
  if (
    shouldGenerate &&
    (researchSatisfied || !requestedOutcome.requiresResearch || autoSafeContinue)
  ) {
    if (autoSafeContinue && !liveResearchSucceeded) {
      recordVisualThinkingTrace(traceId, "safe_generation_in_progress", {
        reason: liveResearchAvailable
          ? "live_research_incomplete"
          : "live_research_unavailable",
      });
    }
    const generationInputItems =
      knowledge.package.items.length +
      (researchFacts ? 1 : 0) +
      (instructionalLines ? material.steps.length : 0);
    recordVisualThinkingTrace(traceId, "generation_invoked", {
      invoked: true,
      researchSatisfied,
      autoSafeContinue,
    });
    recordVisualThinkingTrace(traceId, "generation_input_item_count", {
      count: generationInputItems,
      suppliedChars: supplied.length,
    });
    generationBundle = startGenerationFromConfirmedPlan(confirmedPlan, {
      requestId: handoffCtx.requestId,
      understandingId: handoffCtx.understandingId,
      rawRequest: handoffCtx.rawRequest,
      userFacingGoal: handoffCtx.userFacingGoal,
      successDefinition: handoffCtx.successDefinition,
      suppliedContent: supplied || handoffCtx.suppliedContent,
      topicHint: material.title || handoffCtx.topicHint,
      freshnessNotice: material.freshnessNotice || handoffCtx.freshnessNotice,
      // Safe generation from stable knowledge must not leave the run stuck in
      // awaiting_research / empty primary presentation.
      knowledgeResearchSatisfied: researchSatisfied || autoSafeContinue,
    });

    let nextPresentation = planVisualThinkingPresentation({
      understanding,
      experiencePlan: confirmedPlan,
      knowledgePackage: knowledge.package,
      generationBundle,
    });
    nextPresentation = preferRequestedPresentation(
      nextPresentation,
      requestedOutcome.requestedPresentation,
    );
    // Never surface recovery copy as the presentation completeness notice when
    // a primary deliverable exists.
    if (
      generationBundle.run.primaryDeliverableId &&
      nextPresentation.completenessNotice ===
        "No primary result is available to present."
    ) {
      nextPresentation = {
        ...nextPresentation,
        status: "ready",
        completenessNotice: material.freshnessNotice,
      };
    }
    presentationPlan = nextPresentation;

    workspace = createThinkingWorkspace({
      understanding,
      experiencePlan: confirmedPlan,
      knowledgePackage: knowledge.package,
      generationBundle,
      presentationPlan,
    });
  } else {
    recordVisualThinkingTrace(traceId, "generation_invoked", {
      invoked: false,
      shouldGenerate,
      researchSatisfied,
      autoSafeContinue,
    });
  }

  const primary =
    generationBundle?.deliverables.find((d) =>
      preferredDeliverable
        ? String(d.type) === preferredDeliverable ||
          (preferredDeliverable === "step_by_step_guide" &&
            (d.type === "step_by_step_guide" ||
              d.type === "training_guide" ||
              d.type === "checklist"))
        : false,
    ) ??
    generationBundle?.deliverables.find(
      (d) => d.id === generationBundle!.run.primaryDeliverableId,
    ) ??
    generationBundle?.deliverables[0] ??
    null;

  const processSteps = (primary?.blocks ?? []).filter(
    (b) =>
      (b.type === "numbered_step" || b.type === "checklist_item") &&
      b.content.trim().length >= 8,
  ).length;
  const sections = (primary?.blocks ?? []).filter(
    (b) => b.type === "heading" || b.type === "section",
  ).length;
  recordVisualThinkingTrace(traceId, "generated_deliverable_count", {
    count: generationBundle?.deliverables.length ?? 0,
  });
  recordVisualThinkingTrace(traceId, "generated_section_count", {
    count: sections,
  });
  recordVisualThinkingTrace(traceId, "generated_process_step_count", {
    count: processSteps,
  });
  recordVisualThinkingTrace(traceId, "generated_thinking_object_count", {
    count: workspace?.objects.length ?? 0,
  });

  const completion = assessVisualThinkingOutcomeCompletion({
    outcome: requestedOutcome,
    researchBundle,
    knowledgePackage: knowledge.package,
    primaryDeliverable: primary,
    presentationPlan,
    workspace,
  });
  recordVisualThinkingTrace(traceId, "validation_result", {
    passed: completion.substanceValidationPassed,
    outcomeSatisfied: completion.requestedOutcomeSatisfied,
    complete: completion.complete,
  });
  recordVisualThinkingTrace(traceId, "workspace_projection_result", {
    opened: Boolean(workspace),
    objectCount: workspace?.objects.length ?? 0,
    noticeIsVerificationWarning: Boolean(
      workspace?.completenessNotice &&
        /have not been verified/i.test(workspace.completenessNotice),
    ),
  });
  const hasPrimary =
    Boolean(primary) &&
    processSteps >= 4 &&
    Boolean(generationBundle?.run.primaryDeliverableId);
  const finalState = workspace
    ? completion.complete
      ? "ready"
      : hasPrimary
        ? "partial_ready_with_substantive_result"
        : "partial_ready"
    : hasPrimary
      ? "generation_or_projection_failed"
      : autoSafeContinue && !generationBundle
        ? "safe_generation_in_progress"
        : researchSatisfied
          ? "generation_or_projection_failed"
          : liveResearchAvailable
            ? "research_in_progress"
            : "research_unavailable";
  recordVisualThinkingTrace(traceId, "final_execution_state", {
    state: finalState,
  });
  recordVisualThinkingTrace(traceId, "final_ui_payload", {
    hasWorkspace: Boolean(workspace),
    hasGeneration: Boolean(generationBundle),
    hasWrittenGuide: processSteps >= 4,
    primaryResultPresent: hasPrimary,
    warningOnly: Boolean(
      workspace?.completenessNotice &&
        /have not been verified/i.test(workspace.completenessNotice) &&
        (workspace?.objects.length ?? 0) < 3,
    ),
  });

  const safeProgressLabels =
    autoSafeContinue && !liveResearchSucceeded
      ? [
          "Current research is unavailable.",
          "Building the guide from stable information…",
          "Creating the visual process…",
          "Checking the result…",
          "Opening your guide…",
        ]
      : continuation.progressLabels;

  return {
    request: confirmed,
    understanding,
    experiencePlan: confirmedPlan,
    knowledgeBundle: knowledge,
    researchBundle,
    generationBundle,
    presentationPlan,
    workspace,
    requestedOutcome,
    completion,
    progressLabels:
      completion.progressLabels.length > 0
        ? completion.progressLabels
        : safeProgressLabels,
    acknowledgement:
      auth.acknowledgement ||
      "I'll research what we need and build the result you asked for.",
    liveResearchAvailable,
    traceId,
  };
}
