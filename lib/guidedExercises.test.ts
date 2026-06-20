import { describe, expect, it } from "vitest";
import {
  guidedExerciseMenu,
  isGuidedExerciseActivity,
  standaloneSectionForActivity,
} from "./guidedExercises";
import { momentumBoosterMenu } from "./momentumBoosters";

describe("guidedExercises", () => {
  it("lists guided exercises alphabetically by title", () => {
    const titles = guidedExerciseMenu().map((row) => row.title);
    expect(titles).toEqual([
      "ADHD Decision Compass",
      "Future Me",
      "Goal Clarifier",
      "Priority Sort",
      "Project Breakdown",
      "Quick Two Option Choice",
      "Values Check",
    ]);
  });

  it("routes guided activities to the guided-exercises section", () => {
    expect(isGuidedExerciseActivity("decision-compass")).toBe(true);
    expect(isGuidedExerciseActivity("brain-parking-lot")).toBe(false);
    expect(standaloneSectionForActivity("priority-sort")).toBe(
      "guided-exercises",
    );
    expect(standaloneSectionForActivity("brain-parking-lot")).toBe("focus");
  });
});

describe("momentumBoosters", () => {
  it("lists momentum boosters alphabetically", () => {
    expect(momentumBoosterMenu().map((b) => b.title)).toEqual([
      "Guided Exercises",
      "Momentum Games",
      "Spin The Wheel",
    ]);
  });
});
