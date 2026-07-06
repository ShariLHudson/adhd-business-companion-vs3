import { describe, expect, it } from "vitest";

import {
  prepareFounderExecutiveMemoryTheater,
  prepareFounderMemoryReplaySession,
} from "./executiveMemoryTheaterBridge";

describe("Founder Executive Memory Theater bridge", () => {
  it("prepareFounderExecutiveMemoryTheater returns bootstrap", () => {
    const theater = prepareFounderExecutiveMemoryTheater();
    expect(theater.bootstrap.neverAgainLibrary.length).toBeGreaterThan(3);
    expect(theater.principle).toContain("wisdom");
  });

  it("prepareFounderMemoryReplaySession returns historical simulation when present", () => {
    const result = prepareFounderMemoryReplaySession("Replay workshop before membership decision");
    expect(result.session?.replay.historicalSimulation?.historicalRecommendation).toBeTruthy();
    expect(result.session?.replay.evolutionMap?.length).toBeGreaterThan(5);
  });
});
