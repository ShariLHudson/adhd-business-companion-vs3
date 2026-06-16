import { describe, expect, it } from "vitest";
import {
  canAdvanceActivityStep,
  prepareStepAnswers,
} from "./activityFields";
import { getActivityById } from "./companionActivities";
import { stepField } from "./activityFields";

describe("activityFields", () => {
  it("requires filled options before advancing decision matrix options step", () => {
    const activity = getActivityById("decision-matrix");
    expect(activity).toBeDefined();
    const field = stepField(activity!.steps[1]);
    expect(field?.type).toBe("options");
    expect(canAdvanceActivityStep(field, { options: ["", ""] })).toBe(false);
    expect(
      canAdvanceActivityStep(field, { options: ["A", "B", ""] }),
    ).toBe(true);
  });

  it("copies options into finalists for elimination step (field type)", () => {
    const field = {
      type: "eliminate-from" as const,
      key: "finalists",
      fromKey: "options",
    };
    const prepared = prepareStepAnswers(field, {
      options: ["A", "B", "C"],
    });
    expect(prepared.finalists).toEqual(["A", "B", "C"]);
  });
});
