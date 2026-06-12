import { describe, expect, it } from "vitest";
import { detectPatterns } from "./patternDetection";
import { detectRisks } from "./riskEngine";
import { detectWins } from "./winEngine";
import { detectOpportunities } from "./opportunityEngine";
import { generateInsights } from "./insightEngine";
import { buildFounderMemory } from "./memory";
import {
  getFounderIntelligence,
  selectCurrentRisks,
  selectFounderPatterns,
  selectRecommendedNextActions,
} from "./founderIntelligenceEngine";
import {
  HISTORY_FOUNDER_ID,
  sampleFounderHistory,
} from "./fixtures/founderHistory";

const events = sampleFounderHistory();
const types = (arr: { type: string }[]) => arr.map((x) => x.type);

// Guard: business/productivity only — never diagnostic language.
const DIAGNOSIS = /\b(depress|anxiety disorder|bipolar|adhd diagnos|disorder|mental illness|you are (depressed|anxious|broken))\b/i;

describe("pattern engine", () => {
  const patterns = detectPatterns(events);
  it("detects the recurring behaviors in the history", () => {
    const t = types(patterns);
    expect(t).toContain("unfinished-tasks");
    expect(t).toContain("focus-abandonment");
    expect(t).toContain("timeblock-cancellations");
    expect(t).toContain("low-energy-checkins");
    expect(t).toContain("procrastination-language");
  });
  it("every pattern is explainable and time-bounded", () => {
    for (const p of patterns) {
      expect(p.sourceEventIds.length).toBeGreaterThan(0);
      expect(p.frequency).toBeGreaterThanOrEqual(2);
      expect(new Date(p.firstSeen) <= new Date(p.lastSeen)).toBe(true);
    }
  });
});

describe("risk engine", () => {
  const risks = detectRisks(events);
  it("flags the sales gap and repeated overwhelm", () => {
    const t = types(risks);
    expect(t).toContain("no-sales-activity");
    expect(t).toContain("repeated-overwhelm");
  });
  it("each risk carries a suggested action + evidence", () => {
    for (const r of risks) {
      expect(r.suggestedAction.length).toBeGreaterThan(0);
      expect(r.detectedAt).toBeTruthy();
    }
  });
});

describe("win engine", () => {
  it("captures completions as wins", () => {
    const wins = detectWins(events);
    expect(wins.length).toBeGreaterThan(0);
    expect(types(wins)).toContain("task-completed");
    expect(types(wins)).toContain("document-finished");
  });
});

describe("opportunity engine", () => {
  it("tracks captured ideas with source + status", () => {
    const opps = detectOpportunities(events);
    expect(opps.length).toBe(2);
    expect(opps[0]!.status).toBe("idea");
    expect(opps.some((o) => o.source === "clear-my-mind")).toBe(true);
  });
});

describe("insight engine", () => {
  it("produces plain-English business observations", () => {
    const insights = generateInsights(events, detectPatterns(events));
    expect(insights.length).toBeGreaterThan(0);
    for (const i of insights) expect(DIAGNOSIS.test(i.text)).toBe(false);
  });
});

describe("founder memory", () => {
  it("remembers frequently touched projects and struggles", () => {
    const mem = buildFounderMemory(events);
    expect(mem.frequentProjects.length).toBeGreaterThan(0);
    expect(mem.frequentStruggles.length).toBeGreaterThan(0);
  });
});

describe("getFounderIntelligence composer", () => {
  const intel = getFounderIntelligence(events, HISTORY_FOUNDER_ID);

  it("returns all intelligence sections", () => {
    expect(Object.keys(intel).sort()).toEqual(
      [
        "insights",
        "memory",
        "opportunities",
        "patterns",
        "recommendations",
        "risks",
        "wins",
      ].sort(),
    );
  });

  it("recommends scheduling time for the repeatedly-mentioned funnel", () => {
    const recs = intel.recommendations;
    expect(recs.some((r) => /funnel/i.test(r.text))).toBe(true);
    // Every recommendation must be explainable + traceable.
    for (const r of recs) {
      expect(r.reason.length).toBeGreaterThan(0);
      expect(r.sourceEventIds.length).toBeGreaterThan(0);
      expect(DIAGNOSIS.test(r.text)).toBe(false);
    }
  });

  it("selectors return ordered slices", () => {
    expect(selectCurrentRisks(intel).length).toBeGreaterThan(0);
    expect(selectFounderPatterns(intel).length).toBeGreaterThan(0);
    expect(selectRecommendedNextActions(intel, 3).length).toBeLessThanOrEqual(3);
  });

  it("scopes to the founder id (empty for an unknown founder)", () => {
    const empty = getFounderIntelligence(events, "nobody");
    expect(empty.patterns).toEqual([]);
    expect(empty.wins).toEqual([]);
  });
});
