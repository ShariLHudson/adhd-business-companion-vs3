/**
 * Conversational Create Entrance (2026-08-06) — component-level acceptance.
 * @vitest-environment jsdom
 */
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { CreateEntryConversationPanel } from "@/components/companion/CreateEntryConversationPanel";

describe("CreateEntryConversationPanel", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    container.remove();
  });

  function input(): HTMLTextAreaElement {
    return container.querySelector<HTMLTextAreaElement>(
      "[data-testid='create-estate-entry-input']",
    )!;
  }

  function send() {
    const button = container.querySelector<HTMLButtonElement>(
      "[data-testid='create-estate-entry-send']",
    )!;
    act(() => {
      button.click();
    });
  }

  function typeAndSend(text: string) {
    act(() => {
      const el = input();
      // React tracks <textarea> value via its own property descriptor —
      // setting el.value directly and dispatching "input" is silently
      // ignored unless we go through the native setter first.
      const nativeSetter = Object.getOwnPropertyDescriptor(
        window.HTMLTextAreaElement.prototype,
        "value",
      )!.set!;
      nativeSetter.call(el, text);
      el.dispatchEvent(new Event("input", { bubbles: true }));
    });
    send();
  }

  it("renders the opening question with no categories, templates, or bot turn yet", () => {
    let ready: string | null = null;
    act(() => {
      root.render(
        <CreateEntryConversationPanel onReady={(text) => (ready = text)} />,
      );
    });
    expect(container.textContent).toContain("What are you working on?");
    expect(container.textContent).toContain(
      "It doesn't have to be figured out yet.",
    );
    expect(container.querySelector("[data-testid*='browse-categories']")).toBeNull();
    expect(container.querySelector("[data-testid*='start-with-guidance']")).toBeNull();
    expect(container.querySelector(".companion-chat-bubble--companion")).toBeNull();
    expect(ready).toBeNull();
  });

  it("Example 1 — SOP acknowledgment appears after the opening message", () => {
    act(() => {
      root.render(<CreateEntryConversationPanel onReady={() => undefined} />);
    });
    typeAndSend("I need an SOP for onboarding clients.");
    expect(container.textContent).toContain(
      "I'd be happy to help. Before we start writing steps, let's understand what this process needs to accomplish.",
    );
  });

  it("Example 2 — workshop acknowledgment appears after the opening message", () => {
    act(() => {
      root.render(<CreateEntryConversationPanel onReady={() => undefined} />);
    });
    typeAndSend("I want to plan a workshop.");
    expect(container.textContent).toContain(
      "That sounds exciting. Before we think about schedules or materials, who is this workshop meant to help and what do you hope changes for them?",
    );
  });

  it("Example 3 — marketing acknowledgment appears after the opening message", () => {
    act(() => {
      root.render(<CreateEntryConversationPanel onReady={() => undefined} />);
    });
    typeAndSend("I need help marketing my business.");
    expect(container.textContent).toContain(
      "I'd love to help. Before we create a marketing plan, let's understand what you're hoping marketing will accomplish.",
    );
  });

  it("Example 4 — generic idea fallback appears after the opening message", () => {
    act(() => {
      root.render(<CreateEntryConversationPanel onReady={() => undefined} />);
    });
    typeAndSend("I have an idea but don't know what to do with it.");
    expect(container.textContent).toContain(
      "Perfect. Those are often the ideas worth exploring. Tell me what you're imagining.",
    );
  });

  it("calls onReady with the combined text only after the second (elaboration) turn — never after the first", () => {
    let ready: string | null = null;
    act(() => {
      root.render(
        <CreateEntryConversationPanel onReady={(text) => (ready = text)} />,
      );
    });
    typeAndSend("I need an SOP for onboarding clients.");
    expect(ready).toBeNull(); // one helpful question first, not an immediate classify

    typeAndSend("It's for a client, starting from scratch.");
    expect(ready).toBe(
      "I need an SOP for onboarding clients. It's for a client, starting from scratch.",
    );
  });

  it("never shows a third bot turn — exactly one acknowledgment, no interview", () => {
    act(() => {
      root.render(<CreateEntryConversationPanel onReady={() => undefined} />);
    });
    typeAndSend("I want to plan a workshop.");
    typeAndSend("It's for new clients, hoping they feel confident afterward.");
    expect(
      container.querySelectorAll(".companion-chat-bubble--companion").length,
    ).toBe(1);
  });

  it("disabled prop prevents sending", () => {
    let ready: string | null = null;
    act(() => {
      root.render(
        <CreateEntryConversationPanel
          onReady={(text) => (ready = text)}
          disabled
        />,
      );
    });
    typeAndSend("I need an SOP for onboarding clients.");
    expect(container.textContent).not.toContain("I'd be happy to help.");
    expect(ready).toBeNull();
  });
});
