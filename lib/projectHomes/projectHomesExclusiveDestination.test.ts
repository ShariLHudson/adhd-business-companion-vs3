/**
 * Projects must take exclusive ownership of the screen.
 * Journal Gazebo presence / shell must not layer underneath New Project.
 *
 * @vitest-environment jsdom
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { isDedicatedEstateRoomPanelSection } from "@/lib/estate/directEstateVisit";
import {
  estatePresenceRoomForSection,
  resolveEstatePresenceRoomId,
  sectionOwnsPresenceMapping,
} from "@/lib/estate/estatePresence/registry";
import { detectProjectCreateFlavor } from "@/lib/projects/projectPieces190";

describe("Project Homes exclusive destination ownership", () => {
  it("treats project-homes as a dedicated estate room panel", () => {
    expect(isDedicatedEstateRoomPanelSection("project-homes")).toBe(true);
    expect(isDedicatedEstateRoomPanelSection("growth-journal")).toBe(true);
  });

  it("does not inherit Journal presence when opening Projects after Journal", () => {
    expect(sectionOwnsPresenceMapping("project-homes")).toBe(true);
    expect(estatePresenceRoomForSection("project-homes")).toBeNull();
    expect(
      resolveEstatePresenceRoomId({
        activeSection: "project-homes",
        memoryRoomId: "journal",
        showDirectEstateOverlay: false,
        directEstateVisit: null,
      }),
    ).toBeNull();
  });

  it("still maps growth-journal to journal presence", () => {
    expect(estatePresenceRoomForSection("growth-journal")).toBe("journal");
    expect(
      resolveEstatePresenceRoomId({
        activeSection: "growth-journal",
        memoryRoomId: "coffee-house",
      }),
    ).toBe("journal");
  });

  it("CompanionPageClient mounts Project Homes and Journal Gazebo exclusively", () => {
    const client = readFileSync(
      join(process.cwd(), "app/companion/CompanionPageClient.tsx"),
      "utf8",
    );
    expect(client).toMatch(
      /activeSection === "project-homes"[\s\S]*?<ProjectHomesPrototypePanel/,
    );
    expect(client).toMatch(
      /activeSection === "growth-journal"[\s\S]*?<GrowthJournalRoomPanel/,
    );
    expect(client).toContain('data-project-homes-active={');
    expect(client).toContain("syncDirectEstateVisit(null)");
    // Show Conversation control has been removed entirely — nothing to exclude.
    expect(client).not.toContain("show-conversation-chip");
    expect(client).not.toContain("Show Conversation");
  });

  it("Project Homes panel never mounts Journal Gazebo or frosted chat chrome", () => {
    const panel = readFileSync(
      join(
        process.cwd(),
        "components/companion/projectHomes/ProjectHomesPrototypePanel.tsx",
      ),
      "utf8",
    );
    expect(panel).not.toContain("JournalGazebo");
    expect(panel).not.toContain("GrowthJournalRoomPanel");
    expect(panel).not.toContain("EstateRoomChatChrome");
    expect(panel).toContain('data-testid="project-homes-create-purpose"');
    expect(panel).toContain('data-testid="project-home-intention-input"');
    expect(panel).toContain('data-testid="project-home-name-input"');
    expect(panel).toContain('data-testid="project-homes-continue-intention"');
    expect(panel).toContain('data-testid="project-homes-cancel-create"');
  });

  it("detects event-planning entry flavor from intention language", () => {
    expect(detectProjectCreateFlavor("planning a client workshop")).toBe(
      "event",
    );
    expect(detectProjectCreateFlavor("write chapter three")).toBe("general");
  });
});
