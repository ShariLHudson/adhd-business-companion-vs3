import { describe, expect, it } from "vitest";
import {
  initialArrivalBeatState,
  processRealityMessage,
  reduceArrivalBeat,
  resolveArrivalRecommendation,
  softCompleteReality,
} from "./index";

describe("arrivalExperience", () => {
  it("flooded reality routes to window seat", () => {
    const result = processRealityMessage("I am completely overwhelmed", "open");
    expect(result.tone).toBe("flooded");
    expect(result.needsClarify).toBe(false);
    const rec = resolveArrivalRecommendation({
      message: "overwhelmed",
      tone: result.tone,
      dayState: result.dayState,
    });
    expect(rec?.placeId).toBe("window-seat");
    expect(rec?.section).toBe("brain-dump");
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
    expect(clarified.echo).toMatch(/short tank|gently/i);
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

  it("soft complete provides gentle echo", () => {
    const soft = softCompleteReality();
    expect(soft.echo).toMatch(/gentle/i);
  });
});
