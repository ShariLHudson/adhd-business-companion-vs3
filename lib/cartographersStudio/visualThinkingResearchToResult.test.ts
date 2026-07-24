/**
 * Corrective Build 7.1 — rename compatibility + research-to-result.
 * @vitest-environment node
 */
import { describe, expect, it } from "vitest";
import { WELCOME_HOME_NAV_CATEGORIES } from "@/lib/estate/welcomeHomeNavigationStructure";
import { resolveMyDayAndWorkOpenerFromText } from "@/lib/estate/myDayAndWorkNavigation";
import {
  CARTOGRAPHERS_STUDIO_OFFICIAL_NAME,
  VISUAL_THINKING_STUDIO_OFFICIAL_NAME,
} from "@/lib/cartographersStudio/media";
import {
  assessVisualThinkingOutcomeCompletion,
  inferVisualThinkingRequestedOutcome,
  knowledgePackageAloneSatisfiesOutcome,
  researchPlanAloneSatisfiesOutcome,
} from "@/lib/cartographersStudio/visualThinkingRequestedOutcome";
import {
  buildStableResearchFindingsForRequest,
  runVisualThinkingResearchToResult,
} from "@/lib/cartographersStudio/visualThinkingResearchToResult";
import { prepareVisualThinkingKnowledge } from "@/lib/cartographersStudio/visualThinkingKnowledgeIntelligence";
import { createVisualThinkingRequest } from "@/lib/cartographersStudio/visualThinkingRequest";
import { interpretVisualThinkingUnderstanding } from "@/lib/cartographersStudio/visualThinkingUnderstanding";
import { orchestrateVisualThinkingExperience } from "@/lib/cartographersStudio/visualThinkingExperienceOrchestrator";

describe("Visual Thinking Studio rename (7.1)", () => {
  it("1–3. Welcome Home contains Visual Thinking Studio and routes correctly", () => {
    const build = WELCOME_HOME_NAV_CATEGORIES.find((c) => c.id === "build");
    const labels = build?.destinations.map((d) => d.label) ?? [];
    expect(labels).toContain("Visual Thinking Studio");
    expect(labels).not.toContain("Cartography");
    expect(labels).not.toContain("Cartographer's Studio");
    const entry = build?.destinations.find((d) => d.id === "cartographers-studio");
    expect(entry?.label).toBe("Visual Thinking Studio");
    expect(entry?.id).toBe("cartographers-studio");
  });

  it("4–5. Legacy Cartography commands alias; visible name is Visual Thinking Studio", () => {
    expect(resolveMyDayAndWorkOpenerFromText("Open Cartography")).toBe(
      "cartographers-studio",
    );
    expect(
      resolveMyDayAndWorkOpenerFromText("Open Visual Thinking Studio"),
    ).toBe("cartographers-studio");
    expect(VISUAL_THINKING_STUDIO_OFFICIAL_NAME).toBe("Visual Thinking Studio");
    expect(CARTOGRAPHERS_STUDIO_OFFICIAL_NAME).toBe("Visual Thinking Studio");
  });
});

