import { describe, expect, it } from "vitest";
import {
  buildCoachingFallbackResponse,
  classifyCoachingFallbackKind,
  COACHING_FALLBACK_LEAD,
  isCoachingFallbackNeeded,
} from "./coachingFallback";

describe("coachingFallback", () => {
  it("classifies quit-temptation prompts", () => {
    expect(
      classifyCoachingFallbackKind(
        "I think I should stop working on this app and just go back to making crafts.",
      ),
    ).toBe("quit_temptation");
  });

  it("classifies prioritization overload", () => {
    expect(
      classifyCoachingFallbackKind(
        "I have fifteen things I could work on today and every one of them feels important.",
      ),
    ).toBe("prioritization_overload");
  });

  it("builds fallback with lead copy and a gentle question", () => {
    const response = buildCoachingFallbackResponse(
      "I have fifteen things I could work on today and every one of them feels important.",
    );
    expect(response).toContain(COACHING_FALLBACK_LEAD);
    expect(response).toMatch(/one of those today/i);
  });

  it("detects empty or filtered model output", () => {
    expect(isCoachingFallbackNeeded("", "stop")).toBe(true);
    expect(isCoachingFallbackNeeded("Hello", "content_filter")).toBe(true);
    expect(isCoachingFallbackNeeded("Hello", "stop")).toBe(false);
  });
});
