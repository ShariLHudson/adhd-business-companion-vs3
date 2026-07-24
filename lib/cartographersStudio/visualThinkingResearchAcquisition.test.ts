/**
 * Visual Thinking Research Acquisition Intelligence tests (Build 9).
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
} from "@/lib/cartographersStudio/visualThinkingExperienceOrchestrator";
import {
  clearKnowledgeBundle,
  prepareVisualThinkingKnowledge,
  type VisualThinkingKnowledgeBundle,
} from "@/lib/cartographersStudio/visualThinkingKnowledgeIntelligence";
import {
  clearGenerationBundle,
  startGenerationFromConfirmedPlan,
} from "@/lib/cartographersStudio/visualThinkingGenerationEngine";
import {
  acquireVisualThinkingResearch,
  applyResearchToKnowledgeBundle,
  clearResearchBundle,
  dismissWorkspaceResearchNotification,
  isUserAuthorityGap,
  knowledgeResearchSatisfiesGenerationGate,
  planVisualThinkingResearch,
  projectResearchStatus,
  researchEngineConsumesKnowledgeOnly,
  selectResearchStrategy,
  type VisualThinkingResearchFindingInput,
} from "@/lib/cartographersStudio/visualThinkingResearchAcquisition";
import {
  __resetAdaptiveCompanionExplicitPrefsForTests,
  __resetAdaptiveSessionOverrideForTests,
  setAdaptiveSessionOverride,
} from "@/lib/adaptiveCompanionIntelligence";

function researchKnowledgeBundle(
  raw = "Create a current step-by-step guide for using the latest Loom recording settings and pricing tiers",
): VisualThinkingKnowledgeBundle {
  const request = applyRequestText(createVisualThinkingRequest({}), raw);
  const understanding = interpretVisualThinkingUnderstanding(request);
  let plan = orchestrateVisualThinkingExperience(understanding);
  plan = applyExperiencePlanOverride(plan, { kind: "confirm" });
  plan = {
    ...plan,
    researchStage: "before_generation",
    primaryDeliverable: "step_by_step_guide",
    status: "ready_to_generate",
  };
  return prepareVisualThinkingKnowledge({
    request,
    understanding,
    experiencePlan: plan,
    attachedStructuredContent: raw,
  });
}

describe("Visual Thinking Research Acquisition", () => {
  beforeEach(() => {
    clearVisualThinkingRequestDraft();
    clearKnowledgeBundle();
    clearGenerationBundle();
    clearResearchBundle();
    __resetAdaptiveCompanionExplicitPrefsForTests();
    __resetAdaptiveSessionOverrideForTests();
  });

  it("creates a research plan from knowledge gaps", () => {
    const knowledge = researchKnowledgeBundle();
    const { plan, items } = planVisualThinkingResearch({
      knowledgeBundle: knowledge,
    });
    expect(researchEngineConsumesKnowledgeOnly(plan, knowledge.package.id)).toBe(
      true,
    );
    expect(plan.knowledgePackageId).toBe(knowledge.package.id);
    expect(items.length).toBeGreaterThan(0);
    expect(plan.requiredResearch.length + plan.optionalResearch.length).toBeGreaterThan(
      0,
    );
    expect(plan.status === "ready" || plan.status === "blocked").toBe(true);
  });

  it("separates required vs optional vs blocked research", () => {
    const knowledge = researchKnowledgeBundle();
    const { plan, items } = planVisualThinkingResearch({
      knowledgeBundle: knowledge,
      strategyOverride: "official_first",
    });
    for (const id of plan.requiredResearch) {
      expect(items.find((i) => i.id === id)?.priority).toBe("required");
    }
    for (const id of plan.optionalResearch) {
      expect(items.find((i) => i.id === id)?.priority).toBe("optional");
    }
    for (const id of plan.blockedResearch) {
      expect(items.find((i) => i.id === id)?.priority).toBe("blocked");
    }
  });

  it("scores confidence and verification from evidence, never assumes", () => {
    const knowledge = researchKnowledgeBundle();
    const openGap = knowledge.package.knowledgeGaps.find(
      (g) => g.researchNeeded && g.status === "open",
    );
    expect(openGap).toBeTruthy();
    const finding: VisualThinkingResearchFindingInput = {
      knowledgeGapId: openGap!.id,
      content: "Loom’s current Business plan starts at a published list price.",
      title: "Loom pricing",
      source: "https://www.loom.com/pricing",
      sourceCategory: "official_documentation",
      freshness: "current",
    };
    const bundle = acquireVisualThinkingResearch(
      { knowledgeBundle: knowledge },
      [finding],
    );
    const item = bundle.items.find((i) => i.knowledgeGapId === openGap!.id);
    expect(["verified", "high"]).toContain(item?.confidence);
    expect(item?.verification).toBe("verified");
    expect(bundle.citations.length).toBeGreaterThan(0);
    expect(bundle.citations[0]?.confidence).not.toBe("unknown");
  });

  it("handles freshness including obsolete findings", () => {
    const knowledge = researchKnowledgeBundle();
    const gap = knowledge.package.knowledgeGaps.find((g) => g.researchNeeded)!;
    const bundle = acquireVisualThinkingResearch(
      { knowledgeBundle: knowledge },
      [
        {
          knowledgeGapId: gap.id,
          content: "Legacy pricing from 2019.",
          title: "Old pricing",
          source: "archive.example",
          sourceCategory: "industry_publication",
          freshness: "historical",
          obsolete: true,
        },
      ],
    );
    expect(bundle.items.some((i) => i.status === "obsolete")).toBe(true);
    expect(bundle.items.some((i) => i.verification === "obsolete")).toBe(true);
  });

  it("records conflicts without choosing a winner", () => {
    const knowledge = researchKnowledgeBundle();
    const gap = knowledge.package.knowledgeGaps.find((g) => g.researchNeeded)!;
    const bundle = acquireVisualThinkingResearch(
      { knowledgeBundle: knowledge },
      [
        {
          knowledgeGapId: gap.id,
          content: "Price is $12 per user.",
          title: "Price A",
          source: "Source A",
          sourceCategory: "industry_publication",
          confidence: "medium",
          conflictingSource: {
            source: "Source B",
            title: "Price B",
            content: "Price is $18 per user.",
            sourceCategory: "trusted_reference",
            confidence: "medium",
          },
        },
      ],
    );
    expect(bundle.conflicts.length).toBeGreaterThan(0);
    expect(bundle.conflicts[0]?.recommendedAction).toBe(
      "acknowledge_uncertainty",
    );
    expect(
      bundle.updatedKnowledgePackage.conflicts.some(
        (c) => c.status === "open",
      ),
    ).toBe(true);
    expect(
      bundle.items.some(
        (i) =>
          i.status === "contradictory" || i.verification === "conflicting",
      ),
    ).toBe(true);
  });

  it("merges duplicate findings and preserves sources", () => {
    const knowledge = researchKnowledgeBundle();
    const gap = knowledge.package.knowledgeGaps.find((g) => g.researchNeeded)!;
    const content = "Current Loom recording limit is documented on the official site.";
    const bundle = acquireVisualThinkingResearch(
      { knowledgeBundle: knowledge },
      [
        {
          knowledgeGapId: gap.id,
          content,
          title: "Limit A",
          source: "Official docs",
          sourceCategory: "official_documentation",
        },
        {
          knowledgeGapId: gap.id,
          content,
          title: "Limit A again",
          source: "Help center",
          sourceCategory: "trusted_reference",
        },
      ],
    );
    const matches = bundle.updatedKnowledgePackage.items.filter(
      (i) => i.content === content,
    );
    expect(matches.length).toBe(1);
    expect(matches[0]!.sourceReferenceIds.length).toBeGreaterThanOrEqual(2);
    expect(bundle.citations.length).toBeGreaterThanOrEqual(2);
  });

  it("creates citations that support knowledge items", () => {
    const knowledge = researchKnowledgeBundle();
    const gap = knowledge.package.knowledgeGaps.find((g) => g.researchNeeded)!;
    const bundle = acquireVisualThinkingResearch(
      { knowledgeBundle: knowledge },
      [
        {
          knowledgeGapId: gap.id,
          content: "Verified product detail for generation.",
          title: "Product detail",
          source: "docs.example",
          publisher: "Example Co",
          date: "2026-07-01",
          sourceCategory: "official_documentation",
        },
      ],
    );
    expect(bundle.citations[0]?.supportsItems.length).toBeGreaterThan(0);
    expect(bundle.citations[0]?.retrieved).toBeTruthy();
  });

  it("extends knowledge package without replacing approved items", () => {
    const knowledge = researchKnowledgeBundle();
    const beforeIds = knowledge.package.items.map((i) => i.id).sort();
    const beforeContent = knowledge.package.items.map((i) => i.content).sort();
    const gap = knowledge.package.knowledgeGaps.find((g) => g.researchNeeded)!;
    const acquired = acquireVisualThinkingResearch(
      { knowledgeBundle: knowledge },
      [
        {
          knowledgeGapId: gap.id,
          content: "New verified research fact.",
          title: "New fact",
          source: "official",
          sourceCategory: "official_documentation",
        },
      ],
    );
    const next = applyResearchToKnowledgeBundle(knowledge, acquired);
    for (const id of beforeIds) {
      expect(next.package.items.some((i) => i.id === id)).toBe(true);
    }
    expect(next.package.items.map((i) => i.content).sort()).toEqual(
      expect.arrayContaining(beforeContent),
    );
    expect(next.package.items.length).toBeGreaterThan(
      knowledge.package.items.length,
    );
    expect(
      next.package.knowledgeGaps.find((g) => g.id === gap.id)?.status,
    ).toBe("resolved");
  });

  it("offers workspace notification without auto-applying", () => {
    const knowledge = researchKnowledgeBundle();
    const gap = knowledge.package.knowledgeGaps.find((g) => g.researchNeeded)!;
    const bundle = acquireVisualThinkingResearch(
      { knowledgeBundle: knowledge, workspaceActive: true },
      [
        {
          knowledgeGapId: gap.id,
          content: "Workspace-time research fact.",
          title: "Fact",
          source: "official",
          sourceCategory: "official_documentation",
        },
      ],
    );
    expect(bundle.workspaceNotification?.message).toBe(
      "New verified information is available.",
    );
    expect(bundle.workspaceNotification?.autoApply).toBe(false);
    const dismissed = dismissWorkspaceResearchNotification(bundle);
    expect(dismissed.workspaceNotification?.dismissed).toBe(true);
  });

  it("honors user-authority gaps — internal sources only", () => {
    const knowledge = researchKnowledgeBundle(
      "Write an SOP for our internal onboarding workflow for new hires",
    );
    let plan = knowledge.plan;
    // Force a user-authority style research plan
    const planned = planVisualThinkingResearch({
      knowledgeBundle: knowledge,
      strategyOverride: "user_authority",
    });
    expect(planned.plan.strategy).toBe("user_authority");
    const gap =
      knowledge.package.knowledgeGaps.find((g) => g.userInputNeeded) ??
      knowledge.package.knowledgeGaps.find((g) => g.researchNeeded);
    if (gap && isUserAuthorityGap(gap)) {
      const rejected = acquireVisualThinkingResearch(
        {
          knowledgeBundle: knowledge,
          strategyOverride: "user_authority",
        },
        [
          {
            knowledgeGapId: gap.id,
            content: "Outside blog claim",
            title: "Blog",
            source: "random-blog",
            sourceCategory: "community_discussion",
            userAuthority: true,
          },
        ],
      );
      expect(
        rejected.updatedKnowledgePackage.items.some((i) =>
          i.content.includes("Outside blog claim"),
        ),
      ).toBe(false);
    }
    const accepted = acquireVisualThinkingResearch(
      {
        knowledgeBundle: knowledge,
        strategyOverride: "user_authority",
      },
      [
        {
          knowledgeGapId: gap?.id,
          content: "Our team owner approves onboarding in Notion.",
          title: "Internal SOP",
          source: "Estate document",
          sourceCategory: "internal_user_documents",
          userAuthority: true,
          confidence: "verified",
        },
      ],
    );
    expect(
      accepted.updatedKnowledgePackage.items.some((i) =>
        i.content.includes("Notion"),
      ),
    ).toBe(true);
    void plan;
  });

  it("supports internal-only strategy blocking external research items", () => {
    const knowledge = researchKnowledgeBundle();
    const { plan, items } = planVisualThinkingResearch({
      knowledgeBundle: knowledge,
      strategyOverride: "internal_only",
    });
    expect(plan.strategy).toBe("internal_only");
    expect(
      items.some((i) => i.priority === "blocked") ||
        plan.status === "blocked" ||
        plan.blockedResearch.length > 0,
    ).toBe(true);
  });

  it("supports partial and failed research honestly", () => {
    const knowledge = researchKnowledgeBundle();
    const empty = acquireVisualThinkingResearch(
      { knowledgeBundle: knowledge },
      [],
    );
    expect(
      empty.plan.status === "partial" ||
        empty.plan.status === "failed" ||
        empty.plan.status === "complete",
    ).toBe(true);
    expect(
      empty.items.some(
        (i) =>
          i.status === "still_unresolved" ||
          i.status === "failed" ||
          i.priority === "blocked",
      ) || empty.plan.requiredResearch.length === 0,
    ).toBe(true);

    const status = projectResearchStatus(empty);
    expect(status.headline.length).toBeGreaterThan(0);
    expect(status.statusLabel.length).toBeGreaterThan(0);
  });

  it("satisfies generation research gate without changing Experience Plan", () => {
    const knowledge = researchKnowledgeBundle();
    const request = applyRequestText(
      createVisualThinkingRequest({}),
      "Create a current step-by-step guide for using the latest Loom recording settings",
    );
    const understanding = interpretVisualThinkingUnderstanding(request);
    let plan = orchestrateVisualThinkingExperience(understanding);
    plan = applyExperiencePlanOverride(plan, { kind: "confirm" });
    plan = {
      ...plan,
      researchStage: "before_generation",
      primaryDeliverable: "step_by_step_guide",
      status: "ready_to_generate",
    };
    expect(plan.researchStage).toBe("before_generation");

    const gap = knowledge.package.knowledgeGaps.find((g) => g.researchNeeded)!;
    const research = acquireVisualThinkingResearch(
      { knowledgeBundle: knowledge },
      [
        {
          knowledgeGapId: gap.id,
          content: "1. Open Loom\n2. Choose settings\n3. Record",
          title: "Current Loom steps",
          source: "official",
          sourceCategory: "official_documentation",
        },
      ],
    );
    expect(knowledgeResearchSatisfiesGenerationGate(research)).toBe(true);

    const blocked = startGenerationFromConfirmedPlan(plan, {
      requestId: request.id,
      understandingId: understanding.id,
      rawRequest: request.rawRequest,
    });
    expect(blocked.run.researchBlocked).toBe(true);

    const unblocked = startGenerationFromConfirmedPlan(plan, {
      requestId: request.id,
      understandingId: understanding.id,
      rawRequest: request.rawRequest,
      suppliedContent: "1. Open Loom\n2. Choose settings\n3. Record",
      knowledgeResearchSatisfied: true,
    });
    expect(plan.researchStage).toBe("before_generation");
    expect(unblocked.run.researchBlocked).toBe(false);
  });

  it("Adaptive Companion may hide optional research suggestions but not conflicts", () => {
    setAdaptiveSessionOverride({ choiceLoad: "one", summaryFirst: true });
    const knowledge = researchKnowledgeBundle();
    const { plan } = planVisualThinkingResearch({
      knowledgeBundle: knowledge,
    });
    // optional list may be trimmed
    expect(Array.isArray(plan.optionalResearch)).toBe(true);

    const gap = knowledge.package.knowledgeGaps.find((g) => g.researchNeeded)!;
    const bundle = acquireVisualThinkingResearch(
      { knowledgeBundle: knowledge },
      [
        {
          knowledgeGapId: gap.id,
          content: "Claim one",
          title: "A",
          source: "A",
          sourceCategory: "industry_publication",
          conflictingSource: {
            source: "B",
            title: "B",
            content: "Claim two",
            sourceCategory: "trusted_reference",
          },
        },
      ],
    );
    const status = projectResearchStatus(bundle);
    expect(bundle.conflicts.length).toBeGreaterThan(0);
    expect(status.conflictCount).toBeGreaterThan(0);
  });

  it("selectResearchStrategy respects knowledge plan signals", () => {
    const knowledge = researchKnowledgeBundle();
    expect(
      selectResearchStrategy(knowledge.plan, knowledge.package.knowledgeGaps, null),
    ).toBeTruthy();
    expect(
      selectResearchStrategy(
        knowledge.plan,
        knowledge.package.knowledgeGaps,
        "freshness_first",
      ),
    ).toBe("freshness_first");
  });
});
