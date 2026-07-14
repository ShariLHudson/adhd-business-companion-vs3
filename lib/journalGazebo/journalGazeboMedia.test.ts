import { describe, expect, it } from "vitest";
import { JOURNAL_ROOM_BG } from "@/lib/growth/growthRoom";
import {
  GAZEBO_JOURNAL_BACKGROUND_URL,
  JOURNAL_GAZEBO_BACKGROUND_URL,
  JOURNAL_GAZEBO_RETURN_BACKGROUND_URL,
  JOURNAL_WELCOME_PLATE_URL,
} from "@/lib/journalGazebo/journalGazeboMedia";

describe("journalGazeboMedia", () => {
  it("uses the letter desk plate for the gazebo session", () => {
    expect(JOURNAL_GAZEBO_BACKGROUND_URL).toContain("journal-desk-background.png");
    expect(GAZEBO_JOURNAL_BACKGROUND_URL).toBe(JOURNAL_GAZEBO_BACKGROUND_URL);
    expect(JOURNAL_ROOM_BG).toContain("journal-desk-background.png");
    // Optional letter-free asset may exist; session uses the letter plate.
    expect(JOURNAL_GAZEBO_RETURN_BACKGROUND_URL).toContain(
      "journal-desk-return-background.png",
    );
  });

  it("keeps the alternate welcome plate available for preload only", () => {
    expect(JOURNAL_WELCOME_PLATE_URL).toContain("welcome-to-the-journal-gazebo");
    expect(JOURNAL_WELCOME_PLATE_URL).not.toBe(JOURNAL_GAZEBO_BACKGROUND_URL);
  });
});
