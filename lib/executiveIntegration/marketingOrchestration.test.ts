import { describe, expect, it } from "vitest";

import {
  GHL_DEPARTMENT,
  MARKETING_ORCHESTRATION_FLOW,
  POSTCRAFT_DEPARTMENT,
} from "./marketingOrchestration";

describe("Marketing orchestration flow", () => {
  it("defines Founder → recommend → prepare → departments → feedback", () => {
    expect(MARKETING_ORCHESTRATION_FLOW.steps.map((s) => s.label)).toEqual([
      "Founder Studio",
      "Makes recommendations",
      "Prepares everything",
    ]);
    expect(MARKETING_ORCHESTRATION_FLOW.feedback.label).toContain("status and analytics");
  });

  it("assigns PostCraft content responsibilities", () => {
    expect(POSTCRAFT_DEPARTMENT.responsibilities).toEqual([
      "Creates content",
      "Creates campaigns",
      "Stores content assets",
    ]);
  });

  it("assigns GoHighLevel delivery responsibilities", () => {
    expect(GHL_DEPARTMENT.responsibilities).toContain("Builds workflows");
    expect(GHL_DEPARTMENT.responsibilities).toContain("CRM");
    expect(GHL_DEPARTMENT.responsibilities).toContain("Automations");
    expect(GHL_DEPARTMENT.responsibilities).toHaveLength(6);
  });
});
