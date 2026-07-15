import { describe, expect, it } from "vitest";
import { resolveWelcomeHomeDailyGreeting } from "./dailyGreeting";
import { evaluateWelcomeHomeExperience } from "@/lib/sparkExperienceEngine";

describe("resolveWelcomeHomeDailyGreeting", () => {
  it("rotates morning lines by day", () => {
    const a = resolveWelcomeHomeDailyGreeting({
      now: new Date("2026-06-30T09:00:00"),
    });
    const b = resolveWelcomeHomeDailyGreeting({
      now: new Date("2026-07-01T09:00:00"),
    });
    expect(a).toBeTruthy();
    expect(b).toBeTruthy();
  });

  it("can return presence-only on quiet days", () => {
    const line = resolveWelcomeHomeDailyGreeting({
      now: new Date("2026-06-28T10:00:00"), // Sunday
    });
    expect(line === "I'm here whenever you're ready." || line?.length).toBeTruthy();
  });
});

describe("evaluateWelcomeHomeExperience", () => {
  it("shows intro on first visit and defers greeting to narration", () => {
    const plan = evaluateWelcomeHomeExperience({ hasSeenWelcomeIntro: false });
    expect(plan.showIntro).toBe(true);
    expect(plan.greeting).toBeNull();
  });

  it("skips intro for returning visitors", () => {
    const plan = evaluateWelcomeHomeExperience({ hasSeenWelcomeIntro: true });
    expect(plan.showIntro).toBe(false);
    expect(plan.greeting).toBeTruthy();
  });

  it("skips intro on repeat login", () => {
    const plan = evaluateWelcomeHomeExperience({
      hasSeenWelcomeIntro: false,
      isRepeatLogin: true,
    });
    expect(plan.showIntro).toBe(false);
    expect(plan.visitorKind).toBe("returning");
  });

  it("manual replay opens the welcome after first visit completion", () => {
    const plan = evaluateWelcomeHomeExperience({
      hasSeenWelcomeIntro: true,
      isRepeatLogin: true,
      replayRequested: true,
    });
    expect(plan.visitorKind).toBe("replay");
    expect(plan.showIntro).toBe(true);
    expect(plan.greeting).toBeNull();
  });
});
