import { describe, expect, it } from "vitest";
import {
  JOURNAL_GAZEBO_BACKGROUND_URL,
  JOURNAL_GAZEBO_RETURN_BACKGROUND_URL,
} from "./journalGazeboMedia";
import {
  journalGazeboStartUrl,
  resolveJournalGazeboRestScenes,
  resolveJournalWelcomeScenes,
  resolveJournalWorkshopScenes,
} from "./journalSceneRotation";

describe("journalSceneRotation", () => {
  it("keeps the letter desk for welcome/rest and a letter-free desk for workshop", () => {
    expect(journalGazeboStartUrl()).toBe(JOURNAL_GAZEBO_BACKGROUND_URL);
    expect(resolveJournalWelcomeScenes().gazeboUrl).toBe(
      JOURNAL_GAZEBO_BACKGROUND_URL,
    );
    expect(resolveJournalGazeboRestScenes().gazeboUrl).toBe(
      JOURNAL_GAZEBO_BACKGROUND_URL,
    );
    expect(resolveJournalWelcomeScenes().framing).toBe("welcome-letter");
    expect(resolveJournalGazeboRestScenes().framing).toBe("welcome-letter");
    expect(resolveJournalWorkshopScenes().gazeboUrl).toBe(
      JOURNAL_GAZEBO_RETURN_BACKGROUND_URL,
    );
    expect(resolveJournalWorkshopScenes().framing).toBe("return-desk");
  });
});
