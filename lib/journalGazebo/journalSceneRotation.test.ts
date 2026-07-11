import { describe, expect, it } from "vitest";
import { JOURNAL_GAZEBO_BACKGROUND_URL } from "./journalGazeboMedia";
import {
  journalGazeboStartUrl,
  resolveJournalGazeboRestScenes,
  resolveJournalWelcomeScenes,
  resolveJournalWorkshopScenes,
} from "./journalSceneRotation";

describe("journalSceneRotation", () => {
  it("uses the canonical desk plate for every session scene", () => {
    expect(journalGazeboStartUrl()).toBe(JOURNAL_GAZEBO_BACKGROUND_URL);
    expect(journalGazeboStartUrl()).toContain("/backgrounds/journal-desk-background.png");
    expect(resolveJournalWelcomeScenes().gazeboUrl).toBe(JOURNAL_GAZEBO_BACKGROUND_URL);
    expect(resolveJournalGazeboRestScenes().gazeboUrl).toBe(JOURNAL_GAZEBO_BACKGROUND_URL);
    expect(resolveJournalWorkshopScenes().gazeboUrl).toBe(JOURNAL_GAZEBO_BACKGROUND_URL);
  });
});
