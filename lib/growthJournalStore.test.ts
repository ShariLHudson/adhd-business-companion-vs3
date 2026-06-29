// @vitest-environment jsdom

import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  createCaptureMomentEntry,
  createJournalEntry,
  createYourStoryEntry,
  generateEntryTitle,
  getGrowthMemoryEntries,
} from "./growthJournalStore";

describe("growthJournalStore capture moments", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("generates short title from first words", () => {
    expect(generateEntryTitle("A win from today's launch party")).toBe(
      "A win from today's launch party",
    );
    expect(
      generateEntryTitle(
        "This is a longer first line with many words that should truncate nicely",
      ),
    ).toMatch(/…$/);
  });

  it("saves capture_moment entries with metadata", () => {
    const { entry, ok } = createCaptureMomentEntry({
      content: "Someone said my work changed their week.",
      userId: "user-1",
    });
    expect(ok).toBe(true);
    expect(entry?.type).toBe("capture_moment");
    expect(entry?.sourcePage).toBe("capture_the_moment");
    expect(entry?.title).toBeTruthy();
    expect(entry?.tags).toEqual([]);
    expect(entry?.isArchived).toBe(false);

    const all = getGrowthMemoryEntries();
    expect(all.some((e) => e.id === entry?.id)).toBe(true);
  });

  it("keeps journal entries separate by type", () => {
    createJournalEntry({ body: "Journal reflection", attachments: [], type: "journal" });
    createCaptureMomentEntry({ content: "Captured moment" });
    const journalOnly = getGrowthMemoryEntries({ types: ["journal"] });
    const captureOnly = getGrowthMemoryEntries({ types: ["capture_moment"] });
    expect(journalOnly).toHaveLength(1);
    expect(captureOnly).toHaveLength(1);
  });

  it("saves your_story entries with sourcePage and type", () => {
    const { entry, ok } = createYourStoryEntry({
      content: "A lesson from this season of building.",
      userId: "user-1",
    });
    expect(ok).toBe(true);
    expect(entry?.type).toBe("story_reflection");
    expect(entry?.sourcePage).toBe("your_story");
    expect(entry?.isArchived).toBe(false);

    const milestone = createYourStoryEntry({
      content: "Launched the companion beta.",
      type: "milestone",
    });
    expect(milestone.ok).toBe(true);
    expect(milestone.entry?.type).toBe("milestone");
  });
});
