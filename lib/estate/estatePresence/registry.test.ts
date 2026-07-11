import { describe, expect, it } from "vitest";
import {
  estatePresenceRoomForSection,
  resolveEstatePresenceProfile,
} from "./registry";
import { clampAmbienceVolume } from "../estateAmbienceVolume";

describe("Estate Presence registry", () => {
  it("configures conservatory with water, leaves, and birds", () => {
    const profile = resolveEstatePresenceProfile("conservatory");
    expect(profile?.layers.some((l) => l.kind === "water-ripple")).toBe(true);
    expect(profile?.layers.some((l) => l.kind === "leaves")).toBe(true);
    expect(profile?.layers.some((l) => l.kind === "bird-pass")).toBe(true);
  });

  it("configures stables with horse and lanterns", () => {
    const profile = resolveEstatePresenceProfile("stables");
    expect(profile?.layers.some((l) => l.kind === "horse-calm")).toBe(true);
    expect(profile?.layers.filter((l) => l.kind === "lantern").length).toBe(2);
  });

  it("maps brain-dump section to clear-my-mind presence", () => {
    expect(estatePresenceRoomForSection("brain-dump")).toBe("clear-my-mind");
  });

  it("maps momentum institute section", () => {
    expect(estatePresenceRoomForSection("momentum-institute")).toBe(
      "momentum-institute",
    );
  });

  it("maps chamber of momentum section to momentum institute presence", () => {
    expect(estatePresenceRoomForSection("chamber-of-momentum")).toBe(
      "momentum-institute",
    );
  });

  it("maps growth library to library presence", () => {
    expect(estatePresenceRoomForSection("growth-library")).toBe("library");
  });

  it("configures my-estate profile photo with gate and entrance lanterns", () => {
    const profile = resolveEstatePresenceProfile("my-estate");
    expect(profile?.layers.filter((l) => l.kind === "lantern").length).toBe(4);
  });
});

describe("Estate ambience volume", () => {
  it("clamps volume to 0–1", () => {
    expect(clampAmbienceVolume(1.5)).toBe(1);
    expect(clampAmbienceVolume(-0.2)).toBe(0);
    expect(clampAmbienceVolume(0.6)).toBe(0.6);
  });
});
