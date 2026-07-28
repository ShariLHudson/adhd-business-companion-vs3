/**
 * MA-05 Phase 2 — canonical return / absence classification.
 * One shared threshold policy; deterministic five-state classification.
 */
import { describe, expect, it } from "vitest";
import {
  classifyReturnState,
  isLongAbsence,
  isReturnAfterAbsence,
  LONG_ABSENCE_DAYS,
  RETURN_AFTER_ABSENCE_DAYS,
} from "./returnState";

describe("MA-05 P2 — one shared threshold policy", () => {
  it("exposes exactly two ordered thresholds (3 and 14)", () => {
    expect(RETURN_AFTER_ABSENCE_DAYS).toBe(3);
    expect(LONG_ABSENCE_DAYS).toBe(14);
    expect(RETURN_AFTER_ABSENCE_DAYS).toBeLessThan(LONG_ABSENCE_DAYS);
  });
});

describe("MA-05 P2 — threshold helpers (exact boundaries)", () => {
  it("return-after-absence at exactly the threshold, not below", () => {
    expect(isReturnAfterAbsence(RETURN_AFTER_ABSENCE_DAYS - 1)).toBe(false); // 2
    expect(isReturnAfterAbsence(RETURN_AFTER_ABSENCE_DAYS)).toBe(true); // 3
  });
  it("long-absence at exactly the threshold, not below", () => {
    expect(isLongAbsence(LONG_ABSENCE_DAYS - 1)).toBe(false); // 13
    expect(isLongAbsence(LONG_ABSENCE_DAYS)).toBe(true); // 14
  });
  it("null / undefined day gaps are never an absence", () => {
    expect(isReturnAfterAbsence(null)).toBe(false);
    expect(isReturnAfterAbsence(undefined)).toBe(false);
    expect(isLongAbsence(null)).toBe(false);
    expect(isLongAbsence(undefined)).toBe(false);
  });
});

describe("MA-05 P2 — classifyReturnState (all five states, deterministic)", () => {
  const base = {
    isFirstEver: false,
    sameLocalDay: false,
    daysSinceLastArrival: 0 as number | null,
  };

  it("first-ever arrival", () => {
    expect(classifyReturnState({ ...base, isFirstEver: true })).toBe(
      "first_ever_arrival",
    );
  });
  it("same-day return", () => {
    expect(classifyReturnState({ ...base, sameLocalDay: true })).toBe(
      "same_day_return",
    );
  });
  it("ordinary return below the absence threshold", () => {
    expect(
      classifyReturnState({ ...base, daysSinceLastArrival: 1 }),
    ).toBe("ordinary_return");
    expect(
      classifyReturnState({
        ...base,
        daysSinceLastArrival: RETURN_AFTER_ABSENCE_DAYS - 1, // 2
      }),
    ).toBe("ordinary_return");
  });
  it("return after absence (>= 3, < 14)", () => {
    expect(
      classifyReturnState({
        ...base,
        daysSinceLastArrival: RETURN_AFTER_ABSENCE_DAYS, // 3
      }),
    ).toBe("return_after_absence");
    expect(
      classifyReturnState({
        ...base,
        daysSinceLastArrival: LONG_ABSENCE_DAYS - 1, // 13
      }),
    ).toBe("return_after_absence");
  });
  it("long absence return (>= 14)", () => {
    expect(
      classifyReturnState({
        ...base,
        daysSinceLastArrival: LONG_ABSENCE_DAYS, // 14
      }),
    ).toBe("long_absence_return");
    expect(
      classifyReturnState({ ...base, daysSinceLastArrival: 60 }),
    ).toBe("long_absence_return");
  });
});

describe("MA-05 P2 — precedence (no conflicting classification)", () => {
  it("first-ever wins over any day gap", () => {
    expect(
      classifyReturnState({
        isFirstEver: true,
        sameLocalDay: false,
        daysSinceLastArrival: 90,
      }),
    ).toBe("first_ever_arrival");
  });
  it("same-day wins over a large gap (remount / route revisit is not an absence)", () => {
    expect(
      classifyReturnState({
        isFirstEver: false,
        sameLocalDay: true,
        daysSinceLastArrival: 90,
      }),
    ).toBe("same_day_return");
  });
  it("missing day gap resolves to ordinary_return, never falsely first_ever", () => {
    expect(
      classifyReturnState({
        isFirstEver: false,
        sameLocalDay: false,
        daysSinceLastArrival: null,
      }),
    ).toBe("ordinary_return");
  });
});
