/**
 * @vitest-environment jsdom
 */
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { WelcomeHomeFrostedChatPanel } from "./WelcomeHomeFrostedChatPanel";
import { CompanionVisibilityProvider } from "./CompanionVisibilityContext";

/**
 * Guards the Welcome Home composer fix: `alwaysShowInput` is a true override —
 * the composer renders even when Companion is Off, and a welcome card / greeting
 * never suppresses it. The quiet "turn Companion on" state stays as it was on
 * the surfaces where it is intended (no forced input).
 */
describe("WelcomeHomeFrostedChatPanel composer visibility", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
    vi.restoreAllMocks();
  });

  function visibility(v: "on" | "off") {
    return {
      visibility: v,
      destinationId: "welcome-home",
      showControls: true,
      onToggle: vi.fn(),
      onTurnOn: vi.fn(),
      onNewChat: vi.fn(),
      onNewDay: vi.fn(),
    };
  }

  function render(
    props: Partial<React.ComponentProps<typeof WelcomeHomeFrostedChatPanel>>,
    companion: "on" | "off",
  ) {
    act(() => {
      root.render(
        <CompanionVisibilityProvider value={visibility(companion)}>
          <WelcomeHomeFrostedChatPanel
            showConversation={false}
            thread={null}
            footer={<div data-testid="composer">COMPOSER</div>}
            {...props}
          />
        </CompanionVisibilityProvider>,
      );
    });
  }

  const composer = () =>
    container.querySelector('[data-testid="composer"]');
  const quietState = () =>
    container.querySelector('[data-testid="companion-turn-on"]');

  it("shows composer with welcome content when Companion is On", () => {
    render(
      {
        alwaysShowInput: true,
        showWelcomeLine: true,
        welcomeMessage: "Good morning, Shari.",
      },
      "on",
    );
    expect(composer()).toBeTruthy();
    expect(container.textContent).toContain("Good morning, Shari.");
  });

  it("shows composer when Companion is Off and alwaysShowInput is true (the fix)", () => {
    render({ alwaysShowInput: true }, "off");
    // Previously the companionOn AND-gate hid the composer here.
    expect(composer()).toBeTruthy();
  });

  it("shows welcome cards and composer together", () => {
    render(
      {
        alwaysShowInput: true,
        showWelcomeLine: true,
        welcomeSlot: <div data-testid="welcome-cards">CARDS</div>,
      },
      "on",
    );
    expect(container.querySelector('[data-testid="welcome-cards"]')).toBeTruthy();
    expect(composer()).toBeTruthy();
  });

  it("keeps quiet-state behavior unchanged where intended (Off, no greeting, no forced input)", () => {
    render(
      { alwaysShowInput: false, showConversation: false, showWelcomeLine: false },
      "off",
    );
    // The intended quiet-state surface is unchanged: quiet prompt shows, and the
    // footer is NOT force-rendered because alwaysShowInput is false.
    expect(quietState()).toBeTruthy();
    expect(composer()).toBeNull();
  });
});
