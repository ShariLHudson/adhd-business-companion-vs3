/**
 * @vitest-environment jsdom
 *
 * Estate full-screen background — Hide / Show conversation controls.
 * Proves the reuse-first slice: one CompanionVisibility authority toggles the
 * existing conversation on/off over the background. Hiding quiets the thread but
 * keeps the composer and does not render a second chat; the labels match spec;
 * focus moves to the now-relevant control; Welcome Home is unaffected.
 */
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { WelcomeHomeFrostedChatPanel } from "./WelcomeHomeFrostedChatPanel";
import { CompanionVisibilityProvider } from "./CompanionVisibilityContext";

// @ts-expect-error — React act environment flag
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

let container: HTMLDivElement;
let root: Root;
const onToggle = vi.fn();
const onTurnOn = vi.fn();

function value(v: "on" | "off") {
  return {
    visibility: v,
    destinationId: "coffee-house",
    showControls: true,
    onToggle,
    onTurnOn,
    onNewChat: vi.fn(),
    onNewDay: vi.fn(),
  };
}

function render(companion: "on" | "off", estateRoom = true) {
  act(() => {
    root.render(
      <CompanionVisibilityProvider value={value(companion)}>
        <WelcomeHomeFrostedChatPanel
          estateRoom={estateRoom}
          showConversation
          alwaysShowInput
          thread={<div data-testid="thread">MESSAGES</div>}
          footer={<div data-testid="composer">COMPOSER</div>}
        />
      </CompanionVisibilityProvider>,
    );
  });
}

const q = (sel: string) => container.querySelector<HTMLElement>(sel);
const hideBtn = () => q('[data-testid="estate-hide-conversation"]');
const showBtn = () => q('[data-testid="companion-turn-on"]');
const thread = () => q('[data-testid="thread"]');
const composer = () => q('[data-testid="composer"]');

beforeEach(() => {
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
  onToggle.mockClear();
  onTurnOn.mockClear();
});
afterEach(() => {
  act(() => root.unmount());
  container.remove();
});

describe("estate background — conversation visibility", () => {
  it("On: shows the conversation and a 'Hide conversation' control", () => {
    render("on");
    expect(thread()).toBeTruthy();
    const b = hideBtn();
    expect(b).toBeTruthy();
    expect(b?.getAttribute("aria-label")).toBe("Hide conversation");
    expect(b?.tagName).toBe("BUTTON"); // keyboard reachable
    expect(showBtn()).toBeFalsy();
  });

  it("Off: thread is hidden (state preserved) but composer stays; restore is 'Show conversation'", () => {
    render("off");
    expect(thread()).toBeFalsy(); // quieted, not deleted (parent keeps state)
    expect(composer()).toBeTruthy(); // composer never removed
    expect(hideBtn()).toBeFalsy();
    const s = showBtn();
    expect(s).toBeTruthy();
    expect(s?.textContent).toBe("Show conversation");
  });

  it("Hide control drives the single visibility authority (onToggle)", () => {
    render("on");
    act(() => hideBtn()!.dispatchEvent(new MouseEvent("click", { bubbles: true })));
    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it("Show control restores via the existing onTurnOn authority", () => {
    render("off");
    act(() => showBtn()!.dispatchEvent(new MouseEvent("click", { bubbles: true })));
    expect(onTurnOn).toHaveBeenCalledTimes(1);
  });

  it("focus moves to the now-relevant control on hide, then on show", () => {
    render("on");
    render("off"); // simulate the toggle result
    expect(document.activeElement?.getAttribute("data-testid")).toBe("companion-turn-on");
    render("on");
    expect(document.activeElement?.getAttribute("data-testid")).toBe(
      "estate-hide-conversation",
    );
  });

  it("Welcome Home (non-estate) is unaffected: no Hide control, restore label unchanged", () => {
    render("off", false);
    expect(hideBtn()).toBeFalsy();
    expect(showBtn()?.textContent).toBe("Turn Companion On");
  });
});
