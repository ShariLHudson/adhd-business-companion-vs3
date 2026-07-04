import { describe, expect, it } from "vitest";
import { resolveFrictionBarrierChoice } from "./composeFrictionFirst";
import { evaluateFrictionFirst } from "./evaluateFrictionFirst";
import { frictionFirstHintForChat } from "./frictionFirstHintForChat";
import {
  buildAttentionWanderReply,
  detectFrictionFirstForbiddenLanguage,
  isAttentionWanderSignal,
} from "./gentleLanguage";
import {
  detectFocusSituation,
  isFrictionFirstTurn,
} from "./struggleSignals";
import { FRICTION_BARRIER_MENU_IDS } from "./barriers";

describe("frictionFirst", () => {
  it("activates on I can't focus", () => {
    expect(evaluateFrictionFirst("I can't focus").active).toBe(true);
    expect(evaluateFrictionFirst("I can't focus").domain).toBe("focus");
  });

  it("does not activate on explain Business Model Canvas", () => {
    expect(
      evaluateFrictionFirst("Can you explain a Business Model Canvas?").active,
    ).toBe(false);
  });

  it("detects resistance vs want-to-focus situations", () => {
    expect(detectFocusSituation("I don't want to do this but I have to")).toBe(
      "resistance_not_want",
    );
    expect(detectFocusSituation("I need to focus but I can't")).toBe(
      "want_focus_cant",
    );
  });

  it("resolves numbered barrier choice to one next step", () => {
    const result = resolveFrictionBarrierChoice({
      userText: "1",
      session: {
        domain: "focus",
        focusSituation: "want_focus_cant",
        barrierIds: FRICTION_BARRIER_MENU_IDS,
        offeredAtTurn: 1,
        originalUserText: "I can't focus",
      },
    });
    expect(result.kind).toBe("matched");
    if (result.kind === "matched") {
      expect(result.reply).toContain("out of your head");
    }
  });

  it("includes governing question in hint", () => {
    const hint = frictionFirstHintForChat({ userText: "I can't focus" });
    expect(hint).toContain("What is making this difficult today?");
    expect(hint).toContain("Try harder");
  });

  it("activates on business overwhelm struggle", () => {
    expect(
      evaluateFrictionFirst(
        "I keep getting overwhelmed trying to build my business",
      ).active,
    ).toBe(true);
  });

  it("flags forbidden productivity language", () => {
    expect(detectFrictionFirstForbiddenLanguage("You need to try harder").length).toBeGreaterThan(
      0,
    );
  });

  it("handles attention wander without guilt", () => {
    expect(isAttentionWanderSignal("sorry I got distracted")).toBe(true);
    expect(buildAttentionWanderReply()).toContain("Welcome back");
  });
});
