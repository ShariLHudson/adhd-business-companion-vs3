import { describe, expect, it } from "vitest";
import {
  applyRequestText,
  confirmRecommendation,
  createVisualThinkingRequest,
  detectHelpDepth,
} from "@/lib/cartographersStudio/visualThinkingRequest";
import {
  detectCreationMode,
  interpretVisualThinkingUnderstanding,
} from "@/lib/cartographersStudio/visualThinkingUnderstanding";
import { orchestrateVisualThinkingExperience } from "@/lib/cartographersStudio/visualThinkingExperienceOrchestrator";
import {
  knowledgeHandoffToGenerationContext,
  prepareVisualThinkingKnowledge,
  projectKnowledgePreparationStatus,
} from "@/lib/cartographersStudio/visualThinkingKnowledgeIntelligence";
import {
  getPrimaryDeliverable,
  startGenerationFromConfirmedPlan,
  type VisualThinkingGeneratedDeliverable,
} from "@/lib/cartographersStudio/visualThinkingGenerationEngine";
import {
  assessClarificationNecessity,
  assessGeneratedResultSubstance,
  assessRequestAuthorization,
  assessScopedReadiness,
  buildAutomaticContinuationPlan,
  buildInstructionalGenerationMaterial,
  inferCreationModeFromRequest,
  inferDetailLevelFromRequest,
  resolveKnowledgeGap,
} from "@/lib/cartographersStudio/visualThinkingGenerateFirst";

const LOOM =
  "I need to learn how to make a Loom video and upload it to YouTube.";

function makeEchoDeliverable(
  raw: string,
): VisualThinkingGeneratedDeliverable {
  return {
    id: "d1",
    generationRunId: "r1",
    planId: "p1",
    type: "step_by_step_guide",
    role: "primary",
    title: `Guide: ${raw}`,
    purpose: raw,
    audience: null,
    detailLevel: "guided",
    blocks: [
      {
        id: "b1",
        type: "heading",
        title: "Overview",
        content: raw,
        order: 0,
        parentId: null,
        metadata: {},
        editable: true,
        userEdited: false,
      },
      {
        id: "b2",
        type: "paragraph",
        title: null,
        content: raw,
        order: 1,
        parentId: null,
        metadata: {},
        editable: true,
        userEdited: false,
      },
      {
        id: "b3",
        type: "numbered_step",
        title: "Step 1",
        content: `Complete step 1 for ${raw.slice(0, 40)}`,
        order: 2,
        parentId: null,
        metadata: {},
        editable: true,
        userEdited: false,
      },
    ],
    linkedDeliverableIds: [],
    editable: true,
    userEdited: false,
    status: "review_ready",
    sourceMode: "deterministic_v1",
    sourceReferences: [],
    visualShell: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    error: null,
  };
}

