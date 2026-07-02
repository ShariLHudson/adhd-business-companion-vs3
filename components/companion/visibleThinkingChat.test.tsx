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

  it("renders calm thinking label beside pulse", () => {
    renderBubble("Thinking…");
    const bubble = container.querySelector('[data-testid="visible-thinking-bubble"]');
    const pulse = container.querySelector(".companion-chat-thinking__pulse");
    expect(bubble).toBeTruthy();
    expect(pulse).toBeTruthy();
    expect(container.textContent).toContain("Thinking…");
  });

  it("does not repeat avatar portraits on every thinking state", () => {
    renderBubble("I want to answer this well.");
    const portrait = container.querySelector("img");
    expect(portrait).toBeNull();
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
