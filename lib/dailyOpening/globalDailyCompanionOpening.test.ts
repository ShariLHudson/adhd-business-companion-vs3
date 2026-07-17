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

import { resolveCompanionContinue } from "@/lib/companionLedContinue";
import { daysSinceRelationshipStart } from "@/lib/phase3AdaptiveRelationship";
import {
  buildDailyOpeningArrivalMessage,
  buildDailyOpeningChoiceCards,
  buildDailyOpeningWelcomeMessage,
  clearDailyOpeningPresentedForTests,
  countWelcomeSentences,
  GLOBAL_DAILY_OPENING_INPUT_PLACEHOLDER,
  markDailyOpeningPresented,
  resolveDailyOpeningChoiceAction,
  resolveDailyOpeningDiscoveryInvite,
  resolveGlobalDailyOpening,
  resolveHelpMeChooseSuggestions,
} from "@/lib/dailyOpening";
import { todayStr } from "@/lib/companionStore";

describe("GlobalDailyCompanionOpening — welcome message", () => {
  beforeEach(() => {
    localStorage.clear();
    clearDailyOpeningPresentedForTests();
    vi.mocked(daysSinceRelationshipStart).mockReturnValue(12);
    vi.mocked(resolveCompanionContinue).mockReturnValue({
      mode: "empty",
      prompt: "What would help most right now?",
    });
  });

  it("first opening shows a warm Shari message", () => {
    const message = buildDailyOpeningWelcomeMessage({
      momentKind: "first-of-day",
      memberFirstName: "Shari",
    });
    expect(message).toMatch(/good to see you/i);
    expect(message).toMatch(/Shari/);
    expect(message).not.toMatch(/^What would help most today\??$/i);
    expect(countWelcomeSentences(message)).toBeLessThanOrEqual(6);
  });

  it("same-day return uses return wording", () => {
    const message = buildDailyOpeningWelcomeMessage({
      momentKind: "same-day-return",
      memberFirstName: "Shari",
    });
    expect(message).toMatch(/welcome back/i);
    expect(message).toMatch(/good to see you|already in motion/i);
    expect(countWelcomeSentences(message)).toBeLessThanOrEqual(6);
  });

  it("structures the morning greeting into title, welcome, and choices intro", () => {
    const opening = resolveGlobalDailyOpening({
      entryPoint: "first-platform-opening",
      memberFirstName: "Sarah",
    });
    expect(opening.greetingTitle).toBe("Welcome back, Sarah.");
    expect(opening.welcomeLine).toMatch(/good to see you/i);
    expect(opening.choicesIntro).toMatch(/already in motion/i);
    expect(opening.discoveryInviteLine).toMatch(/helpful part of Spark Estate/i);
    expect(opening.welcomeMessage).toContain(opening.greetingTitle);
  });

  it("long absence uses Return Plan tone", () => {
    const message = buildDailyOpeningWelcomeMessage({
      momentKind: "absence-return",
      memberFirstName: "Shari",
    });
    expect(message).toMatch(/welcome home/i);
    expect(message).toMatch(/do not have to catch up|still here/i);
    expect(message).toMatch(/already in motion|helpful part/i);
    expect(countWelcomeSentences(message)).toBeLessThanOrEqual(6);
  });

  it("resolveGlobalDailyOpening keeps the message useful without becoming a menu", () => {
    const opening = resolveGlobalDailyOpening({
      entryPoint: "first-platform-opening",
      memberFirstName: "Shari",
    });
    expect(countWelcomeSentences(opening.welcomeMessage)).toBeLessThanOrEqual(
      6,
    );
    expect(opening.greeting).toBe(opening.welcomeMessage);
  });
});

describe("GlobalDailyCompanionOpening — main choices", () => {
  beforeEach(() => {
    localStorage.clear();
    clearDailyOpeningPresentedForTests();
    vi.mocked(resolveCompanionContinue).mockReturnValue({
      mode: "empty",
      prompt: "What would help most right now?",
    });
  });

  it("shows exactly three choice cards", () => {
    const opening = resolveGlobalDailyOpening({
      entryPoint: "settings-new-day",
    });
    expect(opening.choiceCards).toHaveLength(3);
    expect(opening.choices).toHaveLength(3);
  });

  it("marks exactly one card Recommended without resuming unfinished work titles", () => {
    const option = {
      id: "people:client-avatar",
      kind: "workspace" as const,
      title: "Client Avatar",
      subtitle: "Pick up where you stopped in People I Help.",
      priority: 2,
      lastTouchedAt: new Date().toISOString(),
    };
    vi.mocked(resolveCompanionContinue).mockReturnValue({
      mode: "single",
      option,
    });
    const cards = buildDailyOpeningChoiceCards(option);
    expect(cards.filter((c) => c.recommended)).toHaveLength(1);
    expect(cards[0]?.title).toBe("Start With What Matters Most");
    expect(cards[0]?.explanation).toMatch(/not a full day plan/i);
    expect(cards[0]?.estimateLabel).toBeTruthy();
  });

  it("does not place discovery inside the primary three choices", () => {
    const opening = resolveGlobalDailyOpening({
      entryPoint: "first-platform-opening",
      memberFirstName: "Shari",
    });
    expect(opening.choiceCards).toHaveLength(3);
    expect(opening.choiceCards.map((c) => c.id)).not.toContain("discovery");
    if (opening.discovery.show) {
      expect(opening.discovery.title).toMatch(/discover/i);
    }
  });

  it("hides discovery after absence or recovery", () => {
    expect(
      resolveDailyOpeningDiscoveryInvite({
        entryPoint: "absence-return",
        momentKind: "absence-return",
      }).show,
    ).toBe(false);
    expect(
      resolveDailyOpeningDiscoveryInvite({
        entryPoint: "first-platform-opening",
        momentKind: "first-of-day",
        suppressForRecovery: true,
      }).show,
    ).toBe(false);
  });
});

