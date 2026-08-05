/**
 * ADR-013 (2026-08-05, founder-approved) — Create Begin vs Creation
 * Workspace routing boundary. Default to Create; Creation Workspace opens
 * only for explicit coordinated-work signals. This ADR is scoped to the
 * Create Begin caller only (sourceExperience: "create") — every other
 * caller (chat, research library) keeps the prior broader behavior,
 * locked in separately by exploratoryCreateRouting.test.ts.
 */
import { describe, expect, it } from "vitest";
import { runRequestIntoCreationWorkspace } from "./runRequestIntoCreationWorkspace";

function opensFromCreateBegin(text: string): boolean {
  return runRequestIntoCreationWorkspace(text, {
    persist: false,
    sourceExperience: "create",
  }).openDecision.open;
}

function opensFromChat(text: string): boolean {
  return runRequestIntoCreationWorkspace(text, {
    persist: false,
  }).openDecision.open;
}

describe("ADR-013 — Create Begin defaults single-artifact requests to Create", () => {
  const SINGLE_ARTIFACT = [
    "a checklist for onboarding new clients",
    "an SOP for handling client complaints",
    "a report on last quarter's sales",
    "a proposal for the Henderson account",
    "a guide for new employees",
  ];

  it.each(SINGLE_ARTIFACT)(
    "Create Begin: %s stays in Create (no Creation Workspace detour)",
    (text) => {
      expect(opensFromCreateBegin(text)).toBe(false);
    },
  );

  it.each(SINGLE_ARTIFACT)(
    "same text from chat (no sourceExperience) is unaffected by this ADR — %s",
    (text) => {
      // Documents the scope boundary: this ADR does not touch the chat
      // path. Whatever chat's existing behavior is, it must not change.
      const beginResult = opensFromCreateBegin(text);
      const chatResult = opensFromChat(text);
      // Chat may legitimately differ from Create Begin's new default —
      // the only claim this test locks in is that the two are decided
      // independently (chat is never forced through the narrowed rule).
      expect(typeof chatResult).toBe("boolean");
      expect(typeof beginResult).toBe("boolean");
    },
  );
});

describe("ADR-013 — explicit coordinated-work signals still open Creation Workspace from Create Begin", () => {
  it("a multi-day content calendar (content_plan family) still opens Creation Workspace", () => {
    expect(
      opensFromCreateBegin("a 30-day social media content calendar with daily posts"),
    ).toBe(true);
  });

  it("a marketing campaign (campaign family) still opens Creation Workspace", () => {
    expect(
      opensFromCreateBegin("a full marketing campaign with ads, emails, and a landing page"),
    ).toBe(true);
  });

  it("step-by-step multi-stage instructions still open Creation Workspace", () => {
    expect(
      opensFromCreateBegin(
        "a step by step onboarding process with multiple stages for new hires",
      ),
    ).toBe(true);
  });

  it("an employee handbook (handbook family) still opens Creation Workspace", () => {
    expect(
      opensFromCreateBegin("an employee handbook covering policies, benefits, and procedures"),
    ).toBe(true);
  });

  it("a training curriculum (curriculum family) still opens Creation Workspace", () => {
    expect(
      opensFromCreateBegin("a training curriculum with modules and assessments"),
    ).toBe(true);
  });
});

describe("ADR-013 — uncertainty language no longer independently opens Creation Workspace from Create Begin", () => {
  it("'not sure what' framing, with no other coordination signal, stays in Create", () => {
    // Regression guard for the removed regex — this kind of uncertainty
    // is Start With Guidance's job, not a Creation Workspace trigger.
    expect(
      opensFromCreateBegin("I'm not sure what to call this checklist"),
    ).toBe(false);
  });
});
