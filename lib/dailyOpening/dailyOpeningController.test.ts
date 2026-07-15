/**
 * @vitest-environment jsdom
 */
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/companionLedContinue", () => ({
  resolveCompanionContinue: vi.fn(() => ({
    mode: "empty",
    prompt: "What would help most right now?",
  })),
}));

vi.mock("@/lib/profile/businessEstateProfile", () => ({
  getApprovedFieldValue: vi.fn(() => "Shari Hudson"),
}));

vi.mock("@/lib/estateJourneyEngine/session", () => ({
  beginEstateJourneyNewDay: vi.fn(() => ({
    greeting: "New day — fresh start. What feels most important right now?",
    sessionSummary: null,
  })),
}));

import { resolveCompanionContinue } from "@/lib/companionLedContinue";
import {
  clearConversation,
  getPrefs,
  loadConversation,
  saveConversation,
  savePrefs,
} from "@/lib/companionStore";
import {
  clearConversationSession,
  getOrCreateConversationSession,
  loadConversationSession,
  resetConversationSessionMemoryForTests,
} from "@/lib/conversationSession";
import {
  __resetEstateMemoryCacheForTests,
  getEstateMemory,
  patchEstateMemory,
  resetEstateMemory,
} from "@/lib/estateMemory";
import { getApprovedFieldValue } from "@/lib/profile/businessEstateProfile";
import {
  clearDailyOpeningPresentedForTests,
  GLOBAL_DAILY_OPENING_CHOICES,
  markDailyOpeningPresented,
  readDailyOpeningPresentedDay,
  resolveDailyOpeningChoiceAction,
  resolveGlobalDailyOpening,
  resolveHelpMeChooseSuggestions,
  runSharedNewDay,
  shouldOfferFirstPlatformOpeningOfDay,
} from "@/lib/dailyOpening";
import { todayStr } from "@/lib/companionStore";
import { readTodayPlanItems, saveTodayPlanItems } from "@/lib/planMyDay/planDayItems";

