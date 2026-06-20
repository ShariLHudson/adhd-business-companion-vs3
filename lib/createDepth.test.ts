import { describe, expect, it } from "vitest";
import {
  createDepthForType,
  createDepthHintForChat,
  isThankYouEmailIntent,
  resolveCreateTypeLabel,
} from "./createDepth";
import {
  advanceAfterDiscoveryAnswer,
  advanceAfterItemPick,
  getDiscoveryQuestions,
  hasEnoughClarityForDraft,
  hasEnoughDiscoveryForDraft,
} from "./createWorkflow";
import { isCreateExplorationRequest } from "./createExplorationMode";
import { researchExplorationCoachHint } from "./createVision";

describe("createDepth", () => {
  it("classifies light, guided, and deep create types", () => {
    expect(createDepthForType("LinkedIn Post")).toBe("light");
    expect(createDepthForType("Newsletter")).toBe("guided");
    expect(createDepthForType("Lead Magnet")).toBe("deep");
  });

  it("resolves thank-you email intent", () => {
    expect(isThankYouEmailIntent("write a thank-you email")).toBe(true);
    expect(resolveCreateTypeLabel("Email", "write a thank-you email")).toBe(
      "Thank-You Email",
    );
    const qs = getDiscoveryQuestions("Thank-You Email");
    expect(qs.map((q) => q.id)).toEqual(["recipient", "reason", "tone"]);
  });

  it("does not treat one social post answer as enough clarity", () => {
    const start = advanceAfterItemPick("Social Post");
    const q = getDiscoveryQuestions("Social Post")[0]!;
    const state = advanceAfterDiscoveryAnswer(
      start,
      "Social Post",
      q.id,
      "ADHD founders",
    );
    expect(hasEnoughClarityForDraft("Social Post", state)).toBe(false);
    expect(hasEnoughDiscoveryForDraft(state.discoveryAnswers, "Social Post")).toBe(
      false,
    );
  });

  it("newsletter needs all guided questions before clarity", () => {
    const start = advanceAfterItemPick("Newsletter");
    const qs = getDiscoveryQuestions("Newsletter");
    expect(qs.length).toBeGreaterThanOrEqual(5);
    let state = advanceAfterDiscoveryAnswer(
      start,
      "Newsletter",
      qs[0]!.id,
      "Perfectionism",
    );
    expect(hasEnoughClarityForDraft("Newsletter", state)).toBe(false);
  });

  it("research questions are exploration not field capture", () => {
    expect(
      isCreateExplorationRequest("What problems do ADHD entrepreneurs have?"),
    ).toBe(true);
  });

  it("research coach hint forbids premature approval prompt", () => {
    const hint = researchExplorationCoachHint(
      "problem",
      { discoveryAnswers: { audience: "ADHD business owners" } } as Parameters<
        typeof researchExplorationCoachHint
      >[1],
      "What problems do they have?",
    );
    expect(hint).toMatch(/Do NOT say/i);
    expect(hint).toMatch(/most relevant/i);
  });

  it("includes depth in chat hints", () => {
    expect(createDepthHintForChat("Lead Magnet")).toMatch(/Deep Create/i);
    expect(createDepthHintForChat("Newsletter")).toMatch(/Guided Create/i);
  });
});
