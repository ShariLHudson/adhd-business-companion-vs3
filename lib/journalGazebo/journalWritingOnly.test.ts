import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { MAX_JOURNAL_WRITING_PAGES } from "./bookCeremony";
import { JOURNAL_SAVE_LABEL } from "./hospitality";

describe("Journal writing-only + save + 200 pages", () => {
  it("caps journals at 200 writing pages", () => {
    expect(MAX_JOURNAL_WRITING_PAGES).toBe(200);
  });

  it("exposes a Save label for the journal actions", () => {
    expect(JOURNAL_SAVE_LABEL).toBe("Save");
  });

  it("labels desk Write as Begin where left off", async () => {
    const { JOURNAL_TABLE_WRITE } = await import("./hospitality");
    expect(JOURNAL_TABLE_WRITE.title).toMatch(/begin where left off/i);
  });

  it("keeps conversation chat off in the Journal room panel", () => {
    const panel = readFileSync(
      join(process.cwd(), "components/companion/GrowthJournalRoomPanel.tsx"),
      "utf8",
    );
    expect(panel).not.toContain("EstateRoomChatChrome");
    expect(panel).toContain("writing-only");
  });

  it("wires Save into the open-book Done actions", () => {
    const experience = readFileSync(
      join(process.cwd(), "components/journal-gazebo/JournalGazeboExperience.tsx"),
      "utf8",
    );
    expect(experience).toContain("handleSaveJournal");
    expect(experience).toContain("onSave={handleSaveJournal}");
    expect(experience).toContain("persistOpenJournalPlace");
  });

  it("has no Show Conversation control left to hide while Journal is active", () => {
    const client = readFileSync(
      join(process.cwd(), "app/companion/CompanionPageClient.tsx"),
      "utf8",
    );
    expect(client).not.toContain("Show Conversation");
    expect(client).not.toContain("show-conversation-chip");
    expect(client).not.toContain("conversation-visibility-chip");
  });

  it("resumes journals via resolveResumePageIndex on open paths", () => {
    const experience = readFileSync(
      join(process.cwd(), "components/journal-gazebo/JournalGazeboExperience.tsx"),
      "utf8",
    );
    expect(experience).toContain("resolveResumePageIndex(journal.id)");
    expect(experience).toContain("resolveResumePageIndex(config.id)");
    expect(experience).toContain("handleSaveJournal");
  });
});
