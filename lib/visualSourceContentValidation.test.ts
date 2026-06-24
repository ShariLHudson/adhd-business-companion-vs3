import { describe, expect, it } from "vitest";
import { resolveFrictionlessAction } from "./frictionlessActionLayer";
import {
  hasConvertibleStructure,
  isPromptOrOfferContent,
  validateVisualSourceContent,
} from "./visualSourceContentValidation";

describe("visualSourceContentValidation (P0.20.5)", () => {
  it("rejects assistant prompt-only content", () => {
    const result = validateVisualSourceContent({
      userText: "Turn this into a flowchart",
      sourceContent: "What process would you like the flowchart to show?",
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.reason).toBe("prompt_or_offer");
      expect(result.askInstead).toMatch(/steps you want included/i);
    }
  });

  it("accepts step-like prior content", () => {
    const prior = "Onboarding: signup, email, kickoff call.";
    expect(hasConvertibleStructure(prior)).toBe(true);
    expect(
      validateVisualSourceContent({
        userText: "Turn this into a flowchart",
        sourceContent: prior,
      }).ok,
    ).toBe(true);
  });

  it("rejects stale pending source", () => {
    const result = validateVisualSourceContent({
      userText: "Visualize this",
      sourceContent: "Steps: research, outline, publish.",
      currentTurn: 20,
      offeredAtTurn: 1,
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe("stale_pending");
  });

  it("detects offer/question content", () => {
    expect(
      isPromptOrOfferContent(
        "I can help with that. Would you like to open Create?",
      ),
    ).toBe(true);
  });
});

describe("frictionless visual conversion validation", () => {
  it("does not open Visual Thinking when prior content is only a question", () => {
    const decision = resolveFrictionlessAction({
      userText: "Turn this into a flowchart",
      currentTurn: 2,
      lastAssistantText: "What process would you like the flowchart to show?",
    });
    expect(decision.immediateVisualOpen).toBeUndefined();
    expect(decision.localReply).toMatch(/steps you want included/i);
  });

  it("opens when prior content has convertible steps", () => {
    const decision = resolveFrictionlessAction({
      userText: "Visualize this",
      currentTurn: 2,
      lastAssistantText: "Steps: research, outline, draft, publish.",
    });
    expect(decision.immediateVisualOpen?.viewId).toBe("mind-map");
  });
});
