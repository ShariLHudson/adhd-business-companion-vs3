import { describe, expect, it } from "vitest";
import {
  phaseShowsGreeting,
  phaseShowsInput,
  resolveWelcomeChatPlaceholder,
  resolveWelcomeRoomAccent,
  seasonBucket,
  welcomeOpeningSchedule,
} from "./index";

describe("welcomeLivingRoom", () => {
  it("schedules a calm opening when motion is allowed", () => {
    const schedule = welcomeOpeningSchedule(false);
    expect(schedule[0]?.phase).toBe("still");
    expect(schedule.at(-1)?.phase).toBe("alive");
  });

  it("reveals immediately when reduced motion is preferred", () => {
    expect(welcomeOpeningSchedule(true)).toEqual([{ phase: "alive", at: 0 }]);
  });

  it("gates copy reveal by phase", () => {
    expect(phaseShowsGreeting("sunlight")).toBe(false);
    expect(phaseShowsGreeting("greeting")).toBe(true);
    expect(phaseShowsInput("invite")).toBe(false);
    expect(phaseShowsInput("input")).toBe(true);
  });

  it("softens placeholder on focus", () => {
    expect(
      resolveWelcomeChatPlaceholder({ focused: false }),
    ).toBe("I'm listening...");
    expect(
      resolveWelcomeChatPlaceholder({ focused: true, focusedVariant: 0 }),
    ).toBe("Take your time...");
    expect(
      resolveWelcomeChatPlaceholder({ focused: true, focusedVariant: 1 }),
    ).toBe("Whenever you're ready.");
  });

  it("detects birthday room accent", () => {
    const accent = resolveWelcomeRoomAccent({
      birthday: { month: 6, day: 12 },
      now: new Date(2026, 5, 12, 10, 0, 0),
    });
    expect(accent).toBe("birthday");
  });

  it("maps months to seasons", () => {
    expect(seasonBucket(new Date(2026, 6, 4))).toBe("summer");
    expect(seasonBucket(new Date(2026, 11, 20))).toBe("holiday");
  });
});
