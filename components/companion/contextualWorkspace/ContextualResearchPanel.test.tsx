/**
 * @vitest-environment jsdom
 */
import { useState } from "react";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  ContextualResearchPanel,
  type ContextualResearchMessage,
} from "./ContextualResearchPanel";

function type(el: HTMLTextAreaElement, value: string) {
  const setter = Object.getOwnPropertyDescriptor(
    window.HTMLTextAreaElement.prototype,
    "value",
  )!.set!;
  setter.call(el, value);
  el.dispatchEvent(new Event("input", { bubbles: true }));
}

/**
 * Host-simulating harness: the panel is controlled, so this owns the per-key
 * thread map and the added-response ids exactly like the builder does — proving
 * threads persist across close/reopen and switching keys, and that dedup works.
 */
function Harness(props: {
  open?: boolean;
  questionKey?: string;
  questionLabel?: string;
  autoPrompt?: string;
  addLabel?: string;
  addAllLabel?: string;
  addedLabel?: string;
  onAddResponseSpy?: (m: ContextualResearchMessage) => void;
  onAddSessionSpy?: () => void;
}) {
  const key = props.questionKey ?? "painPoints";
  const [threads, setThreads] = useState<
    Record<string, ContextualResearchMessage[]>
  >({});
  const [added, setAdded] = useState<string[]>([]);
  const messages = threads[key] ?? [];
  return (
    <ContextualResearchPanel
      open={props.open ?? true}
      onToggle={() => {}}
      questionKey={key}
      questionLabel={props.questionLabel ?? "What are they struggling with most?"}
      systemPrompt="scoped prompt"
      autoPrompt={props.autoPrompt ?? "AUTO please research this question"}
      messages={messages}
      onMessagesChange={(next) => setThreads((t) => ({ ...t, [key]: next }))}
      addedResponseIds={added}
      onAddResponse={(m) => {
        props.onAddResponseSpy?.(m);
        setAdded((a) => (a.includes(m.id) ? a : [...a, m.id]));
      }}
      onAddSession={() => {
        props.onAddSessionSpy?.();
        setAdded((a) => {
          const ids = messages
            .filter(
              (x) =>
                x.role === "assistant" &&
                !x.error &&
                !x.hidden &&
                !a.includes(x.id),
            )
            .map((x) => x.id);
          return [...a, ...ids];
        });
      }}
      addLabel={props.addLabel}
      addAllLabel={props.addAllLabel}
      addedLabel={props.addedLabel}
    />
  );
}

describe("ContextualResearchPanel (controlled, persistent threads)", () => {
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
      Promise.resolve({ json: async () => ({ message: `REPLY-${++n}` }) }),
    );
    vi.stubGlobal("fetch", fetchMock);
    return fetchMock;
  }

  async function render(props: Parameters<typeof Harness>[0] = {}) {
    await act(async () => {
      root.render(<Harness {...props} />);
    });
    await flush();
  }

  it("auto-researches on open when the thread is empty, without the member typing", async () => {
    const fetchMock = mockReplies();
    await render();
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const body = JSON.parse(fetchMock.mock.calls[0]![1]!.body as string);
    expect(body.messages[0].content).toContain("AUTO please research");
    expect(body.systemPromptOverride).toBe("scoped prompt");
    expect(container.textContent).toContain("REPLY-1");
    expect(container.textContent).not.toContain("AUTO please research");
  });

  it("auto-researches only once across close/reopen (thread persists)", async () => {
    const fetchMock = mockReplies();
    await render({ open: true });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    await render({ open: false });
    await render({ open: true });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    // The restored thread is still shown.
    expect(container.textContent).toContain("REPLY-1");
  });

  it("continues follow-ups in the same thread", async () => {
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
    expect(body2.messages.at(-1).content).toBe("a follow-up");
    expect(container.textContent).toContain("REPLY-2");
  });

  it("gives a different key its own separate thread", async () => {
    const fetchMock = mockReplies();
    await render({ questionKey: "painPoints" });
    expect(container.textContent).toContain("REPLY-1");
    await render({ questionKey: "goals", questionLabel: "What are they after?" });
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(container.textContent).toContain("REPLY-2");
    expect(container.textContent).not.toContain("REPLY-1");
  });

  it("Add This Response passes the response and then shows the added state", async () => {
    mockReplies();
    const onAddResponseSpy = vi.fn();
    await render({ onAddResponseSpy, addedLabel: "Added to your answer ✓" });
    const add = container.querySelector(
      '[data-testid="research-add-to-answer"]',
    ) as HTMLButtonElement;
    await act(async () => add.click());
    await flush();
    expect(onAddResponseSpy).toHaveBeenCalledTimes(1);
    expect(onAddResponseSpy.mock.calls[0]![0].content).toBe("REPLY-1");
    // After adding, the response shows the confirmation and no add button.
    expect(container.textContent).toContain("Added to your answer ✓");
    expect(
      container.querySelector('[data-testid="research-add-to-answer"]'),
    ).toBeNull();
  });

  it("offers Add Entire Research Session and invokes the session handler", async () => {
    mockReplies();
    const onAddSessionSpy = vi.fn();
    await render({ onAddSessionSpy });
    const addAll = container.querySelector(
      '[data-testid="research-add-session"]',
    ) as HTMLButtonElement;
    expect(addAll).toBeTruthy();
    await act(async () => addAll.click());
    expect(onAddSessionSpy).toHaveBeenCalledTimes(1);
  });

  it("Keep Researching leaves the answer unchanged", async () => {
    mockReplies();
    const onAddResponseSpy = vi.fn();
    await render({ onAddResponseSpy });
    const keep = container.querySelector(
      '[data-testid="research-keep-researching"]',
    ) as HTMLButtonElement;
    await act(async () => keep.click());
    expect(onAddResponseSpy).not.toHaveBeenCalled();
  });

  it("on failure keeps the panel open with Try Again and no add action", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network")));
    const onAddResponseSpy = vi.fn();
    await render({ onAddResponseSpy });
    expect(
      container.querySelector('[data-testid="research-try-again"]'),
    ).toBeTruthy();
    expect(
      container.querySelector('[data-testid="research-add-to-answer"]'),
    ).toBeNull();
    expect(onAddResponseSpy).not.toHaveBeenCalled();
  });

  it("uses Step 10 add wording when provided", async () => {
    mockReplies();
    await render({
      addLabel: "Add This Response to This Area",
      addAllLabel: "Add Entire Research Session to This Area",
    });
    const add = container.querySelector(
      '[data-testid="research-add-to-answer"]',
    ) as HTMLButtonElement;
    expect(add.textContent).toBe("Add This Response to This Area");
    const addAll = container.querySelector(
      '[data-testid="research-add-session"]',
    ) as HTMLButtonElement;
    expect(addAll.textContent).toBe("Add Entire Research Session to This Area");
  });
});
