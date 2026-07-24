/**
 * Visual Thinking Generation Engine tests (Build 4).
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
  applyBlockEdit,
  clearGenerationBundle,
  deepenDeliverable,
  executeGenerationRun,
  generationEngineConsumesPlanOnly,
  getPrimaryDeliverable,
  getSupportingDeliverables,
  simplifyDeliverable,
  startGenerationFromConfirmedPlan,
  transformBlock,
  type VisualThinkingGenerationContext,
} from "@/lib/cartographersStudio/visualThinkingGenerationEngine";

function confirmedPlan(
  raw: string,
  tweak?: (plan: VisualThinkingExperiencePlan) => VisualThinkingExperiencePlan,
): {
  plan: VisualThinkingExperiencePlan;
  ctx: VisualThinkingGenerationContext;
} {
  const request = applyRequestText(createVisualThinkingRequest({}), raw);
  const understanding = interpretVisualThinkingUnderstanding(request);
  let plan = orchestrateVisualThinkingExperience(understanding);
  plan = applyExperiencePlanOverride(plan, { kind: "confirm" });
  if (tweak) plan = tweak(plan);
  // ensure confirmed status after tweak
  if (plan.status !== "ready_to_generate") {
    plan = { ...plan, status: "ready_to_generate" };
  }
  return {
    plan,
    ctx: {
      requestId: request.id,
      understandingId: understanding.id,
      rawRequest: raw,
      userFacingGoal: understanding.userFacingGoal,
      successDefinition: understanding.successDefinition,
    },
  };
}

describe("Visual Thinking Generation Engine", () => {
  beforeEach(() => {
    clearVisualThinkingRequestDraft();
    clearGenerationBundle();
  });

  it("1 — confirmed plan creates one generation run", () => {
    const { plan, ctx } = confirmedPlan(
      "Turn these steps into an SOP: 1. Greet client 2. Collect info 3. Confirm next meeting",
    );
    const bundle = startGenerationFromConfirmedPlan(plan, ctx);
    expect(bundle.run.planId).toBe(plan.id);
    expect(bundle.run.id).toBeTruthy();
    expect(generationEngineConsumesPlanOnly(plan)).toBe(true);
  });

  it("2 — one primary deliverable is created", () => {
    const { plan, ctx } = confirmedPlan(
      "Turn these steps into an SOP: 1. Greet 2. Collect 3. Confirm",
    );
    const bundle = startGenerationFromConfirmedPlan(plan, ctx);
    const primary = getPrimaryDeliverable(bundle);
    expect(primary).toBeTruthy();
    expect(primary!.role).toBe("primary");
    expect(
      bundle.deliverables.filter((d) => d.role === "primary"),
    ).toHaveLength(1);
  });

  it("3–4 — only approved supporting deliverables; none invented", () => {
    const { plan, ctx } = confirmedPlan(
      "Show me how to create a Loom video. I need every step.",
      (p) => ({
        ...p,
        researchStage: "not_at_all",
        supportingDeliverables: ["checklist"],
        status: "ready_to_generate",
      }),
    );
    const bundle = startGenerationFromConfirmedPlan(plan, ctx);
    const supporting = getSupportingDeliverables(bundle);
    expect(supporting.map((d) => d.type)).toEqual(["checklist"]);
  });

  it("5 — no-map remains honored", () => {
    const { plan, ctx } = confirmedPlan(
      "Research this and give me a detailed report. I do not want a map.",
      (p) => ({
        ...p,
        researchStage: "not_at_all",
        declinesMap: true,
        supportingDeliverables: [],
        status: "ready_to_generate",
      }),
    );
    const bundle = startGenerationFromConfirmedPlan(plan, ctx);
    expect(
      bundle.deliverables.some(
        (d) =>
          d.type === "process_flow" ||
          d.type === "editable_relationship_map" ||
          d.type === "relationship_visualization",
      ),
    ).toBe(false);
  });

  it("6 — build-myself creates a shell, not a completed result", () => {
    const { plan, ctx } = confirmedPlan("I want to map my own ideas about my business.");
    expect(plan.interactionStyle).toBe("let_me_build");
    const bundle = startGenerationFromConfirmedPlan(plan, ctx);
    const primary = getPrimaryDeliverable(bundle)!;
    expect(primary.sourceMode).toBe("user_led_shell");
    expect(primary.visualShell).toBeTruthy();
    expect(primary.visualShell!.nodes.some((n) => n.placeholder)).toBe(true);
    expect(primary.blocks.some((b) => b.type === "numbered_step")).toBe(false);
  });

  it("7 — guide-me creates a partially completed guided structure", () => {
    const { plan, ctx } = confirmedPlan(
      "Walk me through creating an SOP for client intake.",
      (p) => ({
        ...p,
        primaryDeliverable: "sop",
        interactionStyle: "guide_me",
        researchStage: "not_at_all",
        supportingDeliverables: [],
        status: "ready_to_generate",
      }),
    );
    const bundle = startGenerationFromConfirmedPlan(plan, ctx);
    const primary = getPrimaryDeliverable(bundle)!;
    expect(
      primary.blocks.some((b) => b.type === "question" || b.type === "user_note"),
    ).toBe(true);
    expect(["awaiting_user_input", "review_ready", "partial"]).toContain(
      bundle.run.status,
    );
  });

  it("8 — build-for-me creates the full safe draft", () => {
    const { plan, ctx } = confirmedPlan(
      "Create an SOP for client intake.",
      (p) => ({
        ...p,
        primaryDeliverable: "sop",
        interactionStyle: "build_for_me",
        researchStage: "not_at_all",
        supportingDeliverables: [],
        status: "ready_to_generate",
      }),
    );
    const bundle = startGenerationFromConfirmedPlan(plan, ctx);
    expect(bundle.run.status).toBe("review_ready");
    const primary = getPrimaryDeliverable(bundle)!;
    expect(primary.blocks.some((b) => b.type === "numbered_step")).toBe(true);
  });

  it("9–10 — required research creates awaiting_research; no fabricated facts", () => {
    const { plan, ctx } = confirmedPlan(
      "Show me how to create a Loom video. I need every step.",
      (p) => ({
        ...p,
        researchStage: "before_generation",
        primaryDeliverable: "step_by_step_guide",
        supportingDeliverables: ["checklist", "process_flow"],
        status: "ready_to_generate",
      }),
    );
    const bundle = startGenerationFromConfirmedPlan(plan, ctx);
    expect(bundle.run.status).toBe("awaiting_research");
    expect(bundle.run.researchBlocked).toBe(true);
    const primary = getPrimaryDeliverable(bundle)!;
    // Generate-first: stable instructional steps + localized verification — not invented UI labels.
    expect(
      primary.blocks.some(
        (b) =>
          b.type === "placeholder" ||
          b.metadata.researchDependent === true ||
          b.metadata.freshnessNotice === true ||
          b.metadata.freshnessSensitive === true,
      ),
    ).toBe(true);
    expect(primary.blocks.filter((b) => b.type === "numbered_step").length).toBeGreaterThanOrEqual(
      3,
    );
    const text = primary.blocks.map((b) => b.content).join(" ");
    expect(text).not.toMatch(/click the record button|chrome extension/i);
  });

  it("11 — non-research user-provided content can generate", () => {
    const { plan, ctx } = confirmedPlan(
      "Turn these steps into an SOP: 1. Greet client 2. Collect info 3. Confirm next meeting",
    );
    const bundle = startGenerationFromConfirmedPlan(plan, {
      ...ctx,
      suppliedContent: "1. Greet client\n2. Collect info\n3. Confirm next meeting",
    });
    expect(bundle.run.researchBlocked).toBe(false);
    expect(bundle.run.status).toBe("review_ready");
    const primary = getPrimaryDeliverable(bundle)!;
    expect(primary.blocks.some((b) => /Greet client/i.test(b.content))).toBe(
      true,
    );
  });

  it("12 — step-by-step guide uses ordered structured blocks", () => {
    const { plan, ctx } = confirmedPlan(
      "Show me how. Steps: 1. Open app 2. Start 3. Share",
      (p) => ({
        ...p,
        primaryDeliverable: "step_by_step_guide",
        researchStage: "not_at_all",
        supportingDeliverables: [],
        status: "ready_to_generate",
      }),
    );
    const bundle = startGenerationFromConfirmedPlan(plan, {
      ...ctx,
      suppliedContent: "1. Open app\n2. Start\n3. Share",
    });
    expect(bundle.run.errors).toEqual([]);
    expect(bundle.deliverables.length).toBeGreaterThan(0);
    const primary = getPrimaryDeliverable(bundle);
    expect(primary).toBeTruthy();
    const steps = primary!.blocks.filter((b) => b.type === "numbered_step");
    expect(steps.length).toBeGreaterThanOrEqual(3);
    expect(steps[0]!.order).toBeLessThan(steps[1]!.order);
  });

  it("13 — checklist uses checklist blocks", () => {
    const { plan, ctx } = confirmedPlan("I only want a checklist.");
    const bundle = startGenerationFromConfirmedPlan(plan, {
      ...ctx,
      suppliedContent: "- One\n- Two\n- Three",
    });
    const primary = getPrimaryDeliverable(bundle)!;
    expect(primary.type).toBe("checklist");
    expect(
      primary.blocks.filter((b) => b.type === "checklist_item").length,
    ).toBeGreaterThanOrEqual(3);
  });

  it("14 — report uses appropriate report sections", () => {
    const { plan, ctx } = confirmedPlan(
      "Give me a detailed report, not a map.",
      (p) => ({
        ...p,
        researchStage: "not_at_all",
        primaryDeliverable: "report",
        supportingDeliverables: [],
        status: "ready_to_generate",
      }),
    );
    const bundle = startGenerationFromConfirmedPlan(plan, ctx);
    const titles = getPrimaryDeliverable(bundle)!
      .blocks.map((b) => b.title)
      .join(" ");
    expect(titles.toLowerCase()).toMatch(/purpose|summary|explanation/);
  });

  it("15 — SOP uses appropriate process sections", () => {
    const { plan, ctx } = confirmedPlan(
      "Create an SOP. Steps: 1. Start 2. Do 3. Finish",
      (p) => ({
        ...p,
        primaryDeliverable: "sop",
        researchStage: "not_at_all",
        supportingDeliverables: [],
        status: "ready_to_generate",
      }),
    );
    const bundle = startGenerationFromConfirmedPlan(plan, {
      ...ctx,
      suppliedContent: "1. Start\n2. Do\n3. Finish",
    });
    const text = getPrimaryDeliverable(bundle)!
      .blocks.map((b) => b.title || b.content)
      .join(" ");
    expect(text).toMatch(/Purpose|Procedure|Completion/i);
  });

  it("16 — training guide uses learning-oriented sections", () => {
    const { plan, ctx } = confirmedPlan(
      "Create a client onboarding process so I can train my staff.",
      (p) => ({
        ...p,
        researchStage: "not_at_all",
        status: "ready_to_generate",
      }),
    );
    const bundle = startGenerationFromConfirmedPlan(plan, {
      ...ctx,
      suppliedContent: "1. Welcome\n2. Setup account\n3. First call",
    });
    const primary = getPrimaryDeliverable(bundle)!;
    expect(["training_guide", "sop"]).toContain(primary.type);
    const text = primary.blocks.map((b) => b.title || "").join(" ");
    expect(text).toMatch(/Learning|Audience|Demonstration|Completion/i);
  });

  it("17 — visual flow creates nodes and relationships without canvas rendering", () => {
    const { plan, ctx } = confirmedPlan(
      "Help me map how my business works.",
      (p) => ({
        ...p,
        interactionStyle: "collaborate",
        primaryDeliverable: "process_flow",
        researchStage: "not_at_all",
        supportingDeliverables: [],
        declinesMap: false,
        status: "ready_to_generate",
      }),
    );
    const bundle = startGenerationFromConfirmedPlan(plan, ctx);
    const primary = getPrimaryDeliverable(bundle)!;
    expect(primary.visualShell).toBeTruthy();
    expect(primary.visualShell!.nodes.length).toBeGreaterThan(0);
    expect(primary.visualShell!.relationships.length).toBeGreaterThan(0);
  });

  it("18 — user edits survive section regeneration", () => {
    const { plan, ctx } = confirmedPlan(
      "Create a checklist. Steps: 1. A 2. B 3. C",
      (p) => ({
        ...p,
        primaryDeliverable: "checklist",
        researchStage: "not_at_all",
        supportingDeliverables: [],
        status: "ready_to_generate",
      }),
    );
    const bundle = startGenerationFromConfirmedPlan(plan, {
      ...ctx,
      suppliedContent: "1. A\n2. B\n3. C",
    });
    let primary = getPrimaryDeliverable(bundle)!;
    const target = primary.blocks.find((b) => b.type === "checklist_item")!;
    primary = applyBlockEdit(primary, {
      kind: "edit",
      blockId: target.id,
      content: "User wrote this",
    });
    expect(primary.blocks.find((b) => b.id === target.id)!.userEdited).toBe(
      true,
    );
    primary = transformBlock(primary, target.id, "regenerate");
    expect(primary.blocks.find((b) => b.id === target.id)!.content).toBe(
      "User wrote this",
    );
  });

  it("19 — simplify reduces content without changing the goal/type", () => {
    const { plan, ctx } = confirmedPlan(
      "Create a detailed training guide for onboarding.",
      (p) => ({
        ...p,
        primaryDeliverable: "training_guide",
        detailLevel: "detailed",
        researchStage: "not_at_all",
        supportingDeliverables: [],
        status: "ready_to_generate",
      }),
    );
    const bundle = startGenerationFromConfirmedPlan(plan, ctx);
    const before = getPrimaryDeliverable(bundle)!;
    const after = simplifyDeliverable(before);
    expect(after.type).toBe(before.type);
    expect(after.detailLevel).toBe("essentials");
    expect(after.blocks.length).toBeLessThanOrEqual(before.blocks.length);
  });

  it("20 — deepen adds useful structure without inventing research facts", () => {
    const { plan, ctx } = confirmedPlan(
      "Show me how to create a Loom video.",
      (p) => ({
        ...p,
        researchStage: "before_generation",
        primaryDeliverable: "step_by_step_guide",
        supportingDeliverables: [],
        status: "ready_to_generate",
      }),
    );
    const bundle = startGenerationFromConfirmedPlan(plan, ctx);
    const before = getPrimaryDeliverable(bundle)!;
    const after = deepenDeliverable(before);
    expect(after.blocks.length).toBeGreaterThanOrEqual(before.blocks.length);
    expect(after.blocks.map((b) => b.content).join(" ")).not.toMatch(
      /click the red button/i,
    );
  });

  it("21 — failed supporting generation preserves the primary deliverable", () => {
    const { plan, ctx } = confirmedPlan(
      "Create a report about my notes.",
      (p) => ({
        ...p,
        researchStage: "not_at_all",
        declinesMap: true,
        primaryDeliverable: "report",
        supportingDeliverables: ["process_flow"],
        status: "ready_to_generate",
      }),
    );
    const bundle = startGenerationFromConfirmedPlan(plan, ctx);
    expect(getPrimaryDeliverable(bundle)).toBeTruthy();
    expect(
      bundle.deliverables.some((d) => d.type === "process_flow"),
    ).toBe(false);
  });

  it("22 — partial generation is not marked fully completed", () => {
    const { plan, ctx } = confirmedPlan(
      "Create a report.",
      (p) => ({
        ...p,
        researchStage: "not_at_all",
        declinesMap: true,
        primaryDeliverable: "report",
        supportingDeliverables: ["process_flow", "relationship_visualization"],
        status: "ready_to_generate",
      }),
    );
    const bundle = startGenerationFromConfirmedPlan(plan, ctx);
    expect(bundle.run.status).not.toBe("completed");
    expect(["review_ready", "partial", "awaiting_research"]).toContain(
      bundle.run.status,
    );
  });

  it("24–25 — Generation does not re-run Understanding or Orchestrator selection", () => {
    const { plan, ctx } = confirmedPlan(
      "Compare current CRM platforms.",
      (p) => ({
        ...p,
        researchStage: "not_at_all",
        primaryDeliverable: "comparison",
        supportingDeliverables: [],
        status: "ready_to_generate",
      }),
    );
    const lockedPrimary = plan.primaryDeliverable;
    const lockedSupporting = [...plan.supportingDeliverables];
    const bundle = executeGenerationRun(
      {
        ...startGenerationFromConfirmedPlan(plan, ctx).run,
        status: "ready",
        researchBlocked: false,
        deliverableIds: [],
        primaryDeliverableId: null,
        supportingDeliverableIds: [],
        completedStages: [],
        errors: [],
        warnings: [],
      },
      plan,
      ctx,
    );
    expect(getPrimaryDeliverable(bundle)!.type).toBe(lockedPrimary);
    expect(getSupportingDeliverables(bundle).map((d) => d.type)).toEqual(
      lockedSupporting,
    );
  });

  describe("Scenario tests A–F", () => {
    it("A — user-provided process → SOP review_ready", () => {
      const { plan, ctx } = confirmedPlan(
        "Turn these steps into an SOP: 1. Greet 2. Collect 3. Confirm",
      );
      const bundle = startGenerationFromConfirmedPlan(plan, {
        ...ctx,
        suppliedContent: "1. Greet\n2. Collect\n3. Confirm",
      });
      expect(bundle.run.researchBlocked).toBe(false);
      expect(getPrimaryDeliverable(bundle)!.type).toMatch(/sop|training_guide/);
      expect(bundle.run.status).toBe("review_ready");
    });

    it("B — Loom current instructions → awaiting_research with usable steps", () => {
      const { plan, ctx } = confirmedPlan(
        "Show me how to create a Loom video. I need every step.",
        (p) => ({
          ...p,
          researchStage: "before_generation",
          primaryDeliverable: "step_by_step_guide",
          supportingDeliverables: ["checklist", "process_flow"],
          status: "ready_to_generate",
        }),
      );
      const bundle = startGenerationFromConfirmedPlan(plan, ctx);
      expect(bundle.run.status).toBe("awaiting_research");
      const primary = getPrimaryDeliverable(bundle)!;
      expect(
        primary.blocks.some(
          (b) =>
            b.type === "placeholder" ||
            b.metadata.researchDependent === true ||
            b.metadata.freshnessSensitive === true,
        ),
      ).toBe(true);
      expect(
        primary.blocks.filter((b) => b.type === "numbered_step").length,
      ).toBeGreaterThanOrEqual(3);
    });

    it("C — own business map → user-led shell", () => {
      const { plan, ctx } = confirmedPlan(
        "I want to map my own ideas about my business.",
      );
      const bundle = startGenerationFromConfirmedPlan(plan, ctx);
      const primary = getPrimaryDeliverable(bundle)!;
      expect(primary.sourceMode).toBe("user_led_shell");
      expect(bundle.run.researchBlocked).toBe(false);
    });

    it("D — staff onboarding training + supporting", () => {
      const { plan, ctx } = confirmedPlan(
        "Create a client onboarding process so I can train my staff.",
        (p) => ({
          ...p,
          researchStage: "not_at_all",
          supportingDeliverables: ["checklist", "process_flow"],
          status: "ready_to_generate",
        }),
      );
      const bundle = startGenerationFromConfirmedPlan(plan, {
        ...ctx,
        suppliedContent: "1. Welcome\n2. Forms\n3. Kickoff call",
      });
      expect(["training_guide", "sop"]).toContain(
        getPrimaryDeliverable(bundle)!.type,
      );
      expect(getSupportingDeliverables(bundle).map((d) => d.type).sort()).toEqual(
        ["checklist", "process_flow"].sort(),
      );
    });

    it("E — report only, no map, no supporting", () => {
      const { plan, ctx } = confirmedPlan(
        "Give me a detailed report. I do not want a map.",
        (p) => ({
          ...p,
          researchStage: "not_at_all",
          primaryDeliverable: "report",
          supportingDeliverables: [],
          declinesMap: true,
          status: "ready_to_generate",
        }),
      );
      const bundle = startGenerationFromConfirmedPlan(plan, ctx);
      expect(bundle.deliverables).toHaveLength(1);
      expect(bundle.deliverables[0]!.type).toBe("report");
    });

    it("F — guide_me SOP is not falsely complete", () => {
      const { plan, ctx } = confirmedPlan(
        "Walk me through an SOP for onboarding.",
        (p) => ({
          ...p,
          primaryDeliverable: "sop",
          interactionStyle: "guide_me",
          researchStage: "not_at_all",
          supportingDeliverables: [],
          status: "ready_to_generate",
        }),
      );
      const bundle = startGenerationFromConfirmedPlan(plan, ctx);
      expect(bundle.run.status).not.toBe("completed");
      expect(
        getPrimaryDeliverable(bundle)!.blocks.some(
          (b) => b.type === "question" || b.type === "user_note",
        ),
      ).toBe(true);
    });
  });
});
