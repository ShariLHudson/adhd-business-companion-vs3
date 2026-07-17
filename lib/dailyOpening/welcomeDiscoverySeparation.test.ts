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

vi.mock("@/lib/phase3AdaptiveRelationship", () => ({
  daysSinceRelationshipStart: vi.fn(() => 12),
}));

vi.mock("@/lib/profile/businessEstateProfile", () => ({
  getApprovedFieldValue: vi.fn(() => "Shari Hudson"),
}));

vi.mock("@/lib/dailyAdaptation/hasActivePlanToday", () => ({
  hasActivePlanForToday: vi.fn(() => false),
}));

import { resolveCompanionContinue } from "@/lib/companionLedContinue";
import { hasActivePlanForToday } from "@/lib/dailyAdaptation/hasActivePlanToday";
import {
  buildDailyOpeningChoiceCards,
  buildDailyOpeningWelcomeParts,
  clearDailyOpeningPresentedForTests,
  clearHelpfulLessonHistoryForTests,
  HELP_ME_CHOOSE_NEED_OPTIONS,
  HELP_ME_CHOOSE_PROMPT,
  HELPFUL_LESSON_REGISTRY,
  offerNextHelpfulLesson,
  offerNextHelpfulLessonExcluding,
  resolveDailyOpeningChoiceAction,
  resolveGlobalDailyOpening,
  resolveHelpMeChooseSupportOptions,
  SHOW_ME_SOMETHING_HELPFUL_LABEL,
} from "@/lib/dailyOpening";

describe("Welcome discovery vs Help Me Choose separation", () => {
  beforeEach(() => {
    localStorage.clear();
    clearDailyOpeningPresentedForTests();
    clearHelpfulLessonHistoryForTests();
    vi.mocked(resolveCompanionContinue).mockReturnValue({
      mode: "empty",
      prompt: "What would help most right now?",
    });
    vi.mocked(hasActivePlanForToday).mockReturnValue(false);
  });

  it("welcome copy includes discovery invite and is warmer than a menu", () => {
    const parts = buildDailyOpeningWelcomeParts({
      momentKind: "same-day-return",
      memberFirstName: "Shari",
    });
    expect(parts.greetingTitle).toMatch(/Welcome back, Shari/);
    expect(parts.welcomeLine).toMatch(/do not have to remember everything/i);
    expect(parts.choicesIntro).toMatch(/return to something already in motion/i);
    expect(parts.discoveryInviteLine).toMatch(/one helpful part of Spark Estate/i);
    expect(parts.welcomeMessage).not.toMatch(/choose one of three/i);
    expect(SHOW_ME_SOMETHING_HELPFUL_LABEL).toBe("Show Me Something Helpful");
  });

  it("three primary cards stay Continue / Plan or Adapt / Help Me Choose", () => {
    const cards = buildDailyOpeningChoiceCards(null);
    expect(cards.map((c) => c.id)).toEqual([
      "continue-meaningful-work",
      "plan-or-adapt-my-day",
      "help-me-choose",
    ]);
    expect(cards[0]?.title).toBe("Start With What Matters Most");
    expect(cards[2]?.title).toBe("Help Me Choose");
    expect(cards.some((c) => /show me something helpful/i.test(c.title))).toBe(
      false,
    );
  });

  it("Help Me Choose opens need-based flow — not Welcome card duplicates", () => {
    const opening = resolveGlobalDailyOpening({
      entryPoint: "explicit-new-day",
    });
    const action = resolveDailyOpeningChoiceAction("help-me-choose", opening);
    expect(action.kind).toBe("show-help-me-choose");
    expect(opening.helpMeChooseSuggestions).toEqual([]);
    expect(HELP_ME_CHOOSE_NEED_OPTIONS.map((n) => n.label)).toEqual([
      "I feel overwhelmed",
      "I want to make progress on something",
      "I have something on my mind",
      "I need to make a decision",
      "I'm not sure",
    ]);
    expect(HELP_ME_CHOOSE_PROMPT).toBe("What would help most right now?");
    const support = resolveHelpMeChooseSupportOptions("overwhelmed", null);
    expect(support.some((s) => /clear my mind/i.test(s.title))).toBe(true);
    expect(support.some((s) => /breathe/i.test(s.title))).toBe(false);
    expect(
      support.every(
        (s) =>
          !/continue where i left off/i.test(s.title) &&
          s.id !== "continue-meaningful-work",
      ),
    ).toBe(true);
  });

  it("Plan or Adapt auto-routes from plan state", () => {
    const opening = resolveGlobalDailyOpening({
      entryPoint: "explicit-new-day",
    });
    vi.mocked(hasActivePlanForToday).mockReturnValue(false);
    expect(
      resolveDailyOpeningChoiceAction("plan-or-adapt-my-day", opening),
    ).toEqual({
      kind: "navigate",
      destination: { kind: "plan-my-day" },
    });
    vi.mocked(hasActivePlanForToday).mockReturnValue(true);
    expect(
      resolveDailyOpeningChoiceAction("plan-or-adapt-my-day", opening),
    ).toEqual({
      kind: "navigate",
      destination: { kind: "adapt-my-day" },
    });
  });

  it("Show Me Something Helpful offers one curated lesson and rotates", () => {
    expect(HELPFUL_LESSON_REGISTRY.length).toBeGreaterThan(5);
    const first = offerNextHelpfulLesson();
    expect(first?.lesson.title).toBeTruthy();
    expect(first?.lesson.shortExplanation.length).toBeGreaterThan(20);
    const second = offerNextHelpfulLessonExcluding(first!.lesson.id);
    expect(second?.lesson.id).not.toBe(first!.lesson.id);
  });

  it("Parking Lot lesson Show Me targets parking-lot — not Plan My Day", () => {
    const parking = HELPFUL_LESSON_REGISTRY.find((l) => l.id === "parking-lot");
    expect(parking?.destinationId).toBe("parking-lot");
    expect(parking?.destinationId).not.toBe("plan-my-day");
  });

  it("Choice 1 stays Meaningful Start even when unfinished work exists", () => {
    vi.mocked(resolveCompanionContinue).mockReturnValue({
      mode: "single",
      option: {
        id: "proj-1",
        kind: "project",
        title: "Q3 proposal",
        subtitle: "Return to your draft",
        priority: 2,
        lastTouchedAt: new Date().toISOString(),
      },
    });
    const opening = resolveGlobalDailyOpening({
      entryPoint: "explicit-new-day",
    });
    const continueCard = opening.choiceCards.find(
      (c) => c.id === "continue-meaningful-work",
    );
    expect(continueCard?.title).toBe("Start With What Matters Most");
    const action = resolveDailyOpeningChoiceAction(
      "continue-meaningful-work",
      opening,
    );
    expect(action).toEqual({ kind: "show-meaningful-start" });
  });
});
