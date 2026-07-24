/**
 * Visual Thinking Presentation Intelligence tests (Build 6).
 * @vitest-environment node
 */
import { beforeEach, describe, expect, it } from "vitest";
import {
  applyRequestText,
  clearVisualThinkingRequestDraft,
  createVisualThinkingRequest,
} from "@/lib/cartographersStudio/visualThinkingRequest";
import { interpretVisualThinkingUnderstanding } from "@/lib/cartographersStudio/visualThinkingUnderstanding";
import {
  applyExperiencePlanOverride,
  orchestrateVisualThinkingExperience,
  type VisualThinkingExperiencePlan,
} from "@/lib/cartographersStudio/visualThinkingExperienceOrchestrator";
import {
  prepareVisualThinkingKnowledge,
  clearKnowledgeBundle,
  knowledgeHandoffToGenerationContext,
  type VisualThinkingKnowledgePackage,
} from "@/lib/cartographersStudio/visualThinkingKnowledgeIntelligence";
import {
  clearGenerationBundle,
  startGenerationFromConfirmedPlan,
  applyBlockEdit,
  type VisualThinkingGenerationBundle,
} from "@/lib/cartographersStudio/visualThinkingGenerationEngine";
import {
  applyPresentationOverride,
  classifyPresentationRequest,
  clearPresentationPlan,
  collectPresentationStructureSignals,
  densityPreservesContentDepth,
  evaluatePresentationEligibility,
  planVisualThinkingPresentation,
  presentationEngineConsumesUpstreamOnly,
  projectPresentationWorkspace,
  projectVisibleBlocks,
  resolveSplitViewMode,
  visibleAlternatePresentations,
  type VisualThinkingPresentationInput,
} from "@/lib/cartographersStudio/visualThinkingPresentationIntelligence";
import {
  __resetAdaptiveCompanionExplicitPrefsForTests,
  __resetAdaptiveSessionOverrideForTests,
  setAdaptiveSessionOverride,
} from "@/lib/adaptiveCompanionIntelligence";

function pipeline(
  raw: string,
  tweak?: (plan: VisualThinkingExperiencePlan) => VisualThinkingExperiencePlan,
  attached?: string,
): VisualThinkingPresentationInput {
  const request = applyRequestText(createVisualThinkingRequest({}), raw);
  const understanding = interpretVisualThinkingUnderstanding(request);
  let plan = orchestrateVisualThinkingExperience(understanding);
  plan = applyExperiencePlanOverride(plan, { kind: "confirm" });
  if (tweak) plan = { ...tweak(plan), status: "ready_to_generate" };
  const knowledge = prepareVisualThinkingKnowledge({
    request,
    understanding,
    experiencePlan: plan,
    attachedStructuredContent: attached ?? raw,
  });
  const ctx = knowledgeHandoffToGenerationContext(knowledge.handoff, {
    requestId: request.id,
    understandingId: understanding.id,
    rawRequest: request.rawRequest,
    userFacingGoal: understanding.userFacingGoal,
    successDefinition: understanding.successDefinition,
  });
  const generationBundle = startGenerationFromConfirmedPlan(plan, {
    requestId: ctx.requestId,
    understandingId: ctx.understandingId,
    rawRequest: ctx.rawRequest,
    userFacingGoal: ctx.userFacingGoal,
    successDefinition: ctx.successDefinition,
    suppliedContent: ctx.suppliedContent ?? attached ?? null,
  });
  return {
    understanding,
    experiencePlan: plan,
    knowledgePackage: knowledge.package,
    generationBundle,
  };
}

