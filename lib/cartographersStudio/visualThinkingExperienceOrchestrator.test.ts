/**
 * Visual Thinking Experience Orchestrator tests (Build 3).
 * @vitest-environment node
 */
import { beforeEach, describe, expect, it } from "vitest";
import {
  __resetAdaptiveCompanionExplicitPrefsForTests,
  patchAdaptiveCompanionExplicitPrefs,
} from "@/lib/adaptiveCompanionIntelligence";
import {
  applyRequestText,
  clearVisualThinkingRequestDraft,
  createVisualThinkingRequest,
} from "@/lib/cartographersStudio/visualThinkingRequest";
import {
  applyUnderstandingCorrection,
  interpretVisualThinkingUnderstanding,
} from "@/lib/cartographersStudio/visualThinkingUnderstanding";
import {
  applyExperiencePlanOverride,
  convertibleDeliverables,
  experiencePlanHonorsUnderstandingExclusions,
  orchestrateVisualThinkingExperience,
  orchestratorConsumesUnderstandingContract,
  projectExperiencePlanPreview,
  selectInteractionStyle,
  selectPrimaryExperience,
  selectResearchPosition,
  type VisualThinkingExperiencePlan,
} from "@/lib/cartographersStudio/visualThinkingExperienceOrchestrator";

function understand(raw: string, entryPath?: "user_led_visual" | "research_assisted") {
  const base = entryPath
    ? createVisualThinkingRequest({ rawRequest: raw, entryPath })
    : applyRequestText(createVisualThinkingRequest({}), raw);
  return interpretVisualThinkingUnderstanding(base);
}

function planFor(raw: string, entryPath?: "user_led_visual" | "research_assisted") {
  const u = understand(raw, entryPath);
  return { understanding: u, plan: orchestrateVisualThinkingExperience(u) };
}

