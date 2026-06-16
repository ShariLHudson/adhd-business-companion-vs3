import { describe, expect, it } from "vitest";
import {
  ACTIVITY_CATEGORIES,
  COMPANION_ACTIVITIES,
  activitiesForCategory,
  getActivityById,
} from "./companionActivities";
import { stepField } from "./activityFields";

describe("companionActivities", () => {
  it("has seven need-based categories with at least four activities each", () => {
    expect(ACTIVITY_CATEGORIES).toHaveLength(7);
    for (const cat of ACTIVITY_CATEGORIES) {
      const items = activitiesForCategory(cat.id);
      expect(items.length).toBeGreaterThanOrEqual(4);
    }
    expect(COMPANION_ACTIVITIES).toHaveLength(31);
  });

  it("gives every activity steps and time estimate", () => {
    for (const a of COMPANION_ACTIVITIES) {
      expect(a.steps.length).toBeGreaterThanOrEqual(4);
      expect(a.timeLabel.length).toBeGreaterThan(0);
      expect(a.helpsWith.length).toBeGreaterThan(10);
      for (const step of a.steps) {
        expect(step.instruction.length).toBeGreaterThan(5);
      }
    }
  });

  it("includes unique strategy titles", () => {
    const titles = COMPANION_ACTIVITIES.map((a) => a.title);
    expect(titles).toContain("Focus Session");
    expect(titles).toContain("Decision Matrix");
    expect(titles).toContain("Clear My Mind");
    expect(titles).toContain("Energy Check");
    expect(titles).toContain("Five Senses Grounding");
  });

  it("gives decision matrix structured option fields", () => {
    const activity = getActivityById("decision-matrix");
    expect(activity).toBeDefined();
    expect(stepField(activity!.steps[1])?.type).toBe("options");
    expect(stepField(activity!.steps[3])?.type).toBe("pick-from");
  });
});
