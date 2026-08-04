import { describe, expect, it } from "vitest";
import {
  capacityLabelFromState,
  simplifiedEnergyLabel,
  todaysRealityCardLines,
} from "./todaysRealityDisplay";
import type { DayState } from "../companionStore";

function day(partial: Partial<DayState>): DayState {
  return {
    energy: "medium",
    overwhelm: "medium",
    needs: [],
    setAt: new Date().toISOString(),
    ...partial,
  };
}

describe("todaysRealityDisplay P0.53", () => {
  it("maps low energy to Light capacity", () => {
    const state = day({ energy: "low", energyLevel: "running-on-fumes" });
    expect(simplifiedEnergyLabel(state)).toBe("Low");
    expect(capacityLabelFromState(state)).toBe("Light");
  });

  it("maps high energy to Full capacity", () => {
    const state = day({ energy: "high", energyLevel: "full-tank" });
    expect(capacityLabelFromState(state)).toBe("Full");
  });

  it("returns energy focus capacity lines", () => {
    const lines = todaysRealityCardLines(
      day({ energy: "low", vibe: "mixed-bag", energyLevel: "running-on-fumes" }),
    );
    expect(lines.energy).toBe("Low");
    expect(lines.capacity).toBe("Light");
    expect(lines.focus.length).toBeGreaterThan(0);
  });
});
