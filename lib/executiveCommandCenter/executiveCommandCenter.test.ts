import { describe, expect, it } from "vitest";

import {
  COMMAND_CENTER_PRINCIPLE,
  composeExecutiveCommandCenterView,
  composeExecutivePanelDetail,
  getExecutiveCommandCenterBootstrap,
} from "./index";

describe("Executive Command Center™", () => {
  it("exposes headquarters principle", () => {
    expect(COMMAND_CENTER_PRINCIPLE).toContain("One mission");
  });

  it("composeExecutiveCommandCenterView answers six executive questions", () => {
    const view = composeExecutiveCommandCenterView();
    expect(view.sixQuestions.whatMattersToday).toBeTruthy();
    expect(view.sixQuestions.whyItMatters).toBeTruthy();
    expect(view.sixQuestions.whatWeRecommend).toBeTruthy();
    expect(view.sixQuestions.opportunitiesToKnow).toBeTruthy();
    expect(view.sixQuestions.decisionsWaiting).toBeTruthy();
    expect(view.sixQuestions.whatToDoNext).toBeTruthy();
  });

  it("presents six executive panels without duplicating primary recommendation", () => {
    const view = composeExecutiveCommandCenterView();
    expect(view.panels).toHaveLength(6);
    expect(view.panels.map((p) => p.id)).toEqual([
      "today",
      "discover",
      "decide",
      "build",
      "run",
      "learn",
    ]);
    expect(view.primaryRecommendation).toBe(view.panels[0]!.teaser);
  });

  it("status bar and assistant queue surface executive posture", () => {
    const view = composeExecutiveCommandCenterView();
    expect(view.status.currentMission).toBeTruthy();
    expect(view.status.currentFocus).toBeTruthy();
    expect(view.assistantQueue.length).toBeGreaterThan(0);
    expect(view.assistantQueue.every((item) => item.status === "draft")).toBe(true);
  });

  it("composeExecutivePanelDetail expands a panel", () => {
    const detail = composeExecutivePanelDetail("discover");
    expect(detail?.panel.id).toBe("discover");
    expect(detail!.panel.items.length).toBeGreaterThan(0);
  });

  it("getExecutiveCommandCenterBootstrap lists intelligence sources", () => {
    const bootstrap = getExecutiveCommandCenterBootstrap();
    expect(bootstrap.panelCount).toBe(6);
    expect(bootstrap.intelligenceSources).toContain("SPARK™");
    expect(bootstrap.intelligenceSources).toContain("Executive Judgment™");
  });
});
