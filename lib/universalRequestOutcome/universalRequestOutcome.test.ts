/**
 * Universal Request-to-Outcome Intelligence — core contract tests.
 * @vitest-environment node
 */
import { describe, expect, it } from "vitest";
import { resolveCreateBeginOutcome } from "@/lib/createEstate/resolveCreateBeginOutcome";
import { matchCatalogFromText } from "@/lib/createCatalog";
import { inferArtifactTypeFromConversation } from "@/lib/createInitialization";
import { resolveBuilderType } from "@/lib/createBuilderChat";
import {
  getLiveResearchProviderStatus,
  runUniversalRequestToOutcome,
  understandUniversalRequest,
  validateRequestInterpretation,
  validateOutcomeSubstance,
} from "@/lib/universalRequestOutcome";

const FIVE_DAY =
  "Create a five-day social media content plan.";

describe("Universal request understanding", () => {
  it("1–2. preserves five-day duration and does not become Facebook post", () => {
    const u = understandUniversalRequest(FIVE_DAY);
    expect(u.requestedDuration).toEqual({ value: 5, unit: "day" });
    expect(u.creationFamily).toBe("content_plan");
    expect(u.qualifiers.planNotPost).toBe(true);
    expect(u.createArtifactType).not.toMatch(/facebook post|social post/i);
    expect(u.createArtifactType).toMatch(/content calendar|content strategy|marketing plan/i);
    const v = validateRequestInterpretation(u);
    expect(v.validationPassed).toBe(true);
    expect(v.overNarrowed).toBe(false);
  });

  it("3–4. multi-item / series stay multi-item", () => {
    const u = understandUniversalRequest(
      "Create a five email sequence for onboarding clients.",
    );
    expect(u.requestedScope).toBe("series");
    expect(u.requestedQuantity).toBe(5);
    expect(u.qualifiers.seriesPreserved).toBe(true);
  });

  it("5–7. unknown creation gets dynamic blueprint without exact template", () => {
    const run = runUniversalRequestToOutcome(
      "Create a mentoring program for high-school robotics volunteers.",
    );
    expect(run.understanding.creationFamily).toBe("program");
    expect(run.blueprint.dynamicallyInferred).toBe(true);
    expect(run.blueprint.requiredSections).toEqual(
      expect.arrayContaining([
        "purpose",
        "roles",
        "structure",
        "training",
        "safety",
        "evaluation",
      ]),
    );
    expect(run.creationPackage).toBeTruthy();
    expect(run.creationPackage!.sections.length).toBeGreaterThanOrEqual(6);
  });

  it("8. step-by-step produces detailed steps", () => {
    const run = runUniversalRequestToOutcome(
      "Show me step by step how to start a podcast.",
    );
    expect(run.understanding.qualifiers.stepByStep).toBe(true);
    expect(run.creationPackage).toBeTruthy();
    const steps = run.creationPackage!.sections.filter((s) => s.kind === "step");
    expect(steps.length).toBeGreaterThanOrEqual(8);
    expect(run.outcomeValidation?.passed).toBe(true);
  });

  it("9–12. research-only vs research+outcome; live research honesty", () => {
    const live = getLiveResearchProviderStatus();
    expect(live.liveResearchAvailable).toBe(false);

    const researchOnly = runUniversalRequestToOutcome("Research podcast microphones.");
    expect(researchOnly.researchCollection).toBeTruthy();
    expect(researchOnly.researchCollection!.status).not.toBe(
      "current_research_completed",
    );
    expect(
      ["stable_knowledge_used", "current_research_unavailable"].includes(
        researchOnly.researchCollection!.status,
      ),
    ).toBe(true);
    expect(researchOnly.useThisResearchOptions.length).toBeGreaterThan(0);

    const researchAndOutcome = runUniversalRequestToOutcome(
      "Research podcast microphones under $200 and create a comparison.",
    );
    expect(researchAndOutcome.creationPackage).toBeTruthy();
    expect(researchAndOutcome.useThisResearchOptions).toHaveLength(0);
    expect(researchAndOutcome.creationPackage!.researchStatus).not.toBe(
      "current_research_completed",
    );
  });

  it("A. five-day plan package has five substantive days", () => {
    const run = runUniversalRequestToOutcome(FIVE_DAY);
    expect(run.creationPackage).toBeTruthy();
    const days = run.creationPackage!.sections.filter((s) => s.kind === "day");
    expect(days.length).toBe(5);
    for (const d of days) {
      expect(d.content).toMatch(/objective|topic|format|caption|call to action|visual/i);
    }
    expect(run.outcomeValidation?.passed).toBe(true);
    expect(run.outcomeValidation?.overNarrowedToSingleArtifact).toBe(false);
    expect(run.nextUses).toEqual(
      expect.arrayContaining(["Continue in Create", "Turn Into a Project"]),
    );
  });

  it("B. webinar campaign preserves research + five days", () => {
    const run = runUniversalRequestToOutcome(
      "Research current webinar promotion practices and create a five-day social media plan for my webinar.",
    );
    expect(run.understanding.requiresResearch).toBe(true);
    expect(run.understanding.requestedDuration?.value).toBe(5);
    expect(run.creationPackage!.sections.filter((s) => s.kind === "day").length).toBe(
      5,
    );
    expect(run.creationPackage!.sections.some((s) => /webinar|register/i.test(s.content))).toBe(
      true,
    );
  });

  it("17–19. interpretation validation catches post collapse; outcome rejects thin plans", () => {
    const u = understandUniversalRequest(FIVE_DAY);
    const bad = {
      ...u,
      createArtifactType: "Facebook Post",
      qualifiers: { ...u.qualifiers, planNotPost: false, durationPreserved: false },
      requestedDuration: null,
      requestedQuantity: null,
    };
    const v = validateRequestInterpretation(bad);
    expect(v.validationPassed).toBe(false);

    const thin = runUniversalRequestToOutcome(FIVE_DAY).creationPackage!;
    const collapsed = {
      ...thin,
      sections: thin.sections.filter((s) => s.kind !== "day").slice(0, 2),
    };
    const outcome = validateOutcomeSubstance(u, collapsed);
    expect(outcome.passed).toBe(false);
    expect(outcome.overNarrowedToSingleArtifact || outcome.failureReasons.length > 0).toBe(
      true,
    );
  });
});

