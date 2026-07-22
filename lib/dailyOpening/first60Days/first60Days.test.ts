/**
 * @vitest-environment jsdom
 */
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/phase3AdaptiveRelationship", () => ({
  daysSinceRelationshipStart: vi.fn(() => 0),
}));

vi.mock("@/lib/estateMemory/estateMemoryStore", () => ({
  getEstateMemory: vi.fn(() => ({
    roomVisitMemory: { favoriteRoomIds: [], visitCounts: {} },
  })),
}));

import { daysSinceRelationshipStart } from "@/lib/phase3AdaptiveRelationship";
import { getEstateMemory } from "@/lib/estateMemory/estateMemoryStore";
import {
  clearFirst60ProgressForTests,
  FIRST_60_DAYS_GUIDED_LENGTH,
  loadFirst60Progress,
  markFirst60DiscoveryExplored,
  markFirst60DiscoverySkipped,
  resolveDiscoveryForWelcomeDay,
  resolveFirst60WelcomeLine,
  resolveWelcomeDayIndex,
  resolveWelcomeExperiencePhase,
} from "./index";

describe("First 60 Days — day index", () => {
  beforeEach(() => {
    localStorage.clear();
    clearFirst60ProgressForTests();
    vi.mocked(daysSinceRelationshipStart).mockReturnValue(0);
  });

  it("maps relationship day 0 to welcome Day 1 (guided)", () => {
    const result = resolveWelcomeDayIndex(new Date("2026-07-22T12:00:00Z"));
    expect(result.daysSinceStart).toBe(0);
    expect(result.dayIndex).toBe(1);
    expect(result.phase).toBe("guided");
  });

  it("maps day 15 into guided phase", () => {
    vi.mocked(daysSinceRelationshipStart).mockReturnValue(14);
    const result = resolveWelcomeDayIndex();
    expect(result.dayIndex).toBe(15);
    expect(result.phase).toBe("guided");
  });

  it("switches to adaptive after Day 60", () => {
    vi.mocked(daysSinceRelationshipStart).mockReturnValue(60);
    const result = resolveWelcomeDayIndex();
    expect(result.dayIndex).toBe(61);
    expect(result.phase).toBe("adaptive");
    expect(resolveWelcomeExperiencePhase(FIRST_60_DAYS_GUIDED_LENGTH)).toBe(
      "guided",
    );
    expect(resolveWelcomeExperiencePhase(FIRST_60_DAYS_GUIDED_LENGTH + 1)).toBe(
      "adaptive",
    );
  });
});

describe("First 60 Days — discovery skip", () => {
  beforeEach(() => {
    localStorage.clear();
    clearFirst60ProgressForTests();
    vi.mocked(daysSinceRelationshipStart).mockReturnValue(0);
  });

  it("Skip remembers discovery and does not re-offer it while guided", () => {
    const first = resolveDiscoveryForWelcomeDay({
      dayIndexOverride: 1,
      dayKey: "2026-07-22",
    });
    expect(first?.id).toBe("plan-my-day");
    markFirst60DiscoverySkipped(first!.id);

    const next = resolveDiscoveryForWelcomeDay({
      dayIndexOverride: 2,
      dayKey: "2026-07-23",
      persistOffer: true,
    });
    expect(next?.id).not.toBe("plan-my-day");
    expect(loadFirst60Progress().skippedIds).toContain("plan-my-day");
  });

  it("Explore marks discovery explored and advances past it", () => {
    const first = resolveDiscoveryForWelcomeDay({
      dayIndexOverride: 1,
      dayKey: "2026-07-22",
    });
    markFirst60DiscoveryExplored(first!.id);
    const next = resolveDiscoveryForWelcomeDay({
      dayIndexOverride: 3,
      dayKey: "2026-07-24",
    });
    expect(next?.id).not.toBe(first!.id);
    expect(loadFirst60Progress().exploredIds).toContain(first!.id);
  });
});

describe("First 60 Days — no-repeat welcome", () => {
  beforeEach(() => {
    localStorage.clear();
    clearFirst60ProgressForTests();
  });

  it("pins the same welcome within one calendar day", () => {
    const a = resolveFirst60WelcomeLine({ dayIndex: 1, dayKey: "2026-07-22" });
    const b = resolveFirst60WelcomeLine({ dayIndex: 1, dayKey: "2026-07-22" });
    expect(a.id).toBe(b.id);
    expect(a.text).toBe(b.text);
  });

  it("avoids exact repeat on the next calendar day when possible", () => {
    const day1 = resolveFirst60WelcomeLine({
      dayIndex: 1,
      dayKey: "2026-07-22",
    });
    const day2 = resolveFirst60WelcomeLine({
      dayIndex: 2,
      dayKey: "2026-07-23",
    });
    expect(day2.id).not.toBe(day1.id);
  });
});

describe("First 60 Days — adaptive switch", () => {
  beforeEach(() => {
    localStorage.clear();
    clearFirst60ProgressForTests();
    vi.mocked(daysSinceRelationshipStart).mockReturnValue(60);
    vi.mocked(getEstateMemory).mockReturnValue({
      roomVisitMemory: {
        favoriteRoomIds: [],
        visitCounts: {
          "plan-my-day": 5,
          rhythms: 4,
        },
      },
    } as ReturnType<typeof getEstateMemory>);
  });

  it("day 61+ prefers unvisited / low-use discoveries over frequent ones", () => {
    const discovery = resolveDiscoveryForWelcomeDay({
      dayIndexOverride: 61,
      dayKey: "2026-09-20",
    });
    expect(discovery).not.toBeNull();
    expect(discovery!.phase).toBe("adaptive");
    expect(discovery!.id).not.toBe("plan-my-day");
    expect(discovery!.id).not.toBe("rhythms");
  });
});
