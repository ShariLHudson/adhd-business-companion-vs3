import { beforeEach, describe, expect, it, vi } from "vitest";

import { buildSparkEstateDailyArrival } from "./sparkEstateDailyCompanionExperience";
import { getSparkEstateMemberProfile } from "./sparkEstateMemberProfileEngine";
import {
  buildSparkEstateOnboardingArrival,
  clearSparkEstateOnboardingState,
  formatSparkEstateOnboardingReport,
  getSparkEstateOnboardingState,
  isSparkEstateFirstWeekActive,
  mergeSparkEstateOnboardingIntoDailyArrival,
  recordSparkEstateOnboardingVisit,
  resolveSparkEstateOnboardingDay,
  seedSparkEstateOnboardingState,
  SPARK_ESTATE_FIRST_WEEK_DAYS,
  SPARK_ESTATE_FIRST_WEEK_SUCCESS_MEASURES,
  SPARK_ESTATE_ONBOARDING_PRINCIPLE,
  SPARK_ESTATE_ONBOARDING_STAGES,
  SPARK_ESTATE_ONBOARDING_WELCOME,
  verifySparkEstateOnboardingAndFirst7Days,
} from "./sparkEstateOnboardingAndFirst7DaysExperience";

function seedLocalStorage() {
  const mem = new Map<string, string>();
  const storage = {
    getItem: (k: string) => mem.get(k) ?? null,
    setItem: (k: string, v: string) => {
      mem.set(k, v);
    },
    removeItem: (k: string) => {
      mem.delete(k);
    },
    clear: () => {
      mem.clear();
    },
  };
  vi.stubGlobal("localStorage", storage);
  vi.stubGlobal("sessionStorage", storage);
  vi.stubGlobal("window", {
    dispatchEvent: vi.fn(),
    localStorage: storage,
    sessionStorage: storage,
  });
}

describe("sparkEstateOnboardingAndFirst7DaysExperience", () => {
  beforeEach(() => {
    seedLocalStorage();
    localStorage.clear();
    sessionStorage.clear();
    clearSparkEstateOnboardingState();
  });

  function newMemberProfile() {
    return {
      ...getSparkEstateMemberProfile(),
      isNewMember: true,
      progressHistory: [],
      frictionPatterns: [],
      successfulStrategies: [],
    };
  }

  it("defines five onboarding stages and a seven-day journey", () => {
    const verification = verifySparkEstateOnboardingAndFirst7Days();
    expect(SPARK_ESTATE_ONBOARDING_STAGES).toHaveLength(5);
    expect(SPARK_ESTATE_FIRST_WEEK_DAYS).toHaveLength(7);
    expect(SPARK_ESTATE_ONBOARDING_PRINCIPLE).toContain("experience the system");
    expect(verification.firstWeekReady).toBe(true);
    expect(verification.successMeasuresReady).toBe(true);
    expect(SPARK_ESTATE_FIRST_WEEK_SUCCESS_MEASURES).toHaveLength(5);
  });

  it("builds a welcoming day-one arrival without overwhelming choices", () => {
    const arrival = buildSparkEstateOnboardingArrival({
      profile: newMemberProfile(),
    });
    expect(arrival?.welcomeLine).toBe(SPARK_ESTATE_ONBOARDING_WELCOME);
    expect(arrival?.focusOptions.length).toBeLessThanOrEqual(4);
    expect(arrival?.avoidOverload).toBe(true);
    expect(isSparkEstateFirstWeekActive()).toBe(true);
  });

  it("progresses through the first week by day", () => {
    const start = new Date("2026-01-01T12:00:00.000Z");
    seedSparkEstateOnboardingState({
      startedAt: start.toISOString(),
      stagesCompleted: ["welcome"],
      firstWinCaptured: false,
      estateIntroduced: false,
      sparkCardIntroduced: false,
      reflectionCompleted: false,
      visitDates: ["2026-01-01"],
      updatedAt: start.toISOString(),
    });

    const dayThree = new Date("2026-01-03T12:00:00.000Z");
    const arrival = buildSparkEstateOnboardingArrival({
      now: dayThree,
      profile: newMemberProfile(),
    });
    expect(arrival?.welcomeLine).toContain("Day 3");
    expect(arrival?.focusOptions.some((option) => option.id === "create")).toBe(
      true,
    );
  });

  it("merges onboarding guidance into the daily companion arrival for new members", () => {
    recordSparkEstateOnboardingVisit({ now: new Date() });
    const merged = mergeSparkEstateOnboardingIntoDailyArrival(
      buildSparkEstateDailyArrival(),
      { now: new Date(), profile: newMemberProfile() },
    );
    expect(merged.welcomeLine).toContain("Welcome");
    expect(merged.focusOptions.length).toBeLessThanOrEqual(4);
  });

  it("records first-week visits and milestones", () => {
    const state = recordSparkEstateOnboardingVisit({
      firstWin: true,
      estateIntroduced: true,
      sparkCardIntroduced: true,
    });
    expect(state.firstWinCaptured).toBe(true);
    expect(state.estateIntroduced).toBe(true);
    expect(state.sparkCardIntroduced).toBe(true);
    expect(state.stagesCompleted).toContain("first-success");
  });

  it("formats a readable onboarding report", () => {
    const report = formatSparkEstateOnboardingReport();
    expect(report).toContain("First week journey");
    expect(report).toContain("Success measures");
    expect(report).toContain("Integration checks");
  });
});
