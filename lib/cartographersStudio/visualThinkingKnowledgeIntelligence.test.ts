/**
 * Visual Thinking Knowledge Intelligence Engine tests (Build 5).
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
  applyKnowledgeGapAnswer,
  buildGenerationHandoff,
  clearKnowledgeBundle,
  detectKnowledgeConflicts,
  knowledgeBehaviorForCreationMode,
  knowledgeEngineConsumesUpstreamOnly,
  knowledgeHandoffToGenerationContext,
  prepareVisualThinkingKnowledge,
  type VisualThinkingKnowledgeInput,
  type VisualThinkingKnowledgeItem,
} from "@/lib/cartographersStudio/visualThinkingKnowledgeIntelligence";

function confirmedInput(
  raw: string,
  tweak?: (plan: VisualThinkingExperiencePlan) => VisualThinkingExperiencePlan,
  attached?: string,
): VisualThinkingKnowledgeInput {
  const request = applyRequestText(createVisualThinkingRequest({}), raw);
  const understanding = interpretVisualThinkingUnderstanding(request);
  let plan = orchestrateVisualThinkingExperience(understanding);
  plan = applyExperiencePlanOverride(plan, { kind: "confirm" });
  if (tweak) plan = { ...tweak(plan), status: "ready_to_generate" };
  return {
    request,
    understanding,
    experiencePlan: plan,
    attachedStructuredContent: attached ?? null,
  };
}

describe("Visual Thinking Knowledge Intelligence Engine", () => {
  beforeEach(() => {
    clearVisualThinkingRequestDraft();
    clearKnowledgeBundle();
  });

  it("1–4 — confirmed plan creates one Knowledge Plan; uses upstream; no re-interpret / new deliverables", () => {
    const input = confirmedInput(
      "Turn these steps into an SOP: 1. Greet 2. Collect 3. Confirm",
      undefined,
      "1. Greet\n2. Collect\n3. Confirm",
    );
    const locked = input.experiencePlan.primaryDeliverable;
    const lockedSupporting = [...input.experiencePlan.supportingDeliverables];
    expect(
      knowledgeEngineConsumesUpstreamOnly(
        input.experiencePlan,
        input.understanding,
      ),
    ).toBe(true);
    const bundle = prepareVisualThinkingKnowledge(input);
    expect(bundle.plan.experiencePlanId).toBe(input.experiencePlan.id);
    expect(bundle.plan.understandingId).toBe(input.understanding.id);
    expect(input.experiencePlan.primaryDeliverable).toBe(locked);
    expect(input.experiencePlan.supportingDeliverables).toEqual(
      lockedSupporting,
    );
    expect(bundle.plan.purpose).toMatch(/.+/);
  });

  it("5–6 — user-provided content becomes traceable items with source refs", () => {
    const input = confirmedInput(
      "Turn these steps into an SOP: 1. Greet 2. Collect",
      undefined,
      "1. Greet client\n2. Collect info",
    );
    const bundle = prepareVisualThinkingKnowledge(input);
    const steps = bundle.package.items.filter((i) => i.type === "step");
    expect(steps.length).toBeGreaterThanOrEqual(2);
    expect(steps.every((s) => s.userProvided)).toBe(true);
    expect(steps.every((s) => s.sourceReferenceIds.length > 0)).toBe(true);
    expect(bundle.package.sourceReferences.length).toBeGreaterThan(0);
  });

  it("7 — duplicate knowledge items merge without losing source references", () => {
    const input = confirmedInput(
      "Organize these ideas: 1. Same step 2. Same step",
      (p) => ({
        ...p,
        researchStage: "not_at_all",
        primaryDeliverable: "checklist",
        supportingDeliverables: [],
      }),
      "1. Same step\n2. Same step",
    );
    const bundle = prepareVisualThinkingKnowledge(input);
    const same = bundle.package.items.filter(
      (i) => i.type === "step" && /same step/i.test(i.content),
    );
    expect(same.length).toBe(1);
    expect(same[0]!.sourceReferenceIds.length).toBeGreaterThanOrEqual(1);
  });

  it("8 — conflicting claims remain separate and create a conflict record", () => {
    const a: VisualThinkingKnowledgeItem = {
      id: "a",
      type: "step",
      title: "Step 1",
      content: "Do A this way",
      topic: null,
      category: "procedure",
      tags: [],
      sourceReferenceIds: ["s1"],
      confidence: "high",
      freshness: "current",
      verificationStatus: "verified",
      importance: "required",
      sequence: 1,
      parentId: null,
      userProvided: true,
      userEdited: false,
      inferred: false,
      metadata: {},
    };
    const b: VisualThinkingKnowledgeItem = {
      ...a,
      id: "b",
      content: "Do A a different way",
      sourceReferenceIds: ["s2"],
    };
    const conflicts = detectKnowledgeConflicts([a, b]);
    expect(conflicts.length).toBeGreaterThan(0);
    expect(conflicts[0]!.itemIds).toEqual(expect.arrayContaining(["a", "b"]));
    expect(conflicts[0]!.resolutionNeeded).toBe(true);
  });

  it("9 — assumptions do not become verified facts", () => {
    const input = confirmedInput("Show me how to create a Loom video.");
    const bundle = prepareVisualThinkingKnowledge(input);
    const assumptions = bundle.package.items.filter(
      (i) => i.type === "assumption",
    );
    expect(assumptions.every((a) => a.verificationStatus === "assumption")).toBe(
      true,
    );
    expect(assumptions.every((a) => a.verificationStatus !== "verified")).toBe(
      true,
    );
  });

  it("10 — unknown freshness remains unknown when unsupported", () => {
    const input = confirmedInput(
      "Explain my notes about sequencing a process.",
      (p) => ({
        ...p,
        researchStage: "not_at_all",
        primaryDeliverable: "concise_explanation",
        supportingDeliverables: [],
      }),
    );
    const bundle = prepareVisualThinkingKnowledge(input);
    const outcome = bundle.package.items.find((i) => i.category === "outcome");
    expect(outcome?.freshness).toBe("unknown");
  });

  it("11 — current product information creates a research gap", () => {
    const input = confirmedInput(
      "Show me every step for making a Loom video.",
      (p) => ({
        ...p,
        researchStage: "before_generation",
        primaryDeliverable: "step_by_step_guide",
        supportingDeliverables: [],
      }),
    );
    const bundle = prepareVisualThinkingKnowledge(input);
    expect(
      bundle.package.knowledgeGaps.some(
        (g) => g.researchNeeded && g.status === "open",
      ),
    ).toBe(true);
    expect(bundle.package.readiness).not.toBe("full_ready");
  });

  it("12 — user-owned internal process can be full_ready without external research", () => {
    const input = confirmedInput(
      "Turn these steps into an SOP for our onboarding:",
      (p) => ({
        ...p,
        researchStage: "not_at_all",
        primaryDeliverable: "sop",
        supportingDeliverables: [],
        detailLevel: "essentials",
      }),
      "1. Welcome client\n2. Collect forms\n3. Schedule kickoff",
    );
    // Answer ownership if required at essentials it may be helpful only
    let bundle = prepareVisualThinkingKnowledge(input);
    const ownerGap = bundle.package.knowledgeGaps.find(
      (g) => g.area === "process_ownership" && g.status === "open",
    );
    if (ownerGap?.priority === "required") {
      bundle = applyKnowledgeGapAnswer(
        bundle,
        input,
        ownerGap.id,
        "Operations lead approves the final step.",
      );
    }
    expect(bundle.package.readiness).toBe("full_ready");
    expect(bundle.plan.researchRequired).toBe(false);
  });

  it("13 — missing required process ownership creates a user-input gap", () => {
    const input = confirmedInput(
      "Create a detailed SOP for client onboarding.",
      (p) => ({
        ...p,
        researchStage: "not_at_all",
        primaryDeliverable: "sop",
        detailLevel: "detailed",
        supportingDeliverables: [],
      }),
      "1. Welcome\n2. Forms\n3. Kickoff",
    );
    const bundle = prepareVisualThinkingKnowledge(input);
    expect(
      bundle.package.knowledgeGaps.some(
        (g) =>
          g.area === "process_ownership" &&
          g.userInputNeeded &&
          g.status === "open",
      ),
    ).toBe(true);
  });

  it("14 — optional examples do not block essentials-level generation", () => {
    const input = confirmedInput(
      "Create a brief training guide. Steps: 1. Show 2. Practice",
      (p) => ({
        ...p,
        researchStage: "not_at_all",
        primaryDeliverable: "training_guide",
        detailLevel: "essentials",
        supportingDeliverables: [],
      }),
      "1. Show\n2. Practice",
    );
    const bundle = prepareVisualThinkingKnowledge(input);
    const exampleGap = bundle.package.knowledgeGaps.find(
      (g) => g.area === "examples",
    );
    if (exampleGap) {
      expect(exampleGap.resolutionType).toBe("optional_omission");
      expect(exampleGap.priority).toBe("optional");
    }
    expect(bundle.package.readyForGeneration).toBe(true);
  });

  it("15 — required evidence gaps block full generation", () => {
    const input = confirmedInput(
      "Compare current CRM platforms.",
      (p) => ({
        ...p,
        researchStage: "before_generation",
        primaryDeliverable: "comparison",
        supportingDeliverables: [],
      }),
    );
    const bundle = prepareVisualThinkingKnowledge(input);
    expect(bundle.plan.evidenceRequirement).toBe("required");
    expect(bundle.package.readiness).not.toBe("full_ready");
  });

  it("16 — safe structural generation remains possible when factual details are missing", () => {
    const input = confirmedInput(
      "Show me every step for making a Loom video.",
      (p) => ({
        ...p,
        researchStage: "before_generation",
        primaryDeliverable: "step_by_step_guide",
        supportingDeliverables: [],
      }),
    );
    const bundle = prepareVisualThinkingKnowledge(input);
    expect(["structure_ready", "partial_ready"]).toContain(
      bundle.package.readiness,
    );
    expect(bundle.handoff.safeGenerationScope).toBe("structure_only");
  });

  it("17 — build-for-me assembles available knowledge and identifies gaps", () => {
    const input = confirmedInput(
      "Create an SOP. Steps: 1. A 2. B",
      (p) => ({
        ...p,
        interactionStyle: "build_for_me",
        researchStage: "not_at_all",
        primaryDeliverable: "sop",
        detailLevel: "detailed",
        supportingDeliverables: [],
      }),
      "1. A\n2. B",
    );
    expect(knowledgeBehaviorForCreationMode("build_for_me").assembleAllAvailable).toBe(
      true,
    );
    const bundle = prepareVisualThinkingKnowledge(input);
    expect(bundle.package.items.length).toBeGreaterThan(0);
    expect(bundle.package.knowledgeGaps.length).toBeGreaterThan(0);
  });

  it("18 — guide-me produces focused missing-information prompts", () => {
    const input = confirmedInput(
      "Walk me through a training guide for onboarding.",
      (p) => ({
        ...p,
        interactionStyle: "guide_me",
        researchStage: "not_at_all",
        primaryDeliverable: "training_guide",
        supportingDeliverables: [],
      }),
      "1. Welcome\n2. Setup\n3. First call",
    );
    const bundle = prepareVisualThinkingKnowledge(input);
    const q = bundle.package.knowledgeGaps.find(
      (g) => g.focusedQuestion && g.userInputNeeded,
    );
    expect(q?.focusedQuestion).toBeTruthy();
  });

  it("19 — let-me-build creates a lightweight knowledge shell", () => {
    const input = confirmedInput("I want to map my own ideas about my business.");
    expect(knowledgeBehaviorForCreationMode("let_me_build").lightweightShell).toBe(
      true,
    );
    const bundle = prepareVisualThinkingKnowledge(input);
    expect(bundle.package.readiness).toBe("structure_ready");
    expect(
      bundle.package.items.some((i) => i.category === "shell" || i.type === "question"),
    ).toBe(true);
  });

  it("20 — no-map preference does not remove factual knowledge requirements", () => {
    const input = confirmedInput(
      "Give me a detailed report. I do not want a map.",
      (p) => ({
        ...p,
        declinesMap: true,
        researchStage: "not_at_all",
        primaryDeliverable: "report",
        supportingDeliverables: [],
      }),
    );
    const bundle = prepareVisualThinkingKnowledge(input);
    expect(bundle.plan.requiredKnowledgeAreas.length).toBeGreaterThan(0);
    expect(bundle.plan.requiredKnowledgeAreas.some((a) => /visual|map/i.test(a.label))).toBe(
      false,
    );
  });

  it("21 — semantic relationships preserved independently of canvas", () => {
    const input = confirmedInput(
      "Help me map how my business works. Areas: 1. Sales 2. Delivery 3. Support",
      (p) => ({
        ...p,
        researchStage: "not_at_all",
        primaryDeliverable: "relationship_visualization",
        interactionStyle: "collaborate",
        supportingDeliverables: [],
      }),
      "1. Sales\n2. Delivery\n3. Support",
    );
    const bundle = prepareVisualThinkingKnowledge(input);
    expect(bundle.plan.organizationStrategy).toBe("relationships");
    expect(bundle.package.relationships.length).toBeGreaterThan(0);
  });

  it("22 — groups are created only when meaningful", () => {
    const small = prepareVisualThinkingKnowledge(
      confirmedInput(
        "Checklist only: 1. One",
        (p) => ({
          ...p,
          researchStage: "not_at_all",
          primaryDeliverable: "checklist",
          supportingDeliverables: [],
        }),
        "1. One",
      ),
    );
    const large = prepareVisualThinkingKnowledge(
      confirmedInput(
        "SOP steps:",
        (p) => ({
          ...p,
          researchStage: "not_at_all",
          primaryDeliverable: "sop",
          detailLevel: "essentials",
          supportingDeliverables: [],
        }),
        "1. A\n2. B\n3. C",
      ),
    );
    expect(small.package.groups.length).toBeLessThanOrEqual(
      large.package.groups.length,
    );
    expect(large.package.groups.length).toBeGreaterThan(0);
  });

  it("23–24 — handoff includes unresolved gaps and excludes unsupported claims as approved facts", () => {
    const input = confirmedInput(
      "Show me every step for making a Loom video.",
      (p) => ({
        ...p,
        researchStage: "before_generation",
        primaryDeliverable: "step_by_step_guide",
        supportingDeliverables: [],
      }),
    );
    const bundle = prepareVisualThinkingKnowledge(input);
    const handoff = buildGenerationHandoff(bundle.plan, bundle.package);
    expect(handoff.unresolvedGaps.some((g) => g.researchNeeded)).toBe(true);
    expect(handoff.blockedContentAreas.length).toBeGreaterThan(0);
    const ctx = knowledgeHandoffToGenerationContext(handoff, {
      requestId: input.request.id,
      understandingId: input.understanding.id,
      rawRequest: input.request.rawRequest,
    });
    expect(ctx.safeGenerationScope).toBe("structure_only");
    // Generate-first: stable instructional material reaches Generation; not unsupported UI claims.
    expect(ctx.suppliedContent).toBeTruthy();
    expect(ctx.suppliedContent).not.toMatch(/click the record button/i);
    expect(handoff.unresolvedGaps.some((g) => g.researchNeeded)).toBe(true);
  });

  describe("Scenario tests A–F", () => {
    it("A — Loom instructions", () => {
      const bundle = prepareVisualThinkingKnowledge(
        confirmedInput(
          "Show me every step for making a Loom video.",
          (p) => ({
            ...p,
            researchStage: "before_generation",
            primaryDeliverable: "step_by_step_guide",
            supportingDeliverables: [],
          }),
        ),
      );
      expect(bundle.package.readiness).not.toBe("full_ready");
      expect(
        bundle.package.knowledgeGaps.some((g) => g.researchNeeded),
      ).toBe(true);
      expect(
        bundle.package.items.some((i) =>
          /click the record|chrome extension/i.test(i.content),
        ),
      ).toBe(false);
    });

    it("B — Internal onboarding SOP", () => {
      let input = confirmedInput(
        "Turn these steps into an SOP for our onboarding:",
        (p) => ({
          ...p,
          researchStage: "not_at_all",
          primaryDeliverable: "sop",
          detailLevel: "essentials",
          supportingDeliverables: [],
        }),
        "1. Welcome\n2. Forms\n3. Kickoff",
      );
      let bundle = prepareVisualThinkingKnowledge(input);
      expect(bundle.package.relationships.some((r) => r.kind === "follows")).toBe(
        true,
      );
      const owner = bundle.package.knowledgeGaps.find(
        (g) => g.area === "process_ownership" && g.priority === "required",
      );
      if (owner) {
        bundle = applyKnowledgeGapAnswer(
          bundle,
          input,
          owner.id,
          "Ops owns approval.",
        );
      }
      expect(bundle.package.readiness).toBe("full_ready");
    });

    it("C — Business relationship visual", () => {
      const bundle = prepareVisualThinkingKnowledge(
        confirmedInput(
          "Help me map how my business works.",
          (p) => ({
            ...p,
            researchStage: "not_at_all",
            primaryDeliverable: "relationship_visualization",
            supportingDeliverables: [],
          }),
          "1. Marketing\n2. Sales\n3. Delivery",
        ),
      );
      expect(bundle.plan.organizationStrategy).toBe("relationships");
      expect(bundle.plan.researchRequired).toBe(false);
    });

    it("D — Current CRM comparison", () => {
      const bundle = prepareVisualThinkingKnowledge(
        confirmedInput(
          "Compare current CRM platforms.",
          (p) => ({
            ...p,
            researchStage: "before_generation",
            primaryDeliverable: "comparison",
            supportingDeliverables: [],
          }),
        ),
      );
      expect(bundle.package.readiness).not.toBe("full_ready");
      expect(
        bundle.package.items.some((i) => /HubSpot is better/i.test(i.content)),
      ).toBe(false);
    });

    it("E — Training guide missing audience", () => {
      const bundle = prepareVisualThinkingKnowledge(
        confirmedInput(
          "Create a training guide for client onboarding.",
          (p) => ({
            ...p,
            researchStage: "not_at_all",
            primaryDeliverable: "training_guide",
            supportingDeliverables: [],
          }),
          "1. Welcome\n2. Setup\n3. First call",
        ),
      );
      expect(
        bundle.package.knowledgeGaps.some(
          (g) => g.area === "audience_skill_level" && g.userInputNeeded,
        ),
      ).toBe(true);
      expect(["partial_ready", "structure_ready", "full_ready"]).toContain(
        bundle.package.readiness,
      );
    });

    it("F — Report only", () => {
      const bundle = prepareVisualThinkingKnowledge(
        confirmedInput(
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
      expect(bundle.plan.intendedUse).toMatch(/report/i);
      expect(bundle.plan.organizationStrategy).toBe("topic_groups");
    });
  });
});
