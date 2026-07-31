import { beforeEach, describe, expect, it } from "vitest";
import {
  dismissHomeTeaserToday,
  isHomeTeaserDismissedToday,
  resetSparkNoteStoreForTests,
} from "./persistence";

describe("Welcome Home Today's Spark teaser — daily dismissal", () => {
  beforeEach(() => resetSparkNoteStoreForTests());

  it("shows by default, hides after dismissal, and returns the next day", () => {
    const morning = new Date("2026-07-31T09:00:00");
    expect(isHomeTeaserDismissedToday(morning)).toBe(false);

    dismissHomeTeaserToday(morning);
    expect(isHomeTeaserDismissedToday(morning)).toBe(true);

    // Still hidden later the same local day (survives refresh).
    expect(isHomeTeaserDismissedToday(new Date("2026-07-31T21:30:00"))).toBe(
      true,
    );

    // Returns the next calendar day.
    expect(isHomeTeaserDismissedToday(new Date("2026-08-01T08:00:00"))).toBe(
      false,
    );
  });
});
