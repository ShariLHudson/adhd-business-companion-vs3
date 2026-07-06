import { describe, expect, it } from "vitest";

import { getFounderCommandCenterBundle, prepareFounderExecutiveDesk } from "./commandCenterBridge";

describe("Founder Executive Command Center bridge", () => {
  it("getFounderCommandCenterBundle composes one executive surface", () => {
    const bundle = getFounderCommandCenterBundle("listening-rooms");
    expect(bundle.product).toBe("founder");
    expect(bundle.center.desk.todaysMission.id).toBe("listening-rooms");
    expect(bundle.center.sources.length).toBeGreaterThanOrEqual(10);
    expect(bundle.contexts.overnight).toBeTruthy();
  });

  it("prepareFounderExecutiveDesk limits desk attention", () => {
    const desk = prepareFounderExecutiveDesk("listening-rooms");
    expect(desk.desk.executiveBriefHeadline.length).toBeGreaterThan(0);
    expect(desk.today.morning.calmClose).toContain("wait");
    expect(desk.focus.focus.score).toBeGreaterThanOrEqual(0);
  });
});
