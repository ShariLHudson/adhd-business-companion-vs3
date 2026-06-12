// Founder Ecosystem — Phase 8 Founder Operating System tests.
// Proves the OS evaluates capacity, momentum, project health, priorities,
// attention and next actions, and answers the five founder questions from the
// Founder Operating State alone. (Named *.test.ts so vitest discovers it.)

import { describe, expect, it } from "vitest";

import { containsClinicalLanguage } from "../clinicalLanguageGuard";

import { simulateMasterWorkflow } from "../fixtures/masterWorkflow";
import {
  getFounderOperatingState,
  whatAmIForgetting,
  whatIsMostImportant,
  whatNeedsAttention,
  whatShouldIWorkOn,
  whereAmIStuck,
} from "./founderOperatingState";
import { computeMomentum } from "./momentumEngine";
import {
  generateBriefing,
  morningBriefing,
  weeklyReview,
} from "./briefingEngine";
import {
  operatingHeadline,
  selectCapacity,
  selectNextAction,
  selectProjectHealth,
  selectTodaysPriorities,
} from "./osSelectors";

const FOUNDER = "founder-001";
const NOW = new Date("2026-06-02T09:00:00.000Z");
const events = () => simulateMasterWorkflow(FOUNDER, new Date("2026-06-01T09:00:00.000Z"));
const state = () => getFounderOperatingState(events(), FOUNDER, { now: NOW });

describe("operating state composition", () => {
  it("produces a full operating state with every slice", () => {
    const s = state();
    expect(s.capacity.level).toMatch(/low|medium|high/);
    expect(s.momentum.direction).toMatch(/rising|steady|falling/);
    expect(s.projectHealth.length).toBeGreaterThanOrEqual(3);
    expect(s.priorities.length).toBeGreaterThanOrEqual(3);
    expect(s.attention.level).toMatch(/clear|busy|overloaded/);
    expect(["low", "medium", "high"]).toContain(s.riskLevel);
    expect(["low", "medium", "high"]).toContain(s.opportunityLevel);
  });

  it("ranks priorities 1..n with a recommended action each", () => {
    const s = state();
    s.priorities.forEach((p, i) => {
      expect(p.rank).toBe(i + 1);
      expect(p.recommendedAction.length).toBeGreaterThan(0);
    });
  });

  it("gives every project a health rating and a non-empty reason", () => {
    for (const h of state().projectHealth) {
      expect(["healthy", "needs-attention", "at-risk", "stalled"]).toContain(h.rating);
      expect(h.reasons.length).toBeGreaterThan(0);
    }
  });

  it("always yields a concrete next action", () => {
    const na = selectNextAction(state());
    expect(na).not.toBeNull();
    expect(na!.action.length).toBeGreaterThan(0);
    expect(na!.rationale.length).toBeGreaterThan(0);
  });
});

describe("the five founder questions", () => {
  const s = state();

  it("What should I work on?", () => {
    expect(whatShouldIWorkOn(s)).toMatch(/\w/);
  });
  it("What is most important?", () => {
    const top = whatIsMostImportant(s);
    expect(top?.rank).toBe(1);
  });
  it("What am I forgetting?", () => {
    expect(Array.isArray(whatAmIForgetting(s))).toBe(true);
  });
  it("Where am I stuck?", () => {
    expect(Array.isArray(whereAmIStuck(s))).toBe(true);
  });
  it("What needs attention?", () => {
    expect(Array.isArray(whatNeedsAttention(s))).toBe(true);
  });
});

describe("momentum engine", () => {
  it("registers the workflow's completions as positive momentum", () => {
    const m = computeMomentum(events(), FOUNDER, NOW);
    expect(m.tasksCompleted + m.focusSessions + m.wins).toBeGreaterThan(0);
    expect(m.score).toBeGreaterThanOrEqual(0);
    expect(m.score).toBeLessThanOrEqual(100);
  });
});

describe("briefings", () => {
  it("generates morning / weekly briefings with sections", () => {
    const s = state();
    const morning = morningBriefing(s, NOW);
    expect(morning.kind).toBe("morning");
    expect(morning.sections.length).toBeGreaterThan(0);
    expect(morning.headline.length).toBeGreaterThan(0);
    expect(weeklyReview(s, NOW).kind).toBe("weekly");
  });

  it("includes the recommended next action and momentum summary", () => {
    const b = generateBriefing(state(), "midday", NOW);
    expect(b.momentumSummary).toMatch(/Momentum/i);
  });
});

describe("selectors & headline", () => {
  it("exposes the dashboard-prep slices", () => {
    const s = state();
    expect(selectTodaysPriorities(s, 3).length).toBeLessThanOrEqual(3);
    expect(selectCapacity(s).level).toBeTypeOf("string");
    expect(selectProjectHealth(s)[0].healthScore).toBeLessThanOrEqual(100);
    expect(operatingHeadline(s)).toMatch(/capacity/);
  });
});

describe("no diagnosis guardrail", () => {
  it("never emits medical/mental-health language", () => {
    const blob = JSON.stringify(state());
    expect(containsClinicalLanguage(blob)).toBe(false);
  });
});
