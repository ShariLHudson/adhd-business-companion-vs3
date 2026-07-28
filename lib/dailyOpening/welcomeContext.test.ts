/**
 * @vitest-environment jsdom
 *
 * MA-05 Phase 4a — CanonicalWelcomeContext foundation.
 * The context is ADDITIVE: it must mirror the already-resolved daily-opening
 * values exactly (proving zero copy/UI change) and carry the MA-05 P2 return
 * state. No new resident-facing decisions are made here.
 */
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/companionLedContinue", () => ({
  resolveCompanionContinue: vi.fn(() => ({
    mode: "empty",
    prompt: "What would help most right now?",
  })),
}));
vi.mock("@/lib/phase3AdaptiveRelationship", () => ({
  daysSinceRelationshipStart: vi.fn(() => 12),
}));
vi.mock("@/lib/profile/businessEstateProfile", () => ({
  getApprovedFieldValue: vi.fn(() => "Shari Hudson"),
}));

import { daysSinceRelationshipStart } from "@/lib/phase3AdaptiveRelationship";
import {
  clearDailyOpeningPresentedForTests,
  markDailyOpeningPresented,
  resolveGlobalDailyOpening,
} from "@/lib/dailyOpening";
import { isAbsenceReturn } from "@/lib/dailyOpening/dailyOpeningDay";
import { DAILY_OPENING_ABSENCE_THRESHOLD_DAYS } from "@/lib/dailyOpening/types";
import { RETURN_AFTER_ABSENCE_DAYS } from "@/lib/arrivalIntelligence/returnState";
import { resolveArrivalReturnState } from "@/lib/arrivalIntelligence";

beforeEach(() => {
  localStorage.clear();
  clearDailyOpeningPresentedForTests();
  vi.mocked(daysSinceRelationshipStart).mockReturnValue(12);
});

describe("MA-05 P4a — welcomeContext mirrors the rendered result (parity)", () => {
  it("every context field equals the corresponding existing field", () => {
    const r = resolveGlobalDailyOpening({ entryPoint: "first-platform-opening" });
    expect(r.welcomeContext.opening.greetingTitle).toBe(r.greetingTitle);
    expect(r.welcomeContext.opening.welcomeLine).toBe(r.welcomeLine);
    expect(r.welcomeContext.opening.encouragement).toBe(r.encouragementLine);
    expect(r.welcomeContext.choices).toBe(r.choiceCards); // same reference
    expect(r.welcomeContext.continuation.candidate).toBe(r.continueOption);
    expect(r.welcomeContext.discovery).toBe(r.discovery);
    expect(r.welcomeContext.resident.journeyPhase).toBe(r.welcomePhase);
  });

  it("is purely additive — existing rendered fields remain fully populated", () => {
    const r = resolveGlobalDailyOpening({ entryPoint: "first-platform-opening" });
    expect(typeof r.greetingTitle).toBe("string");
    expect(r.greetingTitle.length).toBeGreaterThan(0);
    expect(Array.isArray(r.choiceCards)).toBe(true);
    expect(r.choiceCards.length).toBe(3);
    expect(r.welcomeMessage).toBe(r.greeting); // legacy aliases unchanged
  });
});

describe("MA-05 P4a — return state in the context (reuses P2)", () => {
  it("first-of-day → ordinary_return (momentKind fallback)", () => {
    const r = resolveGlobalDailyOpening({ entryPoint: "first-platform-opening" });
    expect(r.momentKind).toBe("first-of-day");
    expect(r.welcomeContext.resident.returnState).toBe("ordinary_return");
  });
  it("absence-return → return_after_absence (momentKind fallback)", () => {
    const r = resolveGlobalDailyOpening({ entryPoint: "absence-return" });
    expect(r.momentKind).toBe("absence-return");
    expect(r.welcomeContext.resident.returnState).toBe("return_after_absence");
  });
  it("same-day-return → same_day_return (momentKind fallback)", () => {
    markDailyOpeningPresented();
    const r = resolveGlobalDailyOpening({ entryPoint: "explicit-new-day" });
    expect(r.momentKind).toBe("same-day-return");
    expect(r.welcomeContext.resident.returnState).toBe("same_day_return");
  });
  it("explicit P2 returnState input wins over the momentKind fallback", () => {
    const r = resolveGlobalDailyOpening({
      entryPoint: "first-platform-opening",
      returnState: "long_absence_return",
    });
    expect(r.welcomeContext.resident.returnState).toBe("long_absence_return");
  });
});

describe("MA-05 P4a — MA-05 P1 daily stability preserved through the context", () => {
  it("repeated same-day resolution yields identical opening in the context", () => {
    const a = resolveGlobalDailyOpening({ entryPoint: "first-platform-opening" });
    const b = resolveGlobalDailyOpening({ entryPoint: "first-platform-opening" });
    expect(a.welcomeContext.opening.encouragement).toBe(
      b.welcomeContext.opening.encouragement,
    );
    expect(a.welcomeContext.opening.greetingTitle).toBe(
      b.welcomeContext.opening.greetingTitle,
    );
  });
});

describe("MA-05 P4b — daily-opening absence detection uses the shared policy", () => {
  it("DAILY_OPENING_ABSENCE_THRESHOLD_DAYS redirects to the canonical constant", () => {
    expect(DAILY_OPENING_ABSENCE_THRESHOLD_DAYS).toBe(RETURN_AFTER_ABSENCE_DAYS);
  });
  it("isAbsenceReturn uses the shared 3-day boundary (2 → false, 3 → true)", () => {
    expect(isAbsenceReturn(2)).toBe(false);
    expect(isAbsenceReturn(3)).toBe(true);
    expect(isAbsenceReturn(null)).toBe(false);
  });
});

describe("MA-05 P4b — live arrival return state flows into the context", () => {
  it("a precise arrival-derived returnState is carried into welcomeContext", () => {
    const returnState = resolveArrivalReturnState(
      { homeState: "QUIET_PRESENCE", isFirstMeeting: false, returnIntervalDays: 14 },
      { sameLocalDay: false },
    );
    expect(returnState).toBe("long_absence_return");
    const r = resolveGlobalDailyOpening({
      entryPoint: "first-platform-opening",
      returnState,
    });
    expect(r.welcomeContext.resident.returnState).toBe("long_absence_return");
  });
});