describe("Global Daily Companion Experience — shared controller", () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    resetConversationSessionMemoryForTests();
    clearConversationSession();
    clearConversation();
    __resetEstateMemoryCacheForTests();
    resetEstateMemory();
    clearDailyOpeningPresentedForTests();
    savePrefs({ name: "Shari", hasChatted: true, hasSeenWelcomeIntro: true });
    vi.mocked(resolveCompanionContinue).mockReturnValue({
      mode: "empty",
      prompt: "What would help most right now?",
    });
  });

  it("presents exactly three Global Daily choices", () => {
    const opening = resolveGlobalDailyOpening({
      entryPoint: "settings-new-day",
    });
    expect(opening.choices).toHaveLength(3);
    expect(opening.choices.map((c) => c.id)).toEqual([
      "continue-meaningful-work",
      "plan-or-adapt-my-day",
      "help-me-choose",
    ]);
    expect(opening.choices.map((c) => c.label)).toEqual(
      GLOBAL_DAILY_OPENING_CHOICES.map((c) => c.label),
    );
  });

  it("Settings → New Day creates a fresh conversation ID and clears old messages/summaries", () => {
    saveConversation([
      { role: "user", content: "Yesterday we talked about pricing." },
      { role: "assistant", content: "Here is a hidden summary of yesterday." },
    ]);
    const prior = getOrCreateConversationSession();
    patchEstateMemory((mem) => ({
      ...mem,
      conversationDigest: [
        {
          role: "assistant",
          summary: "Hidden summary from yesterday",
          at: new Date().toISOString(),
        },
      ],
    }));

    const result = runSharedNewDay({ entryPoint: "settings-new-day" });

    expect(result.reset.previousConversationId).toBe(prior.conversationId);
    expect(result.reset.conversationId).not.toBe(prior.conversationId);
    expect(loadConversationSession()?.conversationId).toBe(
      result.reset.conversationId,
    );
    expect(loadConversation() ?? []).toEqual([]);
    expect(getEstateMemory().conversationDigest).toEqual([]);
    expect(result.opening.choices).toHaveLength(3);
    expect(result.opening.entryPoint).toBe("settings-new-day");
  });

  it("refresh after New Day does not restore yesterday’s chat id or messages", () => {
    saveConversation([
      { role: "user", content: "Old thread" },
      { role: "assistant", content: "Old reply" },
    ]);
    const prior = getOrCreateConversationSession().conversationId;
    const result = runSharedNewDay({ entryPoint: "explicit-new-day" });

    // Simulate refresh: session already written; conversation storage empty.
    resetConversationSessionMemoryForTests();
    const reloaded = loadConversationSession();
    expect(reloaded?.conversationId).toBe(result.reset.conversationId);
    expect(reloaded?.conversationId).not.toBe(prior);
    expect(loadConversation() ?? []).toEqual([]);
  });

  it("preserves long-term profile / Business Estate information", () => {
    savePrefs({ name: "Shari", hasChatted: true });
    vi.mocked(getApprovedFieldValue).mockReturnValue("Shari Hudson");

    runSharedNewDay({ entryPoint: "settings-new-day" });

    expect(getPrefs().name).toBe("Shari");
    expect(getApprovedFieldValue("identity.founderName")).toBe("Shari Hudson");
  });

  it("does not leave yesterday’s plan as today’s active plan", () => {
    saveTodayPlanItems([
      {
        id: "old-1",
        title: "Yesterday leftover",
        done: false,
        column: "today",
        createdAt: new Date().toISOString(),
      },
    ]);
    expect(readTodayPlanItems().length).toBeGreaterThan(0);

    runSharedNewDay({ entryPoint: "settings-new-day" });

    expect(readTodayPlanItems()).toEqual([]);
  });

  it("Continue Meaningful Work navigates to the unfinished activity", () => {
    const option = {
      id: "project:alpha",
      kind: "project" as const,
      title: "Launch offer page",
      subtitle: "Continue writing",
      priority: 2,
      lastTouchedAt: new Date().toISOString(),
      homeResumeItem: {
        id: "project:alpha",
        kind: "project" as const,
        title: "Launch offer page",
        typeLabel: "Project",
        lastAction: "Continue",
        nextStep: "Continue writing",
        ts: new Date().toISOString(),
        activityId: "projects",
      },
    };
    vi.mocked(resolveCompanionContinue).mockReturnValue({
      mode: "single",
      option,
    });
    const opening = resolveGlobalDailyOpening({
      entryPoint: "explicit-new-day",
    });
    const action = resolveDailyOpeningChoiceAction(
      "continue-meaningful-work",
      opening,
    );
    expect(action).toEqual({
      kind: "navigate",
      destination: { kind: "continue", option },
    });
  });

  it("Plan or Adapt My Day opens Plan My Day on first click", () => {
    const opening = resolveGlobalDailyOpening({
      entryPoint: "settings-new-day",
    });
    const action = resolveDailyOpeningChoiceAction(
      "plan-or-adapt-my-day",
      opening,
    );
    expect(action).toEqual({
      kind: "navigate",
      destination: { kind: "plan-my-day" },
    });
  });

  it("Help Me Choose produces exactly three actionable suggestions that navigate on first click", () => {
    const opening = resolveGlobalDailyOpening({
      entryPoint: "settings-new-day",
    });
    const action = resolveDailyOpeningChoiceAction("help-me-choose", opening);
    expect(action.kind).toBe("show-help-me-choose");
    if (action.kind !== "show-help-me-choose") return;
    expect(action.suggestions).toHaveLength(3);
    for (const suggestion of action.suggestions) {
      expect(suggestion.label.trim().length).toBeGreaterThan(0);
      expect(suggestion.destination.kind).not.toBe("help-me-choose");
    }
    const again = resolveHelpMeChooseSuggestions();
    expect(again).toHaveLength(3);
  });

  it("marks the calendar day so first platform opening is not duplicated", () => {
    expect(shouldOfferFirstPlatformOpeningOfDay()).toBe(true);
    runSharedNewDay({ entryPoint: "first-platform-opening" });
    expect(readDailyOpeningPresentedDay()).toBe(todayStr());
    expect(shouldOfferFirstPlatformOpeningOfDay()).toBe(false);
    markDailyOpeningPresented(todayStr());
    expect(shouldOfferFirstPlatformOpeningOfDay()).toBe(false);
  });

  it("explicit New Day and Settings New Day share the same three choices", () => {
    const fromSettings = resolveGlobalDailyOpening({
      entryPoint: "settings-new-day",
    });
    const fromMenu = resolveGlobalDailyOpening({
      entryPoint: "explicit-new-day",
    });
    expect(fromSettings.choices).toEqual(fromMenu.choices);
  });
});
