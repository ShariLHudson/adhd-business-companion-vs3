import { describe, expect, it } from "vitest";

import {
  prepareFounderExecutiveBrief,
  prepareFounderExecutiveBriefBundle,
  prepareFounderExecutiveBriefFull,
} from "./executiveBriefBridge";

describe("Founder Executive Brief bridge", () => {
  it("prepareFounderExecutiveBriefFull returns presentation brief", () => {
    const brief = prepareFounderExecutiveBriefFull();
    expect(brief.greeting).toContain("Shari");
    expect(brief.founderAlerts.length).toBeGreaterThan(0);
  });

  it("prepareFounderExecutiveBrief scopes to mission", () => {
    const brief = prepareFounderExecutiveBrief("listening-rooms");
    expect(
      brief.opportunities.every((o) => o.relatedMissionIds.includes("listening-rooms")),
    ).toBe(true);
  });

  it("bundle assembles advisor section and readability", () => {
    const bundle = prepareFounderExecutiveBriefBundle();
    expect(bundle.product).toBe("founder");
    expect(bundle.advisorSection.recommendations).toHaveLength(3);
    expect(bundle.readability.passes).toBe(true);
  });
});
