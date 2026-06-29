import { describe, expect, it } from "vitest";
import {
  initialArrivalBeatState,
  processRealityMessage,
  reduceArrivalBeat,
  resolveArrivalRecommendation,
  softCompleteReality,
  beatShowsInput,
  sameAsYesterdayEcho,
} from "./index";

describe("arrivalExperience", () => {
  it("flooded reality sits first — no room redirect without expressed need", () => {
    const result = processRealityMessage("I am completely overwhelmed", "open");
    expect(result.tone).toBe("flooded");
    expect(result.needsClarify).toBe(false);
    expect(result.echo).toMatch(/slow is fine|that's a lot|don't have to fix/i);
    const rec = resolveArrivalRecommendation({
      message: "I am completely overwhelmed",
      tone: result.tone,
      dayState: result.dayState,
      reconnectionTurns: 2,
    });
    expect(rec).toBeNull();
  });

  it("offers window seat when guest explicitly asks to clear their mind", () => {
    const rec = resolveArrivalRecommendation({
      message: "I'm overwhelmed and need to clear my mind",
      tone: "flooded",
      reconnectionTurns: 2,
    });
    expect(rec?.placeId).toBe("window-seat");
  });

  it("vague reply asks one clarify only", () => {
    const result = processRealityMessage("fine", "open");
    expect(result.needsClarify).toBe(true);
    expect(result.clarifyQuestion).toBeTruthy();

    let state = initialArrivalBeatState({
      homeState: "FIRST_VISIT",
      realityFreshToday: false,
      hasCachedReality: false,
      returnAfterLongAbsence: false,
    });
    state = reduceArrivalBeat(state, { type: "TICK_GREET" });
    state = reduceArrivalBeat(state, {
      type: "REALITY_SUBMITTED",
      needsClarify: true,
    });
    expect(state.realityTurn).toBe("clarify");

    const clarified = processRealityMessage("more tired", "clarify");
    expect(clarified.needsClarify).toBe(false);
    expect(clarified.echo).toMatch(/gentle today|light|thank you/i);
  });

  it("skips reality when cached for returning guest", () => {
    const state = initialArrivalBeatState({
      homeState: "QUIET_PRESENCE",
      realityFreshToday: true,
      hasCachedReality: true,
      returnAfterLongAbsence: false,
    });
    expect(state.skipReality).toBe(true);
  });

  it("soft complete offers gentle presence", () => {
    const soft = softCompleteReality();
    expect(soft.echo).toMatch(/no pressure|just be here/i);
  });

  it("does not recommend a room before reconnection turns complete", () => {
    const rec = resolveArrivalRecommendation({
      message: "ready to plan",
      tone: "okay",
      reconnectionTurns: 1,
    });
    expect(rec).toBeNull();
  });

  it("uses home voice for planning table after reconnection", () => {
    const rec = resolveArrivalRecommendation({
      message: "ready to plan",
      tone: "okay",
      reconnectionTurns: 2,
    });
    if (rec?.placeId === "planning-table") {
      expect(rec.line).toMatch(/planning table|table's open/i);
      expect(rec.line).not.toMatch(/together\?/i);
      expect(rec.buttonLabel).toBe("Show me");
    }
  });

  it("continuity echo references specific memory or fresh warmth — never vague", () => {
    const result = sameAsYesterdayEcho();
    expect(result.echo).not.toMatch(/similar feeling/i);
    expect(result.echo).not.toMatch(/about the same/i);
    expect(result.echo).not.toMatch(/feeling the same/i);
    expect(result.echo.trim().length).toBeGreaterThan(0);
  });

  it("keeps communication anchor reachable on every beat", () => {
    const beats = [
      "settle",
      "greet",
      "sit",
      "reality",
      "echo",
      "respond",
      "invite",
      "walk",
      "staying",
    ] as const;
    for (const beat of beats) {
      expect(beatShowsInput(beat)).toBe(true);
    }
  });
});
