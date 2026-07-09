import { beforeEach, describe, expect, it, vi } from "vitest";

import { saveProject } from "@/lib/companionStore";
import { createSavedGrowthWin } from "@/lib/growthWinsStore";
import {
  buildChamberArrivalContext,
  buildChamberMomentumCard,
  CHAMBER_ADHD_FRIENDLY_RULES,
  CHAMBER_COMPLETION_REFLECTION_QUESTIONS,
  CHAMBER_OUTPUT_OPTIONS,
  CHAMBER_USES_UNIVERSAL_ESTATE_COMPLETION_SYSTEM,
  CHAMBER_USES_UNIVERSAL_ESTATE_CREATION_JOURNEY,
  detectDecisionNeed,
  detectReviewNeed,
  hasChamberMomentumCard,
  isWorkshopProjectGoal,
  selectChamberJourneySupport,
  suggestWorkshopProjectMilestones,
  workshopProjectCaptureFields,
} from "./chamberMemberJourney";
import { suggestProjectBreakdown } from "../chamberProjectEngine";

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

describe("chamberMemberJourney", () => {
  beforeEach(() => {
    seedLocalStorage();
    localStorage.clear();
  });

  it("routes decision and review needs to the right intelligence", () => {
    expect(detectDecisionNeed("I can't decide between two offers")).toBe(true);
    expect(
      selectChamberJourneySupport({
        text: "I can't decide between two offers",
      })?.target.section,
    ).toBe("decision-compass");

    expect(detectReviewNeed("Show me my progress from last week")).toBe(true);
    expect(
      selectChamberJourneySupport({
        text: "Show me my progress from last week",
      })?.target.section,
    ).toBe("evidence-bank");
  });

  it("still routes overwhelm and execution through journey selection", () => {
    expect(
      selectChamberJourneySupport({
        text: "I have too much to do",
      })?.need,
    ).toBe("clarity");
    expect(
      selectChamberJourneySupport({
        text: "Help me finish my website",
      })?.target.section,
    ).toBe("chamber-project-entry");
  });

  it("builds a momentum card from active project context", () => {
    saveProject({
      name: "Launch Workshop",
      goal: "Create a workshop for ADHD entrepreneurs.",
      nextAction: "Define workshop purpose",
      status: "active-focus",
    });
    createSavedGrowthWin({
      whatHappened: "Outlined the first module.",
      ts: new Date().toISOString(),
      icon: "🚀",
      attachments: [],
    });

    expect(hasChamberMomentumCard()).toBe(true);
    const card = buildChamberMomentumCard();
    expect(card?.activeProjectName).toBe("Launch Workshop");
    expect(card?.nextStep).toBe("Define workshop purpose");
    expect(card?.recentWin).toContain("Outlined");
  });

  it("captures arrival context and workshop journey support", () => {
    saveProject({
      name: "Workshop",
      goal: "Create a workshop",
      nextAction: "Define workshop purpose",
      status: "active-focus",
    });

    const arrival = buildChamberArrivalContext();
    expect(arrival.summaries.some((line) => line.includes("Workshop"))).toBe(
      true,
    );
    expect(arrival.whereLeftOff).toContain("Workshop");
    expect(arrival.whereLeftOff).toContain("continue");

    expect(isWorkshopProjectGoal("Create a workshop for ADHD entrepreneurs.")).toBe(
      true,
    );
    expect(workshopProjectCaptureFields().audience).toContain("Who is this");
    expect(suggestWorkshopProjectMilestones()[0]).toBe("Define workshop purpose");
    expect(suggestProjectBreakdown("Create a workshop")).toEqual(
      suggestWorkshopProjectMilestones(),
    );
  });

  it("documents completion reflection, output options, and ADHD rules", () => {
    expect(CHAMBER_COMPLETION_REFLECTION_QUESTIONS).toContain(
      "What would you like to remember?",
    );
    expect(CHAMBER_OUTPUT_OPTIONS.map((option) => option.id)).toEqual([
      "save",
      "print",
      "continue",
    ]);
    expect(CHAMBER_ADHD_FRIENDLY_RULES.length).toBeGreaterThanOrEqual(5);
    expect(CHAMBER_USES_UNIVERSAL_ESTATE_CREATION_JOURNEY).toBe(true);
    expect(CHAMBER_USES_UNIVERSAL_ESTATE_COMPLETION_SYSTEM).toBe(true);
  });
});