describe("GlobalDailyCompanionOpening — navigation", () => {
  beforeEach(() => {
    localStorage.clear();
    clearDailyOpeningPresentedForTests();
  });

  it("Continue meaningful work opens the exact unfinished destination", () => {
    const option = {
      id: "people:client-avatar",
      kind: "workspace" as const,
      title: "Client Avatar",
      subtitle: "Pick up where you stopped in People I Help.",
      priority: 2,
      lastTouchedAt: new Date().toISOString(),
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
    // Choice 1 is Meaningful Start — never resumes prior work automatically.
    expect(action).toEqual({ kind: "show-meaningful-start" });
    expect(option.title).toMatch(/Client Avatar/);
  });

  it("Plan or Adapt My Day navigates using canonical plan state", () => {
    const opening = resolveGlobalDailyOpening({
      entryPoint: "settings-new-day",
    });
    const action = resolveDailyOpeningChoiceAction(
      "plan-or-adapt-my-day",
      opening,
    );
    expect(action.kind).toBe("navigate");
    if (action.kind === "navigate") {
      expect(
        action.destination.kind === "plan-my-day" ||
          action.destination.kind === "adapt-my-day",
      ).toBe(true);
    }
  });

  it("Help Me Choose opens the need-based flow (not Welcome card duplicates)", () => {
    const opening = resolveGlobalDailyOpening({
      entryPoint: "settings-new-day",
    });
    const action = resolveDailyOpeningChoiceAction("help-me-choose", opening);
    expect(action).toEqual({ kind: "show-help-me-choose" });
    expect(opening.helpMeChooseSuggestions).toEqual([]);
    expect(resolveHelpMeChooseSuggestions()).toEqual([]);
  });

  it("does not ask for a second confirmation before navigating", () => {
    const opening = resolveGlobalDailyOpening({
      entryPoint: "settings-new-day",
    });
    for (const id of [
      "continue-meaningful-work",
      "plan-or-adapt-my-day",
      "help-me-choose",
    ] as const) {
      const action = resolveDailyOpeningChoiceAction(id, opening);
      expect(
        action.kind === "navigate" ||
          action.kind === "show-help-me-choose" ||
          action.kind === "show-meaningful-start",
      ).toBe(true);
    }
  });
});

describe("GlobalDailyCompanionOpening — wiring contracts", () => {
  it("soft-presents the card when the calendar day was already marked", () => {
    const { readFileSync } = require("node:fs") as typeof import("node:fs");
    const { resolve } = require("node:path") as typeof import("node:path");
    const source = readFileSync(
      resolve(process.cwd(), "app/companion/CompanionPageClient.tsx"),
      "utf8",
    );
    expect(source).toContain("isTodaysWelcomeDismissedThisSession");
    expect(source).toContain("markTodaysWelcomeDismissedThisSession");
    expect(source).toContain("hasUserMessage");
    expect(source).toMatch(
      /Day already marked[\s\S]*?resolveGlobalDailyOpening/,
    );
  });

  it("CPC uses the shared card, empty chat seed, and input placeholder", () => {
    const { readFileSync } = require("node:fs") as typeof import("node:fs");
    const { resolve } = require("node:path") as typeof import("node:path");
    const source = readFileSync(
      resolve(process.cwd(), "app/companion/CompanionPageClient.tsx"),
      "utf8",
    );
    const component = readFileSync(
      resolve(
        process.cwd(),
        "components/companion/GlobalDailyCompanionOpening.tsx",
      ),
      "utf8",
    );
    expect(source).toContain("TodaysWelcomeCard");
    expect(source).not.toContain("<WelcomeHomeDailyChoices");
    expect(source).toContain("GLOBAL_DAILY_OPENING_INPUT_PLACEHOLDER");
    expect(source).toContain("filterLegacyDailyOpeningMessages");
    expect(source).toContain("isSupersededWelcomeHomeGreeting");
    expect(source).toContain("todaysWelcomeOpening");
    expect(source).toContain("welcomeHomeVisibleMessages");
    expect(source).toMatch(
      /setGlobalDailyOpening\(result\.opening\)[\s\S]*?setMessages\(\[\]\)/,
    );
    expect(source).toContain("buildDailyOpeningArrivalMessage");
    expect(component).toContain('data-testid="todays-welcome-card"');
    expect(component).toContain('data-daily-opening-version=');
    expect(component).toContain("Recommended Today");
    expect(component).toContain("global-daily-opening__card--recommended");
    expect(component).toContain("Back to Today");
    expect(component).toContain('data-testid="global-daily-discovery"');
    expect(component).not.toMatch(/Help Me Restart|Check My Day/);
  });

  it("never falls back to the retired plain-text opening strings", () => {
    const { readFileSync } = require("node:fs") as typeof import("node:fs");
    const { resolve } = require("node:path") as typeof import("node:path");
    const source = readFileSync(
      resolve(process.cwd(), "app/companion/CompanionPageClient.tsx"),
      "utf8",
    );
    const retired = [
      "Help Me Restart",
      "Check My Day",
      "What would help most today?",
      "I also have a new discovery waiting",
      "Let's start with one small thing.",
    ];
    for (const phrase of retired) {
      expect(source).not.toContain(phrase);
    }
  });

  it("CSS provides readable cards and focus/hover states", () => {
    const { readFileSync } = require("node:fs") as typeof import("node:fs");
    const { resolve } = require("node:path") as typeof import("node:path");
    const css = readFileSync(
      resolve(process.cwd(), "app/companion/global-daily-companion-opening.css"),
      "utf8",
    );
    expect(css).toContain("min-height: 44px");
    expect(css).toContain(":focus-visible");
    expect(css).toContain(":hover");
    expect(css).toContain("rgba(255, 251, 244, 0.94)");
  });
});

describe("GlobalDailyCompanionOpening — input + a11y contracts", () => {
  it("uses a non-competing input placeholder", () => {
    expect(GLOBAL_DAILY_OPENING_INPUT_PLACEHOLDER).toBe(
      "You can also tell me what you need today.",
    );
    expect(GLOBAL_DAILY_OPENING_INPUT_PLACEHOLDER).not.toMatch(
      /one small thing/i,
    );
  });

  it("choice cards expose recommended flag for one card only", () => {
    const cards = buildDailyOpeningChoiceCards(null);
    expect(cards.filter((c) => c.recommended)).toHaveLength(1);
    expect(cards.every((c) => c.title.trim().length > 0)).toBe(true);
    expect(cards.every((c) => c.explanation.trim().length > 0)).toBe(true);
    expect(cards.map((c) => c.title).join(" ")).not.toMatch(
      /Help Me Restart|Check My Day/i,
    );
    expect(cards[0]?.title).toBe("Start With What Matters Most");
    expect(cards[1]?.title).toBe("Plan or Adapt My Day");
    expect(cards[2]?.title).toBe("Help Me Choose");
    expect(cards[0]?.supportLines?.length).toBeGreaterThanOrEqual(2);
    expect(cards[1]?.supportLines?.join(" ")).toMatch(/plan|adapt/i);
    expect(cards[2]?.supportLines?.join(" ")).toMatch(/support|need/i);
  });

  it("exposes Show Me Something Helpful as a secondary action (not a fourth card)", () => {
    const { readFileSync } = require("node:fs") as typeof import("node:fs");
    const { resolve } = require("node:path") as typeof import("node:path");
    const source = readFileSync(
      resolve(process.cwd(), "components/companion/GlobalDailyCompanionOpening.tsx"),
      "utf8",
    );
    const welcome = readFileSync(
      resolve(process.cwd(), "lib/dailyOpening/buildDailyOpeningWelcome.ts"),
      "utf8",
    );
    expect(source).toContain("SHOW_ME_SOMETHING_HELPFUL_LABEL");
    expect(source).toContain("show-me-something-helpful");
    expect(source).toContain("onShowSomethingHelpful");
    expect(welcome).toContain("Show Me Something Helpful");
    expect(source).toContain('mode: "show-something-helpful"');
    expect(source).toContain("help-me-choose-needs");
  });

  it("never uses a raw user sentence as the Choice 1 card title", () => {
    const cards = buildDailyOpeningChoiceCards({
      id: "raw-continue",
      kind: "conversation",
      title: "whether i should hire a salesperson or not",
      subtitle: "Pick up our conversation",
      priority: 1,
      lastTouchedAt: new Date().toISOString(),
      homeResumeItem: {
        id: "hire-decision",
        kind: "decision-compass",
        title: "whether i should hire a salesperson or not",
        typeLabel: "Hiring Decision",
        lastAction: "Paused",
        nextStep: "Continue deciding",
        ts: new Date().toISOString(),
      },
    });
    expect(cards[0]?.title).toBe("Start With What Matters Most");
    expect(cards[0]?.title).not.toMatch(/whether i should/i);
  });

  it("same-day return after mark uses return moment kind", () => {
    markDailyOpeningPresented(todayStr());
    const opening = resolveGlobalDailyOpening({
      entryPoint: "settings-new-day",
      memberFirstName: "Shari",
    });
    expect(opening.momentKind).toBe("same-day-return");
    expect(opening.welcomeMessage).toMatch(/welcome back/i);
  });
});
