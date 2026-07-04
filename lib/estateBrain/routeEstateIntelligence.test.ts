import { describe, expect, it } from "vitest";
import { detectResearchLevel } from "./researchRouting";
import {
  resolveEstateIntelligenceRoute,
  resolveImmediateResearchOpen,
} from "./routeEstateIntelligence";

describe("Estate Intelligence routing", () => {
  it("routes write email to Create + Copywriter", () => {
    const route = resolveEstateIntelligenceRoute("I need to write an email");
    expect(route?.category).toBe("create");
    expect(route?.capabilityId).toBe("create.email");
    expect(route?.experienceId).toBe("create");
    expect(route?.expertNames).toContain("Copywriter");
    expect(route?.immediateNavigate).toBe(true);
  });

  it("routes newest AI tools to Research level 2 + Study Hall", () => {
    const route = resolveEstateIntelligenceRoute(
      "Research the newest AI tools",
    );
    expect(route?.category).toBe("research");
    expect(route?.researchLevel).toBe(2);
    expect(route?.experienceId).toBe("think");
    expect(route?.spaceId).toBe("study-hall");
    expect(route?.expertNames).toContain("Research Analyst");

    const payload = resolveImmediateResearchOpen("Research the newest AI tools");
    expect(payload?.estatePlaceId).toBe("study-hall");
    expect(payload?.section).toBe("momentum-institute");
  });

  it("routes build my business to Business + multiple experts", () => {
    const route = resolveEstateIntelligenceRoute("Help me build my business");
    expect(route?.category).toBe("business");
    expect(route?.expertIds.length).toBeGreaterThanOrEqual(2);
    expect(["business", "momentum"]).toContain(route?.experienceId);
  });

  it("routes focus request to Focus experience", () => {
    const route = resolveEstateIntelligenceRoute("I need to focus");
    expect(route?.category).toBe("focus");
    expect(route?.experienceId).toBe("focus");
    expect(route?.expertNames.some((n) => /ADHD|Productivity/i.test(n))).toBe(
      true,
    );
  });

  it("keeps explain SWOT in conversation (research level 1)", () => {
    expect(detectResearchLevel("Explain SWOT")).toBe(1);
    const route = resolveEstateIntelligenceRoute("Explain SWOT analysis");
    expect(route?.answerInConversation).toBe(true);
    expect(route?.immediateNavigate).toBe(false);
    expect(resolveImmediateResearchOpen("Explain SWOT")).toBeNull();
  });

  it("detects deep research level 3", () => {
    expect(
      detectResearchLevel("Compare five CRM systems for my business"),
    ).toBe(3);
  });
});
