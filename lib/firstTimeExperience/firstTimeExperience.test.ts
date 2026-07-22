/**
 * @vitest-environment jsdom
 */
import { beforeEach, describe, expect, it } from "vitest";
import {
  FIRST_TIME_EXPERIENCE_PRINCIPLE,
  FIRST_TIME_EXPERIENCE_REGISTRY,
  getFirstTimeExperienceDefinition,
  isFirstTimeExperienceCompleted,
  markFirstTimeExperienceSeen,
  resetFirstTimeExperienceLocalForTests,
  shouldAutoPresentFirstTimeExperience,
} from "@/lib/firstTimeExperience";
import { resolveWelcomeDisposition } from "@/lib/firstLoginWelcome";

describe("First-Time Experience framework (146)", () => {
  beforeEach(() => {
    resetFirstTimeExperienceLocalForTests("user-146");
  });

  it("states the door greeting principle", () => {
    expect(FIRST_TIME_EXPERIENCE_PRINCIPLE).toMatch(/Greet once/i);
  });

  it("registers welcome + orientation experiences", () => {
    const ids = FIRST_TIME_EXPERIENCE_REGISTRY.map((e) => e.id);
    expect(ids).toContain("welcome-audio");
    expect(ids).toContain("how-everything-works-together");
    expect(ids).toContain("estate-tour");
  });

  it("marks How Everything Works Together seen — no second auto interrupt", async () => {
    const def = getFirstTimeExperienceDefinition(
      "how-everything-works-together",
    );
    expect(def.mayAutoPresent).toBe(false);
    expect(
      await shouldAutoPresentFirstTimeExperience(
        "user-146",
        "how-everything-works-together",
      ),
    ).toBe(false);

    const record = markFirstTimeExperienceSeen(
      "user-146",
      "how-everything-works-together",
      { disposition: "completed" },
    );
    expect(isFirstTimeExperienceCompleted(record)).toBe(true);
    const again = markFirstTimeExperienceSeen(
      "user-146",
      "how-everything-works-together",
      { disposition: "completed" },
    );
    expect(again.completedAt).toBe(record.completedAt);
  });

  it("manual replay flag does not clear completion", () => {
    markFirstTimeExperienceSeen("user-146", "estate-tour", {
      disposition: "completed",
    });
    const afterReplay = markFirstTimeExperienceSeen(
      "user-146",
      "estate-tour",
      { isManualReplay: true },
    );
    expect(afterReplay.completedAt).toBeTruthy();
  });

  it("dismissed disposition still counts as a finished welcome", () => {
    expect(resolveWelcomeDisposition({ dismissed: true })).toBe("dismissed");
    expect(resolveWelcomeDisposition({ skipped: true })).toBe("skipped");
    expect(resolveWelcomeDisposition({})).toBe("completed");
  });
});
