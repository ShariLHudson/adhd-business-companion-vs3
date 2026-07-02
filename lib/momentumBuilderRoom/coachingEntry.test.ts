import { describe, expect, it } from "vitest";
import {
  MOMENTUM_BUILDER_ARRIVAL_GLAD,
  MOMENTUM_BUILDER_ARRIVAL_LEAD,
  MOMENTUM_BUILDER_OPENING_QUESTIONS,
  resolveMomentumBuilderArrival,
} from "./coachingEntry";

describe("resolveMomentumBuilderArrival", () => {
  it("never defines momentum builder — coaching only", () => {
    const arrival = resolveMomentumBuilderArrival(new Date("2026-06-29T10:00:00"));
    expect(arrival.glad).toBe(MOMENTUM_BUILDER_ARRIVAL_GLAD);
    expect(arrival.lead).toBe(MOMENTUM_BUILDER_ARRIVAL_LEAD);
    expect(MOMENTUM_BUILDER_OPENING_QUESTIONS).toContain(arrival.question);
    expect(arrival.glad.toLowerCase()).not.toContain("momentum builder");
    expect(arrival.lead.toLowerCase()).not.toContain("momentum builder is");
    expect(arrival.question.toLowerCase()).not.toContain("learn about");
  });
});
