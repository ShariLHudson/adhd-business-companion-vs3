import { describe, expect, it } from "vitest";

import {
  prepareFounderAwareness,
  prepareFounderAwarenessNotices,
  prepareFounderSignificantAwareness,
} from "./awarenessBridge";

describe("Founder Awareness bridge", () => {
  it("prepareFounderAwareness composes full awareness view", () => {
    const view = prepareFounderAwareness("listening-rooms");
    expect(view.architectureOnly).toBe(true);
    expect(view.observations.length).toBeGreaterThan(0);
    expect(view.recommendations.length).toBeLessThanOrEqual(3);
  });

  it("prepareFounderSignificantAwareness returns only significant recommendations", () => {
    const sig = prepareFounderSignificantAwareness("listening-rooms");
    expect(sig.recommendations.every((r) => r.significant)).toBe(true);
  });

  it("prepareFounderAwarenessNotices exposes awareness canon", () => {
    const notices = prepareFounderAwarenessNotices();
    expect(notices.notices.length).toBe(8);
    expect(notices.questions.length).toBe(6);
  });
});
