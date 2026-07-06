import { describe, expect, it } from "vitest";

import {
  prepareFounderExecutiveCommandCenter,
  prepareFounderExecutivePanelDetail,
} from "./executiveCommandCenterBridge";

describe("Founder Executive Command Center bridge", () => {
  it("prepareFounderExecutiveCommandCenter returns headquarters view", () => {
    const result = prepareFounderExecutiveCommandCenter();
    expect(result.view.headquartersMessage).toContain("executive team");
    expect(result.view.panels).toHaveLength(6);
    expect(result.principle).toContain("One mission");
  });

  it("prepareFounderExecutivePanelDetail expands discover panel", () => {
    const result = prepareFounderExecutivePanelDetail("discover");
    expect(result.detail?.panel.title).toBe("Discover");
  });
});
