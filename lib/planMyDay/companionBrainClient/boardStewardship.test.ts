import { describe, expect, it } from "vitest";
import { CompanionBrain } from "@/lib/companionBrain";
import { mapFixtureToCompanionMemory } from "@/lib/planMyDay/companionBrainClient/mapFixtureToMemory";
import { LOW_ENERGY, NORMAL_TUESDAY } from "@/lib/planMyDay/dailyCompanionCycle/fixtures/simulations";
import type { PlanDayItem } from "@/lib/planMyDay/types";
import {
  diffBoardCuration,
  formatBoardStewardshipMessage,
  heldItemsLongTermLine,
  holdingTransparencyLine,
} from "./boardStewardship";

function item(id: string, column: PlanDayItem["column"]): PlanDayItem {
  return { id, title: `Task ${id}`, column, done: false };
}

describe("diffBoardCuration", () => {
  it("counts newly held and released items", () => {
    const before = [
      item("1", "today"),
      item("2", "ready"),
      item("3", "ready"),
    ];
    const after = [
      item("1", "today"),
      item("2", "parked"),
      item("3", "parked"),
    ];
    const diff = diffBoardCuration(before, after);
    expect(diff.newlyHeld).toBe(2);
    expect(diff.released).toBe(0);
    expect(diff.heldTotal).toBe(2);
    expect(diff.visibleTotal).toBe(1);
  });

  it("detects items returning from held", () => {
    const before = [item("1", "parked"), item("2", "ready")];
    const after = [item("1", "ready"), item("2", "ready")];
    const diff = diffBoardCuration(before, after);
    expect(diff.released).toBe(1);
    expect(diff.newlyHeld).toBe(0);
    expect(diff.heldTotal).toBe(0);
  });
});

describe("formatBoardStewardshipMessage", () => {
  it("acknowledges heavier reality with newly held work", () => {
    const memory = mapFixtureToCompanionMemory(LOW_ENERGY);
    const { judgment } = CompanionBrain.runReasoningCycle(memory);
    const msg = formatBoardStewardshipMessage({
      diff: {
        newlyHeld: 3,
        released: 0,
        heldTotal: 3,
        visibleTotal: 2,
      },
      judgment,
      signal: { source: "todays-reality", kind: "day-state", at: "" },
      meaningfulShift: true,
    });
    expect(msg).toMatch(/heavier/i);
    expect(msg).toMatch(/safely waiting/i);
    expect(msg).not.toMatch(/deleted|removed|failed/i);
  });

  it("celebrates gentle return when capacity improves", () => {
    const memory = mapFixtureToCompanionMemory(NORMAL_TUESDAY);
    const { judgment } = CompanionBrain.runReasoningCycle(memory);
    const msg = formatBoardStewardshipMessage({
      diff: {
        newlyHeld: 0,
        released: 1,
        heldTotal: 0,
        visibleTotal: 4,
      },
      judgment,
      meaningfulShift: true,
    });
    expect(msg).toMatch(/more capacity/i);
    expect(msg).toMatch(/one more thing/i);
  });
});

describe("heldItemsLongTermLine", () => {
  it("offers steady holding without guilt", () => {
    expect(heldItemsLongTermLine(3)).toMatch(/still holding/i);
    expect(heldItemsLongTermLine(0)).toBeNull();
  });
});

describe("holdingTransparencyLine", () => {
  it("names tucked items without guilt", () => {
    expect(
      holdingTransparencyLine({
        newlyHeld: 4,
        released: 0,
        heldTotal: 4,
        visibleTotal: 3,
      }),
    ).toBe("I tucked away 4 items to protect today's energy.");
  });
});
