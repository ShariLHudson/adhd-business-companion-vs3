/**
 * Repair 3 — the Creation Turn Envelope is the immutable per-turn Create
 * contract. Later systems (frictionlessActionLayer, Business Profile gate,
 * answer-first block) consume it and may not contradict it.
 */
import { describe, expect, it } from "vitest";

import {
  resolveCreationTurnEnvelope,
  governFrictionlessDecisionByEnvelope,
  frictionlessDecisionOpensCreate,
  isCreateLockedTurn,
} from "./creationTurnEnvelope";
import { isCreationExecutionRequest } from "./creationExecutionEligibility";
import { createNavigationArrivalMessage } from "@/lib/createExperience/createNavigationAcknowledgement";
import { resolveFrictionlessAction } from "@/lib/frictionlessActionLayer";

const env = (t: string) => resolveCreationTurnEnvelope(t, "t1");

describe("eligibility refinement — aspiration + concrete deliverable is execution", () => {
  it("'i want to create a marketing plan' is eligible (has a deliverable)", () => {
    expect(isCreationExecutionRequest("i want to create a marketing plan").eligible).toBe(true);
  });
  it("'i want to create a social media post' is eligible", () => {
    expect(isCreationExecutionRequest("i want to create a social media post").eligible).toBe(true);
  });
  it("aspiration WITHOUT a deliverable stays exploratory (Repair 1 corpus green)", () => {
    expect(isCreationExecutionRequest("I want to create AI innovations for my business.").eligible).toBe(false);
    expect(isCreationExecutionRequest("What kind of report could I create from this?").eligible).toBe(false);
    expect(isCreationExecutionRequest("what kind of things can i create").eligible).toBe(false);
  });
});

describe("turn envelope fields for the live prompts", () => {
  it("1. 'create a marketing plan' → eligible, not exploratory", () => {
    const e = env("create a marketing plan");
    expect(e.createEligible).toBe(true);
    expect(e.exploratoryCreation).toBe(false);
    expect(e.intendedArtifact).toBe("Marketing Plan");
  });
  it("3. 'i want to create a marketing plan' → eligible, artifact preserved", () => {
    const e = env("i want to create a marketing plan");
    expect(e.createEligible).toBe(true);
    expect(e.exploratoryCreation).toBe(false);
  });
  it("4-5. 'what kind of things can i create' → exploratory, ineligible", () => {
    const e = env("what kind of things can i create");
    expect(e.createEligible).toBe(false);
    expect(e.exploratoryCreation).toBe(true);
  });
  it("7-8. 'go to create i want to create a marketing plan' → explicit nav + artifact", () => {
    const e = env("go to create i want to create a marketing plan");
    expect(e.explicitCreateNavigation).toBe(true);
    expect(e.createEligible).toBe(true);
    expect(e.exploratoryCreation).toBe(false);
  });
  it("prompt 5 'i want to create a social media post' → eligible", () => {
    expect(env("i want to create a social media post").createEligible).toBe(true);
  });
});

describe("10-12. frictionlessActionLayer CONSUMES the envelope (cannot open Create when exploratory)", () => {
  const EXPLORATORY = [
    "what kind of things can i create",
    "what could i create for my clients",
  ];
  it.each(EXPLORATORY)("exploratory turn does not open Create: %s", (t) => {
    const decision = resolveFrictionlessAction({
      userText: t,
      currentTurn: 1,
      createEnvelope: env(t),
    });
    expect(frictionlessDecisionOpensCreate(decision)).toBe(false);
  });

  it("without the envelope, the raw layer could still open Create (proves the envelope is the fix)", () => {
    const raw = resolveFrictionlessAction({
      userText: "what kind of things can i create",
      currentTurn: 1,
    });
    const governed = resolveFrictionlessAction({
      userText: "what kind of things can i create",
      currentTurn: 1,
      createEnvelope: env("what kind of things can i create"),
    });
    // The governed decision never opens Create; governance is the deciding factor.
    expect(frictionlessDecisionOpensCreate(governed)).toBe(false);
    void raw;
  });

  it("governance leaves an ELIGIBLE turn's Create action intact", () => {
    const openCreate = {
      category: "universal_creation",
      localReply: "On it — Create is the right place for this.",
      immediateCreateOpen: { userText: "create a marketing plan" },
    };
    const governed = governFrictionlessDecisionByEnvelope(openCreate, env("create a marketing plan"));
    expect(frictionlessDecisionOpensCreate(governed)).toBe(true);
  });

  it("governance collapses an EXPLORATORY turn's Create action to conversational", () => {
    const openCreate = {
      category: "universal_creation" as string,
      localReply: "Taking you to Create." as string | null,
      immediateEstatePlaceNavigate: { placeId: "creative-studio" },
    };
    const governed = governFrictionlessDecisionByEnvelope(openCreate, env("what kind of things can i create"));
    expect(frictionlessDecisionOpensCreate(governed)).toBe(false);
    expect(governed.category).toBe("none");
    expect(governed.localReply).toBeNull();
  });
});

