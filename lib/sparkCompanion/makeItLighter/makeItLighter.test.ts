import { describe, expect, it } from "vitest";
import { evaluateMakeItLighter } from "./evaluateMakeItLighter";
import { estateMissionHintForPlace } from "./estateMissionMap";
import { makeItLighterHintForChat } from "./makeItLighterHintForChat";
import {
  detectShameReinforcement,
  isHighMentalLoadTurn,
} from "./mentalLoadSignals";
import { SPARK_HEARTBEAT_QUESTION } from "./types";

describe("makeItLighter", () => {
  it("always includes heartbeat question in hint", () => {
    const hint = makeItLighterHintForChat({ userText: "Hello" });
    expect(hint).toContain(SPARK_HEARTBEAT_QUESTION);
  });

  it("expands hint on overwhelm", () => {
    const hint = makeItLighterHintForChat({
      userText: "I'm overwhelmed and ashamed I fell behind",
    });
    expect(hint).toContain("MAKE IT LIGHTER");
    expect(hint).toContain("overwhelm");
    expect(hint).toContain("shame");
  });

  it("evaluates mental load signals", () => {
    const d = evaluateMakeItLighter({
      userText: "I have decision fatigue and self-doubt",
    });
    expect(d.active).toBe(true);
    expect(d.signals).toContain("decision_fatigue");
    expect(d.signals).toContain("self_doubt");
  });

  it("respects overwhelmed flag", () => {
    expect(isHighMentalLoadTurn("ok", true)).toBe(true);
  });

  it("flags shame reinforcement language", () => {
    expect(detectShameReinforcement("You're falling behind").length).toBeGreaterThan(
      0,
    );
  });

  it("maps estate places to friction-reduction mission", () => {
    expect(estateMissionHintForPlace("clear-my-mind")).toContain(
      "mental load",
    );
  });
});
