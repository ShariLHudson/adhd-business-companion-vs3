import { describe, expect, it } from "vitest";
import { getShariAssistLabel } from "./shariAssistLabels";

describe("getShariAssistLabel", () => {
  it("maps core workspaces to purpose-specific labels", () => {
    expect(getShariAssistLabel("projects")).toBe("Build With Shari");
    expect(getShariAssistLabel("content-generator")).toBe("Build With Shari");
    expect(getShariAssistLabel("playbook")).toBe("Apply With Shari");
    expect(getShariAssistLabel("brain-dump")).toBe("Sort It Out With Shari");
    expect(getShariAssistLabel("templates-library")).toBe("Build With Shari");
    expect(getShariAssistLabel("how-do-i")).toBe("Learn With Shari");
    expect(getShariAssistLabel("client-avatars")).toBe("Define With Shari");
    expect(getShariAssistLabel("focus-timer")).toBe("Focus With Shari");
  });

  it("maps decide activities to Decide With Shari", () => {
    expect(
      getShariAssistLabel("activities", { activityCategoryId: "decide" }),
    ).toBe("Decide With Shari");
  });

  it("labels business strategy builds on playbook", () => {
    expect(
      getShariAssistLabel("playbook", {
        businessStrategyLabel: "Marketing Strategy",
        businessStrategyPhase: "building",
      }),
    ).toBe("Build Marketing With Shari");
    expect(
      getShariAssistLabel("playbook", {
        businessStrategyLabel: "Marketing Strategy",
        businessStrategyPhase: "coaching",
      }),
    ).toBe("Plan Marketing With Shari");
  });

  it("falls back when section is unknown", () => {
    expect(getShariAssistLabel("settings")).toBe("Work With Shari");
    expect(getShariAssistLabel(null)).toBe("Work With Shari");
  });
});
