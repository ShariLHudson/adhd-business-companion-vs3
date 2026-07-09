import { beforeEach, describe, expect, it, vi } from "vitest";

import { saveProject } from "@/lib/companionStore";
import {
  buildSparkEstateDailyArrival,
  formatSparkEstateDailyCompletionPrompt,
  formatSparkEstateReturnToWorkLine,
  parseSparkEstateDailyFocusChoice,
  recordSparkEstateDailySessionUpdate,
  resolveSparkEstateDailyFocusPlan,
  SPARK_ESTATE_DAILY_FOCUS_QUESTION,
  SPARK_ESTATE_DAILY_SUCCESS_TEST,
  verifySparkEstateDailyCompanionExperience,
} from "./sparkEstateDailyCompanionExperience";

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

describe("sparkEstateDailyCompanionExperience", () => {
  beforeEach(() => {
    seedLocalStorage();
    localStorage.clear();
    sessionStorage.clear();
  });

  it("defines daily focus question and success experience", () => {
    const verification = verifySparkEstateDailyCompanionExperience();
    expect(SPARK_ESTATE_DAILY_FOCUS_QUESTION).toBe(
      "What would help you most today?",
    );
    expect(SPARK_ESTATE_DAILY_SUCCESS_TEST).toContain("knows where I am");
    expect(verification.focusOptions).toBe(7);
    expect(verification.arrivalReady).toBe(true);
    expect(verification.routingReady).toBe(true);
    expect(verification.completionReady).toBe(true);
  });

  it("builds personalized daily arrival without overload", () => {
    saveProject({
      name: "Website",
      goal: "Launch",
      nextAction: "Review homepage message",
      status: "active-focus",
    });
    const arrival = buildSparkEstateDailyArrival();
    expect(arrival.welcomeLine).toContain("Website");
    expect(arrival.focusOptions.map((option) => option.id)).toContain("continue");
    expect(arrival.suggestedCards.length).toBeLessThanOrEqual(1);
  });

  it("parses focus choices and routes daily intelligence", () => {
    expect(parseSparkEstateDailyFocusChoice("Clear my mind")).toBe("clear-mind");
    expect(parseSparkEstateDailyFocusChoice("Teach me marketing")).toBe("learn");

    const plan = resolveSparkEstateDailyFocusPlan({ choice: "decide" });
    expect(plan.section).toBe("decision-compass");
    expect(plan.goal).toContain("clarity");
  });

  it("continues work naturally after leaving", () => {
    saveProject({
      name: "Workshop",
      goal: "Launch workshop",
      nextAction: "Outline session one",
      status: "active-focus",
    });
    expect(formatSparkEstateReturnToWorkLine()).toContain("Workshop");
  });

  it("records daily session updates and completion options", () => {
    const session = recordSparkEstateDailySessionUpdate({
      focusChoice: "work-important",
      projectName: "Website",
    });
    expect(session.visitCount).toBe(1);
    expect(session.lastFocusChoice).toBe("work-important");
    expect(formatSparkEstateDailyCompletionPrompt()).toContain("review");
  });
});
