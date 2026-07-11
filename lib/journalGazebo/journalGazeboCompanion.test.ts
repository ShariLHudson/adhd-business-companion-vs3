/**
 * Journal Gazebo companion contracts — desk background and sanctuary actions.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

function readJournalGazeboExperience(): string {
  return readFileSync(
    resolve(
      process.cwd(),
      "components/journal-gazebo/JournalGazeboExperience.tsx",
    ),
    "utf8",
  );
}

function readCompanionPageClient(): string {
  return readFileSync(
    resolve(process.cwd(), "app/companion/CompanionPageClient.tsx"),
    "utf8",
  );
}

describe("journalGazeboCompanion", () => {
  const experience = readJournalGazeboExperience();
  const companion = readCompanionPageClient();
  const estateDesk = readFileSync(
    resolve(
      process.cwd(),
      "components/journal-gazebo/JournalGazeboEstateDesk.tsx",
    ),
    "utf8",
  );

  it("pins companion background to the canonical desk plate", () => {
    expect(experience).toMatch(
      /if \(useAtmosphere\) return \[\];\s*return \[JOURNAL_GAZEBO_BACKGROUND_URL\]/,
    );
  });

  it("opens the featured journal directly from the sanctuary desk", () => {
    expect(experience).toMatch(
      /onJournalClick=\{[\s\S]*openSelectedJournal\(featuredJournal\)/,
    );
  });

  it("mounts only one growth journal panel when the section is active", () => {
    expect(companion).toMatch(
      /case "growth-journal":[\s\S]*if \(activeSection === "growth-journal"\) return null/,
    );
  });

  it("shows welcome desk actions before the background finishes composing", () => {
    expect(estateDesk).not.toMatch(/welcomeVisible[\s\S]*sceneComposed/);
    expect(estateDesk).toMatch(/<JournalGazeboWelcomeDesk/);
  });

  it("portals welcome desk actions above portaled estate chrome", () => {
    const welcomeDesk = readFileSync(
      resolve(
        process.cwd(),
        "components/journal-gazebo/JournalGazeboWelcomeDesk.tsx",
      ),
      "utf8",
    );
    expect(welcomeDesk).toMatch(/JournalGazeboTableActionsPortal/);
    expect(welcomeDesk).toMatch(/layout="welcome-plate"/);
    expect(welcomeDesk).toMatch(/jg-welcome-desk/);
    expect(readFileSync(resolve(process.cwd(), "app/companion/companion.css"), "utf8")).toMatch(
      /body:has\(\.companion-root\[data-journal-gazebo-active\]\) \.spark-note-anchor/,
    );
  });
});
