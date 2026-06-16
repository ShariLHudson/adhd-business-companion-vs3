import { describe, expect, it } from "vitest";
import {
  canAdvanceActivityStep,
  prepareStepAnswers,
} from "./activityFields";
import { getActivityById } from "./companionActivities";
import { stepField } from "./activityFields";

describe("activityFields", () => {
  it("requires filled options before advancing elimination round step 1", () => {
    const activity = getActivityById("elimination-round");
    expect(activity).toBeDefined();
    const field = stepField(activity!.steps[0]);
    expect(field?.type).toBe("options");
    expect(canAdvanceActivityStep(field, { options: ["", ""] })).toBe(false);
    expect(
      canAdvanceActivityStep(field, { options: ["A", "B", ""] }),
    ).toBe(true);
  });

  it("copies options into finalists for elimination step", () => {
    const activity = getActivityById("elimination-round");
    const field = stepField(activity!.steps[2]);
    expect(field?.type).toBe("eliminate-from");
    const prepared = prepareStepAnswers(field, {
      options: ["A", "B", "C"],
    });
    expect(prepared.finalists).toEqual(["A", "B", "C"]);
  });
});
