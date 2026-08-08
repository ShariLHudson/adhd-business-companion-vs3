/**
 * Founder-Language Validation Set — Round 2.
 *
 * A second, requested round of the same pre-flip review exercise as
 * foundersLanguageValidationSet.test.ts (Round 1), this time deliberately
 * targeting the five experts Round 1's own recommendation flagged as
 * untested (Presentations, Innovations, Horizons, Learning, Knowledge
 * Management), plus several likely collision pairs (Strategy vs Horizons'
 * shared "generalist" territory, Innovations vs Research, Presentations
 * vs Content). Run through the exact production call path, same as
 * Round 1. See docs/estate/CHAMBER_ACTIVATION_V2_VALIDATION_SET.md §6 for
 * the full narrative, findings, and fixes this test locks in.
 */

import { describe, expect, it } from "vitest";
import { resolveIntentRouting } from "@/lib/intentRoutingIntelligence";
import { resolveEstateIntelligenceRoute } from "@/lib/estateBrain/routeEstateIntelligence";
import { resolveChamberExpertActivationV2 } from "../resolveChamberExpertActivationV2";
import type { ChamberExpertId } from "../types";

type Scenario = {
  text: string;
  note: string;
  expectPrimaryOneOf?: readonly ChamberExpertId[];
  /** Accepted alongside expectPrimaryOneOf when the second expert may legitimately land in `supporting` or `coPrimary` rather than `primary`. */
  expectSecondExpertIn?: readonly ChamberExpertId[];
  expectCoPrimaryContains?: readonly ChamberExpertId[];
  expectInsufficientEvidence?: boolean;
};

const SCENARIOS: readonly Scenario[] = [
  {
    text: "I need to put together a pitch deck for investors.",
    note: "Presentations.",
    expectPrimaryOneOf: ["PRES"],
  },
  {
    text: "I have an idea for a totally different product and want to test if it's even worth building.",
    note: "Innovations.",
    expectPrimaryOneOf: ["INN"],
  },
  {
    text: "I keep dreaming about where this business could go in five years, but I don't know how to get there.",
    note: "Horizons.",
    expectPrimaryOneOf: ["HOR"],
  },
  {
    text: "I keep buying courses but never finish them or actually use what I learn.",
    note: "Learning.",
    expectPrimaryOneOf: ["LEARN"],
  },
  {
    text: "I have hundreds of notes scattered everywhere and I can never find the one I need.",
    note: "Knowledge Management.",
    expectPrimaryOneOf: ["KMG"],
  },
  {
    text: "I need to give a talk at a conference next month and I have no idea where to start.",
    note:
      "Collision: Presentations (the talk) vs Project Management (\"where to start\") — both genuinely " +
      "present, resolved as co-primary. Accept either alone or co-primary containing Presentations.",
    expectPrimaryOneOf: ["PRES", "PM"],
    expectSecondExpertIn: ["PRES", "PM"],
  },
  {
    text: "I want to validate a new offer idea before I spend months building it out.",
    note: "Innovations.",
    expectPrimaryOneOf: ["INN"],
  },
  {
    text: "My notes are scattered across five different apps and I don't trust any of them.",
    note: "Knowledge Management.",
    expectPrimaryOneOf: ["KMG"],
  },
  {
    text: "I keep signing up for certifications but never actually apply what I learn.",
    note: "Learning.",
    expectPrimaryOneOf: ["LEARN"],
  },
  {
    text: "Where do I even want this business to be three years from now?",
    note: "Horizons.",
    expectPrimaryOneOf: ["HOR"],
  },
  {
    text: "I need to prep a pitch deck and also nail the story so it actually lands with investors.",
    note: "Collision: Presentations + Content — accept Presentations primary with Content woven in.",
    expectPrimaryOneOf: ["PRES"],
    expectSecondExpertIn: ["CNT"],
  },
  {
    text: "I want to test a new product idea and figure out if the market even wants it.",
    note: "Collision: Innovations + Research — accept Innovations primary with Research woven in.",
    expectPrimaryOneOf: ["INN"],
    expectSecondExpertIn: ["RES"],
  },
  {
    text: "My team keeps asking me what our long term plan is and I don't have a clear answer.",
    note: "Horizons/Strategy — either is a defensible generalist read.",
    expectPrimaryOneOf: ["HOR", "STR"],
  },
  { text: "I don't know what I'm doing.", note: "Zero topical anchor — no forced expert.", expectInsufficientEvidence: true },
  {
    text: "I need to present my results to the board next week.",
    note: "Presentations.",
    expectPrimaryOneOf: ["PRES"],
  },
  {
    text: "I have a notebook full of ideas I've never turned into anything real.",
    note: "Innovations or Content — either is a defensible read.",
    expectPrimaryOneOf: ["INN", "CNT"],
  },
  {
    text: "I keep starting certifications and dropping them halfway through.",
    note: "Learning.",
    expectPrimaryOneOf: ["LEARN"],
  },
  {
    text: "I need to organize my knowledge base so my team can actually find what they need.",
    note: "Knowledge Management.",
    expectPrimaryOneOf: ["KMG"],
  },
  {
    text: "I think it's time to build a business strategy for the long run.",
    note: "Regression guard — must stay Strategy despite the new Horizons 'long term'/'long run' vocabulary.",
    expectPrimaryOneOf: ["STR"],
  },
  {
    text: "I keep having big five-year visions but no idea what to do about them this week.",
    note: "Horizons.",
    expectPrimaryOneOf: ["HOR"],
  },
];

