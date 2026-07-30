/**
 * Chamber intake matching — three distinct credible members or one follow-up.
 * Registry-driven coverage across the need areas; distinct, member-specific
 * reasons; never more than three; never all 24.
 */
import { describe, expect, it } from "vitest";

import {
  CHAMBER_INTAKE_FOLLOW_UP,
  matchChamberIntake,
} from "./chamberIntakeMatch";
import { CHAMBER_MEMBER_IDS } from "./chamberMemberRegistry";

function recs(text: string) {
  const r = matchChamberIntake(text);
  if (r.kind !== "recommendations") throw new Error(`expected recs for "${text}"`);
  return [r.primary, ...r.additional];
}
function ids(text: string) {
  return recs(text).map((rec) => rec.member.id);
}

describe("three distinct recommendations", () => {
  it("a clear need returns exactly three members", () => {
    expect(recs("my marketing is not working")).toHaveLength(3);
  });

  it("the three members are distinct", () => {
    const memberIds = ids("I need help with my finances and pricing");
    expect(new Set(memberIds).size).toBe(memberIds.length);
  });

  it("the three reasons are materially different and member-specific", () => {
    const list = recs("help me decide between two directions");
    const whys = list.map((r) => r.whyFits);
    expect(new Set(whys).size).toBe(3);
    expect(whys[0]).toMatch(/best starting point/i);
    for (const r of list) expect(r.whyFits).toContain(r.member.displayName);
  });

  it("never returns more than three across many needs", () => {
    for (const t of [
      "my marketing is not working",
      "I need to hire someone",
      "I'm burned out",
      "what are my blind spots",
      "I need a budget",
      "help me plan a launch",
      "I want to grow the business",
    ]) {
      const r = matchChamberIntake(t);
      if (r.kind === "recommendations") {
        expect(1 + r.additional.length).toBeLessThanOrEqual(3);
      }
    }
  });
});

describe("need coverage across the areas", () => {
  const cases: [string, string][] = [
    ["I can't decide between two options", "strategy"],
    ["help me plan and sequence the launch", "project-management"],
    ["my marketing and sales aren't working", "marketing"],
    ["I need to improve a broken process", "systems"],
    ["I need help with pricing and cash flow", "finance"],
    ["I need more customers and clients", "client-relationships"],
    ["I need to hire and build my team", "people-culture"],
    ["should I use AI and automation", "ai-technology"],
    ["I want to stay true to my values", "client-relationships"],
    ["I'm burned out and running on empty", "wellness"],
    ["I feel stuck and can't get started", "momentum"],
    ["I want a strategy to grow and scale", "strategy"],
    ["what assumptions am I missing", "research"],
  ];
  it.each(cases)("'%s' → leads with %s", (text, expectedPrimary) => {
    expect(ids(text)[0]).toBe(expectedPrimary);
  });

  it("surfaces members the old perspective buckets never reached", () => {
    const reachable = (id: string, text: string) => ids(text).includes(id);
    expect(reachable("finance", "I need help with my budget")).toBe(true);
    expect(reachable("ai-technology", "which AI tools should I use")).toBe(true);
    expect(reachable("data-analytics", "what metrics should I track")).toBe(true);
    expect(reachable("events", "I want to plan a retreat")).toBe(true);
    expect(reachable("innovations", "I have a new product idea")).toBe(true);
    expect(reachable("presentations", "help me build a pitch deck")).toBe(true);
    expect(reachable("learning", "I need to learn a new skill")).toBe(true);
    expect(reachable("networking", "I need to make more connections")).toBe(true);
    expect(reachable("partnerships", "I'm exploring a collaboration")).toBe(true);
    expect(reachable("people-culture", "I need to hire someone")).toBe(true);
    expect(reachable("creative-studio", "I need creative direction")).toBe(true);
    expect(reachable("horizons", "what's next long-term for my business")).toBe(true);
    expect(reachable("client-relationships", "I need more clients")).toBe(true);
  });
});

describe("follow-up instead of weak matches", () => {
  it("an unrecognizable request returns one follow-up question", () => {
    const r = matchChamberIntake("asdf qwerty zzz");
    expect(r.kind).toBe("follow_up");
    if (r.kind !== "follow_up") return;
    expect(r.question).toBe(CHAMBER_INTAKE_FOLLOW_UP);
  });

  it("empty input returns a follow-up (never all 24)", () => {
    expect(matchChamberIntake("   ").kind).toBe("follow_up");
  });
});

describe("registry is the source of truth", () => {
  it("only canonical registry ids are returned; roster is still 24", () => {
    const idSet = new Set<string>(CHAMBER_MEMBER_IDS);
    for (const id of ids("I need help understanding how my advertisements work together")) {
      expect(idSet.has(id)).toBe(true);
    }
    expect(CHAMBER_MEMBER_IDS).toHaveLength(24);
  });
});
