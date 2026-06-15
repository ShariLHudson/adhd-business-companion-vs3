import { describe, expect, it } from "vitest";
import {
  ACTIVITY_CATEGORIES,
  COMPANION_ACTIVITIES,
  activitiesForCategory,
} from "./companionActivities";

describe("companionActivities", () => {
  it("has seven need-based categories with at least four activities each", () => {
    expect(ACTIVITY_CATEGORIES).toHaveLength(7);
    for (const cat of ACTIVITY_CATEGORIES) {
      const items = activitiesForCategory(cat.id);
      expect(items.length).toBeGreaterThanOrEqual(4);
    }
    expect(COMPANION_ACTIVITIES).toHaveLength(28);
  });

  it("includes suggested activity titles", () => {
    const titles = COMPANION_ACTIVITIES.map((a) => a.title);
    expect(titles).toContain("Five Senses Grounding");
    expect(titles).toContain("Bad First Draft");
    expect(titles).toContain("What Feels Heaviest?");
  });

  it("gives every activity steps and time estimate", () => {
    for (const a of COMPANION_ACTIVITIES) {
      expect(a.steps.length).toBeGreaterThanOrEqual(4);
      expect(a.timeLabel.length).toBeGreaterThan(0);
      expect(a.helpsWith.length).toBeGreaterThan(10);
    }
  });
});
