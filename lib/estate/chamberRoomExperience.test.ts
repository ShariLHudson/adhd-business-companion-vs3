import { beforeEach, describe, expect, it, vi } from "vitest";

import { saveProject } from "@/lib/companionStore";
import { createSavedGrowthWin } from "@/lib/growthWinsStore";
import { recordMomentumPathMilestone } from "@/lib/momentumBuilderRoom/momentumPathHooks";
import {
  buildChamberMomentumPathItems,
  buildChamberProgressMoments,
  hasChamberSupplementalPanels,
} from "./chamberRoomExperience";
import { CHAMBER_ENTRY_OPTIONS, CHAMBER_WELCOME_SUBTITLE, CHAMBER_WELCOME_TITLE } from "./chamberOfMomentumRouting";
import { CHAMBER_OF_MOMENTUM_ROOM_META } from "./chamber/chamberOfMomentumRoomRegistry";

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
  vi.stubGlobal("window", {
    dispatchEvent: vi.fn(),
    localStorage: storage,
  });
}

describe("chamberRoomExperience", () => {
  beforeEach(() => {
    seedLocalStorage();
    localStorage.clear();
  });

  it("hides supplemental panels when there is no movement data", () => {
    expect(buildChamberMomentumPathItems()).toEqual([]);
    expect(buildChamberProgressMoments()).toEqual([]);
    expect(hasChamberSupplementalPanels()).toBe(false);
  });

  it("shows first step from an active project next action", () => {
    saveProject({
      name: "Website launch",
      goal: "Launch my website",
      nextAction: "Write the homepage headline",
      status: "active-focus",
    });
    const items = buildChamberMomentumPathItems();
    expect(items[0]?.trademark).toBe("First Step");
    expect(items[0]?.label).toBe("Write the homepage headline");
    expect(hasChamberSupplementalPanels()).toBe(true);
  });

  it("shows recent wins and milestones in progress recognition", () => {
    createSavedGrowthWin({
      whatHappened: "Published the homepage",
      ts: new Date().toISOString(),
      icon: "🚀",
      attachments: [],
    });
    recordMomentumPathMilestone({
      id: "ms-1",
      milestoneKind: "easy_win_completed",
      label: "Named the next step",
      recordedAt: new Date().toISOString(),
    });
    expect(buildChamberProgressMoments().length).toBeGreaterThan(0);
    expect(
      buildChamberMomentumPathItems().some(
        (item) => item.trademark === "Easy Wins",
      ),
    ).toBe(true);
  });
});

describe("chamber Phase 7 copy and room identity", () => {
  it("uses the arrival copy from the demo room spec", () => {
    expect(CHAMBER_WELCOME_SUBTITLE).toBe(
      "Let's find what will help you move forward today.",
    );
    expect(CHAMBER_WELCOME_TITLE).toBe(
      "Welcome to the Chamber of Momentum",
    );
    expect(CHAMBER_OF_MOMENTUM_ROOM_META.background).toContain(
      "spark-chamber-of-momentum-background.png",
    );
  });

  it("uses the five simple doorway choices", () => {
    expect(CHAMBER_ENTRY_OPTIONS.map((option) => option.label)).toEqual([
      "I have an idea",
      "I feel stuck",
      "I need a plan",
      "I want to learn",
      "I want to work on a project",
    ]);
  });
});
