import { describe, expect, it } from "vitest";

import {
  generateLiveContentOpportunities,
  opportunitiesAreSignalOnly,
  toPostCraftLiveExport,
} from "./liveContentOpportunityGenerator";
import type { EcosystemSignalCount } from "./serverSignalStore";

const NOW = new Date("2026-06-12T12:00:00.000Z");

function counts(
  rows: Array<{ kind: EcosystemSignalCount["kind"]; category: string; count: number }>,
): EcosystemSignalCount[] {
  return rows.map((r) => ({
    kind: r.kind,
    category: r.category,
    count: r.count,
    lastSeen: NOW.toISOString(),
  }));
}

describe("generateLiveContentOpportunities", () => {
  it("creates overwhelm-related content ideas when overwhelm signals are high", () => {
    const opportunities = generateLiveContentOpportunities({
      counts: counts([
        { kind: "struggle", category: "overwhelm", count: 80 },
        { kind: "question", category: "im_overwhelmed", count: 40 },
        { kind: "emotion", category: "frustrated", count: 20 },
      ]),
      now: NOW,
    });

    const overwhelm = opportunities.find((o) => o.topicKey === "overwhelm");
    expect(overwhelm).toBeDefined();
    expect(overwhelm!.frequency).toBe(140);
    expect(overwhelm!.suggestedAssets.some((a) => a.type === "blog")).toBe(true);
    expect(
      overwhelm!.suggestedAssets.some((a) =>
        /overwhelm|urgent/i.test(a.title + a.angle),
      ),
    ).toBe(true);
    expect(overwhelm!.whyThisMatters.length).toBeGreaterThan(20);
  });

  it("creates prioritization-related content ideas when prioritization signals are high", () => {
    const opportunities = generateLiveContentOpportunities({
      counts: counts([
        { kind: "struggle", category: "prioritization", count: 55 },
        { kind: "question", category: "help_me_prioritize", count: 30 },
        { kind: "question", category: "what_should_i_work_on", count: 25 },
      ]),
      now: NOW,
    });

    const prioritization = opportunities.find((o) => o.topicKey === "prioritization");
    expect(prioritization).toBeDefined();
    expect(
      prioritization!.suggestedAssets.some((a) => a.type === "lead_magnet"),
    ).toBe(true);
    expect(
      prioritization!.suggestedAssets.some((a) =>
        /priority|work on|matters first/i.test(a.title + a.angle),
      ),
    ).toBe(true);
  });

  it("ranks opportunities by score and frequency", () => {
    const opportunities = generateLiveContentOpportunities({
      counts: counts([
        { kind: "struggle", category: "overwhelm", count: 100 },
        { kind: "struggle", category: "prioritization", count: 40 },
      ]),
      now: NOW,
    });

    expect(opportunities.length).toBeGreaterThan(1);
    for (let i = 1; i < opportunities.length; i++) {
      expect(opportunities[i - 1].opportunityScore).toBeGreaterThanOrEqual(
        opportunities[i].opportunityScore,
      );
    }
    expect(opportunities[0].topicKey).toBe("overwhelm");
  });

  it("exports PostCraft payload without conversation text", () => {
    const opportunities = generateLiveContentOpportunities({
      counts: counts([{ kind: "struggle", category: "focus", count: 12 }]),
      now: NOW,
    });
    const payload = toPostCraftLiveExport(opportunities, NOW);

    expect(payload.opportunities.length).toBeGreaterThan(0);
    expect(payload.opportunities[0].assets[0].title).toBeTruthy();
    expect(opportunitiesAreSignalOnly(opportunities)).toBe(true);
    expect(JSON.stringify(payload)).not.toMatch(/conversation|transcript|"message"/i);
  });
});
