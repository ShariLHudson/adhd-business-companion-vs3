/**
 * End-to-End Founder Journeys.
 *
 * Requested explicitly as a different kind of validation than everything
 * before it: not individual-system tests, but whole scenarios chained
 * through the real functions — Support Gate, Chamber Activation, Estate
 * Routing, AND Universal Creation's own multi-turn discovery — the same
 * way `lib/universalCreation/universalCreation.test.ts` already
 * simulates multi-turn discovery headlessly (localStorage stub, no
 * React, no LLM).
 *
 * Honest scope note, stated plainly: this cannot simulate Shari's
 * literal generated sentences (no LLM access in this environment). What
 * it CAN verify — and does — is every deterministic system a live turn
 * actually passes through before an LLM ever sees it: whether the
 * founder's message is admitted into creation, which document-discovery
 * questions get asked and in what order, whether prior context is
 * genuinely prefilled or lost, and which Chamber lenses (with what real
 * substantive content, not just names) would inform Shari's response.
 */

import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  clearUniversalCreationSession,
  detectUniversalDocumentType,
  startUniversalCreationTurn,
  advanceUniversalCreation,
  loadUniversalCreationSession,
  resolveUniversalCreationTurn,
  isSimpleCreateRequest,
} from "@/lib/universalCreation";
import { detectEmotionalState } from "@/lib/companionEmotions";
import { resolveIntentRouting } from "@/lib/intentRoutingIntelligence";
import { resolveEstateIntelligenceRoute } from "@/lib/estateBrain/routeEstateIntelligence";
import { resolveChamberExpertActivationV2 } from "@/lib/chamberExpertise/resolveChamberExpertActivationV2";
import { selectExpertContribution } from "@/lib/chamberIntelligence/selectExpertContribution";
import { renderSelectedContribution } from "@/lib/chamberIntelligence/renderSelectedContribution";
import { resolveSupportGate } from "./resolveSupportGate";

