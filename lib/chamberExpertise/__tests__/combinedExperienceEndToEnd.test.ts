/**
 * Combined-experience end-to-end validation.
 *
 * Exercises the exact production call path used by
 * app/companion/CompanionPageClient.tsx — resolveIntentRouting +
 * resolveEstateIntelligenceRoute feeding resolveChamberExpertActivation(V2)
 * feeding chamberExpertiseHintForChat — for a real founder request, not a
 * hand-constructed input. This is the test that surfaced two real defects
 * (a runnerUp-exposure bug, and Estate Brain's broad, capability-level
 * legacyExpertIds systematically outranking genuine Chamber-level text
 * evidence) — both fixed in resolveChamberExpertActivationV2.ts. Kept as a
 * permanent regression lock so this exact request never silently regresses.
 */

import { describe, expect, it, beforeEach, afterEach, vi } from "vitest";
import { resolveIntentRouting } from "@/lib/intentRoutingIntelligence";
import { resolveEstateIntelligenceRoute } from "@/lib/estateBrain/routeEstateIntelligence";
import { resolveChamberExpertActivationV2 } from "../resolveChamberExpertActivationV2";
import { chamberExpertiseHintForChat } from "../chamberExpertiseHintForChat";
import { estimateTokens } from "../textMatch";

const RETREAT_REQUEST = "I want to create a two-day ADHD business retreat.";

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

beforeEach(() => {
  vi.unstubAllEnvs();
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("Combined experience — 'I want to create a two-day ADHD business retreat.'", () => {
  it("Work Recognition resolves a business-creation request (sanity check on the upstream signals this test depends on)", () => {
    const input = resolveViaProductionPath(RETREAT_REQUEST);
    expect(input.estateCategory).toBe("business");
    expect(input.legacyExpertIds).toEqual(
      expect.arrayContaining(["business-strategist", "marketing-expert", "sales-expert"]),
    );
  });

  it("V2 activates Events as primary, with Marketing and Client Relationships woven in as supporting — matching the expected council, not a generic Strategy default", () => {
    const input = resolveViaProductionPath(RETREAT_REQUEST);
    const activation = resolveChamberExpertActivationV2(input);

    expect(activation.primary).toBe("EVT");
    expect(activation.supporting).toContain("MKT");
    expect(activation.supporting).toContain("CR");
    // A genuine Events phrase match must never be excluded from
    // consideration by a broad, capability-level legacy signal that
    // wasn't actually about this specific request.
    const evtSignal = activation.signals.find((s) => s.id === "EVT");
    expect(evtSignal?.topicPhraseMatch).toBe(true);
  });

  it("primary and runnerUp are always distinct experts (regression lock for the runnerUp-exposure bug)", () => {
    const input = resolveViaProductionPath(RETREAT_REQUEST);
    const activation = resolveChamberExpertActivationV2(input);
    if (activation.confidence === "contested") {
      expect(activation.runnerUp).not.toBeNull();
      expect(activation.runnerUp).not.toBe(activation.primary);
    }
  });

  it("the composed hint reads as one companion voice — never names an expert as a separate persona to the member, and stays under budget", () => {
    vi.stubEnv("NEXT_PUBLIC_CHAMBER_ACTIVATION_V2", "true");
    const input = resolveViaProductionPath(RETREAT_REQUEST);
    const hint = chamberExpertiseHintForChat(input);

    expect(hint).toBeDefined();
    expect(hint).toContain("Events Intelligence");
    expect(hint).toContain("Marketing Intelligence");
    expect(hint).toContain("Client Relationships Intelligence");

    // The guardrail that makes this "one companion, not a panel" — every
    // internal expert name must be paired with an explicit instruction
    // never to surface it as a separate voice.
    expect(hint).toMatch(/do not announce them, name any expert as a separate person/);
    expect(hint).toMatch(/Speak only as Shari, one conversation, one voice/);
    expect(hint).toMatch(/never a handoff/);
    // The literal forbidden patterns from the spec ("Events expert says…",
    // "Marketing expert says…") must never appear as actual instructions
    // to say them — only ever as quoted counter-examples of what NOT to say.
    expect(hint).not.toMatch(/\bsay\b[^".]*Events expert says/i);
    expect(hint).not.toMatch(/\bsay\b[^".]*Marketing expert says/i);

    expect(estimateTokens(hint!)).toBeLessThanOrEqual(550);
  });

  it("V1 (flag off, today's production default) does NOT yet reach this outcome — documented honestly, not hidden", () => {
    // This is the pre-V2-2 status quo: Strategy wins via the same
    // contentless legacy-ID tie this delivery's V2 path fixes, and Events
    // never appears anywhere in the hint. Recorded here so the gap between
    // "V2 implemented" and "V2 enabled by default" stays visible rather
    // than assumed.
    const input = resolveViaProductionPath(RETREAT_REQUEST);
    const hint = chamberExpertiseHintForChat(input);
    expect(hint).toBeDefined();
    expect(hint).not.toContain("Events Intelligence");
  });
});
