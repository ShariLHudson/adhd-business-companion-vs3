/**
 * Regression: Project Homes room imports from the barrel. Missing re-exports
 * throw during render and surface EstateRouteRecovery ("did not finish loading").
 */
import { describe, expect, it } from "vitest";
import * as projectHomes from "@/lib/projectHomes";

const REQUIRED_EXPORTS = [
  "PROJECT_HOMES_ROOM_BACKGROUND",
  "PROJECTS_BACKGROUND_SRC",
  "listProjectHomeRooms",
  "exploreExampleHomes",
  "loadMemberProjectHomesFromStore",
  "mergeMemberHomesWithStore",
  "createPersistedProjectHome",
  "visibleGalleryHomes",
  "EXPLORE_EXAMPLES_SECTION_NOTE",
  "VIEW_SAMPLE_PROJECTS_PROMPT",
  "SAMPLE_PROJECT_HOMES",
] as const;

describe("projectHomes barrel exports", () => {
  it("re-exports every symbol Project Homes UI needs to open", () => {
    for (const name of REQUIRED_EXPORTS) {
      expect(
        projectHomes[name as keyof typeof projectHomes],
        `missing export: ${name}`,
      ).toBeDefined();
    }
    expect(typeof projectHomes.exploreExampleHomes).toBe("function");
    expect(typeof projectHomes.loadMemberProjectHomesFromStore).toBe("function");
    expect(projectHomes.exploreExampleHomes().length).toBeGreaterThan(0);
    expect(projectHomes.listProjectHomeRooms().length).toBeGreaterThan(0);
  });
});
