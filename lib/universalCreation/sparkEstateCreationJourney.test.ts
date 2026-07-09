import { describe, expect, it } from "vitest";

import {
  chamberProjectJourneyMatchesEstateJourney,
  CREATION_ARCHETYPE_BUILD_FIELDS,
  inferCreationArchetype,
  mapUniversalPhaseToCreationStep,
  SPARK_ESTATE_CREATION_ADHD_RULES,
  SPARK_ESTATE_CREATION_STEPS,
  SPARK_ESTATE_ROOM_INDEPENDENCE_RULE,
  verifySparkEstateCreationJourney,
} from "./sparkEstateCreationJourney";
import { SPARK_ESTATE_COMPLETION_FEELING } from "./sparkEstateCompletionSystem";
import {
  formatShariCreationIntro,
  formatShariCreationQuestion,
  SHARI_CREATION_AVOID,
  SHARI_CREATION_TRAITS,
} from "./shariCreationExperience";
import {
  formatUniversalCreationQuestion,
  startUniversalCreationTurn,
} from "./orchestrator";

describe("sparkEstateCreationJourney", () => {
  it("defines the eight-step universal creation journey", () => {
    const verification = verifySparkEstateCreationJourney();
    expect(verification.stepCount).toBe(8);
    expect(verification.hasRememberStep).toBe(true);
    expect(SPARK_ESTATE_CREATION_STEPS.map((step) => step.id)).toEqual([
      "understand",
      "discover",
      "define",
      "build",
      "review",
      "improve",
      "complete",
      "remember",
    ]);
    expect(SPARK_ESTATE_ROOM_INDEPENDENCE_RULE).toContain("journey remains the same");
  });

  it("maps universal creation phases to estate journey steps", () => {
    expect(mapUniversalPhaseToCreationStep("discovery")).toBe("discover");
    expect(mapUniversalPhaseToCreationStep("preparation")).toBe("define");
    expect(mapUniversalPhaseToCreationStep("guided_creation")).toBe("build");
    expect(mapUniversalPhaseToCreationStep("review")).toBe("review");
    expect(mapUniversalPhaseToCreationStep("completion")).toBe("complete");
  });

  it("infers creation archetypes for projects, email, and funnels", () => {
    expect(
      inferCreationArchetype({
        documentType: "email",
        userText: "write an email",
      }),
    ).toBe("email");
    expect(
      inferCreationArchetype({
        documentType: "sales_funnel",
        userText: "build a funnel",
      }),
    ).toBe("funnel");
    expect(
      inferCreationArchetype({
        roomId: "chamber-project-entry",
        userText: "create a project",
      }),
    ).toBe("project");
    expect(CREATION_ARCHETYPE_BUILD_FIELDS.project).toContain("next actions");
    expect(CREATION_ARCHETYPE_BUILD_FIELDS.funnel).toContain("follow-up");
  });

  it("aligns Chamber project creation with the estate journey", () => {
    expect(chamberProjectJourneyMatchesEstateJourney()).toBe(true);
    expect(SPARK_ESTATE_COMPLETION_FEELING).toBe("I created something valuable.");
    expect(SPARK_ESTATE_CREATION_ADHD_RULES.length).toBeGreaterThanOrEqual(4);
  });
});

describe("shariCreationExperience", () => {
  it("documents the Shari creation voice", () => {
    expect(SHARI_CREATION_TRAITS).toContain("warm");
    expect(SHARI_CREATION_TRAITS).toContain("step-by-step");
    expect(SHARI_CREATION_AVOID).toContain("checklist robot");
  });

  it("formats creation questions in a Shari-friendly voice", () => {
    const intro = formatShariCreationIntro("Let's write this email together.");
    expect(intro).toContain("one question at a time");

    const question = formatShariCreationQuestion("Who is receiving this email?");
    expect(question).toBe("Who is receiving this email?");
  });

  it("applies Shari formatting through universal creation replies", () => {
    const turn = startUniversalCreationTurn("help me write an email", 1);
    expect(turn?.kind).toBe("question");
    if (turn?.kind !== "question") return;
    const formatted = formatUniversalCreationQuestion(turn);
    expect(formatted).toMatch(/one (?:thing|question) at a time/i);
    expect(formatted).toMatch(/receiving this email/i);
  });
});