describe("Visual Thinking Presentation Intelligence", () => {
  beforeEach(() => {
    clearVisualThinkingRequestDraft();
    clearKnowledgeBundle();
    clearGenerationBundle();
    clearPresentationPlan();
    __resetAdaptiveCompanionExplicitPrefsForTests();
    __resetAdaptiveSessionOverrideForTests();
  });

  it("1–3 — review-ready run creates one Presentation Plan; primary stays; one recommended", () => {
    const input = pipeline(
      "Turn these into a step-by-step guide: 1. Greet 2. Collect 3. Confirm",
      (p) => ({
        ...p,
        researchStage: "not_at_all",
        primaryDeliverable: "step_by_step_guide",
        supportingDeliverables: ["checklist", "process_flow"],
      }),
      "1. Greet\n2. Collect\n3. Confirm",
    );
    expect(
      presentationEngineConsumesUpstreamOnly(
        input.experiencePlan,
        input.understanding,
        input.knowledgePackage?.id ?? null,
      ),
    ).toBe(true);
    const lockedPrimary = input.experiencePlan.primaryDeliverable;
    const plan = planVisualThinkingPresentation(input);
    expect(plan.generationRunId).toBe(input.generationBundle.run.id);
    expect(plan.primaryDeliverableId).toBe(
      input.generationBundle.run.primaryDeliverableId,
    );
    expect(input.experiencePlan.primaryDeliverable).toBe(lockedPrimary);
    expect(plan.recommendedPresentation).toBe("step_by_step");
    expect(plan.initialView).toBe(plan.recommendedPresentation);
  });

  it("4–5 — only eligible alternates; process needs ordered steps", () => {
    const withSteps = pipeline(
      "SOP: 1. A 2. B 3. C",
      (p) => ({
        ...p,
        researchStage: "not_at_all",
        primaryDeliverable: "sop",
        supportingDeliverables: [],
      }),
      "1. Welcome client\n2. Collect forms\n3. Kickoff call",
    );
    const plan = planVisualThinkingPresentation(withSteps);
    expect(plan.availablePresentations).toContain("process_flow");
    const signals = collectPresentationStructureSignals(withSteps);
    expect(
      evaluatePresentationEligibility("process_flow", signals).eligible,
    ).toBe(true);

    const noSteps = pipeline(
      "Write a short report about our philosophy.",
      (p) => ({
        ...p,
        researchStage: "not_at_all",
        primaryDeliverable: "report",
        supportingDeliverables: [],
        declinesMap: true,
      }),
    );
    const noStepSignals = collectPresentationStructureSignals(noSteps);
    // Force no steps
    noStepSignals.hasOrderedSteps = false;
    noStepSignals.hasProcessNodes = false;
    expect(
      evaluatePresentationEligibility("process_flow", noStepSignals).eligible,
    ).toBe(false);
  });

  it("6 — relationship view requires semantic relationships", () => {
    const input = pipeline(
      "Help me map how my business works.",
      (p) => ({
        ...p,
        researchStage: "not_at_all",
        primaryDeliverable: "relationship_visualization",
        supportingDeliverables: [],
      }),
      "1. Sales\n2. Delivery\n3. Support",
    );
    const signals = collectPresentationStructureSignals(input);
    expect(signals.hasSemanticRelationships || signals.hasEntitiesOrConcepts).toBe(
      true,
    );
    const plan = planVisualThinkingPresentation(input);
    expect(plan.recommendedPresentation).toBe("relationship_view");
  });

  it("7 — timeline requires chronological structure", () => {
    const input = pipeline(
      "Write a report about our values.",
      (p) => ({
        ...p,
        researchStage: "not_at_all",
        primaryDeliverable: "report",
        supportingDeliverables: [],
      }),
    );
    const signals = collectPresentationStructureSignals(input);
    signals.hasChronology = false;
    expect(evaluatePresentationEligibility("timeline", signals).eligible).toBe(
      false,
    );
  });

  it("8 — comparison requires multiple options and criteria", () => {
    const signals = collectPresentationStructureSignals(
      pipeline(
        "Compare two CRM tools we already shortlisted.",
        (p) => ({
          ...p,
          researchStage: "not_at_all",
          primaryDeliverable: "comparison",
          supportingDeliverables: [],
        }),
        "1. HubSpot\n2. Salesforce",
      ),
    );
    signals.optionCount = 1;
    signals.hasComparisonCriteria = false;
    expect(
      evaluatePresentationEligibility("comparison_view", signals).eligible,
    ).toBe(false);
    signals.optionCount = 2;
    signals.hasComparisonCriteria = true;
    expect(
      evaluatePresentationEligibility("comparison_view", signals).eligible,
    ).toBe(true);
  });

  it("9 — decision tree requires decision structure", () => {
    const signals = collectPresentationStructureSignals(
      pipeline("Report on culture.", (p) => ({
        ...p,
        researchStage: "not_at_all",
        primaryDeliverable: "report",
        supportingDeliverables: [],
      })),
    );
    signals.hasDecisionStructure = false;
    expect(
      evaluatePresentationEligibility("decision_tree", signals).eligible,
    ).toBe(false);
  });

  it("10 — checklist requires actionable or checklist-compatible blocks", () => {
    const withSteps = collectPresentationStructureSignals(
      pipeline(
        "Checklist: 1. One 2. Two",
        (p) => ({
          ...p,
          researchStage: "not_at_all",
          primaryDeliverable: "checklist",
          supportingDeliverables: [],
        }),
        "1. One\n2. Two",
      ),
    );
    expect(withSteps.hasChecklistCompatible).toBe(true);
    expect(
      evaluatePresentationEligibility("checklist", withSteps).eligible,
    ).toBe(true);
    const bare = collectPresentationStructureSignals(
      pipeline("A short note about trust.", (p) => ({
        ...p,
        researchStage: "not_at_all",
        primaryDeliverable: "summary",
        supportingDeliverables: [],
      })),
    );
    bare.hasChecklistCompatible = false;
    bare.hasOrderedSteps = false;
    expect(evaluatePresentationEligibility("checklist", bare).eligible).toBe(
      false,
    );
  });

  it("10b — no-map preference excludes visual-map presentations", () => {
    const plan = planVisualThinkingPresentation(
      pipeline(
        "Give me a detailed report. I do not want a map.",
        (p) => ({
          ...p,
          declinesMap: true,
          researchStage: "not_at_all",
          primaryDeliverable: "report",
          supportingDeliverables: [],
        }),
      ),
    );
    expect(plan.availablePresentations).not.toContain("relationship_view");
    expect(plan.availablePresentations).not.toContain("mind_map");
    expect(plan.availablePresentations).not.toContain("process_flow");
    expect(plan.visualRecommendation).toBeNull();
  });

  it("11–12 — user-requested report remains primary; supporting secondary", () => {
    const input = pipeline(
      "Write a detailed report explaining Medicare basics.",
      (p) => ({
        ...p,
        researchStage: "not_at_all",
        primaryDeliverable: "report",
        supportingDeliverables: ["glossary"],
      }),
    );
    const plan = planVisualThinkingPresentation(input);
    expect([
      "concise_reading",
      "guided_reading",
      "detailed_reading",
      "report",
    ]).toContain(plan.recommendedPresentation);
    expect(plan.primaryDeliverableId).toBe(
      input.generationBundle.run.primaryDeliverableId,
    );
    expect(plan.supportingDeliverableIds).toEqual(
      input.generationBundle.run.supportingDeliverableIds,
    );
    const proj = projectPresentationWorkspace(plan, input.generationBundle);
    expect(proj.primaryDominant).toBe(true);
    expect(proj.supportingLabel).toBe("Also available");
  });

  it("13–15 — density does not change depth or remove approved content", () => {
    const input = pipeline(
      "Detailed SOP: 1. One 2. Two 3. Three",
      (p) => ({
        ...p,
        researchStage: "not_at_all",
        primaryDeliverable: "sop",
        detailLevel: "detailed",
        supportingDeliverables: [],
      }),
      "1. One\n2. Two\n3. Three",
    );
    const plan = planVisualThinkingPresentation(input);
    const after = applyPresentationOverride(plan, {
      kind: "set_density",
      density: "low",
    });
    expect(densityPreservesContentDepth(plan, after)).toBe(true);
    expect(after.contentDetailLevel).toBe("detailed");
    const primary = input.generationBundle.deliverables.find(
      (d) => d.id === plan.primaryDeliverableId,
    )!;
    const beforeIds = primary.blocks.map((b) => b.id).sort();
    const proj = projectPresentationWorkspace(after, input.generationBundle);
    expect(proj.preservedBlockIds.sort()).toEqual(beforeIds);
    expect(primary.blocks.length).toBe(beforeIds.length);
  });

  it("14 — Adaptive Companion limits visible choices without removing eligible", () => {
    setAdaptiveSessionOverride({ choiceLoad: "one", summaryFirst: true });
    const plan = planVisualThinkingPresentation(
      pipeline(
        "Step guide: 1. A 2. B 3. C",
        (p) => ({
          ...p,
          researchStage: "not_at_all",
          primaryDeliverable: "step_by_step_guide",
          supportingDeliverables: ["checklist", "process_flow"],
        }),
        "1. Prepare\n2. Record\n3. Share",
      ),
    );
    const visible = visibleAlternatePresentations(plan);
    expect(visible.length).toBeLessThanOrEqual(1);
    expect(plan.availablePresentations.length).toBeGreaterThanOrEqual(
      visible.length,
    );
  });

  it("15 — required gaps and warnings remain visible", () => {
    const input = pipeline(
      "Show me every step for making a Loom video.",
      (p) => ({
        ...p,
        researchStage: "before_generation",
        primaryDeliverable: "step_by_step_guide",
        supportingDeliverables: [],
      }),
    );
    const plan = planVisualThinkingPresentation(input);
    const primary = input.generationBundle.deliverables.find(
      (d) => d.id === plan.primaryDeliverableId,
    )!;
    // Ensure a warning/placeholder exists or completeness notice
    expect(
      plan.completenessNotice ||
        primary.blocks.some((b) => b.type === "placeholder" || b.type === "warning"),
    ).toBeTruthy();
    const blocks = projectVisibleBlocks(primary, {
      ...plan,
      informationDensity: "low",
      progressiveDisclosure: "start_with_first_step",
    });
    for (const b of primary.blocks.filter(
      (x) => x.type === "warning" || x.type === "placeholder",
    )) {
      expect(blocks.visible).toContain(b.id);
    }
  });

  it("16–18 — presentation overrides do not change Understanding / Plan / Knowledge", () => {
    const input = pipeline(
      "Guide: 1. A 2. B",
      (p) => ({
        ...p,
        researchStage: "not_at_all",
        primaryDeliverable: "step_by_step_guide",
        supportingDeliverables: ["checklist"],
      }),
      "1. A\n2. B",
    );
    const uBefore = structuredClone(input.understanding);
    const pBefore = structuredClone(input.experiencePlan);
    const kBefore = structuredClone(
      input.knowledgePackage,
    ) as VisualThinkingKnowledgePackage;
    let plan = planVisualThinkingPresentation(input);
    plan = applyPresentationOverride(
      plan,
      { kind: "set_presentation", presentation: "checklist" },
      collectPresentationStructureSignals(input),
    );
    plan = applyPresentationOverride(plan, {
      kind: "set_density",
      density: "high",
    });
    expect(input.understanding).toEqual(uBefore);
    expect(input.experiencePlan).toEqual(pBefore);
    expect(input.knowledgePackage).toEqual(kBefore);
    expect(plan.userAdjusted).toBe(true);
  });

  it("19–20 — Show This Differently only eligible; unsupported does not invent", () => {
    const input = pipeline(
      "Report only about trust.",
      (p) => ({
        ...p,
        declinesMap: true,
        researchStage: "not_at_all",
        primaryDeliverable: "report",
        supportingDeliverables: [],
      }),
    );
    const plan = planVisualThinkingPresentation(input);
    const alts = visibleAlternatePresentations(plan, { showAll: true });
    expect(alts.every((a) => plan.availablePresentations.includes(a.type))).toBe(
      true,
    );
    expect(alts.some((a) => a.type === "timeline")).toBe(false);
    const blocked = applyPresentationOverride(
      plan,
      { kind: "set_presentation", presentation: "timeline" },
      collectPresentationStructureSignals(input),
    );
    expect(blocked.initialView).not.toBe("timeline");
    expect(
      blocked.excludedPresentations.some((e) => e.type === "timeline"),
    ).toBe(true);
  });

  it("21 — split view falls back on narrow screens", () => {
    const input = pipeline(
      "Steps: 1. One 2. Two 3. Three",
      (p) => ({
        ...p,
        researchStage: "not_at_all",
        primaryDeliverable: "step_by_step_guide",
        supportingDeliverables: ["process_flow"],
        declinesMap: false,
      }),
      "1. One\n2. Two\n3. Three",
    );
    let plan = planVisualThinkingPresentation(input);
    plan = applyPresentationOverride(plan, {
      kind: "set_split_view",
      value: true,
    });
    expect(resolveSplitViewMode(plan, 1200)).toBe("side_by_side");
    expect(resolveSplitViewMode(plan, 400)).toBe("stacked_switch");
  });

  it("22 — user-led visual plans open workspace shell, not completed map", () => {
    const input = pipeline("I want to map my own ideas about my business.", (p) => ({
      ...p,
      interactionStyle: "let_me_build",
      primaryDeliverable: "editable_relationship_map",
      supportingDeliverables: [],
      researchStage: "not_at_all",
    }));
    const plan = planVisualThinkingPresentation(input);
    expect(plan.recommendedPresentation).toBe("user_led_canvas");
    const proj = projectPresentationWorkspace(plan, input.generationBundle);
    expect(proj.userLedShell).toBe(true);
    expect(proj.userLedActions).toContain("Add Idea");
    expect(proj.title).not.toMatch(/completed map/i);
  });

  it("23–24 — research-blocked and partial are not shown as complete", () => {
    const input = pipeline(
      "Show me every step for making a Loom video.",
      (p) => ({
        ...p,
        researchStage: "before_generation",
        primaryDeliverable: "step_by_step_guide",
        supportingDeliverables: [],
      }),
    );
    // Force incomplete run status if generation marked awaiting_research
    const incomplete: VisualThinkingGenerationBundle = {
      ...input.generationBundle,
      run: {
        ...input.generationBundle.run,
        status: "awaiting_research",
        researchBlocked: true,
        researchBlockReason: "Current Loom steps need verification.",
      },
    };
    const plan = planVisualThinkingPresentation({
      ...input,
      generationBundle: incomplete,
    });
    expect(plan.completenessNotice).toBeTruthy();
    const proj = projectPresentationWorkspace(plan, incomplete);
    expect(proj.incompletenessVisible).toBe(true);
  });

  it("22 / 25 / 28 — switching does not regenerate facts; edits remain", () => {
    const input = pipeline(
      "Guide: 1. Alpha 2. Beta",
      (p) => ({
        ...p,
        researchStage: "not_at_all",
        primaryDeliverable: "step_by_step_guide",
        supportingDeliverables: ["checklist"],
      }),
      "1. Alpha\n2. Beta",
    );
    const primary = input.generationBundle.deliverables.find(
      (d) => d.role === "primary",
    )!;
    const snapshot = JSON.stringify(primary.blocks);
    const editable = primary.blocks.find((b) => b.editable)!;
    const edited = applyBlockEdit(primary, {
      kind: "edit",
      blockId: editable.id,
      content: "Edited step content",
    });
    const bundle: VisualThinkingGenerationBundle = {
      run: input.generationBundle.run,
      deliverables: input.generationBundle.deliverables.map((d) =>
        d.id === edited.id ? edited : d,
      ),
    };
    let plan = planVisualThinkingPresentation({ ...input, generationBundle: bundle });
    const beforeSwitch = JSON.stringify(
      bundle.deliverables.find((d) => d.id === edited.id)!.blocks,
    );
    plan = applyPresentationOverride(
      plan,
      { kind: "set_presentation", presentation: "checklist" },
      collectPresentationStructureSignals({ ...input, generationBundle: bundle }),
    );
    const still = bundle.deliverables.find((d) => d.id === edited.id)!;
    expect(JSON.stringify(still.blocks)).toBe(beforeSwitch);
    expect(
      still.blocks.some((b) => b.content === "Edited step content" && b.userEdited),
    ).toBe(true);
    expect(plan.activePresentation).toBe("checklist");
    expect(snapshot).not.toContain("Edited step content");
  });

  it("29 — primary remains available after opening a supporting view", () => {
    const input = pipeline(
      "Guide: 1. A 2. B 3. C",
      (p) => ({
        ...p,
        researchStage: "not_at_all",
        primaryDeliverable: "step_by_step_guide",
        supportingDeliverables: ["checklist"],
      }),
      "1. A\n2. B\n3. C",
    );
    let plan = planVisualThinkingPresentation(input);
    const primaryId = plan.primaryDeliverableId;
    const supportingId = plan.supportingDeliverableIds[0];
    expect(supportingId).toBeTruthy();
    plan = applyPresentationOverride(plan, {
      kind: "select_supporting",
      deliverableId: supportingId!,
    });
    expect(plan.selectedSupportingDeliverableId).toBe(supportingId);
    expect(plan.primaryDeliverableId).toBe(primaryId);
    expect(
      input.generationBundle.deliverables.some((d) => d.id === primaryId),
    ).toBe(true);
  });

  it("switching versus conversion messaging", () => {
    const plan = planVisualThinkingPresentation(
      pipeline(
        "Write a report about trust.",
        (p) => ({
          ...p,
          declinesMap: true,
          researchStage: "not_at_all",
          primaryDeliverable: "report",
          supportingDeliverables: [],
        }),
      ),
    );
    const switchOk = classifyPresentationRequest(plan, plan.recommendedPresentation);
    expect(switchOk.kind).toBe("presentation_switch");
    const conversion = classifyPresentationRequest(plan, "training_guide");
    expect(conversion.kind).toBe("deliverable_conversion");
    expect(conversion.userFacingMessage).toMatch(/new version/i);
  });

  describe("Scenario tests A–G", () => {
    it("A — Loom guide presentation", () => {
      const input = pipeline(
        "Show me every step for making a Loom video.",
        (p) => ({
          ...p,
          researchStage: "before_generation",
          primaryDeliverable: "step_by_step_guide",
          supportingDeliverables: ["checklist", "process_flow"],
        }),
      );
      const plan = planVisualThinkingPresentation(input);
      expect(plan.recommendedPresentation).toBe("step_by_step");
      const alts = visibleAlternatePresentations(plan, { showAll: true });
      expect(alts.every((a) => plan.availablePresentations.includes(a.type))).toBe(
        true,
      );
      expect(plan.contentDetailLevel).toBe(input.experiencePlan.detailLevel);
    });

    it("B — Loom guide still awaiting research", () => {
      const input = pipeline(
        "Show me every step for making a Loom video.",
        (p) => ({
          ...p,
          researchStage: "before_generation",
          primaryDeliverable: "step_by_step_guide",
          supportingDeliverables: ["checklist"],
        }),
      );
      const incomplete: VisualThinkingGenerationBundle = {
        ...input.generationBundle,
        run: {
          ...input.generationBundle.run,
          status: "awaiting_research",
          researchBlocked: true,
          researchBlockReason: "Current Loom steps need verification.",
        },
      };
      const plan = planVisualThinkingPresentation({
        ...input,
        generationBundle: incomplete,
      });
      expect(plan.completenessNotice).toMatch(/verified information/i);
      const proj = projectPresentationWorkspace(plan, incomplete);
      expect(proj.incompletenessVisible).toBe(true);
      expect(proj.incompletenessMessage).not.toMatch(/complete|finished/i);
    });

    it("C — Medicare explanation", () => {
      const input = pipeline(
        "Explain Medicare basics as a report.",
        (p) => ({
          ...p,
          researchStage: "not_at_all",
          primaryDeliverable: "report",
          supportingDeliverables: ["glossary"],
        }),
      );
      // Inject relationship + glossary signals via package-like structure check
      const plan = planVisualThinkingPresentation(input);
      expect([
        "concise_reading",
        "guided_reading",
        "detailed_reading",
        "report",
      ]).toContain(plan.recommendedPresentation);
      const signals = collectPresentationStructureSignals(input);
      signals.hasChronology = false;
      expect(evaluatePresentationEligibility("timeline", signals).eligible).toBe(
        false,
      );
    });

    it("D — Business map", () => {
      const input = pipeline(
        "Help me map how my business works.",
        (p) => ({
          ...p,
          researchStage: "not_at_all",
          primaryDeliverable: "relationship_visualization",
          supportingDeliverables: ["summary"],
        }),
        "1. Marketing\n2. Sales\n3. Delivery",
      );
      const plan = planVisualThinkingPresentation(input);
      expect(plan.recommendedPresentation).toBe("relationship_view");
      const denser = applyPresentationOverride(plan, {
        kind: "set_density",
        density: "high",
      });
      expect(denser.informationDensity).toBe("high");
    });

    it("E — CRM comparison", () => {
      const input = pipeline(
        "Compare current CRM platforms.",
        (p) => ({
          ...p,
          researchStage: "before_generation",
          primaryDeliverable: "comparison",
          supportingDeliverables: ["summary"],
        }),
        "1. HubSpot\n2. Salesforce",
      );
      const plan = planVisualThinkingPresentation(input);
      expect(plan.recommendedPresentation).toBe("comparison_view");
      const signals = collectPresentationStructureSignals(input);
      signals.hasChronology = false;
      signals.hasOrderedSteps = false;
      signals.hasProcessNodes = false;
      expect(evaluatePresentationEligibility("timeline", signals).eligible).toBe(
        false,
      );
    });

    it("F — Staff training", () => {
      const input = pipeline(
        "Create a training guide for onboarding.",
        (p) => ({
          ...p,
          researchStage: "not_at_all",
          primaryDeliverable: "training_guide",
          supportingDeliverables: ["checklist", "process_flow"],
        }),
        "1. Welcome\n2. Tools\n3. First call",
      );
      const plan = planVisualThinkingPresentation(input);
      expect(plan.recommendedPresentation).toBe("training_guide");
      expect(plan.supportingDeliverableIds.length).toBeGreaterThan(0);
    });

    it("G — Report only, no map", () => {
      const plan = planVisualThinkingPresentation(
        pipeline(
          "Write a report only. No map please.",
          (p) => ({
            ...p,
            declinesMap: true,
            researchStage: "not_at_all",
            primaryDeliverable: "report",
            supportingDeliverables: [],
          }),
        ),
      );
      expect(plan.availablePresentations).not.toContain("relationship_view");
      expect(plan.availablePresentations).not.toContain("mind_map");
      expect(plan.visualRecommendation).toBeNull();
    });

    it("H — User-led visual", () => {
      const plan = planVisualThinkingPresentation(
        pipeline("Let me build my own visual about my offers.", (p) => ({
          ...p,
          interactionStyle: "let_me_build",
          primaryDeliverable: "editable_relationship_map",
          supportingDeliverables: [],
          researchStage: "not_at_all",
        })),
      );
      expect(plan.recommendedPresentation).toBe("user_led_canvas");
      expect(plan.navigationMode).toBe("canvas_shell");
    });
  });
});
