/**
 * Golden Conversations — Phase 3 of the Work State Priority Model
 * (docs/estate/WORK_STATE_PRIORITY_MODEL.md), approved implementation
 * order: (1) fix the classifier distinction, (2) add the gate,
 * (3) validate with golden conversations.
 *
 * Exercises the REAL functions in the actual Create Fast Path decision —
 * `isSimpleCreateRequest` (the lexical match) combined with
 * `resolveSupportGate` (the new checkpoint, wired into
 * `CompanionPageClient.tsx`'s Create Fast Path condition exactly as
 * `(isSimpleCreateRequest(trimmed) || continuation) && supportGate !==
 * "pause"`) — so this test proves the actual admission decision a live
 * turn would make, not just the gate's tier in isolation.
 *
 * The two non-create examples (business process, event) exercise the
 * real Work Recognition + Chamber Activation chain
 * (lib/chamberExpertise/), confirming the "Systems/Client Experience"
 * and "Experience planning" destinations are real, not aspirational.
 */

import { describe, expect, it } from "vitest";
import { isSimpleCreateRequest } from "@/lib/universalCreation/createFastPath";
import { detectEmotionalState } from "@/lib/companionEmotions";
import { resolveIntentRouting } from "@/lib/intentRoutingIntelligence";
import { resolveEstateIntelligenceRoute } from "@/lib/estateBrain/routeEstateIntelligence";
import { resolveChamberExpertActivationV2 } from "@/lib/chamberExpertise/resolveChamberExpertActivationV2";
import { resolveSupportGate, softenResponse } from "./resolveSupportGate";

/** Mirrors the exact condition wired into CompanionPageClient.tsx's Create Fast Path check. */
function wouldCreateFastPathAct(userText: string): boolean {
  const emotionalState = detectEmotionalState(userText);
  const gate = resolveSupportGate(userText, emotionalState);
  return isSimpleCreateRequest(userText) && gate !== "pause";
}

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

describe("Golden Conversation 1 — Build: \"I want to create a workshop.\"", () => {
  const TEXT = "I want to create a workshop.";

  it("enters the Create journey — the gate does not interfere with a calm build request", () => {
    expect(resolveSupportGate(TEXT)).toBe("proceed");
    expect(wouldCreateFastPathAct(TEXT)).toBe(true);
  });
});

describe("Golden Conversation 2 — Support: \"I'm overwhelmed about my workshop.\"", () => {
  const TEXT = "I'm overwhelmed about my workshop.";

  it("Support wins first — Create Fast Path is blocked even though the text lexically matches a creation request", () => {
    expect(detectEmotionalState(TEXT)).toBe("overwhelmed");
    expect(resolveSupportGate(TEXT)).toBe("pause");
    // The critical integration assertion: isSimpleCreateRequest alone
    // WOULD fire (confirming this is a real gate effect, not a case that
    // was never going to trigger Create Fast Path anyway).
    expect(isSimpleCreateRequest(TEXT)).toBe(true);
    expect(wouldCreateFastPathAct(TEXT)).toBe(false);
  });

  it("Estate routing, reached now that Create Fast Path is blocked, resolves to a restore/support destination", () => {
    const route = resolveEstateIntelligenceRoute(TEXT);
    expect(route?.category).toBe("restore");
  });
});

describe("Golden Conversation 3 — Blend: \"I'm stuck trying to figure out my workshop.\"", () => {
  const TEXT = "I'm stuck trying to figure out my workshop.";

  it("Support + forward movement — Create Fast Path still proceeds, softened, not blocked", () => {
    expect(detectEmotionalState(TEXT)).toBe("stuck");
    expect(resolveSupportGate(TEXT)).toBe("soften");
    expect(wouldCreateFastPathAct(TEXT)).toBe(true);
  });

  it("the eventual reply carries a brief acknowledgment woven into the SAME response, not a separate detour", () => {
    const hypotheticalDiscoveryReply = "Who is the workshop for?";
    const softened = softenResponse(hypotheticalDiscoveryReply, TEXT);
    expect(softened).toContain("We can sort this together.");
    expect(softened).toContain("Who is the workshop for?");
  });
});

describe("Golden Conversation 4 — Business process: \"I want to develop a process for new clients.\"", () => {
  const TEXT = "I want to develop a process for new clients.";

  it("no distress signal — proceeds normally, same as any calm build request", () => {
    expect(resolveSupportGate(TEXT)).toBe("proceed");
  });

  it("Chamber recognizes the real Systems / Client Experience path", () => {
    const activation = resolveChamberExpertActivationV2(resolveViaProductionPath(TEXT));
    expect(activation.primary).toBe("SYS");
    expect(activation.supporting).toContain("CR");
  });

  it("Estate correctly routes to the SOP capability (Work Recognition + Chamber Integration Validation fix)", () => {
    const route = resolveEstateIntelligenceRoute(TEXT);
    expect(route?.capabilityId).toBe("create.sop");
  });
});

describe("Golden Conversation 5 — Event: \"I want to plan a birthday party for a staff member.\"", () => {
  const TEXT = "I want to plan a birthday party for a staff member.";

  it("no distress signal — proceeds normally", () => {
    expect(resolveSupportGate(TEXT)).toBe("proceed");
  });

  it("Chamber recognizes Experience planning (Events), not a business-strategy request", () => {
    const activation = resolveChamberExpertActivationV2(resolveViaProductionPath(TEXT));
    expect(activation.primary).toBe("EVT");
    expect(activation.primary).not.toBe("STR");
  });
});

describe("Golden Conversations — cross-cutting regression guard", () => {
  it("the gate never blocks or softens a request with no distress signal, across all five golden conversations", () => {
    const nonDistressTexts = [
      "I want to create a workshop.",
      "I want to develop a process for new clients.",
      "I want to plan a birthday party for a staff member.",
    ];
    for (const text of nonDistressTexts) {
      expect(resolveSupportGate(text)).toBe("proceed");
    }
  });

  it("only genuine distress (overwhelmed/emotional/stuck/genuine confusion) ever produces a non-proceed gate result", () => {
    const distressTexts = [
      "I'm overwhelmed about my workshop.",
      "I'm stuck trying to figure out my workshop.",
    ];
    for (const text of distressTexts) {
      expect(resolveSupportGate(text)).not.toBe("proceed");
    }
  });
});
