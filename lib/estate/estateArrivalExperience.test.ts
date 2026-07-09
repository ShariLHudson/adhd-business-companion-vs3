import { describe, expect, it } from "vitest";
import {
  ESTATE_ARRIVAL_HOLD_MS,
  resolveEstateArrivalExperience,
  shouldPlayEstateArrival,
} from "./estateArrivalExperience";
import { GREENHOUSE_BIRDS_AMBIENCE_MP3 } from "@/lib/soundscapes/audioAssets";
import { recordEstateRoomVisit } from "./estateRoomVisitMemory";
import { getEstateMemory } from "@/lib/estateMemory/estateMemoryStore";

describe("Estate Arrival Experience™", () => {
  it("resolves conservatory title and motto", () => {
    const config = resolveEstateArrivalExperience("conservatory");
    expect(config?.title).toBe("The Conservatory™");
    expect(config?.motto).toContain("breathe, think, and regain clarity");
    expect(config?.shariGreeting).toBeTruthy();
    expect(config?.ambience?.src).toBeTruthy();
  });

  it("resolves Chamber of Momentum from momentum institute entry", () => {
    const config = resolveEstateArrivalExperience("momentum-institute");
    expect(config?.title).toBe("Chamber of Momentum™");
    expect(config?.motto).toContain("figure everything out");
    expect(config?.shariGreeting).toBe(
      "What would help you move forward today?",
    );
  });

  it("uses greenhouse birds ambience for growth profile", () => {
    const config = resolveEstateArrivalExperience("growth-profile");
    expect(config?.ambience?.src).toBe(GREENHOUSE_BIRDS_AMBIENCE_MP3);
  });

  it("skips welcome home arrival", () => {
    expect(shouldPlayEstateArrival("welcome-home")).toBe(false);
  });

  it("holds title visible for two seconds", () => {
    expect(ESTATE_ARRIVAL_HOLD_MS).toBe(2000);
  });
});

describe("Estate Room Visit Memory™", () => {
  it("increments visit counts per room", () => {
    recordEstateRoomVisit("conservatory");
    recordEstateRoomVisit("conservatory");
    recordEstateRoomVisit("stables");
    const updated = getEstateMemory();
    expect(updated.roomVisitMemory?.visitCounts.conservatory).toBe(2);
    expect(updated.roomVisitMemory?.visitCounts.stables).toBe(1);
    expect(updated.roomVisitMemory?.lastRoomId).toBe("stables");
  });
});
