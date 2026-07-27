/**
 * @vitest-environment jsdom
 */
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { runResearchMock, chatSpy } = vi.hoisted(() => ({
  runResearchMock: vi.fn(async (req: { mode: string; builtInGuidance?: unknown[] }) =>
    req.mode === "sources"
      ? {
          mode: "sources",
          reply: "",
          findings: [],
          providerUnavailable: true,
          notice: "Live web research isn't connected yet, so I can't pull real sources.",
        }
      : {
          mode: "explore",
          reply: "Here are useful frameworks.",
          findings: req.builtInGuidance ?? [],
        },
  ),
  chatSpy: vi.fn(async () => "unused"),
}));

vi.mock("@/lib/research/researchEngine", async (importActual) => {
  const actual = await importActual<typeof import("@/lib/research/researchEngine")>();
  return {
    ...actual,
    runResearch: (...args: unknown[]) => runResearchMock(args[0] as never),
    createDefaultChatProvider: () => chatSpy,
  };
});

import { ResearchLibraryPanel } from "./ResearchLibraryPanel";

let container: HTMLDivElement;
let root: Root;

beforeEach(() => {
  window.localStorage.clear();
  runResearchMock.mockClear();
  chatSpy.mockClear();
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
});
afterEach(() => {
  act(() => root.unmount());
  container.remove();
  window.localStorage.clear();
});

const q = (sel: string) => container.querySelector(sel);

function render() {
  act(() => {
    root.render(<ResearchLibraryPanel />);
  });
}
function typeTopic(value: string) {
  const input = q('[data-testid="research-library-input"]') as HTMLTextAreaElement;
  const setter = Object.getOwnPropertyDescriptor(
    window.HTMLTextAreaElement.prototype,
    "value",
  )!.set!;
  act(() => {
    setter.call(input, value);
    input.dispatchEvent(new Event("input", { bubbles: true }));
  });
}
function click(testid: string) {
  act(() => {
    (q(`[data-testid="${testid}"]`) as HTMLButtonElement).dispatchEvent(
      new MouseEvent("click", { bubbles: true }),
    );
  });
}
async function flush() {
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();
  });
}

describe("ResearchLibraryPanel (RL-2 — shared engine + panel)", () => {
  it("Explore routes through runResearch with topic-pack built_in_guidance, in the shared panel", async () => {
    render();
    typeTopic("How do I start a podcast?");
    click("research-library-explore");
    await flush();

    // Conversation now uses the shared ContextualResearchPanel.
    expect(q('[data-testid="research-library-conversation"]')).not.toBeNull();
    expect(q('[data-testid="research-this-question-toggle"]')).not.toBeNull();

    const exploreCall = runResearchMock.mock.calls.find(
      (c) => (c[0] as { mode: string }).mode === "explore",
    );
    expect(exploreCall).toBeTruthy();
    const req = exploreCall![0] as {
      mode: string;
      systemPrompt: string;
      builtInGuidance: unknown[];
    };
    expect(typeof req.systemPrompt).toBe("string");
    expect(Array.isArray(req.builtInGuidance)).toBe(true);
    expect(req.builtInGuidance.length).toBeGreaterThan(0);
    // No Research Library assumptions leak into the engine request shape.
    expect(Object.keys(req).sort()).toEqual([
      "builtInGuidance",
      "messages",
      "mode",
      "systemPrompt",
    ]);
  });

  it("Sources is honestly unavailable and never falls back to Explore", async () => {
    render();
    typeTopic("medicare enrollment");
    click("research-library-sources");
    await flush();

    expect(q('[data-testid="research-library-sources-unavailable"]')).not.toBeNull();
    expect(container.textContent).toMatch(/isn't connected yet/i);

    expect(
      runResearchMock.mock.calls.some((c) => (c[0] as { mode: string }).mode === "sources"),
    ).toBe(true);
    // No silent fallback to Explore.
    expect(
      runResearchMock.mock.calls.some((c) => (c[0] as { mode: string }).mode === "explore"),
    ).toBe(false);
    // No synthetic source strings rendered.
    expect(container.textContent).not.toContain("Spark Estate stable knowledge");
  });
});
