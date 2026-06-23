import { describe, expect, it } from "vitest";
import {
  detectBusinessAdviceDomains,
  isBusinessAdviceRequest,
  primaryBusinessAdviceDomain,
} from "./businessAdviceIntent";

describe("businessAdviceIntent", () => {
  it("detects marketing and content strategy advice", () => {
    expect(
      detectBusinessAdviceDomains("How should I structure my content strategy?"),
    ).toContain("content_strategy");
    expect(
      isBusinessAdviceRequest("Help me with my marketing funnel"),
    ).toBe(true);
  });

  it("detects revenue and sales advice", () => {
    expect(detectBusinessAdviceDomains("How do I increase revenue?")).toContain(
      "revenue",
    );
    expect(
      isBusinessAdviceRequest("What's the best sales strategy for my offer?"),
    ).toBe(true);
  });

  it("detects audience advice", () => {
    expect(primaryBusinessAdviceDomain("Who should my ideal client be?")).toBe(
      "audience",
    );
  });

  it("ignores generic productivity chat", () => {
    expect(isBusinessAdviceRequest("I'm overwhelmed today")).toBe(false);
  });
});
