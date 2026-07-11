import { describe, expect, it } from "vitest";
import {
  estateRoomUsesExperienceVideo,
  estateRoomUsesOceanConservatoryVideo,
  resolveEstateRoomExperienceVideo,
} from "./estateRoomExperienceVideo";

describe("estateRoomExperienceVideo", () => {
  it("resolves aquarium room video from manifest", () => {
    expect(resolveEstateRoomExperienceVideo("conservatory")).toContain(
      "aquarium-room-video.mp4",
    );
    expect(estateRoomUsesExperienceVideo("conservatory")).toBe(true);
    expect(estateRoomUsesOceanConservatoryVideo("conservatory")).toBe(true);
  });

  it("resolves butterfly house video from manifest", () => {
    expect(resolveEstateRoomExperienceVideo("butterfly-house")).toContain(
      "butterfly-house-video.mp4",
    );
    expect(estateRoomUsesExperienceVideo("butterfly-house")).toBe(true);
  });

  it("detects aquarium video from background plate when room id is an alias", () => {
    expect(
      resolveEstateRoomExperienceVideo(
        "sunroom",
        "/backgrounds/aquarium-room-background.png",
      ),
    ).toContain("aquarium-room-video.mp4");
  });
});
