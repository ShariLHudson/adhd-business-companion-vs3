import { describe, expect, it } from "vitest";
import {
  CREATE_BACKGROUND_SRC,
  PROJECTS_BACKGROUND_SRC,
} from "@/lib/estateExperienceBackgrounds";
import { CREATIVE_STUDIO_ROOM_BG } from "@/lib/creativeStudio/creativeStudioRoom";
import { PROJECT_HOMES_ROOM_BACKGROUND } from "@/lib/projectHomes/roomCatalog";
import { CANONICAL_PLACE_BACKGROUNDS } from "@/lib/estate/estatePlaceMedia";

describe("estateExperienceBackgrounds", () => {
  it("defines Create and Projects public background URLs", () => {
    expect(CREATE_BACKGROUND_SRC).toBe(
      "/backgrounds/art-studio-background.png",
    );
    expect(PROJECTS_BACKGROUND_SRC).toBe(
      "/backgrounds/inspiring-vision-room-background.png",
    );
  });

  it("Create shells resolve the shared Create background", () => {
    expect(CREATIVE_STUDIO_ROOM_BG).toBe(CREATE_BACKGROUND_SRC);
  });

  it("Projects room plate resolves the shared Projects background", () => {
    expect(PROJECT_HOMES_ROOM_BACKGROUND).toBe(PROJECTS_BACKGROUND_SRC);
  });

  it("estate place media maps Create and Projects places to the same plates", () => {
    expect(CANONICAL_PLACE_BACKGROUNDS["creative-studio"]).toBe(
      CREATE_BACKGROUND_SRC,
    );
    expect(CANONICAL_PLACE_BACKGROUNDS["art-studio"]).toBe(
      CREATE_BACKGROUND_SRC,
    );
    expect(CANONICAL_PLACE_BACKGROUNDS["goals-projects"]).toBe(
      PROJECTS_BACKGROUND_SRC,
    );
  });
});
