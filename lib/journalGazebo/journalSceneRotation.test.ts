import { describe, expect, it } from "vitest";
import { JOURNAL_GAZEBO_BACKGROUND_URL } from "./journalGazeboMedia";
import {
  journalGazeboStartUrl,
  resolveJournalGazeboRestScenes,
  resolveJournalWelcomeScenes,
  resolveJournalWorkshopScenes,
} from "./journalSceneRotation";

describe("journalSceneRotation", () => {
  it("keeps the letter desk plate for welcome and rest scenes", () => {
    expect(journalGazeboStartUrl()).toBe(JOURNAL_GAZEBO_BACKGROUND_URL);
    expect(resolveJournalWelcomeScenes().gazeboUrl).toBe(
      JOURNAL_GAZEBO_BACKGROUND_URL,
    );
    expect(resolveJournalGazeboRestScenes().gazeboUrl).toBe(
      JOURNAL_GAZEBO_BACKGROUND_URL,
    );
    expect(resolveJournalWorkshopScenes().gazeboUrl).toBe(
      JOURNAL_GAZEBO_BACKGROUND_URL,
    );
    expect(resolveJournalWelcomeScenes().framing).toBe("welcome-letter");
    expect(resolveJournalGazeboRestScenes().framing).toBe("welcome-letter");
  });
});
