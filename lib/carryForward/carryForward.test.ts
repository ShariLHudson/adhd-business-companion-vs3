import { describe, expect, it, beforeEach } from "vitest";
import { clearCarryForwardStoreForTests } from "./dayVisit";
import {
  CARRY_FORWARD_CATALOG,
  evaluateCarryForward,
  formatCarryForwardGreeting,
  inferYesterdayCloseTone,
  isValidCarryForwardLine,
  violatesCarryForwardLine,
} from "./index";
import { violatesVagueCarryForward } from "@/lib/relationshipIntelligence";

describe("Carry Forward", () => {
  beforeEach(() => {
    clearCarryForwardStoreForTests();
  });

  it("catalog has varied greetings for each yesterday tone", () => {
    expect(CARRY_FORWARD_CATALOG.length).toBeGreaterThanOrEqual(36);
    const tones = new Set(CARRY_FORWARD_CATALOG.map((e) => e.tone));
    expect(tones.has("ended_well")).toBe(true);
    expect(tones.has("ended_overwhelmed")).toBe(true);
    expect(tones.has("morning_universal")).toBe(true);
  });

  it("every greeting line passes constitutional rules", () => {
    for (const entry of CARRY_FORWARD_CATALOG) {
      expect(isValidCarryForwardLine(entry.line), entry.id).toBe(true);
      if (entry.followUp) {
        expect(isValidCarryForwardLine(entry.followUp), `${entry.id} followUp`).toBe(true);
      }
    }
  });

  it("forbids vague emotional carry-forward", () => {
    expect(violatesVagueCarryForward("Still carrying a similar feeling?")).toBe(true);
    expect(isValidCarryForwardLine("Still carrying a similar feeling?")).toBe(false);
    expect(isValidCarryForwardLine("Good morning. I'm glad you're here.")).toBe(true);
  });

  it("activates on first visit of the day", () => {
    const verdict = evaluateCarryForward({
      isFirstVisitOfDay: true,
      sessionVisitIndex: 3,
    });
    expect(verdict.active).toBe(true);
    expect(verdict.greeting).toBeTruthy();
    expect(formatCarryForwardGreeting(verdict)).toContain(verdict.greeting!);
  });

  it("replays the same greeting when already carried today on first visit", () => {
    const first = evaluateCarryForward({ isFirstVisitOfDay: true, sessionVisitIndex: 1 });
    const again = evaluateCarryForward({ isFirstVisitOfDay: true, sessionVisitIndex: 2 });
    expect(again.active).toBe(true);
    expect(again.greeting).toBe(first.greeting);
    expect(again.followUp).toBe(first.followUp);
  });

  it("suppresses when guest arrives with work intent", () => {
    const verdict = evaluateCarryForward({
      isFirstVisitOfDay: true,
      userText: "Help me build a marketing funnel.",
    });
    expect(verdict.suppressedReason).toBe("honor-their-intent-work");
    expect(verdict.active).toBe(false);
  });

  it("does not infer tasks from a simple good morning", () => {
    const verdict = evaluateCarryForward({
      isFirstVisitOfDay: true,
      userText: "good morning",
    });
    expect(verdict.active).toBe(false);
    expect(verdict.suppressedReason).toBe("simple-greeting");
    expect(verdict.greeting).toBeNull();
  });

  it("carry forward greetings never sound like task analysis", () => {
    const verdict = evaluateCarryForward({
      isFirstVisitOfDay: true,
      sessionVisitIndex: 2,
    });
    if (!verdict.greeting) return;
    expect(violatesCarryForwardLine(verdict.greeting)).toBe(false);
    expect(verdict.greeting).not.toMatch(/juggling|incomplete|task/i);
  });

  it("infers yesterday tone without task counts", () => {
    expect(
      inferYesterdayCloseTone({ projectRecentlyCompleted: true }),
    ).toBe("ended_with_win");
    expect(
      inferYesterdayCloseTone({ recoveryGentle: true }),
    ).toBe("ended_overwhelmed");
  });

  it("includes signature overwhelmed greeting", () => {
    const verdict = evaluateCarryForward({
      isFirstVisitOfDay: true,
      yesterdayTone: "ended_overwhelmed",
      sessionVisitIndex: 5,
      now: new Date("2026-06-25T08:00:00"),
    });
    expect(verdict.greeting).toBeTruthy();
    expect(verdict.yesterdayTone).toBe("ended_overwhelmed");
    expect(isValidCarryForwardLine(verdict.greeting!)).toBe(true);
  });
});
