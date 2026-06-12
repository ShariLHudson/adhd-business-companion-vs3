import { describe, expect, it } from "vitest";

import type { FounderEvent } from "@/lib/ecosystem/events";

import {
  buildProductIntelligenceReport,
  classifyProductCategory,
  extractProductSignals,
} from "./productIntelligenceEngine";

const FOUNDER = "founder-001";

function evt(
  partial: Omit<FounderEvent, "founderId"> & { founderId?: string },
): FounderEvent {
  return { founderId: FOUNDER, ...partial };
}

describe("productIntelligenceEngine", () => {
  it("classifies signals into product categories", () => {
    expect(classifyProductCategory("Create opens old content")).toBe("create");
    expect(classifyProductCategory("Where did my document go?")).toBe(
      "google_docs",
    );
    expect(classifyProductCategory("Time Block not saving project")).toBe(
      "time_block",
    );
    expect(classifyProductCategory("Need calendar integration please")).toBe(
      "integrations",
    );
  });

  it("extracts friction and feature requests from events", () => {
    const events: FounderEvent[] = [
      evt({
        id: "e1",
        type: "painpoint.observed",
        ts: "2026-06-01T10:00:00.000Z",
        data: { text: "Create opens old content" },
      }),
      evt({
        id: "e2",
        type: "painpoint.observed",
        ts: "2026-06-02T10:00:00.000Z",
        data: { text: "Create opens old content again" },
      }),
      evt({
        id: "e3",
        type: "chat.coaching",
        ts: "2026-06-03T10:00:00.000Z",
        userMessage: "I wish we had calendar integration",
      }),
      evt({
        id: "e4",
        type: "focus.completed",
        ts: "2026-06-03T11:00:00.000Z",
        data: { actualMinutes: 25 },
      }),
    ];

    const signals = extractProductSignals(events, FOUNDER);
    expect(signals.some((s) => s.type === "friction" && s.category === "create")).toBe(
      true,
    );
    expect(signals.some((s) => s.type === "feature_request")).toBe(true);
    expect(signals.some((s) => s.type === "success")).toBe(true);
  });

  it("ranks top frustrations and identifies quick wins", () => {
    const events: FounderEvent[] = [
      evt({
        id: "a1",
        type: "painpoint.observed",
        ts: "2026-06-01T10:00:00.000Z",
        data: { text: "Where did my document go?" },
      }),
      evt({
        id: "a2",
        type: "painpoint.observed",
        ts: "2026-06-02T10:00:00.000Z",
        data: { text: "Where did my document go? still confused" },
      }),
      evt({
        id: "a3",
        type: "painpoint.observed",
        ts: "2026-06-03T10:00:00.000Z",
        data: { text: "Time Block confusion saving project" },
      }),
      evt({
        id: "a4",
        type: "chat.coaching",
        ts: "2026-06-04T10:00:00.000Z",
        userMessage: "Can you add a mobile app please?",
      }),
    ];

    const report = buildProductIntelligenceReport(
      events,
      FOUNDER,
      new Date("2026-06-09T12:00:00.000Z"),
    );

    expect(report.topFrustrations.length).toBeGreaterThan(0);
    expect(report.topFrustrations[0]?.category).toBeDefined();
    expect(report.mostRequestedFeatures.length).toBeGreaterThan(0);
    expect(report.weeklyReview.summary.length).toBeGreaterThan(10);
    expect(report.opportunities.some((o) => o.category === "google_docs")).toBe(
      true,
    );
  });
});