describe("Visual Thinking Generate-First (6.6)", () => {
  it("1–3. clear teach/show/create requests authorize creation", () => {
    expect(assessRequestAuthorization("Teach me how to create a Loom video").authorized).toBe(
      true,
    );
    expect(assessRequestAuthorization("Show me how to upload to YouTube").authorized).toBe(
      true,
    );
    expect(
      assessRequestAuthorization("Create an SOP for onboarding clients").authorized,
    ).toBe(true);
    expect(assessRequestAuthorization(LOOM).creationMode).toBe("build_for_me");
  });

  it("4. authorized requests skip Yes-create confirmation", () => {
    const auth = assessRequestAuthorization(LOOM);
    expect(auth.skipRecommendationConfirm).toBe(true);
    expect(auth.skipSafeOutlineGate).toBe(true);
  });

  it("5–6. detail is inferred and can be changed later", () => {
    expect(inferDetailLevelFromRequest(LOOM)).toBe("guided");
    expect(inferDetailLevelFromRequest("Walk me through every step of Loom")).toBe(
      "detailed",
    );
    expect(inferDetailLevelFromRequest("Give me the basic steps")).toBe("essentials");
    const req = applyRequestText(createVisualThinkingRequest({}), LOOM);
    expect(req.status).not.toBe("awaiting_depth");
    expect(req.requestedDepth).toBe("guided");
  });

  it("7. publicly researchable Loom details do not require user clarification", () => {
    const req = applyRequestText(createVisualThinkingRequest({}), LOOM);
    const confirmed = confirmRecommendation(req);
    const understanding = interpretVisualThinkingUnderstanding(confirmed);
    const plan = orchestrateVisualThinkingExperience(understanding);
    const knowledge = prepareVisualThinkingKnowledge({
      request: confirmed,
      understanding,
      experiencePlan: plan,
      attachedStructuredContent: LOOM,
    });
    const clarification = assessClarificationNecessity({
      rawRequest: LOOM,
      gaps: knowledge.package.knowledgeGaps,
      creationMode: understanding.creationMode,
    });
    expect(clarification.required).toBe(false);
  });

  it("8–9. user-owned SOP may ask one focused question", () => {
    const raw =
      "Create an SOP for how my VA publishes my weekly newsletter.";
    const req = applyRequestText(createVisualThinkingRequest({}), raw);
    const confirmed = confirmRecommendation(req);
    const understanding = interpretVisualThinkingUnderstanding(confirmed);
    const plan = orchestrateVisualThinkingExperience(understanding);
    const knowledge = prepareVisualThinkingKnowledge({
      request: confirmed,
      understanding,
      experiencePlan: plan,
      attachedStructuredContent: raw,
    });
    const clarification = assessClarificationNecessity({
      rawRequest: raw,
      gaps: knowledge.package.knowledgeGaps.map((g) =>
        g.userInputNeeded || g.resolutionType === "user_input"
          ? g
          : {
              ...g,
              userInputNeeded: true,
              researchNeeded: false,
              resolutionType: "user_input" as const,
              priority: "required" as const,
              status: "open" as const,
              focusedQuestion: "What steps does your VA follow today?",
            },
      ),
      creationMode: "build_for_me",
    });
    expect(clarification.required).toBe(true);
    expect(clarification.question).toBeTruthy();
    expect(clarification.blocksAllGeneration).toBe(false);
  });

  it("10–11. external research gaps auto-route; safe generation may proceed", () => {
    const req = applyRequestText(createVisualThinkingRequest({}), LOOM);
    const confirmed = confirmRecommendation(req);
    const understanding = interpretVisualThinkingUnderstanding(confirmed);
    const plan = orchestrateVisualThinkingExperience(understanding);
    const knowledge = prepareVisualThinkingKnowledge({
      request: confirmed,
      understanding,
      experiencePlan: plan,
      attachedStructuredContent: LOOM,
    });
    const researchGap = knowledge.package.knowledgeGaps.find(
      (g) => g.researchNeeded || g.resolutionType === "external_research",
    );
    expect(researchGap).toBeTruthy();
    const decision = resolveKnowledgeGap(researchGap!, { rawRequest: LOOM });
    expect(decision.resolutionType).toBe("external_research");
    expect(decision.automatic).toBe(true);
    expect(decision.requiresUser).toBe(false);
    const scoped = assessScopedReadiness(
      knowledge.package,
      knowledge.package.knowledgeGaps.map((g) =>
        resolveKnowledgeGap(g, { rawRequest: LOOM }),
      ),
    );
    expect(scoped.mayProceedToGeneration).toBe(true);
    expect(scoped.blocksAllGeneration).toBe(false);
  });

  it("12–15. structure/partial proceed; only not_ready may block all", () => {
    const req = applyRequestText(createVisualThinkingRequest({}), LOOM);
    const confirmed = confirmRecommendation(req);
    const understanding = interpretVisualThinkingUnderstanding(confirmed);
    const plan = orchestrateVisualThinkingExperience({
      ...understanding,
      creationMode: "build_for_me",
    });
    const confirmedPlan = {
      ...plan,
      status: "ready_to_generate" as const,
    };
    const knowledge = prepareVisualThinkingKnowledge({
      request: confirmed,
      understanding: { ...understanding, creationMode: "build_for_me" },
      experiencePlan: confirmedPlan,
      attachedStructuredContent: LOOM,
    });
    expect(
      ["structure_ready", "partial_ready", "full_ready"].includes(
        knowledge.package.readiness,
      ),
    ).toBe(true);
    const status = projectKnowledgePreparationStatus(knowledge);
    expect(status.canProceedGenerateFirst).toBe(true);
    const handoffCtx = knowledgeHandoffToGenerationContext(
      knowledge.handoff,
      {
        requestId: confirmed.id,
        understandingId: understanding.id,
        rawRequest: LOOM,
        userFacingGoal: understanding.userFacingGoal,
      },
      knowledge.package,
    );
    expect(handoffCtx.suppliedContent).toBeTruthy();
    expect(handoffCtx.suppliedContent).not.toContain("Complete step 1 for");
    const bundle = startGenerationFromConfirmedPlan(confirmedPlan, {
      ...handoffCtx,
      knowledgeResearchSatisfied: true,
    });
    const primary = getPrimaryDeliverable(bundle);
    expect(primary).toBeTruthy();
    const steps = primary!.blocks.filter((b) => b.type === "numbered_step");
    expect(steps.length).toBeGreaterThanOrEqual(5);
    expect(
      steps.some((s) => /loom|youtube|record|upload/i.test(s.content + (s.title ?? ""))),
    ).toBe(true);
    expect(primary!.blocks.every((b) => b.content !== LOOM)).toBe(true);
  });

  it("20–22. substance validation rejects request-echo and thin guides", () => {
    const echo = assessGeneratedResultSubstance({
      deliverable: makeEchoDeliverable(LOOM),
      rawRequest: LOOM,
    });
    expect(echo.substantive).toBe(false);
    expect(echo.failureReasons.length).toBeGreaterThan(0);

    const material = buildInstructionalGenerationMaterial(LOOM);
    const good: VisualThinkingGeneratedDeliverable = {
      ...makeEchoDeliverable(LOOM),
      title: material.title,
      blocks: material.steps.map((s, i) => ({
        id: `s${i}`,
        type: "numbered_step" as const,
        title: s.title,
        content: s.content,
        order: i,
        parentId: null,
        metadata: {},
        editable: true,
        userEdited: false,
      })),
    };
    const ok = assessGeneratedResultSubstance({
      deliverable: good,
      rawRequest: LOOM,
    });
    expect(ok.substantive).toBe(true);
  });

  it("23. comparison without options fails substance", () => {
    const comparison: VisualThinkingGeneratedDeliverable = {
      ...makeEchoDeliverable("Compare CRMs"),
      type: "comparison_table",
      blocks: [
        {
          id: "c1",
          type: "heading",
          title: "Compare",
          content: "Compare CRMs",
          order: 0,
          parentId: null,
          metadata: {},
          editable: true,
          userEdited: false,
        },
      ],
    };
    const result = assessGeneratedResultSubstance({
      deliverable: comparison,
      rawRequest: "Compare CRMs for my small business.",
    });
    expect(result.substantive).toBe(false);
  });

  it("24. checklist without actionable items fails substance", () => {
    const checklist: VisualThinkingGeneratedDeliverable = {
      ...makeEchoDeliverable("checklist"),
      type: "checklist",
      blocks: [
        {
          id: "h",
          type: "heading",
          title: "Checklist",
          content: "Things to do",
          order: 0,
          parentId: null,
          metadata: {},
          editable: true,
          userEdited: false,
        },
      ],
    };
    expect(
      assessGeneratedResultSubstance({
        deliverable: checklist,
        rawRequest: "Make a checklist",
      }).substantive,
    ).toBe(false);
  });

  it("E. user-led visual infers build_myself", () => {
    expect(inferCreationModeFromRequest("I want to make my own map")).toBe(
      "build_myself",
    );
    expect(detectCreationMode("I want to make my own map")).toBe("build_myself");
    const auth = assessRequestAuthorization("I want to make my own map");
    expect(auth.skipRecommendationConfirm).toBe(false);
    expect(buildAutomaticContinuationPlan(auth).stages).not.toContain("generate");
  });

  it("creation mode: teach me → build_for_me via Understanding", () => {
    expect(detectCreationMode("Teach me how to create a Loom video")).toBe(
      "build_for_me",
    );
    expect(detectCreationMode("Show me how to upload to YouTube")).toBe(
      "build_for_me",
    );
    expect(detectHelpDepth(LOOM)).toBe("unspecified");
  });

  it("A. Loom scenario end-to-end produce meaningful guide", () => {
    const auth = assessRequestAuthorization(LOOM);
    expect(auth.creationMode).toBe("build_for_me");
    expect(auth.skipDetailScreen).toBe(true);
    const material = buildInstructionalGenerationMaterial(LOOM);
    expect(material.domain).toBe("screen_recording_publish");
    expect(material.steps.length).toBeGreaterThanOrEqual(10);
    expect(material.freshnessNotice).toBeTruthy();
  });
});
