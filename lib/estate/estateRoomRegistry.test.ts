import { describe, expect, it } from "vitest";
import { ESTATE_ROOM_BG } from "./estateRoomAssets";
import {
  ESTATE_ROOM_REGISTRY,
  bestEstateRoomForText,
  estateRoomNavigationLine,
  getEstateRoomById,
  getEstateRoomForRoute,
  matchEstateRoomsForText,
} from "./index";

describe("Estate Room Registry™", () => {
  it("registers every required Estate space", () => {
    const ids = ESTATE_ROOM_REGISTRY.map((r) => r.id);
    const required = [
      "welcome-home",
      "conservatory",
      "library",
      "momentum-institute",
      "coffee-house",
      "creative-studio",
      "observatory",
      "music-room",
      "tea-room",
      "game-room",
      "gardens",
      "greenhouse",
      "stables",
      "apple-orchard",
      "sunroom",
      "peaceful-places",
      "clear-my-mind",
      "decision-compass",
      "momentum-builder",
      "journal",
      "my-estate",
      "institute-cabinet",
      "evidence-vault",
      "portfolio",
      "seeds-planted",
      "goals-projects",
      "growth-profile",
    ];
    for (const id of required) {
      expect(ids, `missing ${id}`).toContain(id);
    }
    expect(ids.length).toBe(required.length);
  });

  it("resolves routes for live rooms", () => {
    expect(getEstateRoomForRoute("momentum-institute")?.id).toBe(
      "momentum-institute",
    );
    expect(getEstateRoomForRoute("brain-dump")?.id).toBe("clear-my-mind");
    expect(getEstateRoomForRoute("decision-compass")?.id).toBe(
      "decision-compass",
    );
    expect(getEstateRoomForRoute("stables")?.id).toBe("stables");
  });

  it("routes Estate Intelligence examples", () => {
    expect(bestEstateRoomForText("I want music")?.room.id).toBe("music-room");
    expect(bestEstateRoomForText("I want to learn pricing")?.room.id).toBe(
      "momentum-institute",
    );
    expect(
      bestEstateRoomForText("I want to write a newsletter")?.room.id,
    ).toBe("creative-studio");
    expect(
      bestEstateRoomForText("I want to think through a decision")?.room.id,
    ).toBe("decision-compass");
    expect(bestEstateRoomForText("I need to clear my head")?.room.id).toBe(
      "clear-my-mind",
    );
    expect(bestEstateRoomForText("I want to journal")?.room.id).toBe("journal");
    expect(
      bestEstateRoomForText("I want to go to the apple orchard")?.room.id,
    ).toBe("apple-orchard");
    expect(bestEstateRoomForText("I want coffee")?.room.id).toBe(
      "coffee-house",
    );
    expect(bestEstateRoomForText("I want to research AI tools")?.room.id).toBe(
      "observatory",
    );
    expect(bestEstateRoomForText("I'm nervous")?.room.id).toBe("stables");
  });

  it("routes explicit navigation phrases", () => {
    const orchard = matchEstateRoomsForText("Take me to the Apple Orchard.");
    expect(orchard[0]?.room.id).toBe("apple-orchard");

    const music = matchEstateRoomsForText("Go to the Music Room.");
    expect(music[0]?.room.id).toBe("music-room");

    const gardens = matchEstateRoomsForText("Let's visit the Gardens.");
    expect(gardens[0]?.room.id).toBe("gardens");
  });

  it("uses Estate language for navigation", () => {
    expect(estateRoomNavigationLine("apple-orchard")).toBe(
      "Let's head to the Apple Orchard.",
    );
    expect(estateRoomNavigationLine("music-room")).toBe(
      "I'll take us to the Music Room.",
    );
    expect(estateRoomNavigationLine("clear-my-mind")).toBe(
      "Let's clear your mind together.",
    );
  });

  it("marks image-ready rooms with intended paths, not invented filenames", () => {
    const institute = getEstateRoomById("momentum-institute");
    expect(institute?.backgroundImage).toBeNull();
    expect(institute?.intendedBackgroundImage).toBe(
      ESTATE_ROOM_BG.momentumInstitute,
    );
    expect(institute?.status).toBe("image-ready-needs-asset");
  });
});
