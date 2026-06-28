import { describe, expect, it } from "vitest";
import { resolvePeacefulPlacesGardenAtmosphere } from "./gardenAtmosphere";

describe("resolvePeacefulPlacesGardenAtmosphere", () => {
  it("maps dawn to sunrise light", () => {
    const atmosphere = resolvePeacefulPlacesGardenAtmosphere(
      new Date("2026-06-26T06:15:00"),
    );
    expect(atmosphere.light).toBe("sunrise");
  });

  it("glows lanterns at blue hour and moonlight", () => {
    const blueHour = resolvePeacefulPlacesGardenAtmosphere(
      new Date("2026-06-26T20:15:00"),
    );
    const moonlight = resolvePeacefulPlacesGardenAtmosphere(
      new Date("2026-06-26T23:15:00"),
    );
    expect(blueHour.lanternGlow).toBe(true);
    expect(moonlight.lanternGlow).toBe(true);
  });

  it("keeps the same garden with seasonal accents by month", () => {
    const spring = resolvePeacefulPlacesGardenAtmosphere(
      new Date("2026-04-10T12:00:00"),
    );
    const autumn = resolvePeacefulPlacesGardenAtmosphere(
      new Date("2026-10-10T12:00:00"),
    );
    expect(spring.season).toBe("spring-blossoms");
    expect(autumn.season).toBe("autumn-leaves");
  });
});