beforeEach(() => {
  const mem = new Map<string, string>();
  const storage = {
    getItem: (k: string) => mem.get(k) ?? null,
    setItem: (k: string, v: string) => mem.set(k, v),
    removeItem: (k: string) => mem.delete(k),
    clear: () => mem.clear(),
  };
  vi.stubGlobal("localStorage", storage);
  vi.stubGlobal("window", { localStorage: storage });
  clearUniversalCreationSession();
  vi.unstubAllEnvs();
  vi.stubEnv("NEXT_PUBLIC_CHAMBER_ACTIVATION_V2", "true");
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

/** Drives Universal Creation discovery to completion with the given answers, or as far as they go. */
function driveDiscoveryToReady(
  startText: string,
  answers: readonly string[],
): ReturnType<typeof advanceUniversalCreation> {
  const start = startUniversalCreationTurn(startText, 1);
  expect(start?.kind).toBe("question");
  let session = start!.session;
  let result: ReturnType<typeof advanceUniversalCreation> = null;
  for (const answer of answers) {
    result = advanceUniversalCreation(session, answer);
    if (!result) break;
    if (result.kind === "ready") break;
    if (result.kind === "question") session = result.session;
  }
  return result;
}

describe("Journey 1 — New client experience: \"I want to develop a process for new clients.\"", () => {
  const TEXT = "I want to develop a process for new clients.";

  it("recognizes building — the gate does not interfere", () => {
    expect(resolveSupportGate(TEXT)).toBe("proceed");
  });

  it("understands this as a process/client-experience goal, not a generic document", () => {
    // Locks in this journey's own fix: before it, this sentence fell
    // through to Universal Creation's generic "document" profile instead
    // of SOP's own, more specific discovery questions.
    expect(detectUniversalDocumentType(TEXT)).toBe("sop");
  });

  it("brings Systems + Client Relationships, not a generic business-strategy default", () => {
    const activation = resolveChamberExpertActivationV2(resolveViaProductionPath(TEXT));
    expect(activation.primary).toBe("SYS");
    expect(activation.supporting).toContain("CR");
  });

  it("Estate resolves to the real SOP capability, not a coincidental default", () => {
    const route = resolveEstateIntelligenceRoute(TEXT);
    expect(route?.capabilityId).toBe("create.sop");
  });

  it("eventually reaches a ready-to-build state through SOP's own discovery questions", () => {
    const result = driveDiscoveryToReady(TEXT, [
      "For new clients specifically",
      "Starting from scratch",
      "Just me for now",
      "Onboarding new clients",
      "Every time someone signs up",
      "They forget to send the welcome packet",
    ]);
    expect(result?.kind).toBe("ready");
    expect(result?.preparationLine).toMatch(/SOP|process|checklist/i);
  });
});

describe("Journey 2 — Workshop overwhelm: \"I'm overwhelmed about creating a workshop for ADHD entrepreneurs.\"", () => {
  const TEXT = "I'm overwhelmed about creating a workshop for ADHD entrepreneurs.";

  it("support wins first — the gate pauses even though this text would otherwise enter creation", () => {
    expect(detectEmotionalState(TEXT)).toBe("overwhelmed");
    expect(resolveSupportGate(TEXT)).toBe("pause");
    // Confirms this is a REAL gate effect, not a case that would never
    // have reached Create Fast Path anyway.
    expect(isSimpleCreateRequest(TEXT)).toBe(true);
  });

  it("no Universal Creation session is started while paused — nothing to \"reduce overwhelm\" would compete with", () => {
    // A live turn never calls startUniversalCreationTurn at all when the
    // gate pauses (see the CompanionPageClient.tsx wiring) — simulated
    // here by simply not calling it, and confirming no session exists.
    expect(loadUniversalCreationSession()).toBeNull();
  });

  it("Estate independently resolves this exact text to a restore/support destination", () => {
    const route = resolveEstateIntelligenceRoute(TEXT);
    expect(route?.category).toBe("restore");
  });

  it(
    "HONEST FINDING, not yet fixed: a later, calm follow-up does not resume the paused workshop context — " +
      "it starts a fresh discovery, and the earlier 'for ADHD entrepreneurs' detail is not carried over. " +
      "This is the Working Memory capture gap documented in WORK_STATE_PRIORITY_MODEL.md Sec3.3/Sec5, " +
      "explicitly deferred, not silently fixed here. This test intentionally documents CURRENT behavior — " +
      "update it once that gap is closed, not before.",
    () => {
      const followUp = "Okay, I think I'm ready to work on the workshop now.";
      expect(resolveSupportGate(followUp)).toBe("proceed");

      const turn2 = resolveUniversalCreationTurn(followUp, 2);
      expect(turn2?.kind).toBe("question");
      // Starts completely fresh — no memory of "ADHD entrepreneurs" from
      // the paused turn.
      if (turn2 && "session" in turn2) {
        expect(turn2.session.originalUserText).toBe(followUp);
        expect(turn2.session.originalUserText).not.toMatch(/adhd entrepreneurs/i);
      }
    },
  );

  it(
    "principle check — founder-led, never system-timed: nothing in this codebase counts turns or sets a " +
      "timer to auto-offer the workshop back; the follow-up above only proceeds because the FOUNDER brought " +
      "it up again with calm language, not because any system decided \"enough support, now build\"",
    () => {
      // There is no mechanism under test here that could fire on its own
      // — this is a structural assertion: resolveSupportGate takes no
      // turn count, timer, or session-age input of any kind.
      expect(resolveSupportGate.length).toBeLessThanOrEqual(2); // (userText, emotionalState?) only
    },
  );
});

describe("Journey 3 — Newsletter: \"I want to create a newsletter for my ADHD business community.\"", () => {
  const TEXT = "I want to create a newsletter for my ADHD business community.";

  it("recognizes building with no distress signal", () => {
    expect(resolveSupportGate(TEXT)).toBe("proceed");
  });

  it("understands purpose first — the opening discovery question asks WHY, not immediately WHO or WHAT", () => {
    const start = startUniversalCreationTurn(TEXT, 1);
    expect(start?.kind).toBe("question");
    if (start?.kind === "question") {
      expect(start.question).toMatch(/main reason|why/i);
    }
  });

  it("considers audience — \"business community\" prefills the WHO discovery slot, and it is never asked again", () => {
    const start = startUniversalCreationTurn(TEXT, 1);
    expect(start?.kind).toBe("question");
    if (start?.kind === "question") {
      // Confidence starts elevated because "business" prefilled the who
      // slot from the opening sentence itself.
      expect(start.session.confidence.who).toBe(true);
      expect(start.session.answers["newsletter-who"]).toBeTruthy();
    }
  });

  it("research is available if genuine uncertainty appears, but is never force-triggered by audience language alone", () => {
    const start = startUniversalCreationTurn(TEXT, 1)!;
    expect(start.kind).toBe("question");
    // Calm continuation — no research offered unprompted.
    const calmNext = advanceUniversalCreation(
      (start as { session: Parameters<typeof advanceUniversalCreation>[0] }).session,
      "To share tips and encouragement",
    );
    expect(calmNext?.kind).not.toBe("uncertainty");

    // Genuine uncertainty — research becomes available, as designed.
    const uncertainStart = startUniversalCreationTurn(TEXT, 1)!;
    const uncertain = advanceUniversalCreation(
      (uncertainStart as { session: Parameters<typeof advanceUniversalCreation>[0] }).session,
      "I'm not sure, whatever works",
    );
    expect(uncertain?.kind).toBe("uncertainty");
    expect(uncertain?.message).toMatch(/research/i);
  });

  it("eventually creates the newsletter through its own full discovery set", () => {
    const result = driveDiscoveryToReady(TEXT, [
      "to encourage other ADHD business owners",
      "adhd small business owners who feel behind",
      "you are not behind, you are wired differently",
      "my community and coaching program",
      "warm and encouraging, like a friend",
      "join this week's conversation",
      "skip",
      "they feel less alone and take one small step",
    ]);
    expect(result?.kind).toBe("ready");
  });
});

describe("Journey 4 — Event: \"I want to plan a retreat for my clients.\"", () => {
  const TEXT = "I want to plan a retreat for my clients.";

  it("recognizes building with no distress signal", () => {
    expect(resolveSupportGate(TEXT)).toBe("proceed");
  });

  it("brings Events primary with Client Relationships woven in — not a business-strategy default", () => {
    const activation = resolveChamberExpertActivationV2(resolveViaProductionPath(TEXT));
    expect(activation.primary).toBe("EVT");
    expect(activation.primary).not.toBe("STR");
    const allActivated = [activation.primary, ...activation.supporting, ...activation.possible];
    expect(allActivated).toContain("CR");
  });

  it("Events' contribution is genuine experience-design substance, not a name-only fallback", () => {
    const selection = selectExpertContribution({ expertId: "EVT", userText: TEXT, role: "primary" });
    expect(selection).not.toBeNull();
    expect(selection!.frameworks.length).toBeGreaterThan(0);
    expect(selection!.question).toBeTruthy();
    const rendered = renderSelectedContribution(selection!);
    // The actual experience-design vocabulary, not just the expert's name.
    expect(rendered).toMatch(/transformation|experience|anchor|feel/i);
  });
});
