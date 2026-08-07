/**
 * Founder-Language Validation Set — pre-flip review.
 *
 * A small (20-scenario) set of realistic founder phrasings, run through
 * the EXACT production call path (resolveIntentRouting →
 * resolveEstateIntelligenceRoute → resolveChamberExpertActivationV2),
 * requested explicitly as a review step BEFORE considering
 * isChamberActivationV2Enabled()'s default. This is deliberately NOT the
 * same corpus as foundersCorpus/ — that corpus hand-specifies
 * intentCategory/estateCategory to isolate Chamber-layer behavior; this
 * set exercises the REAL upstream Work Recognition + Estate Brain
 * functions, which is what actually surfaced the legacy-ID-weighting and
 * runnerUp-exposure defects fixed in this same delivery. See
 * docs/estate/CHAMBER_ACTIVATION_V2_VALIDATION_SET.md for the full
 * narrative, findings, and fixes this test locks in.
 */

import { describe, expect, it } from "vitest";
import { resolveIntentRouting } from "@/lib/intentRoutingIntelligence";
import { resolveEstateIntelligenceRoute } from "@/lib/estateBrain/routeEstateIntelligence";
import { resolveChamberExpertActivationV2 } from "../resolveChamberExpertActivationV2";
import type { ChamberExpertId } from "../types";

type Scenario = {
  text: string;
  note: string;
  /** What a human reviewer judges correct — checked against `primary` OR `coPrimary`. */
  expectPrimaryOneOf?: readonly ChamberExpertId[];
  expectCoPrimaryContains?: readonly ChamberExpertId[];
  expectInsufficientEvidence?: boolean;
};

const SCENARIOS: readonly Scenario[] = [
  {
    text: "I need to create a client onboarding process.",
    note:
      "Given example #1. A genuine, deep two-sided ambiguity — Client Relationships' " +
      "'client onboarding' and Systems' 'onboarding process'/'create a process' both " +
      "carry real, substantive evidence (confirmed: CR's 'onboarding' is a first-class " +
      "expertise term, not incidental). V1's own corpus history independently found " +
      "this exact phrase ambiguous and reworded around it rather than resolving it by " +
      "fiat. Accepting either as primary, held loosely (contested), is the honest read.",
    expectPrimaryOneOf: ["SYS", "CR"],
  },
  { text: "I need help promoting my workshop.", note: "Given example #2.", expectPrimaryOneOf: ["MKT"] },
  {
    text: "I want to launch a course but don't know what to charge or how to sell it.",
    note: "Given example #3.",
    expectCoPrimaryContains: ["FIN", "MKT"],
  },
  {
    text: "I hired my first employee and need to figure out how we operate.",
    note: "Given example #4.",
    expectCoPrimaryContains: ["PC", "SYS"],
  },
  { text: "I need help with my business.", note: "Given example #5.", expectInsufficientEvidence: true },
  {
    text: "I have three different offers and I don't know which one to focus on.",
    note: "Constructed: Strategy (opportunity filtering).",
    expectPrimaryOneOf: ["STR"],
  },
  {
    text: "I want to host a two-day retreat for my clients next spring.",
    note: "Constructed: Events.",
    expectPrimaryOneOf: ["EVT"],
  },
  {
    text: "My clients keep ghosting me right after they onboard.",
    note: "Constructed: Client Relationships.",
    expectPrimaryOneOf: ["CR"],
  },
  {
    text: "I hate doing sales calls, they feel so pushy.",
    note: "Constructed: Sales.",
    expectPrimaryOneOf: ["SALES"],
  },
  {
    text: "I have a huge launch coming up and no idea where to even start on the plan.",
    note: "Constructed: Project Management or Marketing — either is a defensible read.",
    expectPrimaryOneOf: ["PM", "MKT"],
  },
  {
    text: "I'm not sure which AI tool to use for my client intake.",
    note: "Constructed: AI & Technology.",
    expectPrimaryOneOf: ["AI"],
  },
  {
    text: "I keep having ideas but never turn them into an actual blog post.",
    note: "Constructed: Content.",
    expectPrimaryOneOf: ["CNT"],
  },
  {
    text: "I have no idea which of my numbers actually matter anymore.",
    note: "Constructed: Data & Analytics.",
    expectPrimaryOneOf: ["DATA"],
  },
  {
    text: "My team doesn't know what's expected of them and I keep avoiding the conversation.",
    note: "Constructed: Leadership.",
    expectPrimaryOneOf: ["LEAD"],
  },
  {
    text: "I'm running on fumes and ignoring every signal my body is giving me.",
    note: "Constructed: Wellness.",
    expectPrimaryOneOf: ["WELL"],
  },
  {
    text: "I keep starting projects and losing all momentum after a few days.",
    note: "Constructed: Momentum.",
    expectPrimaryOneOf: ["MOM"],
  },
  {
    text: "I met some great people at a conference last week and never followed up.",
    note: "Constructed: Networking.",
    expectPrimaryOneOf: ["NET"],
  },
  {
    text: "A friend wants to build something with me but we haven't talked about roles or who gets what.",
    note: "Constructed: Partnerships.",
    expectPrimaryOneOf: ["PART"],
  },
  {
    text: "I don't have enough real information to know if this market is even viable.",
    note: "Constructed: Research.",
    expectPrimaryOneOf: ["RES"],
  },
  {
    text: "My brand feels flat and I can't find a visual direction for it.",
    note: "Constructed: Creative Studio.",
    expectPrimaryOneOf: ["CRE"],
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

describe("Founder-Language Validation Set (20 scenarios, real production pipeline)", () => {
  it.each(SCENARIOS)("$text", (scenario) => {
    const activation = resolveChamberExpertActivationV2(resolveViaProductionPath(scenario.text));

    if (scenario.expectInsufficientEvidence) {
      expect(activation.primary, scenario.note).toBeNull();
      expect(activation.confidence).toBe("low");
      expect(activation.clarifyingQuestion, scenario.note).toBeTruthy();
      return;
    }

    if (scenario.expectCoPrimaryContains) {
      expect(activation.coPrimary, `${scenario.note} — expected co-primary containing ${scenario.expectCoPrimaryContains.join(" & ")}`).toBeTruthy();
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
  });

  it("reports overall accuracy against the validation set", () => {
    let correct = 0;
    for (const scenario of SCENARIOS) {
      const activation = resolveChamberExpertActivationV2(resolveViaProductionPath(scenario.text));
      if (scenario.expectInsufficientEvidence) {
        if (activation.primary === null && activation.clarifyingQuestion) correct++;
      } else if (scenario.expectCoPrimaryContains) {
        if (scenario.expectCoPrimaryContains.every((id) => activation.coPrimary?.includes(id))) correct++;
      } else if (scenario.expectPrimaryOneOf) {
        if (activation.primary && scenario.expectPrimaryOneOf.includes(activation.primary)) correct++;
      }
    }
    console.log(`[validation set] accuracy: ${correct}/${SCENARIOS.length} (${((correct / SCENARIOS.length) * 100).toFixed(1)}%)`);
    expect(correct / SCENARIOS.length).toBeGreaterThanOrEqual(1.0);
  });
});
