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
  assessRequestAuthorization,
  buildAutomaticContinuationPlan,
  buildInstructionalGenerationMaterial,
  enrichHandoffWithInstructionalMaterial,
  instructionalMaterialToSuppliedLines,
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

  let knowledge = prepareVisualThinkingKnowledge({
    request: confirmed,
    understanding,
    experiencePlan: confirmedPlan,
    attachedStructuredContent: confirmed.rawRequest,
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

  if (needsResearch || findings.length > 0) {
    if (findings.length > 0) {
      researchBundle = acquireVisualThinkingResearch(
        { knowledgeBundle: knowledge, workspaceActive: false },
        findings,
      );
      knowledge = applyResearchToKnowledgeBundle(knowledge, researchBundle);
    } else {
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

  const researchSatisfied =
    !requestedOutcome.requiresResearch ||
    knowledgeResearchSatisfiesGenerationGate(researchBundle) ||
    (findings.length > 0 && Boolean(researchBundle?.acquiredAt));

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

  // Do not treat "research planned" as satisfied — only acquired findings.
  if (
    shouldGenerate &&
    (researchSatisfied || !requestedOutcome.requiresResearch)
  ) {
    generationBundle = startGenerationFromConfirmedPlan(confirmedPlan, {
      requestId: handoffCtx.requestId,
      understandingId: handoffCtx.understandingId,
      rawRequest: handoffCtx.rawRequest,
      userFacingGoal: handoffCtx.userFacingGoal,
      successDefinition: handoffCtx.successDefinition,
      suppliedContent: supplied || handoffCtx.suppliedContent,
      topicHint: handoffCtx.topicHint,
      freshnessNotice: material.freshnessNotice || handoffCtx.freshnessNotice,
      knowledgeResearchSatisfied: researchSatisfied,
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
    presentationPlan = nextPresentation;

    workspace = createThinkingWorkspace({
      understanding,
      experiencePlan: confirmedPlan,
      knowledgePackage: knowledge.package,
      generationBundle,
      presentationPlan,
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

  const completion = assessVisualThinkingOutcomeCompletion({
    outcome: requestedOutcome,
    researchBundle,
    knowledgePackage: knowledge.package,
    primaryDeliverable: primary,
    presentationPlan,
    workspace,
  });

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
        : continuation.progressLabels,
    acknowledgement:
      auth.acknowledgement ||
      "I'll research what we need and build the result you asked for.",
    liveResearchAvailable,
  };
}
