import { describe, expect, it } from "vitest";
import {
  PROJECT_HOMES_ROOM_BACKGROUND,
  SAMPLE_PROJECT_HOMES,
  connectedPlacesForProjectHome,
  getProjectHomeRoom,
  listProjectHomeRooms,
  recommendProjectHome,
  resolveProjectHomeArtwork,
  shortPurpose,
} from "@/lib/projectHomes";

describe("projectHomes refinement", () => {
  it("uses project-room.png as the permanent Projects room background", () => {
    expect(PROJECT_HOMES_ROOM_BACKGROUND).toBe("/backgrounds/project-room.png");
  });

  it("lists ten Project Homes with existing artwork paths", () => {
    const rooms = listProjectHomeRooms();
    expect(rooms).toHaveLength(10);
    for (const room of rooms) {
      expect(room.artwork.backgroundUrl.startsWith("/backgrounds/")).toBe(true);
      expect(room.artwork.backgroundUrl.includes("generated")).toBe(false);
      expect(room.description.length).toBeGreaterThan(10);
    }
  });

  it("isolates Strategy Conference Room as placeholder artwork", () => {
    const room = getProjectHomeRoom("strategy-conference");
    expect(room.artwork.isPlaceholder).toBe(true);
    expect(room.artwork.source).toBe("placeholder");
    expect(room.artwork.dedicatedArtworkPath).toContain(
      "strategy-conference-room-background",
    );
  });

  it("recommends Writing Room with natural Project Home voice", () => {
    const rec = recommendProjectHome("I want to write a newsletter draft");
    expect(rec.roomId).toBe("writing-room");
    expect(rec.reason).toContain("Writing Room");
    expect(rec.reason).toContain("Project Home");
  });

  it("recommends Boardroom for decision work", () => {
    const rec = recommendProjectHome(
      "Help me decide between two paths with stakeholders",
    );
    expect(rec.roomId).toBe("boardroom");
  });

  it("uses projectHomeId on sample records and resolves artwork", () => {
    expect(SAMPLE_PROJECT_HOMES[0]?.projectHomeId).toBe("writing-room");
    const art = resolveProjectHomeArtwork(SAMPLE_PROJECT_HOMES[0]!);
    expect(art.backgroundUrl).toContain("writing-room");
  });

  it("shortens purpose for cards and lists Connected Places", () => {
    expect(shortPurpose("A".repeat(120)).endsWith("…")).toBe(true);
    const places = connectedPlacesForProjectHome("writing-room");
    expect(places.map((p) => p.label)).toContain("Cartography");
    expect(places.map((p) => p.label)).toContain("Hall of Accomplishment");
  });
});
