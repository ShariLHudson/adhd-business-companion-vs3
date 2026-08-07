/**
 * Spark Council Reality Test.
 *
 * Requested explicitly as a different KIND of test than activation
 * accuracy: not "what expert activates?" but "does the combined result
 * feel like Spark actually understood the founder's situation?" and
 * "does it read as one companion, never a panel?"
 *
 * Honest scope limitation: this environment has no LLM access, so this
 * cannot test Shari's literal final sentence. What it CAN test, and does,
 * is the two things that entirely determine what that sentence is capable
 * of being: (1) COVERAGE — does the activated set of lenses (primary +
 * supporting + possible + coPrimary) span the situation's real
 * dimensions, not just name one expert and stop; (2) VOICE — does the
 * internal hint that feeds the LLM carry the guardrail language that
 * makes a one-voice, no-panel response possible, and never itself slip
 * into "I'm bringing in three experts" phrasing. If either of these
 * failed, no downstream LLM behavior could compensate; passing both is a
 * necessary (not sufficient, but load-bearing) condition for the felt
 * experience requested.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { resolveIntentRouting } from "@/lib/intentRoutingIntelligence";
import { resolveEstateIntelligenceRoute } from "@/lib/estateBrain/routeEstateIntelligence";
import { resolveChamberExpertActivationV2 } from "../resolveChamberExpertActivationV2";
import { chamberExpertiseHintForChat } from "../chamberExpertiseHintForChat";
import type { ChamberExpertActivation, ChamberExpertId } from "../types";

beforeEach(() => {
  vi.stubEnv("NEXT_PUBLIC_CHAMBER_ACTIVATION_V2", "true");
});

afterEach(() => {
  vi.unstubAllEnvs();
});

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

function activatedSet(activation: ChamberExpertActivation): ChamberExpertId[] {
  return [
    ...(activation.primary ? [activation.primary] : []),
    ...activation.supporting,
    ...activation.possible,
    ...(activation.coPrimary ?? []),
  ];
}

/** The core "does this sound like a panel" guardrail — checked on every scenario below. */
function expectOneVoice(hint: string | undefined): void {
  expect(hint).toBeDefined();
  expect(hint).toMatch(/do not announce them, name any expert as a separate person/);
  expect(hint).toMatch(/Speak only as Shari, one conversation, one voice/);
  expect(hint).toMatch(/never a handoff/);
  // Forbidden phrasing must only ever appear as a quoted counter-example
  // of what NOT to say — never as an actual instruction to say it.
  expect(hint).not.toMatch(/\bsay\b[^".]*bringing in (the |)(two|three|these) experts/i);
  expect(hint).not.toMatch(/I'm bringing in (two|three) experts/);
}

describe("Spark Council Reality Test — 'I keep launching things and burning out.'", () => {
  const input = resolveViaProductionPath("I keep launching things and burning out.");
  const activation = resolveChamberExpertActivationV2(input);
  const activated = activatedSet(activation);

  it("understands this as more than just Momentum — Strategy and Wellness are woven in, not just named", () => {
    expect(activation.primary, "expected Momentum given the classic boom/bust framing").toBe("MOM");
    expect(activated, "expected Strategy's prioritization lens to be present").toContain("STR");
    expect(activated, "expected Wellness's energy-management lens to be present").toContain("WELL");
  });

  it("reads as one companion synthesizing multiple lenses, never a panel of experts", () => {
    const hint = chamberExpertiseHintForChat(input);
    expectOneVoice(hint);
    // The actual substance for the full-depth supporting lens, not just a
    // name — a hint that only said "Strategy" without its themes
    // wouldn't satisfy "notices prioritization", it would just be a
    // longer Momentum answer wearing another expert's name.
    expect(hint).toMatch(/[Oo]pportunity filtering/);
    // Wellness lands in the lighter "possible" tier here (Strategy and
    // Project Management already fill the full-depth supporting slots) —
    // still present and available to Shari, by name, not full-depth.
    expect(hint).toMatch(/Wellness Intelligence/);
  });
});

describe("Spark Council Reality Test — 'I need to create a workshop.'", () => {
  const input = resolveViaProductionPath("I need to create a workshop.");
  const activation = resolveChamberExpertActivationV2(input);
  const activated = activatedSet(activation);

  it("naturally combines Events and Marketing without being told which experts to use", () => {
    expect(activation.primary, "expected Events — this is fundamentally an event-design request").toBe("EVT");
    expect(activated, "expected Marketing's audience/positioning lens to be present").toContain("MKT");
  });

  it("does NOT force Client Relationships in without genuine client context — a real boundary, not a gap", () => {
    // Deliberately a finding, not a bug: a bare "create a workshop" says
    // nothing about who it's for yet. Client Relationships activating
    // here would be a lens inserting itself without evidence — exactly
    // the "generic AI advisor" failure mode this whole project exists to
    // avoid. See the companion scenario below for the contrast once
    // client context IS present.
    expect(activated).not.toContain("CR");
  });

  it("reads as one companion, never announcing 'bringing in the Marketing expert'", () => {
    const hint = chamberExpertiseHintForChat(input);
    expectOneVoice(hint);
  });
});

describe("Spark Council Reality Test — companion scenario: same request, WITH client context", () => {
  const input = resolveViaProductionPath("I need to create a workshop for my existing clients.");
  const activation = resolveChamberExpertActivationV2(input);
  const activated = activatedSet(activation);

  it("Client Relationships now activates — proving the boundary above is context-sensitive, not a vocabulary gap", () => {
    expect(activation.primary).toBe("EVT");
    expect(activated).toContain("MKT");
    expect(activated, "adding real client context should bring Client Relationships in").toContain("CR");
  });

  it("still reads as one companion", () => {
    const hint = chamberExpertiseHintForChat(input);
    expectOneVoice(hint);
  });
});
