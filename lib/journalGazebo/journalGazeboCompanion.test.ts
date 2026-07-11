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
});
