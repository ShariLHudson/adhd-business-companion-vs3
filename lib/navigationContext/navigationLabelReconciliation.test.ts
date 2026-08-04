import { describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { labelForDestinationId } from "./destinationLabels";
import { DESTINATION_LABELS } from "./types";
import { workspaceAreaTitle, WORKSPACE_TITLES } from "@/lib/workspaceMode";
import { WELCOME_HOME_NAV_CATEGORIES } from "@/lib/estate/welcomeHomeNavigationStructure";
import { BOARDROOM_DESTINATION_NAME } from "@/lib/board/types";
import { getExploreEstateDestinations } from "@/lib/estateMap/exploreEstateDestinations";

function read(pathFromRoot: string): string {
  return readFileSync(resolve(process.cwd(), pathFromRoot), "utf8");
}

function findMenuLabel(destinationId: string): string | undefined {
  for (const category of WELCOME_HOME_NAV_CATEGORIES) {
    const match = category.destinations.find((d) => d.id === destinationId);
    if (match) return match.label;
    for (const dest of category.destinations) {
      const child = dest.dropdownChildren?.find((c) => c.id === destinationId);
      if (child) return child.label;
    }
  }
  return undefined;
}

describe("navigation label reconciliation — Boardroom", () => {
  it("has one canonical display name: 'Boardroom', not 'Round Table Boardroom'", () => {
    expect(findMenuLabel("boardroom")).toBe("Boardroom");
    expect(DESTINATION_LABELS["boardroom"]).toBe("Boardroom");
    expect(WORKSPACE_TITLES["boardroom"]).toBe("Boardroom");
    expect(workspaceAreaTitle("boardroom")).toBe("Boardroom");
    expect(labelForDestinationId("boardroom")).toBe("Boardroom");
    expect(BOARDROOM_DESTINATION_NAME).toBe("Boardroom");
  });

  it("the room's own header, error-boundary fallback, and director sub-screens agree with the menu — no more 'Round Table Boardroom' anywhere live", () => {
    const boardroomPanel = read(
      "components/companion/boardroom/BoardroomRoomPanel.tsx",
    );
    expect(boardroomPanel).toContain('<h1 className="boardroom-title">Boardroom</h1>');
    expect(boardroomPanel).not.toContain("Round Table Boardroom");

    const companionClient = read("app/companion/CompanionPageClient.tsx");
    expect(companionClient).toContain('roomLabel="Boardroom"');

    const meetExperience = read(
      "components/companion/board/BoardDirectorsMeetExperience.tsx",
    );
    expect(meetExperience).toContain('<p className="boardroom-kicker">Boardroom</p>');

    const profileCard = read(
      "components/companion/board/BoardDirectorProfileCard.tsx",
    );
    expect(profileCard).toContain("<span>Boardroom</span>");
  });

  it("the Explore Estate catalog card also agrees", () => {
    const destinations = getExploreEstateDestinations();
    const board = destinations.find((d) => d.id === "round-table");
    expect(board?.name).toBe("Boardroom");
  });

  it("the conversational welcome message ('Welcome to the Round Table Boardroom...') is intentionally preserved — narrative copy, not a structural destination label", () => {
    const boardroomEntry = read("lib/boardroom/boardroomEntry.ts");
    expect(boardroomEntry).toContain("Welcome to the Round Table Boardroom");
  });
});

describe("navigation label reconciliation — Personal Library", () => {
  it("has one canonical display name: 'Personal Library', not 'My Personal Library'", () => {
    expect(findMenuLabel("personal-library")).toBe("Personal Library");
    expect(DESTINATION_LABELS["personal-library"]).toBe("Personal Library");
    expect(WORKSPACE_TITLES["personal-library"]).toBe("Personal Library");
    expect(workspaceAreaTitle("personal-library")).toBe("Personal Library");
    expect(labelForDestinationId("personal-library")).toBe("Personal Library");
  });

  it("the room's own title/aria-label and the Back-to control agree with the menu", () => {
    const room = read(
      "components/companion/personalLibrary/PersonalLibraryRoom.tsx",
    );
    expect(room).toContain('aria-label="Personal Library"');
    expect(room).toContain(
      '<h1 className="personal-library-room__sr-title">Personal Library</h1>',
    );

    const sparkCardShell = read("components/companion/TodaysSparkCardShell.tsx");
    expect(sparkCardShell).toContain("Back to Personal Library");
    expect(sparkCardShell).not.toContain("Back to My Personal Library");
  });

  it("descriptive/context copy may still say 'My Personal Library' — action wording is allowed to differ from the destination name", () => {
    // Example from the task itself: destination name "Personal Library",
    // action "Go to My Personal Library". The image alt text and the
    // gift-room's compound aria-label are exactly this kind of warm,
    // descriptive context copy, not a navigational label pill — left as-is.
    const room = read(
      "components/companion/personalLibrary/PersonalLibraryRoom.tsx",
    );
    expect(room).toContain("My Personal Library");
  });

  it("canonicalEstatePlaces.ts's official registry already agreed with the chosen canonical name — confirms it was the authoritative source", () => {
    const canonicalPlaces = read("lib/estate/canonicalEstatePlaces.ts");
    expect(canonicalPlaces).toMatch(
      /id: "personal-library",\s*\n\s*officialName: "Personal Library"/,
    );
  });
});

describe("navigation label reconciliation — creation-workspace", () => {
  it("'Creation Workspace' is confirmed correct as the destination/room label, not a violation of the human-readable workspace identity standard", () => {
    // Doc 073 bans "Creation Workspace" as the *member-facing fallback name
    // for an unnamed work item* being created. CreationWorkspacePanel.tsx
    // already does the right thing: when a work item exists, its own
    // <h1> shows workspace.title (the item's real name), and
    // CREATION_WORKSPACE_TITLE only ever appears as the room/destination
    // eyebrow or the empty-state heading — never as a stand-in for an
    // unnamed piece of work. No change needed; documented here so this
    // isn't re-flagged as a false-positive violation in a future batch.
    const panel = read(
      "components/companion/creationWorkspace/CreationWorkspacePanel.tsx",
    );
    expect(panel).toContain("{workspace.title}");
    expect(DESTINATION_LABELS["creation-workspace"]).toBe("Creation Workspace");
    expect(WORKSPACE_TITLES["creation-workspace"]).toBe("Creation Workspace");
  });
});

describe("navigation label reconciliation — safety net still intact", () => {
  it("unknown ids still use the safe humanized fallback, never a raw id", () => {
    const label = labelForDestinationId("some-newly-added-room");
    expect(label).toBe("Some Newly Added Room");
    expect(label).not.toContain("-");
  });

  it("still warns in development for an unmapped id", () => {
    const originalEnv = process.env.NODE_ENV;
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    try {
      (process.env as { NODE_ENV: string }).NODE_ENV = "development";
      labelForDestinationId("another-new-room");
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining("another-new-room"),
      );
    } finally {
      (process.env as { NODE_ENV: string }).NODE_ENV = originalEnv ?? "test";
      warnSpy.mockRestore();
    }
  });
});

describe("navigation label reconciliation — calendar/reminders collision remains protected", () => {
  it("Settings-tab and Estate-room contexts for 'calendar' still resolve differently, on purpose — left undisturbed per the task's explicit instruction", () => {
    expect(DESTINATION_LABELS["calendar"]).toBe("Calendar Settings");
    expect(WORKSPACE_TITLES["calendar"]).toBe("Calendar");
    expect(DESTINATION_LABELS["calendar"]).not.toBe(WORKSPACE_TITLES["calendar"]);
  });

  it("Settings-tab and Estate-room contexts for 'reminders' still resolve differently, on purpose", () => {
    expect(DESTINATION_LABELS["reminders"]).toBe("Reminder Settings");
    expect(WORKSPACE_TITLES["reminders"]).toBe("Reminders");
    expect(DESTINATION_LABELS["reminders"]).not.toBe(WORKSPACE_TITLES["reminders"]);
  });
});
