import { describe, expect, it } from "vitest";
import {
  evaluatePlanningTableRoom,
  PLANNING_TABLE_ADHD_FORBIDDEN,
  PLANNING_TABLE_EMOTIONAL_PROMISE,
  violatesPlanningTableAdhdRule,
} from "./index";

describe("Planning Table™ — Plan My Day™", () => {
  it("communicates emotional promise and room whispers", () => {
    const verdict = evaluatePlanningTableRoom();
    expect(verdict.emotionalPromise).toBe(PLANNING_TABLE_EMOTIONAL_PROMISE);
    expect(verdict.roomWhisper).toMatch(/figure|time|pressure/i);
    expect(verdict.title).toBe("Plan My Day™");
  });

  it("assigns Beside You™ presence — no Shari across the table", () => {
    const verdict = evaluatePlanningTableRoom();
    expect(verdict.sharisPresenceState).toBe("beside-you");
    expect(verdict.dataAttributes["data-sharis-presence"]).toBeUndefined();
  });

  it("uses Planning Notebook™ as signature object", () => {
    expect(evaluatePlanningTableRoom().signatureObjectId).toBe(
      "sig-planning-notebook",
    );
  });

  it("reserves center for protected workspace only", () => {
    const center = evaluatePlanningTableRoom().layout.find(
      (z) => z.zone === "center",
    );
    expect(center?.elements).toContain("protected-workspace");
    expect(center?.elements).not.toContain("open-window");
  });

  it("puts window and garden life on right border", () => {
    const right = evaluatePlanningTableRoom().layout.find(
      (z) => z.zone === "right-border",
    );
    expect(right?.elements).toContain("open-window");
    expect(right?.elements).toContain("bird-feeder");
  });

  it("adapts border motion for rain", () => {
    const verdict = evaluatePlanningTableRoom({ weather: "rain" });
    expect(verdict.timeProfile).toBe("rain");
    expect(verdict.borderMotion).toContain("rain-on-glass");
  });

  it("forbids ADHD pressure patterns", () => {
    expect(violatesPlanningTableAdhdRule("countdown-timer")).toBe(true);
    expect(violatesPlanningTableAdhdRule("gentle-invitation")).toBe(false);
    expect(PLANNING_TABLE_ADHD_FORBIDDEN.length).toBeGreaterThanOrEqual(5);
  });

  it("is stable within the same day", () => {
    const now = new Date("2026-06-25T08:00:00");
    const a = evaluatePlanningTableRoom({ now, chapter: "gateway" });
    const b = evaluatePlanningTableRoom({ now, chapter: "gateway" });
    expect(a.roomWhisper).toBe(b.roomWhisper);
  });
});