describe("Research-to-result pipeline (7.1)", () => {
  it("8–10. Requested outcomes record research/generation/visual requirements", () => {
    const guide = inferVisualThinkingRequestedOutcome(
      "Research how Loom works now and create a detailed guide for recording a video and uploading it to YouTube.",
    );
    expect(guide.requestedDeliverableType).toMatch(/guide/);
    expect(guide.requiresResearch).toBe(true);
    expect(guide.requiresGeneration).toBe(true);
    expect(guide.requiresWrittenContent).toBe(true);

    const map = inferVisualThinkingRequestedOutcome(
      "Research this and create a map of how the pieces connect.",
    );
    expect(map.requiresVisualProjection).toBe(true);

    const report = inferVisualThinkingRequestedOutcome(
      "Research Medicare changes and create a report.",
    );
    expect(report.requestedDeliverableType).toBe("report");
    expect(report.requiresWrittenContent).toBe(true);
  });

  it("16–17. Research Plan / Knowledge Package alone never complete", () => {
    expect(researchPlanAloneSatisfiesOutcome()).toBe(false);
    expect(knowledgePackageAloneSatisfiesOutcome()).toBe(false);
  });

  it("A. Loom guide — research findings enter package and guide generates", () => {
    const run = runVisualThinkingResearchToResult(
      "Research how Loom works now and create a detailed guide for recording a video and uploading it to YouTube.",
      { entryPath: "research_assisted" },
    );
    expect(run.requestedOutcome.requiresResearch).toBe(true);
    expect(run.researchBundle?.acquiredAt).toBeTruthy();
    const researchItems =
      run.researchBundle?.updatedKnowledgePackage.items.filter(
        (i) => i.category === "research_acquired",
      ) ?? [];
    expect(researchItems.length).toBeGreaterThan(0);
    expect(
      run.generationBundle,
      `no generation: researchSatisfied path failed acquiredAt=${run.researchBundle?.acquiredAt} plan=${run.experiencePlan.primaryDeliverable}`,
    ).toBeTruthy();
    const primary =
      run.generationBundle?.deliverables.find(
        (d) => d.id === run.generationBundle!.run.primaryDeliverableId,
      ) ?? run.generationBundle?.deliverables[0];
    expect(
      primary,
      `deliverables=${run.generationBundle?.deliverables.map((d) => d.type).join(",")} status=${run.generationBundle?.run.status}`,
    ).toBeTruthy();
    expect(primary!.sourceMode).not.toBe("research_placeholder");
    expect(primary!.blocks.length).toBeGreaterThanOrEqual(3);
    const text = primary!.blocks.map((b) => b.content).join(" ").toLowerCase();
    expect(text).not.toMatch(/^research how loom works now/);
    expect(run.completion.generationCompleted).toBe(true);
    expect(
      run.completion.substanceValidationPassed,
      `substance failed: ${JSON.stringify(run.completion.substance?.failureReasons)} type=${primary!.type} steps=${run.completion.substance?.instructionalStepCount}`,
    ).toBe(true);
  });

  it("B. CRM comparison — options and criteria enter knowledge", () => {
    const run = runVisualThinkingResearchToResult(
      "Research the best CRM options for a small consulting business and create a comparison report.",
      { entryPath: "research_assisted" },
    );
    const findings =
      run.researchBundle?.updatedKnowledgePackage.items
        .map((i) => i.content)
        .join(" ")
        .toLowerCase() ?? "";
    expect(findings).toMatch(/hubspot|pipedrive|salesforce/);
    expect(run.generationBundle).toBeTruthy();
    expect(run.completion.requiredResearchResolved).toBe(true);
  });

  it("C. Industry timeline — chronology findings present", () => {
    const run = runVisualThinkingResearchToResult(
      "Research how the online coaching industry has changed and create a timeline.",
      { entryPath: "research_assisted" },
    );
    const findings =
      run.researchBundle?.updatedKnowledgePackage.items
        .map((i) => i.content)
        .join(" ") ?? "";
    expect(findings).toMatch(/2020|201/);
    expect(run.requestedOutcome.requestedDeliverableType).toBe("timeline");
  });

  it("D. Business relationship map — estate knowledge path without empty center", () => {
    const run = runVisualThinkingResearchToResult(
      "Use what you know about my business and create a map of how my offers, audiences, marketing, and projects connect.",
      { entryPath: "describe_request" },
    );
    expect(run.generationBundle || run.researchBundle).toBeTruthy();
    const blob = [
      ...(run.researchBundle?.updatedKnowledgePackage.items.map((i) => i.content) ??
        []),
      ...(run.generationBundle?.deliverables.flatMap((d) =>
        d.blocks.map((b) => b.content),
      ) ?? []),
    ]
      .join(" ")
      .toLowerCase();
    expect(blob).toMatch(/offer|audience|marketing|project/);
  });

  it("E. Report request keeps written outcome primary", () => {
    const run = runVisualThinkingResearchToResult(
      "Research Medicare changes and create a report.",
      { entryPath: "research_assisted" },
    );
    expect(run.requestedOutcome.requestedDeliverableType).toBe("report");
    expect(run.requestedOutcome.requiresVisualProjection).toBe(false);
    expect(run.researchBundle?.acquiredAt).toBeTruthy();
    expect(run.generationBundle).toBeTruthy();
  });

  it("11–15. Findings merge, gate uses acquisition (not plan alone), pipeline continues", () => {
    const request = createVisualThinkingRequest({
      rawRequest: "Research Loom and create a guide",
      entryPath: "research_assisted",
    });
    const understanding = interpretVisualThinkingUnderstanding(request);
    const plan = orchestrateVisualThinkingExperience(understanding);
    const knowledge = prepareVisualThinkingKnowledge({
      request,
      understanding,
      experiencePlan: plan,
      attachedStructuredContent: request.rawRequest,
    });
    const { findings } = buildStableResearchFindingsForRequest({
      rawRequest: request.rawRequest,
      knowledgeBundle: knowledge,
    });
    expect(findings.length).toBeGreaterThan(0);

    const run = runVisualThinkingResearchToResult(request.rawRequest, {
      entryPath: "research_assisted",
    });
    expect(run.researchBundle?.acquiredAt).toBeTruthy();
    expect(run.generationBundle).toBeTruthy();
    expect(run.presentationPlan).toBeTruthy();
    // Workspace may be null if substance/entry guard rejects — generation must still exist.
    expect(run.completion.generationCompleted).toBe(true);
  });

  it("18–24. Outcome-specific substance failures", () => {
    const outcome = inferVisualThinkingRequestedOutcome(
      "Create a comparison report of CRM options",
    );
    const thin = assessVisualThinkingOutcomeCompletion({
      outcome,
      researchBundle: null,
      knowledgePackage: null,
      primaryDeliverable: {
        id: "d1",
        generationRunId: "g1",
        planId: "p1",
        type: "report",
        role: "primary",
        title: "Overview",
        purpose: "overview",
        audience: null,
        detailLevel: "guided",
        blocks: [
          {
            id: "b1",
            type: "heading",
            title: "Overview",
            content: "Overview",
            order: 0,
            parentId: null,
            metadata: {},
            editable: true,
            userEdited: false,
          },
        ],
        linkedDeliverableIds: [],
        editable: true,
        userEdited: false,
        status: "ready",
        sourceMode: "deterministic_v1",
        sourceReferences: [],
        visualShell: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        error: null,
      },
      presentationPlan: null,
      workspace: null,
    });
    expect(thin.requestedOutcomeSatisfied).toBe(false);
    expect(thin.substanceValidationPassed).toBe(false);
  });

  it("F. Research unavailable keeps incomplete when no findings", () => {
    const outcome = inferVisualThinkingRequestedOutcome(
      "Research the latest obscure regulation XYZ-999 pricing now and create a report.",
    );
    const incomplete = assessVisualThinkingOutcomeCompletion({
      outcome: { ...outcome, requiresResearch: true },
      researchBundle: {
        plan: {
          id: "rp",
          knowledgePackageId: "kp",
          status: "ready",
          strategy: "official_first",
          requiredResearch: [],
          optionalResearch: [],
          requestedResearch: [],
          researchQuestions: [],
          acceptedSources: [],
          freshnessRequirement: "current",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        } as never,
        items: [],
        citations: [],
        conflicts: [],
        updatedKnowledgePackage: { items: [] } as never,
        updatedHandoff: {} as never,
        workspaceNotification: null,
        acquiredAt: null,
      },
      knowledgePackage: { items: [] } as never,
      primaryDeliverable: null,
      presentationPlan: null,
      workspace: null,
    });
    expect(incomplete.requestedOutcomeSatisfied).toBe(false);
    expect(incomplete.requiredResearchResolved).toBe(false);
    expect(incomplete.failureStage).toBe("research");
  });
});