function resolveViaProductionPath(userText: string) {
  const intentCategory = resolveIntentRouting({ userText }).category;
  const estateRoute = resolveEstateIntelligenceRoute(userText);
  return {
    userText,
    intentCategory,
    estateCategory: estateRoute?.category ?? null,
    legacyExpertIds: estateRoute?.expertIds ?? null,
  };
}

function secondExpertPresent(
  activation: ReturnType<typeof resolveChamberExpertActivationV2>,
  candidates: readonly ChamberExpertId[],
): boolean {
  const present = [activation.primary, ...activation.supporting, ...activation.possible, ...(activation.coPrimary ?? [])];
  return candidates.some((id) => present.includes(id));
}

describe("Founder-Language Validation Set — Round 2 (untested experts + collisions, real production pipeline)", () => {
  it.each(SCENARIOS)("$text", (scenario) => {
    const activation = resolveChamberExpertActivationV2(resolveViaProductionPath(scenario.text));

    if (scenario.expectInsufficientEvidence) {
      expect(activation.primary, scenario.note).toBeNull();
      return;
    }

    if (scenario.expectCoPrimaryContains) {
      expect(activation.coPrimary, scenario.note).toBeTruthy();
      for (const id of scenario.expectCoPrimaryContains) {
        expect(activation.coPrimary, scenario.note).toContain(id);
      }
      return;
    }

    if (scenario.expectPrimaryOneOf) {
      expect(
        activation.primary,
        `${scenario.note} — expected one of ${scenario.expectPrimaryOneOf.join(", ")} but got "${activation.primary}"`,
      ).not.toBeNull();
      expect(scenario.expectPrimaryOneOf, scenario.note).toContain(activation.primary);
    }

    if (scenario.expectSecondExpertIn) {
      expect(
        secondExpertPresent(activation, scenario.expectSecondExpertIn),
        `${scenario.note} — expected one of ${scenario.expectSecondExpertIn.join(", ")} to appear somewhere in the activation`,
      ).toBe(true);
    }
  });

  it("reports overall accuracy for Round 2", () => {
    let correct = 0;
    for (const scenario of SCENARIOS) {
      const activation = resolveChamberExpertActivationV2(resolveViaProductionPath(scenario.text));
      const primaryOk =
        scenario.expectInsufficientEvidence
          ? activation.primary === null
          : scenario.expectCoPrimaryContains
            ? scenario.expectCoPrimaryContains.every((id) => activation.coPrimary?.includes(id))
            : scenario.expectPrimaryOneOf
              ? Boolean(activation.primary && scenario.expectPrimaryOneOf.includes(activation.primary))
              : true;
      const secondOk = scenario.expectSecondExpertIn ? secondExpertPresent(activation, scenario.expectSecondExpertIn) : true;
      if (primaryOk && secondOk) correct++;
    }
    console.log(`[validation set round 2] accuracy: ${correct}/${SCENARIOS.length} (${((correct / SCENARIOS.length) * 100).toFixed(1)}%)`);
    expect(correct / SCENARIOS.length).toBeGreaterThanOrEqual(1.0);
  });
});
