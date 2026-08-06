/**
 * SOP Reasoning-First Migration, Phase 2 (2026-08-06) — discovery gate.
 *
 * Proves the discovery-question lookup, field mapping, and completion
 * check that gate entry into SOP's existing section flow. This module
 * reuses discoveryRegistry.ts's already-authored SOP questions verbatim —
 * it does not author new discovery logic, only sequences and maps three
 * existing questions onto Working Memory fields.
 *
 * @see docs/create-experience/CREATE_REASONING_FIRST_MIGRATION_IMPLEMENTATION_PLAN.md
 */

import { describe, expect, it } from "vitest";
import {
  isSopDiscoveryEligible,
  isSopDiscoveryComplete,
  nextSopDiscoveryQuestion,
  sopDiscoveryFieldForQuestion,
  sopDiscoveryIntro,
  sopDiscoveryQuestions,
} from "./sopDiscoveryFocus";

describe("SOP discovery eligibility", () => {
  it("is eligible only for SOP, case-insensitively", () => {
    expect(isSopDiscoveryEligible("SOP")).toBe(true);
    expect(isSopDiscoveryEligible("sop")).toBe(true);
    expect(isSopDiscoveryEligible("Email")).toBe(false);
    expect(isSopDiscoveryEligible("Standard Operating Procedure")).toBe(
      false,
    );
  });
});

describe("SOP discovery questions — reused verbatim from discoveryRegistry.ts", () => {
  it("has exactly the three authored questions, in order", () => {
    const questions = sopDiscoveryQuestions();
    expect(questions.map((q) => q.id)).toEqual([
      "sop-audience-type",
      "sop-starting-point",
      "sop-audience-size",
    ]);
    expect(questions[0].prompt).toBe(
      "Is this SOP for your own business, or for a client?",
    );
  });

  it("has a non-form intro line", () => {
    expect(sopDiscoveryIntro()).toMatch(/understand what you're trying to build/i);
  });
});

describe("Discovery question -> Working Memory field mapping", () => {
  it("maps each question to its approved field", () => {
    expect(sopDiscoveryFieldForQuestion("sop-audience-type")).toBe(
      "ownershipContext",
    );
    expect(sopDiscoveryFieldForQuestion("sop-starting-point")).toBe(
      "existingAssetsFound",
    );
    expect(sopDiscoveryFieldForQuestion("sop-audience-size")).toBe(
      "intendedAudience",
    );
  });

  it("returns null for an unknown question id", () => {
    expect(sopDiscoveryFieldForQuestion("not-a-real-question")).toBeNull();
  });
});

describe("nextSopDiscoveryQuestion — sequential completion, not confidence scoring", () => {
  it("returns the first question when nothing is answered or skipped", () => {
    const next = nextSopDiscoveryQuestion({
      discoveryAnswers: null,
      skippedDiscoveryIds: null,
    });
    expect(next?.id).toBe("sop-audience-type");
  });

  it("returns the next unanswered, unskipped question in order", () => {
    const next = nextSopDiscoveryQuestion({
      discoveryAnswers: { "sop-audience-type": "my own business" },
      skippedDiscoveryIds: null,
    });
    expect(next?.id).toBe("sop-starting-point");
  });

  it("treats a skipped question as resolved, not as needing an answer", () => {
    const next = nextSopDiscoveryQuestion({
      discoveryAnswers: null,
      skippedDiscoveryIds: ["sop-audience-type"],
    });
    expect(next?.id).toBe("sop-starting-point");
  });

  it("returns null once every question is answered or skipped", () => {
    const next = nextSopDiscoveryQuestion({
      discoveryAnswers: {
        "sop-audience-type": "my own business",
        "sop-starting-point": "starting from scratch",
      },
      skippedDiscoveryIds: ["sop-audience-size"],
    });
    expect(next).toBeNull();
  });
});

describe("isSopDiscoveryComplete", () => {
  it("is false until all three questions are answered or skipped", () => {
    expect(
      isSopDiscoveryComplete({
        discoveryAnswers: { "sop-audience-type": "my own business" },
        skippedDiscoveryIds: null,
      }),
    ).toBe(false);
  });

  it("is true once every question is resolved, in any combination", () => {
    expect(
      isSopDiscoveryComplete({
        discoveryAnswers: {
          "sop-audience-type": "my own business",
          "sop-audience-size": "just me",
        },
        skippedDiscoveryIds: ["sop-starting-point"],
      }),
    ).toBe(true);
  });

  it("is true for a record with no discovery state at all only if there are no questions — otherwise false", () => {
    // Guards against an empty/undefined state accidentally reading as complete.
    expect(
      isSopDiscoveryComplete({
        discoveryAnswers: null,
        skippedDiscoveryIds: null,
      }),
    ).toBe(false);
  });
});