describe("Create / builder route integration", () => {
  it("Create Begin: five-day plan confirms Content Calendar (not Facebook Post)", () => {
    const outcome = resolveCreateBeginOutcome(FIVE_DAY);
    expect(outcome.kind).toBe("confirm");
    if (outcome.kind === "confirm") {
      expect(outcome.artifactType).not.toMatch(/facebook post|social post/i);
      expect(outcome.artifactType).toMatch(/content calendar|content strategy|marketing plan|5-day/i);
    }
  });

  it("catalog + conversation + builder agree plan beats post", () => {
    expect(matchCatalogFromText(FIVE_DAY)?.type).not.toMatch(
      /facebook post|social post/i,
    );
    expect(inferArtifactTypeFromConversation(FIVE_DAY)).not.toMatch(
      /facebook post|social post/i,
    );
    expect(resolveBuilderType(FIVE_DAY)).not.toMatch(/facebook post|social post/i);
  });

  it("word-order flipped content plan still not Social Post", () => {
    const flipped = "Create a content plan for social media over five days";
    const outcome = resolveCreateBeginOutcome(flipped);
    expect(outcome.kind).toBe("confirm");
    if (outcome.kind === "confirm") {
      expect(outcome.artifactType).not.toBe("Social Post");
      expect(outcome.artifactType).not.toBe("Facebook Post");
    }
  });

  it("G. project request yields proposal requiring review", () => {
    const run = runUniversalRequestToOutcome(
      "Build a project for creating and launching a monthly newsletter.",
    );
    expect(run.projectProposal).toBeTruthy();
    expect(run.projectProposal!.requiresReviewBeforeCreate).toBe(true);
    expect(run.projectProposal!.phases.length).toBeGreaterThanOrEqual(2);
  });
});