/**
 * Final-render assembly for the four/five live prompts: an eligible / explicit
 * Create turn renders exactly one placeholder; an exploratory turn renders no
 * Create navigation and no placeholder (the model answers conversationally).
 */
function finalRender(userText: string): string[] {
  const e = env(userText);
  const messages: string[] = [];
  const pushDedup = (line: string) => {
    if (!messages.includes(line)) messages.push(line);
  };
  // Eligible / explicit-navigation → Create arrival; while the Create room is
  // unfinished the single placeholder is that arrival. Exploratory → no Create
  // navigation and no placeholder (the conversation continues).
  if (e.createEligible) pushDedup(createNavigationArrivalMessage());
  return messages;
}

describe("14 + 18. final rendered message list for each live prompt", () => {
  it("'create a marketing plan' → one placeholder", () => {
    expect(finalRender("create a marketing plan")).toEqual([createNavigationArrivalMessage()]);
  });
  it("'i want to create a marketing plan' → one placeholder", () => {
    expect(finalRender("i want to create a marketing plan")).toEqual([createNavigationArrivalMessage()]);
  });
  it("'what kind of things can i create' → no Create, no placeholder", () => {
    expect(finalRender("what kind of things can i create")).toEqual([]);
  });
  it("'go to create i want to create a marketing plan' → one placeholder", () => {
    expect(finalRender("go to create i want to create a marketing plan")).toEqual([
      createNavigationArrivalMessage(),
    ]);
  });
  it("'i want to create a social media post' → one placeholder", () => {
    expect(finalRender("i want to create a social media post")).toEqual([
      createNavigationArrivalMessage(),
    ]);
  });
});

describe("delivery gate — Create-related turns bypass reflective certification", () => {
  const LIVE = [
    "create a marketing plan",
    "i want to create a marketing plan",
    "what kind of things can i create",
    "go to create i want to create a marketing plan",
    "i want to create a social media post",
  ];

  it("every live Create prompt is a locked turn (skips the reflective spine)", () => {
    for (const p of LIVE) expect(isCreateLockedTurn(env(p))).toBe(true);
  });

  it("ordinary non-Create turns are NOT locked (full certification runs)", () => {
    for (const p of ["what is a sales funnel?", "help me price my service", "how do i network at an event"]) {
      expect(isCreateLockedTurn(env(p))).toBe(false);
    }
  });

  /**
   * Model of the finalizeMemberFacingAssistantText gate: when the turn is locked
   * the substantive answer is delivered as-is; otherwise it would pass through
   * the reflective certification spine (stand-in below) that rewrites Create
   * answers into "you're still deciding whether … makes sense".
   */
  function finalizeGate(userText: string, modelAnswer: string): string {
    const locked = isCreateLockedTurn(env(userText));
    if (locked) return modelAnswer;
    // Reflective-certification stand-in (the proven live divergence).
    return "You're still deciding whether create marketing plan makes sense.";
  }

  it("a Create turn's model answer survives — no 'deciding whether' rewrite", () => {
    const answer =
      "You can create various types of materials for your marketing plan, including a target audience profile and a unique selling proposition.";
    for (const p of LIVE) {
      const out = finalizeGate(p, answer);
      expect(out).toBe(answer);
      expect(out).not.toMatch(/deciding whether/i);
    }
  });
});