describe("Visual Thinking Experience Orchestrator", () => {
  beforeEach(() => {
    clearVisualThinkingRequestDraft();
    __resetAdaptiveCompanionExplicitPrefsForTests();
  });

  it("consumes Understanding contract without requiring raw re-interpretation", () => {
    const u = understand("Show me how to create a Loom video. I need every step.");
    expect(orchestratorConsumesUnderstandingContract(u)).toBe(true);
    const plan = orchestrateVisualThinkingExperience(u);
    expect(plan.understandingId).toBe(u.id);
  });

  it("selects Guided Learning + step-by-step for Loom how-to", () => {
    const { plan } = planFor(
      "Show me how to create a Loom video. I need every step.",
    );
    expect(plan.primaryExperience).toBe("learning");
    expect(plan.primaryDeliverable).toBe("step_by_step_guide");
    expect(plan.supportingDeliverables.length).toBeGreaterThan(0);
    expect(plan.supportingDeliverables).not.toContain(plan.primaryDeliverable);
  });

  it("selects Understanding/Research experience for Medicare", () => {
    const { understanding, plan } = planFor(
      "Research Medicare and explain it simply.",
    );
    expect(["research", "understanding"]).toContain(plan.primaryExperience);
    expect(["report", "concise_explanation"]).toContain(plan.primaryDeliverable);
    expect(plan.researchStage).toBe("before_generation");
    expect(
      experiencePlanHonorsUnderstandingExclusions(plan, understanding),
    ).toBe(true);
  });

  it("selects visual organization for business mapping", () => {
    const { plan } = planFor("Help me map how my business works.");
    expect(["organization", "visual_thinking"]).toContain(plan.primaryExperience);
    expect([
      "editable_relationship_map",
      "relationship_visualization",
    ]).toContain(plan.primaryDeliverable);
    expect(plan.researchStage).toBe("not_at_all");
  });

  it("selects comparison for CRM-style compare requests", () => {
    const { plan } = planFor("Compare current email marketing platforms.");
    expect(plan.primaryExperience).toBe("comparison");
    expect(plan.primaryDeliverable).toBe("comparison");
    expect(plan.researchStage).toBe("before_generation");
  });

  it("selects teaching for staff training", () => {
    const { plan } = planFor(
      "Create a client onboarding process so I can train my staff.",
    );
    expect(plan.primaryExperience).toBe("teaching");
    expect(["training_guide", "sop"]).toContain(plan.primaryDeliverable);
  });

  it("selects decision support and does not decide for the user", () => {
    const { plan } = planFor("Help me decide whether to hire an employee.");
    expect(plan.primaryExperience).toBe("decision_support");
    expect(["decision_tree", "comparison"]).toContain(plan.primaryDeliverable);
    expect(plan.reviewPoints.join(" ")).toMatch(/confirm|review/i);
  });

  it("honors report-only and no-map exclusions", () => {
    const { understanding, plan } = planFor(
      "Research this and give me a detailed report. I do not want a map.",
    );
    expect(plan.primaryDeliverable).toBe("report");
    expect(plan.declinesMap).toBe(true);
    expect(
      [plan.primaryDeliverable, ...plan.supportingDeliverables].some(
        (d) =>
          d === "editable_relationship_map" ||
          d === "relationship_visualization" ||
          d === "process_flow",
      ),
    ).toBe(false);
    expect(
      experiencePlanHonorsUnderstandingExclusions(plan, understanding),
    ).toBe(true);
  });

  it("build_myself → let_me_build, no research, no finished supporting results", () => {
    const { plan } = planFor("I want to map my own ideas about my business.");
    expect(plan.interactionStyle).toBe("let_me_build");
    expect(plan.researchStage).toBe("not_at_all");
    expect(plan.primaryDeliverable).toBe("editable_relationship_map");
    expect(plan.supportingDeliverables).toEqual([]);
    expect(plan.generationStages).toEqual([
      "prepare_user_led_canvas",
      "review",
      "return_to_user",
    ]);
  });

  it("research stage follows Understanding researchNeed", () => {
    expect(selectResearchPosition("required", "build_for_me")).toBe(
      "before_generation",
    );
    expect(selectResearchPosition("optional", "collaborate")).toBe(
      "during_generation",
    );
    expect(selectResearchPosition("not_needed", "collaborate")).toBe(
      "not_at_all",
    );
    expect(selectResearchPosition("required", "let_me_build")).toBe(
      "not_at_all",
    );
  });

  it("interaction style preserves creation mode", () => {
    expect(selectInteractionStyle("build_for_me")).toBe("build_for_me");
    expect(selectInteractionStyle("guide_me")).toBe("guide_me");
    expect(selectInteractionStyle("build_myself")).toBe("let_me_build");
    expect(selectInteractionStyle("unspecified")).toBe("collaborate");
  });

  it("supporting deliverables stay optional and non-duplicative", () => {
    const { plan } = planFor(
      "Show me how to create a Loom video. I need every step.",
    );
    expect(plan.supportingDeliverables).not.toContain(plan.primaryDeliverable);
    expect(new Set(plan.supportingDeliverables).size).toBe(
      plan.supportingDeliverables.length,
    );
  });

  it("does not invent extras beyond Understanding recommendations", () => {
    const { understanding, plan } = planFor("I only want a checklist.");
    expect(plan.primaryDeliverable).toBe("checklist");
    expect(plan.supportingDeliverables).toEqual([]);
    expect(
      experiencePlanHonorsUnderstandingExclusions(plan, understanding),
    ).toBe(true);
  });

  it("overrides change the plan without requiring a new Understanding id", () => {
    const { understanding, plan } = planFor(
      "Show me how to create a Loom video. I need every step.",
    );
    const next = applyExperiencePlanOverride(plan, {
      kind: "remove_supporting",
      deliverable: plan.supportingDeliverables[0]!,
    });
    expect(next.understandingId).toBe(understanding.id);
    expect(next.supportingDeliverables.length).toBe(
      plan.supportingDeliverables.length - 1,
    );
    expect(next.status).toBe("user_adjusted");
    expect(next.userOverrides.removedSupporting?.length).toBe(1);

    const switched = applyExperiencePlanOverride(next, {
      kind: "set_primary_deliverable",
      deliverable: "checklist",
    });
    expect(switched.primaryDeliverable).toBe("checklist");
    expect(switched.understandingId).toBe(understanding.id);
  });

  it("output switching contract is preserved on the plan", () => {
    const { plan } = planFor(
      "Show me how to create a Loom video. I need every step.",
    );
    expect(plan.convertibleTo.length).toBeGreaterThan(0);
    expect(plan.convertibleTo).toEqual(
      expect.arrayContaining(["checklist", "training_guide", "sop"]),
    );
    expect(plan.editingMode).toEqual(
      expect.arrayContaining([
        "editing",
        "conversion",
        "simplification",
        "expansion",
      ]),
    );
    expect(
      convertibleDeliverables("report", true).some(
        (d) =>
          d === "editable_relationship_map" ||
          d === "relationship_visualization" ||
          d === "process_flow",
      ),
    ).toBe(false);
  });

  it("generation stages skip research when not needed", () => {
    const { plan } = planFor("Organize these ideas I pasted.");
    expect(plan.generationStages).not.toContain("research");
    expect(plan.generationStages).toContain("create_primary");
    expect(plan.generationStages.at(-1)).toBe("return_to_user");
  });

  it("generation stages place required research before primary creation", () => {
    const { plan } = planFor("Compare current CRM platforms.");
    const researchIdx = plan.generationStages.indexOf("research");
    const primaryIdx = plan.generationStages.indexOf("create_primary");
    expect(researchIdx).toBeGreaterThanOrEqual(0);
    expect(researchIdx).toBeLessThan(primaryIdx);
  });

  it("Adaptive Companion reduces visible supporting choices but keeps plan depth", () => {
    patchAdaptiveCompanionExplicitPrefs({ choiceLoad: "one" });
    const { understanding, plan } = planFor(
      "Show me how to create a Loom video. I need every step.",
    );
    expect(plan.primaryDeliverable).toBe("step_by_step_guide");
    expect(plan.detailLevel).toBe("detailed");
    expect(plan.supportingDeliverables.length).toBeGreaterThan(0);
    const preview = projectExperiencePlanPreview(plan, understanding);
    expect(preview.supportingLines.length).toBeLessThanOrEqual(1);
  });

  it("preview projection stays natural-language (no technical enums)", () => {
    const { understanding, plan } = planFor(
      "Show me how to create a Loom video. I need every step.",
    );
    const preview = projectExperiencePlanPreview(plan, understanding);
    expect(preview.experienceLine).toBe("Guided Learning");
    expect(preview.primaryDeliverableLine).toMatch(/step-by-step/i);
    expect(preview.experienceLine).not.toMatch(/learn_how|primaryExperience/);
    expect(preview.stagesSummary).toMatch(/→/);
  });

  it("selectPrimaryExperience uses Understanding fields only", () => {
    const u = understand("Help me decide whether to hire an employee.");
    expect(selectPrimaryExperience(u)).toBe("decision_support");
  });

  it("re-orchestrates after Understanding correction without losing plan linkage shape", () => {
    const original = understand("Show me how to create a Loom video.");
    const corrected = applyUnderstandingCorrection(original, {
      kind: "natural_language",
      text: "This is actually for training my team.",
    });
    const plan = orchestrateVisualThinkingExperience(corrected);
    expect(plan.primaryExperience).toBe("teaching");
    expect(["training_guide", "sop"]).toContain(plan.primaryDeliverable);
    expect(plan.understandingId).toBe(corrected.id);
  });

  describe("Browser validation scenarios (logic)", () => {
    const cases: Array<{
      name: string;
      raw: string;
      experience: VisualThinkingExperiencePlan["primaryExperience"] | VisualThinkingExperiencePlan["primaryExperience"][];
      deliverable?: VisualThinkingExperiencePlan["primaryDeliverable"] | VisualThinkingExperiencePlan["primaryDeliverable"][];
      research?: VisualThinkingExperiencePlan["researchStage"];
      interaction?: VisualThinkingExperiencePlan["interactionStyle"];
    }> = [
      {
        name: "Loom",
        raw: "Show me how to make a Loom video. I need every step.",
        experience: "learning",
        deliverable: "step_by_step_guide",
      },
      {
        name: "Medicare",
        raw: "Research Medicare.",
        experience: ["research", "understanding"],
        research: "before_generation",
      },
      {
        name: "Business Mapping",
        raw: "Help me map how my business works.",
        experience: ["organization", "visual_thinking"],
        research: "not_at_all",
      },
      {
        name: "CRM Comparison",
        raw: "Compare current CRM platforms.",
        experience: "comparison",
        deliverable: "comparison",
        research: "before_generation",
      },
      {
        name: "Staff Training",
        raw: "Create a client onboarding process for training my staff.",
        experience: "teaching",
        deliverable: ["training_guide", "sop"],
      },
      {
        name: "Decision Support",
        raw: "Help me decide whether to hire an employee.",
        experience: "decision_support",
      },
      {
        name: "Report Only",
        raw: "Research this and give me a detailed report. I do not want a map.",
        experience: ["research", "understanding"],
        deliverable: "report",
      },
      {
        name: "No Map",
        raw: "Give me a report, not a map.",
        deliverable: "report",
      },
      {
        name: "Build Myself",
        raw: "I want to build my own map.",
        experience: "visual_thinking",
        interaction: "let_me_build",
        research: "not_at_all",
      },
    ];

    for (const c of cases) {
      it(c.name, () => {
        const { plan } = planFor(c.raw);
        if (c.experience) {
          const allowed = Array.isArray(c.experience)
            ? c.experience
            : [c.experience];
          expect(allowed).toContain(plan.primaryExperience);
        }
        if (c.deliverable) {
          const allowed = Array.isArray(c.deliverable)
            ? c.deliverable
            : [c.deliverable];
          expect(allowed).toContain(plan.primaryDeliverable);
        }
        if (c.research) expect(plan.researchStage).toBe(c.research);
        if (c.interaction) expect(plan.interactionStyle).toBe(c.interaction);
        if (c.name === "No Map" || c.name === "Report Only") {
          expect(
            [plan.primaryDeliverable, ...plan.supportingDeliverables].some(
              (d) =>
                d === "editable_relationship_map" ||
                d === "relationship_visualization" ||
                d === "process_flow",
            ),
          ).toBe(false);
        }
      });
    }
  });
});
