/**
 * @vitest-environment jsdom
 */
import { act, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { DailyOpeningChoiceCard } from "@/lib/dailyOpening";

import { TodaysWelcomeCard } from "./GlobalDailyCompanionOpening";

const choiceCards: DailyOpeningChoiceCard[] = [
  {
    id: "plan-or-adapt-my-day",
    title: "Plan My Day",
    explanation: "Shape today around time and energy.",
  },
];

const authored = {
  greetingTitle: "Welcome back, Shari.",
  welcomeLine: "It's good to see you.",
  choicesIntro:
    "You can return to something already in motion, shape today, or let me help you decide.",
  discoveryInviteLine:
    "I can also show you one helpful part of Spark Estate you may not have discovered yet.",
  welcomeMessage:
    "Welcome back, Shari. It's good to see you. You can return to something already in motion, shape today, or let me help you decide. I can also show you one helpful part of Spark Estate you may not have discovered yet.",
};

describe("TodaysWelcomeCard — welcome message visibility", () => {
  let container: HTMLDivElement;
  let root: Root;

  afterEach(() => {
    act(() => root?.unmount());
    container?.remove();
  });

  function render(node: ReactNode) {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
    act(() => {
      root.render(node);
    });
  }

  it("renders all four authored welcome sections in main mode", () => {
    render(
      <TodaysWelcomeCard
        mode="main"
        greetingTitle={authored.greetingTitle}
        welcomeLine={authored.welcomeLine}
        choicesIntro={authored.choicesIntro}
        discoveryInviteLine={authored.discoveryInviteLine}
        welcomeMessage={authored.welcomeMessage}
        choiceCards={choiceCards}
        onSelect={vi.fn()}
        onShowSomethingHelpful={vi.fn()}
      />,
    );
    expect(
      container.querySelector("[data-testid='global-daily-greeting-title']")
        ?.textContent,
    ).toContain(authored.greetingTitle);
    expect(
      container.querySelector("[data-testid='global-daily-welcome-line']")
        ?.textContent,
    ).toContain(authored.welcomeLine);
    expect(
      container.querySelector("[data-testid='global-daily-choices-intro']")
        ?.textContent,
    ).toContain(authored.choicesIntro);
    expect(
      container.querySelector("[data-testid='global-daily-discovery-invite']")
        ?.textContent,
    ).toContain(authored.discoveryInviteLine);
    // The discovery invite pairs with the Show Me Something Helpful button.
    expect(
      container.querySelector("[data-testid='show-me-something-helpful']"),
    ).toBeTruthy();
  });

  it("does not duplicate lines when optional authored fields are absent", () => {
    render(
      <TodaysWelcomeCard
        mode="main"
        greetingTitle={authored.greetingTitle}
        welcomeLine={authored.welcomeLine}
        welcomeMessage={authored.welcomeMessage}
        choiceCards={choiceCards}
        onSelect={vi.fn()}
        onShowSomethingHelpful={vi.fn()}
      />,
    );
    expect(
      container.querySelector("[data-testid='global-daily-choices-intro']"),
    ).toBeFalsy();
    expect(
      container.querySelector("[data-testid='global-daily-discovery-invite']"),
    ).toBeFalsy();
    // Greeting still shows exactly once.
    expect(
      container.querySelectorAll(
        "[data-testid='global-daily-greeting-title']",
      ).length,
    ).toBe(1);
  });

  it("falls back to the joined welcome message when structured fields are missing", () => {
    render(
      <TodaysWelcomeCard
        mode="main"
        welcomeMessage={authored.welcomeMessage}
        choiceCards={choiceCards}
        onSelect={vi.fn()}
        onShowSomethingHelpful={vi.fn()}
      />,
    );
    expect(
      container.querySelector("[data-testid='global-daily-greeting-title']"),
    ).toBeFalsy();
    expect(container.textContent).toContain(authored.welcomeMessage);
    // No duplicate discrete choices-intro line in fallback mode.
    expect(
      container.querySelector("[data-testid='global-daily-choices-intro']"),
    ).toBeFalsy();
  });
});
