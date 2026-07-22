import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  CREATE_BACKGROUND_SRC,
  PROJECTS_BACKGROUND_SRC,
} from "@/lib/estateExperienceBackgrounds";
import { CREATIVE_STUDIO_ROOM_BG } from "@/lib/creativeStudio/creativeStudioRoom";
import { PROJECT_HOMES_ROOM_BACKGROUND } from "@/lib/projectHomes/roomCatalog";
import { CANONICAL_PLACE_BACKGROUNDS } from "@/lib/estate/estatePlaceMedia";

function publicPathFromUrl(url: string): string {
  return join(process.cwd(), "public", url.replace(/^\//, ""));
}

function readRepo(relativePath: string): string {
  return readFileSync(join(process.cwd(), relativePath), "utf8");
}

describe("estateExperienceBackgrounds", () => {
  it("defines Create and Projects public background URLs", () => {
    expect(CREATE_BACKGROUND_SRC).toBe(
      "/backgrounds/art-studio-background.png",
    );
    expect(PROJECTS_BACKGROUND_SRC).toBe(
      "/backgrounds/inspiring-vision-room-background.png",
    );
  });

  it("ships the Create and Projects PNG plates in public/", () => {
    expect(existsSync(publicPathFromUrl(CREATE_BACKGROUND_SRC))).toBe(true);
    expect(existsSync(publicPathFromUrl(PROJECTS_BACKGROUND_SRC))).toBe(true);
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

  it("Create and Projects shells wire CinematicBackground + atmosphere CSS", () => {
    const createShell = readRepo(
      "components/companion/CreateEstateRoomShell.tsx",
    );
    const projectsShell = readRepo(
      "components/companion/projectHomes/ProjectHomesRoomShell.tsx",
    );
    const client = readRepo("app/companion/CompanionPageClient.tsx");
    const layout = readRepo("app/companion/layout.tsx");
    expect(createShell).toContain("CREATE_BACKGROUND_SRC");
    expect(createShell).toContain("CinematicBackground");
    expect(createShell).toContain("create-projects-atmosphere.css");
    expect(createShell).toContain('preset="creative-studio"');
    expect(projectsShell).toContain("PROJECTS_BACKGROUND_SRC");
    expect(projectsShell).toContain("CinematicBackground");
    expect(projectsShell).toContain("create-projects-atmosphere.css");
    expect(layout).toContain("create-projects-atmosphere.css");
    expect(client).toContain('data-create-estate-working={');
    expect(client).toContain('data-project-homes-active={');
    expect(client).toContain('roomId="goals-projects"');
  });
});
