import { describe, expect, it } from "vitest";
import type { TimeBlock } from "./companionStore";
import {
  DEFAULT_MOMENTUM_GOAL,
  applyWhenPreset,
  checkInAckMessage,
  formatMomentumDuration,
  momentumStatusDisplay,
  normalizeBlockStatus,
  statusForCheckInOutcome,
} from "./momentumAppointment";

function block(partial: Partial<TimeBlock> = {}): TimeBlock {
  return {
    id: "b1",
    title: "Marketing plan",
    date: "2026-06-12",
    startTime: "14:00",
    durationMin: 30,
    energy: "medium",
    status: "pending",
    createdAt: "2026-01-01T00:00:00.000Z",
    goal: DEFAULT_MOMENTUM_GOAL,
    ...partial,
  };
}

describe("momentumAppointment", () => {
  it("maps legacy missed to not-today", () => {
    expect(normalizeBlockStatus("missed")).toBe("not-today");
    expect(momentumStatusDisplay("missed").label).toBe("Not Today");
  });

  it("shows movement-based status labels", () => {
    expect(momentumStatusDisplay("pending").label).toBe("Ready When You Are");
    expect(momentumStatusDisplay("triggered").label).toBe("Started");
    expect(momentumStatusDisplay("progress").label).toBe("Made Progress");
    expect(momentumStatusDisplay("completed").label).toBe("Finished");
  });

  it("maps check-in outcomes without failure states", () => {
    expect(statusForCheckInOutcome("finished")).toBe("completed");
    expect(statusForCheckInOutcome("progress")).toBe("progress");
    expect(statusForCheckInOutcome("other-important")).toBe("progress");
    expect(statusForCheckInOutcome("not-today")).toBe("not-today");
  });

  it("uses accepting language in acknowledgments", () => {
    expect(checkInAckMessage("not-today", "Marketing plan")).toMatch(
      /different direction/i,
    );
    expect(checkInAckMessage("progress", "Marketing plan")).toMatch(/momentum/i);
    expect(checkInAckMessage("finished", "X")).not.toMatch(/missed|failed/i);
  });

  it("formats flexible duration", () => {
    expect(formatMomentumDuration(block({ durationFlexible: true }))).toBe(
      "Flexible",
    );
    expect(formatMomentumDuration(block({ durationMin: 30 }))).toBe("30 min");
  });

  it("applies when presets", () => {
    const morning = applyWhenPreset("morning");
    expect(morning.startTime).toBe("09:00");
    expect(morning.whenPreset).toBe("morning");
  });
});
