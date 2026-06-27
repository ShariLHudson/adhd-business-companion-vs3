/**
 * @vitest-environment jsdom
 */
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, describe, expect, it } from "vitest";
import { VisibleThinkingBubble } from "./VisibleThinkingBubble";
import { shouldShowChatVisibleThinking } from "@/lib/visibleThinking/chatThinkingUi";
import { friendlyFetchErrorMessage } from "@/lib/safeJsonResponse";

describe("Visible Thinking chat bubble", () => {
  let container: HTMLDivElement;
  let root: Root;

  afterEach(() => {
    act(() => {
      root?.unmount();
    });
    container?.remove();
  });

  function renderBubble(message: string) {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
    act(() => {
      root.render(<VisibleThinkingBubble message={message} emotion="unclear" />);
    });
  }

  it("renders Shari portrait beside thinking copy", () => {
    renderBubble("Connecting a few dots...");
    const bubble = container.querySelector('[data-testid="visible-thinking-bubble"]');
    const portrait = container.querySelector("img");
    expect(bubble).toBeTruthy();
    expect(portrait).toBeTruthy();
    expect(container.textContent).toContain("Connecting a few dots...");
  });

  it("uses compact circular portrait without a white square placeholder", () => {
    renderBubble("I want to answer this well.");
    const portrait = container.querySelector("img");
    expect(portrait?.className).toMatch(/rounded-full/);
    expect(portrait?.className).toMatch(/h-10/);
    expect(portrait?.className).not.toMatch(/bg-white/);
    const whiteSquare = container.querySelector(".bg-white");
    expect(whiteSquare).toBeNull();
  });

  it("never surfaces raw JSON or DOCTYPE errors in chat copy", () => {
    const recovery = friendlyFetchErrorMessage(
      new SyntaxError(`Unexpected token '<', "<!DOCTYPE "... is not valid JSON`),
    );
    expect(recovery).not.toMatch(/DOCTYPE/i);
    expect(recovery).not.toMatch(/Unexpected token/i);
    expect(recovery).toMatch(/tangled|still here/i);
  });

  it("removes thinking bubble when loading completes", () => {
    expect(shouldShowChatVisibleThinking(true, "One moment...")).toBe(true);
    expect(shouldShowChatVisibleThinking(false, "One moment...")).toBe(false);
  });
});
