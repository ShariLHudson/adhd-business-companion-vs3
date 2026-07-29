import { describe, expect, it } from "vitest";

import {
  isRelatedSpecialistFollowUp,
  resolveSpecialistTurnMember,
} from "./expertiseContinuity";

const base = {
  hasActiveOrNamedMember: false,
  enteredOtherWorkflow: false,
} as const;

describe("expertiseContinuity — isRelatedSpecialistFollowUp", () => {
  it("recognizes clearly dependent follow-ups", () => {
    for (const t of [
      "how do I figure out the tradeoffs?",
      "what if she still isn't respected after the trial?",
      "give me some concrete examples",
      "and how would that work?",
      "tell me more",
      "can you explain that a bit more?",
      "why is that?",
      "that sounds risky though",
    ]) {
      expect(isRelatedSpecialistFollowUp(t), t).toBe(true);
    }
  });

  it("does not treat a new standalone topic as a follow-up", () => {
    for (const t of [
      "what should I make for dinner for a family of four",
      "I want to talk about something else",
      "new question — how do I set up my website",
      "",
    ]) {
      expect(isRelatedSpecialistFollowUp(t), t).toBe(false);
    }
  });
});

describe("expertiseContinuity — resolveSpecialistTurnMember", () => {
  it("uses and retains a freshly resolved specialist", () => {
    expect(
      resolveSpecialistTurnMember({
        ...base,
        userText: "Should I spend $100 on a finance class?",
        resolvedMemberId: "finance",
        retainedMemberId: null,
      }),
    ).toEqual({ memberId: "finance", retain: "finance" });
  });

  it("retains the specialist across a related follow-up (no re-resolution needed)", () => {
    expect(
      resolveSpecialistTurnMember({
        ...base,
        userText: "how do I figure out the tradeoffs? give me concrete examples",
        resolvedMemberId: null,
        retainedMemberId: "finance",
      }),
    ).toEqual({ memberId: "finance", retain: "finance" });
  });

  it("releases silent ownership on a topic change", () => {
    expect(
      resolveSpecialistTurnMember({
        ...base,
        userText: "what should I make for dinner for a family of four",
        resolvedMemberId: null,
        retainedMemberId: "finance",
      }),
    ).toEqual({ memberId: null, retain: null });
  });

  it("switches to a different specialist when one resolves this turn", () => {
    expect(
      resolveSpecialistTurnMember({
        ...base,
        userText: "ok, now how should I advertise my product?",
        resolvedMemberId: "marketing",
        retainedMemberId: "finance",
      }),
    ).toEqual({ memberId: "marketing", retain: "marketing" });
  });

  it("releases when a Chamber/Board member is active or explicitly named", () => {
    expect(
      resolveSpecialistTurnMember({
        ...base,
        hasActiveOrNamedMember: true,
        userText: "how do I figure out the tradeoffs?",
        resolvedMemberId: null,
        retainedMemberId: "finance",
      }),
    ).toEqual({ memberId: null, retain: null });
  });

  it("releases on a Create request", () => {
    expect(
      resolveSpecialistTurnMember({
        ...base,
        userText: "make me a checklist",
        resolvedMemberId: null,
        retainedMemberId: "finance",
      }),
    ).toEqual({ memberId: null, retain: null });
  });

  it("releases on a Create rejection", () => {
    expect(
      resolveSpecialistTurnMember({
        ...base,
        userText: "I don't need the create room",
        resolvedMemberId: null,
        retainedMemberId: "finance",
      }),
    ).toEqual({ memberId: null, retain: null });
  });

  it("releases when the turn enters another owned workflow", () => {
    expect(
      resolveSpecialistTurnMember({
        ...base,
        enteredOtherWorkflow: true,
        userText: "how do I figure out the tradeoffs?",
        resolvedMemberId: null,
        retainedMemberId: "finance",
      }),
    ).toEqual({ memberId: null, retain: null });
  });

  it("stays general when nothing is retained and the turn is a plain follow-up", () => {
    expect(
      resolveSpecialistTurnMember({
        ...base,
        userText: "tell me more",
        resolvedMemberId: null,
        retainedMemberId: null,
      }),
    ).toEqual({ memberId: null, retain: null });
  });
});
