/**
 * @vitest-environment jsdom
 */
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ContextualResearchPanel } from "./ContextualResearchPanel";

function type(el: HTMLTextAreaElement, value: string) {
  const setter = Object.getOwnPropertyDescriptor(
    window.HTMLTextAreaElement.prototype,
    "value",
  )!.set!;
  setter.call(el, value);
  el.dispatchEvent(new Event("input", { bubbles: true }));
}

describe("ContextualResearchPanel", () => {
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

  const base = {
    open: true,
    onToggle: vi.fn(),
    questionKey: "painPoints",
    questionLabel: "What are they struggling with most?",
    systemPrompt: "scoped prompt",
  };

  it("shows the active question and a labeled, scoped input", () => {
    act(() => root.render(<ContextualResearchPanel {...base} />));
    expect(container.textContent).toContain(
      "What are they struggling with most?",
    );
    const input = container.querySelector(
      '[data-testid="research-input"]',
    ) as HTMLTextAreaElement;
    expect(input.getAttribute("aria-label")).toContain(
      "What are they struggling with most?",
    );
  });

  it("disables Ask until there is input", () => {
    act(() => root.render(<ContextualResearchPanel {...base} />));
    const ask = [...container.querySelectorAll("button")].find(
      (b) => b.textContent === "Ask",
    ) as HTMLButtonElement;
    expect(ask.disabled).toBe(true);
  });

  it("sends a scoped message and renders the reply, then resets when the question changes", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      json: async () => ({ message: "A helpful research reply" }),
    });
    vi.stubGlobal("fetch", fetchMock);

    act(() => root.render(<ContextualResearchPanel {...base} />));
    const input = container.querySelector(
      '[data-testid="research-input"]',
    ) as HTMLTextAreaElement;
    await act(async () => {
      type(input, "What angles should I consider?");
    });
    const ask = [...container.querySelectorAll("button")].find(
      (b) => b.textContent === "Ask",
    ) as HTMLButtonElement;
    await act(async () => {
      ask.click();
    });
    // fetch was called with the talkItOutShariEngine contract + scoped prompt.
    const body = JSON.parse(fetchMock.mock.calls[0]![1]!.body as string);
    expect(body.talkItOutShariEngine).toBe(true);
    expect(body.systemPromptOverride).toBe("scoped prompt");
    expect(container.textContent).toContain("A helpful research reply");

    // Changing the active question resets the thread (no leak across questions).
    await act(async () => {
      root.render(
        <ContextualResearchPanel {...base} questionKey="goals" questionLabel="What are they trying to achieve?" />,
      );
    });
    expect(container.textContent).not.toContain("A helpful research reply");
  });

  it("handles an API failure without crashing", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network")));
    act(() => root.render(<ContextualResearchPanel {...base} />));
    const input = container.querySelector(
      '[data-testid="research-input"]',
    ) as HTMLTextAreaElement;
    await act(async () => type(input, "help"));
    const ask = [...container.querySelectorAll("button")].find(
      (b) => b.textContent === "Ask",
    ) as HTMLButtonElement;
    await act(async () => {
      ask.click();
    });
    expect(container.textContent).toMatch(/couldn't reach|try again/i);
  });
});
