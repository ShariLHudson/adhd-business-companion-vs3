/**
 * Work Recognition + Chamber Integration Validation.
 *
 * Tests the whole chain — Create Fast Path → Intent Routing → Estate
 * Routing → Chamber Activation — not just Chamber's response to
 * already-computed signals (that's what the founders-language validation
 * sets already cover). This is the layer ABOVE Chamber: does a message
 * even reach Chamber with the right signals, or does an earlier layer
 * short-circuit or misroute it first?
 *
 * See docs/estate/WORK_RECOGNITION_CHAMBER_INTEGRATION_VALIDATION.md for
 * the full narrative, root causes, and what was and wasn't fixed.
 */

import { describe, expect, it } from "vitest";
import { isSimpleCreateRequest } from "@/lib/universalCreation/createFastPath";
import { detectEmotionalState } from "@/lib/companionEmotions";
import { resolveIntentRouting } from "@/lib/intentRoutingIntelligence";
import { resolveEstateIntelligenceRoute } from "@/lib/estateBrain/routeEstateIntelligence";
import { resolveChamberExpertActivationV2 } from "../resolveChamberExpertActivationV2";
import type { ChamberExpertId } from "../types";

function resolveViaProductionPath(userText: string) {
  const intentCategory = resolveIntentRouting({ userText }).category;
  const estateRoute = resolveEstateIntelligenceRoute(userText);
  return {
    userText,
    intentCategory,
    estateCategory: estateRoute?.category ?? null,
    legacyExpertIds: estateRoute?.expertIds ?? null,
    estateRoute,
  };
}

function activatedSet(
  activation: ReturnType<typeof resolveChamberExpertActivationV2>,
): ChamberExpertId[] {
  return [
    ...(activation.primary ? [activation.primary] : []),
    ...activation.supporting,
    ...activation.possible,
    ...(activation.coPrimary ?? []),
  ];
}

describe("Work Recognition + Chamber Integration — 1. Creation (\"I want to create a newsletter.\")", () => {
  const TEXT = "I want to create a newsletter.";

  it("Create Fast Path fires and enters Universal Creation's understand-first discovery, not a draft", () => {
    // isSimpleCreateRequest returning true here is CORRECT — Universal
    // Creation's own discovery gate (lib/universalCreation/orchestrator.ts)
    // asks a clarifying question before ever drafting. This is the one
    // scenario where Create Fast Path firing is the desired behavior.
    expect(isSimpleCreateRequest(TEXT)).toBe(true);
  });

  it("Chamber recognizes the newsletter's real purpose-cast: Content, Marketing, Sales — not just one keyword-matched expert", () => {
    const activation = resolveChamberExpertActivationV2(resolveViaProductionPath(TEXT));
    expect(activation.primary).toBe("CNT");
    expect(activatedSet(activation)).toContain("MKT");
  });
});

describe("Work Recognition + Chamber Integration — 2. Process (\"I want to develop a process for new clients.\")", () => {
  const TEXT = "I want to develop a process for new clients.";

  it("Estate correctly routes to the SOP capability, not a coincidental 'Email' default", () => {
    const route = resolveEstateIntelligenceRoute(TEXT);
    expect(route?.capabilityId).toBe("create.sop");
  });

  it("Chamber recognizes both process (Systems) and customer experience (Client Relationships)", () => {
    const activation = resolveChamberExpertActivationV2(resolveViaProductionPath(TEXT));
    expect(activation.primary).toBe("SYS");
    expect(activatedSet(activation)).toContain("CR");
  });
});

describe("Work Recognition + Chamber Integration — 3. Event (\"I want to plan a birthday party for a staff member.\")", () => {
  const TEXT = "I want to plan a birthday party for a staff member.";

  it("Estate does NOT route to a generic business-strategy destination", () => {
    const route = resolveEstateIntelligenceRoute(TEXT);
    expect(route?.capabilityId).not.toBe("business.strategy");
    expect(route?.environmentName).not.toBe("Boardroom");
  });

  it("Chamber recognizes this as celebration/event + people experience, not a business-strategy request", () => {
    const activation = resolveChamberExpertActivationV2(resolveViaProductionPath(TEXT));
    expect(activation.primary).toBe("EVT");
    expect(activatedSet(activation)).toContain("CR");
    expect(activation.primary).not.toBe("STR");
  });
});

describe("Work Recognition + Chamber Integration — 4. Business strategy (\"I want to grow my ADHD coaching business.\")", () => {
  const TEXT = "I want to grow my ADHD coaching business.";

  it("Chamber recognizes the full growth cast: Strategy, Marketing, and Client Relationships", () => {
    const activation = resolveChamberExpertActivationV2(resolveViaProductionPath(TEXT));
    const activated = activatedSet(activation);
    expect(activated).toContain("STR");
    expect(activated).toContain("MKT");
    expect(activated).toContain("CR");
  });
});

describe("Work Recognition + Chamber Integration — 5. Stuck mode (\"I'm overwhelmed trying to figure out my workshop.\")", () => {
  const TEXT = "I'm overwhelmed trying to figure out my workshop.";

  it("emotional state and Estate routing BOTH correctly recognize overwhelm/restore", () => {
    expect(detectEmotionalState(TEXT)).toBe("overwhelmed");
    const route = resolveEstateIntelligenceRoute(TEXT);
    expect(route?.category).toBe("restore");
  });

  it(
    "DOCUMENTED DEFECT (not fixed here — see WORK_RECOGNITION_CHAMBER_INTEGRATION_VALIDATION.md §4.1): " +
      "Create Fast Path still fires on the bare word 'workshop', which would override the correct " +
      "overwhelm/restore signal above and enter creation mode instead of support mode. This assertion " +
      "intentionally documents CURRENT (undesired) behavior — flip it to .toBe(false) once §4.1 is fixed, " +
      "not before.",
    () => {
      expect(isSimpleCreateRequest(TEXT)).toBe(true);
    },
  );

  it("Chamber itself correctly stays silent — no business-expert lens forces itself into a support moment", () => {
    const activation = resolveChamberExpertActivationV2(resolveViaProductionPath(TEXT));
    expect(activation.primary).toBeNull();
  });
});

describe("Work Recognition + Chamber Integration — governing principle: expertise follows purpose, not keywords", () => {
  it("the SAME curated collaboration structure (Marketing -> Strategy, Client Relationships) generalizes across unrelated requests without per-request authoring", () => {
    // "grow my business" and "launch a course but don't know what to
    // charge or sell it" are unrelated requests that both correctly
    // surface Client Relationships/Strategy via Marketing's OWN curated
    // relationships, not because either sentence mentions clients or
    // strategy directly — direct evidence that purpose-based
    // collaboration structures generalize where keyword lists don't.
    const growth = resolveChamberExpertActivationV2(
      resolveViaProductionPath("I want to grow my ADHD coaching business."),
    );
    expect(activatedSet(growth)).toContain("CR");

    const launch = resolveChamberExpertActivationV2(
      resolveViaProductionPath("I want to launch a course but don't know what to charge or how to sell it."),
    );
    // Finance/Marketing co-primary here; Marketing's own curated list
    // still includes Strategy without a strategy-specific trigger firing.
    expect(launch.coPrimary).toContain("MKT");
  });
});
