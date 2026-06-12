import { describe, expect, it } from "vitest";
import { routeAdvisors } from "./advisorRouter";
import { deliberate } from "./boardReasoningEngine";
import { buildAdvisorMemory, type DeliberationRecord } from "./advisorMemory";
import { buildBoardSummary } from "./advisorDashboardSelectors";
import { ADVISOR_SCENARIOS } from "./fixtures/advisorScenarios";
import { getFounderIntelligence } from "../intelligence/founderIntelligenceEngine";
import {
  HISTORY_FOUNDER_ID,
  sampleFounderHistory,
} from "../intelligence/fixtures/founderHistory";

const intel = getFounderIntelligence(
  sampleFounderHistory(),
  HISTORY_FOUNDER_ID,
);
const DIAGNOSIS = /\b(depress|anxiety disorder|bipolar|adhd diagnos|disorder|mental illness)\b/i;

describe("advisorRouter", () => {
  for (const s of ADVISOR_SCENARIOS) {
    it(`routes "${s.message}" → ${s.primary}`, () => {
      const r = routeAdvisors(s.message, intel);
      expect(r.primary).toBe(s.primary);
      if (s.secondaryIncludes) {
        expect(r.secondary).toContain(s.secondaryIncludes);
      }
    });
  }
});

describe("board deliberation", () => {
  it("returns ONE unified response combining advisors", () => {
    const res = deliberate("I need more clients", intel);
    expect(typeof res.message).toBe("string");
    expect(res.message.length).toBeGreaterThan(0);
    expect(res.primaryAdvisor).toBe("sales");
    // More than one advisor contributed (better than a single advisor alone).
    expect(res.perspectives.length).toBeGreaterThanOrEqual(2);
    expect(res.secondaryAdvisors.length).toBeGreaterThanOrEqual(1);
  });

  it("resolves conflict toward pacing when capacity is low (overwhelm in intel)", () => {
    // The sample history contains repeated overwhelm → capacity low.
    const res = deliberate("I don't know what to work on", intel);
    expect(/small|one focused block|don't have to/i.test(res.message)).toBe(true);
  });

  it("never uses diagnostic language in any perspective or the response", () => {
    for (const s of ADVISOR_SCENARIOS) {
      const res = deliberate(s.message, intel);
      expect(DIAGNOSIS.test(res.message)).toBe(false);
      for (const p of res.perspectives) {
        expect(DIAGNOSIS.test(p.observation + " " + p.recommendation)).toBe(false);
      }
    }
  });

  it("keeps the wellness advisor to workload/energy/capacity only", () => {
    const res = deliberate("I'm exhausted and running on empty", intel);
    const w = res.perspectives.find((p) => p.advisor === "wellness");
    expect(w).toBeTruthy();
    expect(/capacity|smaller|block|energy/i.test(w!.recommendation)).toBe(true);
  });
});

describe("advisor memory", () => {
  it("learns most-used advisors and pairings from past deliberations", () => {
    const records: DeliberationRecord[] = ADVISOR_SCENARIOS.map((s, i) => ({
      id: `d${i}`,
      ts: new Date().toISOString(),
      message: s.message,
      response: deliberate(s.message, intel),
      helpful: i % 2 === 0,
    }));
    const mem = buildAdvisorMemory(records);
    expect(mem.mostUsedAdvisors.length).toBeGreaterThan(0);
    expect(mem.commonPairings.length).toBeGreaterThan(0);
    expect(mem.commonChallenges.length).toBeGreaterThan(0);
  });
});

describe("board summary", () => {
  it("assembles the Founder Board summary from intelligence", () => {
    const summary = buildBoardSummary(intel);
    expect(summary.topRisks.length).toBeGreaterThan(0);
    expect(summary.recommendedNextActions.length).toBeGreaterThan(0);
    expect(Object.keys(summary).sort()).toEqual(
      [
        "currentRecommendations",
        "mostActiveAdvisor",
        "recommendedNextActions",
        "topOpportunities",
        "topRisks",
      ].sort(),
    );
  });
});
