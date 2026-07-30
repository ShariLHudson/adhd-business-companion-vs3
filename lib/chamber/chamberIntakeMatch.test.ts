/**
 * Phase 1A — conversational Chamber intake matching.
 * Deterministic topic + need matching (no AI): composes the canonical
 * alias resolver and the existing perspective recommender. Never returns more
 * than three members, and never falls back to showing all 24.
 */
import { describe, expect, it } from "vitest";

import {
  CHAMBER_INTAKE_FOLLOW_UP,
  matchChamberIntake,
} from "./chamberIntakeMatch";
import {
  CHAMBER_MEMBERS,
  CHAMBER_MEMBER_IDS,
} from "./chamberMemberRegistry";

describe("matchChamberIntake — topic + need matching", () => {
  it("a direct topic match returns exactly one primary member", () => {
    const r = matchChamberIntake("my marketing is not working");
    expect(r.kind).toBe("recommendations");
    if (r.kind !== "recommendations") return;
    expect(r.primary.member.id).toBe("marketing");
    expect(r.additional).toHaveLength(0);
  });

  it("a broad cross-specialty request returns two or three recommendations", () => {
    const r = matchChamberIntake(
      "I need help understanding how several advertisements work together",
    );
    expect(r.kind).toBe("recommendations");
    if (r.kind !== "recommendations") return;
    const total = 1 + r.additional.length;
    expect(total).toBeGreaterThanOrEqual(2);
    expect(total).toBeLessThanOrEqual(3);
    expect(r.primary.member.id).toBe("marketing");
  });

  it("an ambiguous need ('more clients') returns multiple perspectives", () => {
    const r = matchChamberIntake("I need more clients");
    expect(r.kind).toBe("recommendations");
    if (r.kind !== "recommendations") return;
    expect(1 + r.additional.length).toBeGreaterThanOrEqual(2);
    expect(r.basis).toBe("cross-specialty");
  });

  it("normal matching never returns more than three members", () => {
    const queries = [
      "my marketing is not working",
      "I need help understanding how several advertisements work together",
      "I need more clients",
      "help me decide whether to launch now",
      "I want to improve a process",
      "I feel stuck and overwhelmed",
      "I have too many ideas and do not know where to start",
    ];
    for (const q of queries) {
      const r = matchChamberIntake(q);
      if (r.kind === "recommendations") {
        expect(1 + r.additional.length).toBeLessThanOrEqual(3);
      }
    }
  });

  it("every recommendation includes a non-empty reason", () => {
    const r = matchChamberIntake(
      "I need help understanding how several advertisements work together",
    );
    if (r.kind !== "recommendations") throw new Error("expected recommendations");
    for (const rec of [r.primary, ...r.additional]) {
      expect(rec.whyFits.trim().length).toBeGreaterThan(0);
    }
  });

  it("a low-confidence request returns one gentle follow-up question", () => {
    const r = matchChamberIntake("I do not know what to do next");
    expect(r.kind).toBe("follow_up");
    if (r.kind !== "follow_up") return;
    expect(r.question).toBe(CHAMBER_INTAKE_FOLLOW_UP);
  });

  it("empty input returns a follow-up (never all members)", () => {
    expect(matchChamberIntake("   ").kind).toBe("follow_up");
  });

  it("a follow-up answer produces recommendations", () => {
    for (const answer of [
      "choosing between options",
      "making a plan",
      "getting started",
    ]) {
      expect(matchChamberIntake(answer).kind).toBe("recommendations");
    }
  });

  it("only canonical registry members are returned (no duplicate registry)", () => {
    const idSet = new Set<string>(CHAMBER_MEMBER_IDS);
    const r = matchChamberIntake(
      "I need help understanding how several advertisements work together",
    );
    if (r.kind !== "recommendations") throw new Error("expected recommendations");
    for (const rec of [r.primary, ...r.additional]) {
      expect(idSet.has(rec.member.id)).toBe(true);
    }
    // The canonical roster is still exactly 24 members.
    expect(CHAMBER_MEMBERS).toHaveLength(24);
  });
});
