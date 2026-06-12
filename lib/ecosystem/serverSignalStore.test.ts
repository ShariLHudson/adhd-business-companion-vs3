import { describe, expect, it, beforeEach } from "vitest";

import {
  ecosystemCountsToContentOpportunities,
  ecosystemCountsToProductSignals,
} from "./ecosystemDashboardSignals";
import {
  incrementEcosystemSignals,
  loadEcosystemSignalCounts,
  resetMemorySignalStore,
  sanitizeSignalIncrements,
} from "./serverSignalStore";

describe("serverSignalStore", () => {
  beforeEach(() => {
    resetMemorySignalStore();
  });

  it("rejects invalid signal categories", () => {
    expect(
      sanitizeSignalIncrements([
        { kind: "struggle", category: "overwhelm" },
        { kind: "struggle", category: "not_a_real_category" },
        { kind: "question", category: "help_me_prioritize" },
      ]),
    ).toHaveLength(2);
  });

  it("increments and loads memory-backed counts", async () => {
    await incrementEcosystemSignals([
      { kind: "struggle", category: "overwhelm" },
      { kind: "struggle", category: "overwhelm" },
      { kind: "question", category: "im_overwhelmed" },
    ]);

    const counts = await loadEcosystemSignalCounts();
    const overwhelm = counts.find((c) => c.category === "overwhelm");
    expect(overwhelm?.count).toBe(2);
  });
});

describe("ecosystemDashboardSignals", () => {
  it("maps counts to product signals and content opportunities", () => {
    const counts = [
      {
        kind: "struggle" as const,
        category: "overwhelm",
        count: 120,
        lastSeen: "2026-06-12T12:00:00.000Z",
      },
      {
        kind: "question" as const,
        category: "im_overwhelmed",
        count: 45,
        lastSeen: "2026-06-12T12:00:00.000Z",
      },
    ];

    const product = ecosystemCountsToProductSignals(counts);
    expect(product[0].label).toBe("Overwhelm");
    expect(product[0].count).toBe(120);

    const content = ecosystemCountsToContentOpportunities(counts);
    expect(content.length).toBeGreaterThan(0);
    expect(content[0].opportunityScore).toBeGreaterThan(0);
    expect(content[0].assetIdeas?.length).toBeGreaterThan(0);
    expect(content[0].whyThisMatters).toBeTruthy();
  });
});
