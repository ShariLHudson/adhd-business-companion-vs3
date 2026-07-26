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

describe("ContextualResearchPanel (refined flow)", () => {
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

  async function flush() {
    await act(async () => {
      await new Promise((r) => setTimeout(r, 0));
    });
  }

  function mockReplies() {
    let n = 0;
    const fetchMock = vi.fn().mockImplementation(() =>
      Promise.resolve({
        json: async () => ({ message: `REPLY-${++n}` }),
      }),
    );
    vi.stubGlobal("fetch", fetchMock);
    return fetchMock;
  }

  const base = {
    open: true,
    onToggle: vi.fn(),
    questionKey: "painPoints",
    questionLabel: "What are they struggling with most?",
    systemPrompt: "scoped prompt",
    autoPrompt: "AUTO please research this question",
  };

  async function render(props: Partial<typeof base> & Record<string, unknown> = {}) {
    await act(async () => {
      root.render(<ContextualResearchPanel {...base} {...props} />);
    });
    await flush();
  }

  it("automatically submits the active question on open, without the member typing", async () => {
    const fetchMock = mockReplies();
    await render();
    // The auto request was sent (member typed nothing).
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const body = JSON.parse(fetchMock.mock.calls[0]![1]!.body as string);
    expect(body.messages[0].content).toContain("AUTO please research");
    expect(body.systemPromptOverride).toBe("scoped prompt");
    // The reply is shown; the auto request itself is not shown as a user message.
    expect(container.textContent).toContain("REPLY-1");
    expect(container.textContent).not.toContain("AUTO please research");
  });

  it("auto-researches only once per question across close/reopen", async () => {
    const fetchMock = mockReplies();
    await render();
    expect(fetchMock).toHaveBeenCalledTimes(1);
    await render({ open: false });
    await render({ open: true });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("continues follow-ups in the same question-scoped thread", async () => {
    const fetchMock = mockReplies();
    await render();
    const input = container.querySelector(
      '[data-testid="research-input"]',
    ) as HTMLTextAreaElement;
    await act(async () => type(input, "a follow-up"));
    const ask = [...container.querySelectorAll("button")].find(
      (b) => b.textContent === "Ask",
    ) as HTMLButtonElement;
    await act(async () => ask.click());
    await flush();
    expect(fetchMock).toHaveBeenCalledTimes(2);
    const body2 = JSON.parse(fetchMock.mock.calls[1]![1]!.body as string);
    // Thread carries the prior auto turn + reply + the new follow-up.
    expect(body2.messages.length).toBeGreaterThan(2);
    expect(body2.messages.at(-1).content).toBe("a follow-up");
    expect(container.textContent).toContain("REPLY-2");
  });

  it("gives a new question its own separate automatic thread", async () => {
    const fetchMock = mockReplies();
    await render({ questionKey: "painPoints" });
    expect(container.textContent).toContain("REPLY-1");
    await render({
      questionKey: "goals",
      questionLabel: "What are they trying to achieve?",
    });
    expect(fetchMock).toHaveBeenCalledTimes(2);
    // The new question shows its own reply, not the prior question's.
    expect(container.textContent).toContain("REPLY-2");
    expect(container.textContent).not.toContain("REPLY-1");
  });

  it("Add to Answer appends only the selected reply", async () => {
    mockReplies();
    const onAddToAnswer = vi.fn();
    await render({ onAddToAnswer });
    const add = container.querySelector(
      '[data-testid="research-add-to-answer"]',
    ) as HTMLButtonElement;
    await act(async () => add.click());
    expect(onAddToAnswer).toHaveBeenCalledTimes(1);
    expect(onAddToAnswer).toHaveBeenCalledWith("REPLY-1");
  });

  it("Keep Researching leaves the answer unchanged", async () => {
    mockReplies();
    const onAddToAnswer = vi.fn();
    await render({ onAddToAnswer });
    const keep = container.querySelector(
      '[data-testid="research-keep-researching"]',
    ) as HTMLButtonElement;
    await act(async () => keep.click());
    expect(onAddToAnswer).not.toHaveBeenCalled();
  });

  it("on failure keeps the panel open with Try Again and no Add to Answer", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network")));
    const onAddToAnswer = vi.fn();
    await render({ onAddToAnswer });
    expect(container.querySelector('[data-testid="research-try-again"]')).toBeTruthy();
    expect(
      container.querySelector('[data-testid="research-add-to-answer"]'),
    ).toBeNull();
    expect(onAddToAnswer).not.toHaveBeenCalled();
  });
});
