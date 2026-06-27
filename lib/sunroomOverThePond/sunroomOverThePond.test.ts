import { describe, expect, it } from "vitest";
import {
  evaluateSunroomOverThePond,
  SUNROOM_COGNITIVE_FORBIDDEN,
  SUNROOM_EMOTIONAL_PROMISE,
  violatesSunroomCognitiveRule,
} from "./index";

describe("Sunroom Over The Pond — Focus My Brain", () => {
  it("communicates emotional promise and room whispers", () => {
    const verdict = evaluateSunroomOverThePond();
    expect(verdict.emotionalPromise).toBe(SUNROOM_EMOTIONAL_PROMISE);
    expect(verdict.roomWhisper).toMatch(/water|nature|thought|pond/i);
    expect(verdict.title).toBe("Focus My Brain");
  });

  it("assigns Nearby presence — pond is emotional center, not Shari", () => {
    const verdict = evaluateSunroomOverThePond();
    expect(verdict.sharisPresenceState).toBe("nearby");
    expect(verdict.dataAttributes["data-sharis-presence"]).toBe("nearby");
  });

  it("uses Pond Anchor as signature object", () => {
    expect(evaluateSunroomOverThePond().signatureObjectId).toBe(
      "sig-pond-anchor",
    );
  });

  it("anchors pond as primary emotional element", () => {
    const pond = evaluateSunroomOverThePond().layout.find(
      (z) => z.zone === "pond-anchor",
    );
    expect(pond?.elements).toContain("flowing-water-feature");
    expect(pond?.elements).toContain("goldfish");
    expect(pond?.elements).toContain("water-lilies");
  });

  it("keeps workspace embedded — center never hosts pond motion", () => {
    const center = evaluateSunroomOverThePond().layout.find(
      (z) => z.zone === "center",
    );
    expect(center?.elements).toContain("embedded-not-overlay");
    expect(center?.elements).not.toContain("goldfish");
  });

  it("includes pergola half-circle framing the pond", () => {
    const pergola = evaluateSunroomOverThePond().layout.find(
      (z) => z.zone === "pergola-arc",
    );
    expect(pergola?.elements).toContain("pergola-half-circle");
  });

  it("adapts border motion after rain", () => {
    const verdict = evaluateSunroomOverThePond({ weather: "rain" });
    expect(verdict.timeProfile).toBe("after-rain");
    expect(verdict.borderMotion).toContain("water-flow");
  });

  it("forbids attention-pulling motion patterns", () => {
    expect(violatesSunroomCognitiveRule("repetitive-animation")).toBe(true);
    expect(violatesSunroomCognitiveRule("gentle-water-flow")).toBe(false);
    expect(SUNROOM_COGNITIVE_FORBIDDEN.length).toBeGreaterThanOrEqual(5);
  });

  it("is stable within the same day", () => {
    const now = new Date("2026-06-25T08:00:00");
    const a = evaluateSunroomOverThePond({ now, focusCategory: "stuck" });
    const b = evaluateSunroomOverThePond({ now, focusCategory: "stuck" });
    expect(a.roomWhisper).toBe(b.roomWhisper);
  });
});
