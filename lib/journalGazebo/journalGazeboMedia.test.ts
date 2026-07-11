import { describe, expect, it } from "vitest";
import { JOURNAL_ROOM_BG } from "@/lib/growth/growthRoom";
import {
  GAZEBO_JOURNAL_BACKGROUND_URL,
  JOURNAL_GAZEBO_BACKGROUND_URL,
  JOURNAL_WELCOME_PLATE_URL,
} from "@/lib/journalGazebo/journalGazeboMedia";

describe("journalGazeboMedia", () => {
  it("uses the clean desk plate for return visits", () => {
    expect(JOURNAL_GAZEBO_BACKGROUND_URL).toContain("journal-desk-background.png");
    expect(GAZEBO_JOURNAL_BACKGROUND_URL).toBe(JOURNAL_GAZEBO_BACKGROUND_URL);
    expect(JOURNAL_ROOM_BG).toBe(JOURNAL_GAZEBO_BACKGROUND_URL);
  });

  it("keeps the welcome letter asset available for preload only", () => {
    expect(JOURNAL_WELCOME_PLATE_URL).toContain("welcome-to-the-journal-gazebo");
    expect(JOURNAL_WELCOME_PLATE_URL).not.toBe(JOURNAL_GAZEBO_BACKGROUND_URL);
  });
});
