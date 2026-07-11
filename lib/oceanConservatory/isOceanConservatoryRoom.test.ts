import { describe, expect, it } from "vitest";
import {
  isOceanConservatoryBackground,
  isOceanConservatoryRoom,
} from "./isOceanConservatoryRoom";

describe("Ocean Conservatory room detection", () => {
  it("recognizes the canonical place id", () => {
    expect(isOceanConservatoryRoom("conservatory")).toBe(true);
    expect(isOceanConservatoryRoom("greenhouse")).toBe(false);
    expect(isOceanConservatoryRoom(null)).toBe(false);
  });

  it("recognizes aquarium room aliases", () => {
    expect(isOceanConservatoryRoom("aquarium-room")).toBe(true);
    expect(isOceanConservatoryRoom("ocean-conservatory")).toBe(true);
  });

  it("recognizes the ocean conservatory background plate", () => {
    expect(
      isOceanConservatoryBackground(
        "/backgrounds/aquarium-room-background.png",
      ),
    ).toBe(true);
    expect(isOceanConservatoryBackground("/backgrounds/sunroom-background.png")).toBe(
      false,
    );
  });
});
