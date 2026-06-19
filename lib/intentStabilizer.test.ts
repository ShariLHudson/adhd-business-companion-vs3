import { describe, expect, it } from "vitest";
import {
  MAKE_CONFIDENCE_THRESHOLD,
  buildCreateRouteMessage,
  resolveIntent,
} from "./intentStabilizer";

describe("resolveIntent — create routing", () => {
  it("routes 'I need a 5 day marketing plan' to make with Marketing Plan type", () => {
    const r = resolveIntent("I need a 5 day marketing plan");
    expect(r.action).toBe("make");
    expect(r.type).toBe("Marketing Plan");
    expect(r.topic).toMatch(/5 day marketing plan/i);
    expect(r.confidence).toBeGreaterThanOrEqual(MAKE_CONFIDENCE_THRESHOLD);
  });

  it("routes 'create a marketing plan' to make", () => {
    const r = resolveIntent("create a marketing plan");
    expect(r.action).toBe("make");
    expect(r.type).toBe("Marketing Plan");
  });

  it("routes 'I need a proposal' to make with Proposal type", () => {
    const r = resolveIntent("I need a proposal");
    expect(r.action).toBe("make");
    expect(r.type).toBe("Proposal");
  });

  it("routes 'write an email' to make with Email type", () => {
    const r = resolveIntent("write an email");
    expect(r.action).toBe("make");
    expect(r.type).toBe("Email");
  });

  it("routes 'make a sales page' to make with Sales Page type", () => {
    const r = resolveIntent("make a sales page");
    expect(r.action).toBe("make");
    expect(r.type).toBe("Sales Page");
    expect(r.topic).toMatch(/sales page/i);
  });

  it("routes 'draft a funnel' to make", () => {
    const r = resolveIntent("draft a funnel");
    expect(r.action).toBe("make");
    expect(r.type).toBe("Sales Funnel");
  });

  it("stays in chat for how-to questions", () => {
    const r = resolveIntent("how do I write a marketing plan", {
      askingHow: true,
    });
    expect(r.action).toBe("chat");
  });
});

describe("buildCreateRouteMessage", () => {
  it("uses topic in the open message", () => {
    const msg = buildCreateRouteMessage({
      action: "make",
      type: "Marketing Plan",
      topic: "5 day marketing plan",
      confidence: 0.9,
      rawText: "I need a 5 day marketing plan",
      reason: "test",
      multiIntent: false,
      vague: false,
    });
    expect(msg).toContain("Create");
    expect(msg).not.toMatch(/\bMake\b/);
    expect(msg).toContain("5 day marketing plan");
  });
});
