/**
 * Visual Thinking Understanding Engine tests (Build 2).
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
  detectHelpDepth,
} from "@/lib/cartographersStudio/visualThinkingRequest";
import {
  applyUnderstandingCorrection,
  assessResearchNeed,
  detectCreationMode,
  detectKnowledgeLevel,
  inferPrimaryGoal,
  interpretVisualThinkingUnderstanding,
  projectUnderstandingPreview,
} from "@/lib/cartographersStudio/visualThinkingUnderstanding";

function understand(raw: string, entryPath?: "user_led_visual" | "research_assisted") {
  const base = entryPath
    ? createVisualThinkingRequest({ rawRequest: raw, entryPath })
    : applyRequestText(createVisualThinkingRequest({}), raw);
  return interpretVisualThinkingUnderstanding(base);
}

describe("Visual Thinking Understanding Engine", () => {
  beforeEach(() => {
    clearVisualThinkingRequestDraft();
    __resetAdaptiveCompanionExplicitPrefsForTests();
  });

  it("1 — Loom how-to: learn + create, optional/required research, guide primary", () => {
    const u = understand("Show me how to create a Loom video.");
    expect(u.primaryGoal).toBe("learn_how");
    expect(u.cognitiveTasks).toEqual(
      expect.arrayContaining(["learn", "create"]),
    );
    expect(["optional", "required"]).toContain(u.researchNeed);
    expect(u.recommendedPrimaryOutput).toBe("step_by_step_guide");
    expect(u.recommendedSupportingOutputs).toEqual(
      expect.arrayContaining(["process_flow", "checklist"]),
    );
  });

  it("2 — Loom with basics known: not beginner; skips remedial tone", () => {
    const u = understand(
      "Show me how to create a Loom video. I already know the basics.",
    );
    expect(u.userKnowledgeLevel).not.toBe("beginner");
    expect(u.userKnowledgeLevel).toBe("developing");
    expect(u.userFacingRecommendation).toMatch(/skips the basics/i);
  });

  it("3 — Every step, no map: detailed guide, no visual-map outputs", () => {
    const u = understand(
      "Create every step for making a Loom video. No map.",
    );
    expect(u.effectiveDepth).toBe("detailed");
    expect(u.declinesMap).toBe(true);
    expect(u.recommendedPrimaryOutput).toBe("step_by_step_guide");
    expect(u.recommendedSupportingOutputs.some((o) => /map|flow|decision/i.test(o))).toBe(
      false,
    );
  });

  it("4 — Research Medicare simply: understand, research required, explanation/report", () => {
    const u = understand("Research Medicare and explain it simply.");
    expect(["understand_topic", "research_topic"]).toContain(u.primaryGoal);
    expect(u.researchNeed).toBe("required");
    expect(["essentials", "guided"]).toContain(u.effectiveDepth);
    expect(["concise_explanation", "report", "simple_explanation"]).toContain(
      u.recommendedPrimaryOutput,
    );
  });

  it("5 — Map how business works: organize/connect, relationship visual, no research", () => {
    const u = understand("Help me map how my business works.");
    expect(u.primaryGoal).toBe("see_relationships");
    expect(u.cognitiveTasks).toEqual(
      expect.arrayContaining(["organize", "connect"]),
    );
    expect(u.recommendedPrimaryOutput).toBe("relationship_map");
    expect(u.researchNeed).toBe("not_needed");
  });

  it("6 — Build my own map: build_myself, no completed generation", () => {
    expect(detectCreationMode("I want to build my own map.")).toBe(
      "build_myself",
    );
    const u = understand("I want to build my own map.");
    expect(u.creationMode).toBe("build_myself");
    expect(u.primaryExperience).toBe("user_led_creation");
    expect(u.userFacingRecommendation).toMatch(/will not generate a finished/i);
  });

  it("7 — Compare email platforms: compare + research + comparison primary", () => {
    const u = understand("Compare current email marketing platforms.");
    expect(u.primaryGoal).toBe("compare_options");
    expect(u.cognitiveTasks).toContain("compare");
    expect(u.researchNeed).toBe("required");
    expect(u.recommendedPrimaryOutput).toBe("comparison");
  });

  it("8 — Hire decision: decide + decision support, does not decide for user", () => {
    const u = understand("Help me decide whether to hire an employee.");
    expect(u.primaryGoal).toBe("make_decision");
    expect(u.cognitiveTasks).toContain("decide");
    expect(u.primaryExperience).toBe("decision_support");
    expect(u.userFacingRecommendation).toMatch(/you stay the decision-maker/i);
  });

  it("9 — Staff onboarding training: teach + training/SOP + process/checklist", () => {
    const u = understand(
      "Create a client onboarding process for training my staff.",
    );
    expect(u.primaryGoal).toBe("teach_others");
    expect(["training_guide", "sop"]).toContain(u.recommendedPrimaryOutput);
    expect(u.recommendedSupportingOutputs).toEqual(
      expect.arrayContaining(["process_flow", "checklist"]),
    );
    expect(u.successDefinition).toMatch(/staff|consistently/i);
  });

  it("10 — Organize pasted ideas: organize, research not needed", () => {
    const u = understand("Organize these ideas I pasted.");
    expect(u.primaryGoal).toBe("organize_information");
    expect(u.cognitiveTasks).toContain("organize");
    expect(u.researchNeed).toBe("not_needed");
  });

  it("11 — Report not map: report primary, no visual map", () => {
    const u = understand("Give me a report, not a map.");
    expect(u.recommendedPrimaryOutput).toBe("report");
    expect(u.declinesMap).toBe(true);
    expect(u.recommendedSupportingOutputs.some((o) => /map/i.test(o))).toBe(
      false,
    );
  });

  it("12 — Checklist only", () => {
    const u = understand("I only want a checklist.");
    expect(u.recommendedPrimaryOutput).toBe("checklist");
    expect(u.recommendedSupportingOutputs).toHaveLength(0);
  });

  it("13 — Don't know: one starting experience, not a large menu", () => {
    const u = understand("I don’t know what would be best.");
    expect(u.recommendedPrimaryOutput).toBeTruthy();
    expect(u.recommendedSupportingOutputs.length).toBeLessThanOrEqual(3);
    const preview = projectUnderstandingPreview(u);
    expect(preview.primaryLine.length).toBeGreaterThan(8);
  });

  it("14 — Explicit depth prevents duplicate depth question need", () => {
    expect(
      detectHelpDepth("Show me how to create a Loom video. I need every step."),
    ).toBe("detailed");
    const req = applyRequestText(
      createVisualThinkingRequest({}),
      "Show me how to create a Loom video. I need every step.",
    );
    expect(req.status).toBe("preview");
    const u = interpretVisualThinkingUnderstanding(req);
    expect(u.requestedDepth).toBe("detailed");
    expect(u.effectiveDepth).toBe("detailed");
  });

  it("15 — Explicit creation mode prevents creation-mode question", () => {
    const u = understand("I want to make my own map of my business.");
    expect(u.creationMode).toBe("build_myself");
    expect(u.clarificationNeed).toBeNull();
  });

  it("16 — Unknown knowledge stays unknown without evidence", () => {
    expect(detectKnowledgeLevel("Help me with my marketing process.").level).toBe(
      "unknown",
    );
    const u = understand("Help me with my marketing process.");
    expect(u.userKnowledgeLevel).toBe("unknown");
  });

  it("17 — Assumptions recorded but not treated as facts", () => {
    const u = understand("Show me how to create a Loom video.");
    expect(u.assumptions.length).toBeGreaterThan(0);
    expect(u.userKnowledgeLevel === "unknown" || u.assumptions.some((a) => /unknown/i.test(a))).toBe(
      true,
    );
  });

  it("18 — Low-confidence interpretation produces at most one clarification", () => {
    const u = understand("Help me with Medicare.");
    const clarifiers = [u.clarificationNeed].filter(Boolean);
    expect(clarifiers.length).toBeLessThanOrEqual(1);
  });

  it("19 — User correction updates understanding without losing raw request", () => {
    const original = understand("Show me how to create a Loom video.");
    const corrected = applyUnderstandingCorrection(original, {
      kind: "natural_language",
      text: "This is actually for training my team.",
    });
    expect(corrected.rawRequest).toBe(original.rawRequest);
    expect(corrected.primaryGoal).toBe("teach_others");
    expect(corrected.userAdjusted).toBe(true);
    expect(["training_guide", "sop"]).toContain(
      corrected.recommendedPrimaryOutput,
    );
  });

  it("20 — Adaptive Companion reduces visible choices but not requested depth", () => {
    patchAdaptiveCompanionExplicitPrefs({ choiceLoad: "one" });
    const u = understand(
      "Show me how to create a Loom video. I need every step.",
    );
    expect(u.effectiveDepth).toBe("detailed");
    const preview = projectUnderstandingPreview(u);
    expect(preview.supportingLines.length).toBeLessThanOrEqual(3);
  });

  it("research assessor marks own-business map as not needed", () => {
    const need = assessResearchNeed({
      raw: "Help me map how my business works.",
      primaryGoal: "see_relationships",
      creationMode: "unspecified",
    });
    expect(need.need).toBe("not_needed");
  });

  it("inferPrimaryGoal covers unclear help-me-choose phrasing", () => {
    expect(inferPrimaryGoal("I don't know what would be best.").primary).toBe(
      "unclear",
    );
  });

  describe("Browser validation scenarios A–F (logic)", () => {
    it("A — Loom beginner: detailed guide + research optional/required + supports", () => {
      const u = understand(
        "Show me how to make a Loom video. I need every step.",
      );
      expect(u.primaryGoal).toBe("learn_how");
      expect(u.effectiveDepth).toBe("detailed");
      expect(u.recommendedPrimaryOutput).toBe("step_by_step_guide");
      expect(["optional", "required"]).toContain(u.researchNeed);
      expect(u.clarificationNeed).toBeNull();
      expect(u.recommendedSupportingOutputs.length).toBeGreaterThan(0);
    });

    it("B — Staff training: training/SOP primary with process + checklist", () => {
      const u = understand(
        "Create a client onboarding process so I can train my staff.",
      );
      expect(u.primaryGoal).toBe("teach_others");
      expect(["training_guide", "sop"]).toContain(u.recommendedPrimaryOutput);
      expect(u.successDefinition.toLowerCase()).toMatch(/staff|consist/);
      expect(u.recommendedSupportingOutputs).toEqual(
        expect.arrayContaining(["process_flow", "checklist"]),
      );
    });

    it("C — User-led visual: build_myself, no research, no finished generation", () => {
      const u = understand("I want to map my own ideas about my business.");
      expect(u.creationMode).toBe("build_myself");
      expect(u.researchNeed).toBe("not_needed");
      expect(u.recommendedPrimaryOutput).toBe("editable_visual_map");
      expect(u.recommendedSupportingOutputs).toEqual([]);
      const preview = projectUnderstandingPreview(u);
      expect(preview.creationModeLine ?? "").toMatch(/yourself|will not generate/i);
    });

    it("D — Report only: research required, detailed report, no map", () => {
      const u = understand(
        "Research this and give me a detailed report. I do not want a map.",
      );
      expect(u.researchNeed).toBe("required");
      expect(u.recommendedPrimaryOutput).toBe("report");
      expect(u.effectiveDepth).toBe("detailed");
      expect(u.declinesMap).toBe(true);
      expect(
        [u.recommendedPrimaryOutput, ...u.recommendedSupportingOutputs].some(
          (o) =>
            o === "editable_visual_map" ||
            o === "relationship_map" ||
            o === "mind_map",
        ),
      ).toBe(false);
    });

    it("E — Ambiguous Medicare: understand/research, at most one clarification", () => {
      const u = understand("Help me with Medicare.");
      expect(["understand_topic", "research_topic"]).toContain(u.primaryGoal);
      const clarifiers = [u.clarificationNeed].filter(Boolean);
      expect(clarifiers.length).toBeLessThanOrEqual(1);
      expect(u.recommendedSupportingOutputs.length).toBeLessThanOrEqual(3);
    });

    it("F — Correction: Loom how-to → training revises goal and output", () => {
      const original = understand("Show me how to create a Loom video.");
      const corrected = applyUnderstandingCorrection(original, {
        kind: "natural_language",
        text: "This is actually for training my team.",
      });
      expect(corrected.rawRequest).toBe(original.rawRequest);
      expect(corrected.primaryGoal).toBe("teach_others");
      expect(["training_guide", "sop"]).toContain(
        corrected.recommendedPrimaryOutput,
      );
      expect(corrected.userFacingGoal.toLowerCase()).toMatch(/staff|teach|train/);
    });
  });
});
