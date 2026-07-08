import { describe, expect, it } from "vitest";
import {
  COMPANION_HOMESTEAD_ROOMS,
  homesteadRoomById,
  homesteadRoomForSection,
  peacefulPlaceNatureMotion,
} from "./homesteadRoomRegistry";

describe("homesteadRoomRegistry", () => {
  it("defines six canonical homestead rooms", () => {
    expect(COMPANION_HOMESTEAD_ROOMS).toHaveLength(6);
    expect(COMPANION_HOMESTEAD_ROOMS.map((r) => r.id)).toEqual([
      "living-room",
      "sunroom",
      "game-room",
      "library",
      "study",
      "peaceful-places",
    ]);
  });

  it("maps focus to the sunroom", () => {
    const room = homesteadRoomForSection("focus");
    expect(room?.id).toBe("sunroom");
    expect(room?.signatureMotion).toBe("butterflies-drifting");
  });

  it("maps home to the living room with homestead scene background", () => {
    const room = homesteadRoomForSection("home");
    expect(room?.id).toBe("living-room");
    expect(room?.backgroundKind).toBe("homestead-scene");
    expect(room?.signatureMotion).toBe("time-of-day-lighting");
  });

  it("exposes the user's architecture table fields", () => {
    const sunroom = homesteadRoomById("sunroom");
    expect(sunroom.name).toBe("Sunroom");
    expect(sunroom.purpose).toBe("Focus My Brain");
    expect(sunroom.permanentBackground).toContain("butterfly-house-video");
    expect(sunroom.signatureMotionDescription).toMatch(/butterflies/i);

    const study = homesteadRoomById("study");
    expect(study.name).toBe("Study");
    expect(study.sections).toContain("plan-my-day");
  });

  it("resolves peaceful place nature motion from destination cues", () => {
    expect(
      peacefulPlaceNatureMotion({
        placeId: "summer-storm-covered-deck",
        experienceName: "Summer Storm",
      }),
    ).toBe("rain");
    expect(
      peacefulPlaceNatureMotion({ soundscapeId: "ocean-waves" }),
    ).toBe("waves");
    expect(peacefulPlaceNatureMotion({ placeId: "cozy-cafe" })).toBe(
      "interior-glow",
    );
  });
});
