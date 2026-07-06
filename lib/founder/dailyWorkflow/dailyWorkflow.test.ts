import { describe, expect, it } from "vitest";

import {
  composeFounderDailyWorkflow,
  FOUNDER_WORK_MODES,
  getWorkMode,
  listWorkModes,
} from "./index";

describe("Founder Daily Workflow™", () => {
  it("defines six work modes that map to existing workspaces", () => {
    expect(FOUNDER_WORK_MODES).toHaveLength(6);
    expect(listWorkModes().map((m) => m.id)).toEqual([
      "think",
      "build",
      "create",
      "grow",
      "review",
      "lead",
    ]);
    expect(getWorkMode("build").workspaceIds).toContain("build");
  });

  it("composeFounderDailyWorkflow answers the Shari test fields", () => {
    const workflow = composeFounderDailyWorkflow();

    expect(workflow.greeting).toBeTruthy();
    expect(workflow.mission.title).toBeTruthy();
    expect(workflow.mission.whyItMatters).toBeTruthy();
    expect(workflow.primaryAction.title).toBeTruthy();
    expect(workflow.workMode.label).toBeTruthy();
    expect(workflow.office.agenda).toBeDefined();
    expect(workflow.assembledStack.length).toBeGreaterThan(3);
  });

  it("assembles cross-ecosystem stack layers from existing services", () => {
    const workflow = composeFounderDailyWorkflow();
    const layers = new Set(workflow.assembledStack.map((item) => item.layer));

    expect(layers.has("mission")).toBe(true);
    expect(layers.has("listening")).toBe(true);
    expect(
      layers.has("decisions") ||
        layers.has("cursor") ||
        layers.has("marketing"),
    ).toBe(true);
  });

  it("caps surface lists to reduce cognitive load", () => {
    const workflow = composeFounderDailyWorkflow();
    expect(workflow.opportunities.length).toBeLessThanOrEqual(3);
    expect(workflow.pendingDecisions.length).toBeLessThanOrEqual(3);
    expect(workflow.canWait.length).toBeLessThanOrEqual(3);
  });

  it("consumes SPARK bridge without duplicating intelligence", () => {
    const workflow = composeFounderDailyWorkflow();
    const hasSparkSignal = workflow.assembledStack.some(
      (item) => item.layer === "cursor" || item.layer === "marketing",
    );
    expect(hasSparkSignal).toBe(true);
  });
});
