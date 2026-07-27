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
import { createResearchSession } from "@/lib/researchLibrary/session";
import {
  addFindingsToCollection,
  createResearchCollection,
  makeStableFinding,
} from "@/lib/researchLibrary/collection";
import { saveResearchCollectionRecord } from "@/lib/researchLibrary/persistence";

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

function clickButtonContaining(text: string) {
  const btn = Array.from(container.querySelectorAll("button")).find((b) =>
    (b.textContent ?? "").includes(text),
  );
  if (!btn) throw new Error(`No button containing "${text}"`);
  act(() => {
    btn.dispatchEvent(new MouseEvent("click", { bubbles: true }));
  });
}

/** A realistic pre-RL-2 collection: findings carry synthetic stable-knowledge
 * "source" metadata, exactly as the old canned path stored them. */
function seedLegacyCollection() {
  const session = createResearchSession({ text: "advisory board" });
  let collection = createResearchCollection(session);
  collection = addFindingsToCollection(collection, [
    makeStableFinding({
      title: "Advisory vs governing board",
      content: "Advisors guide; no fiduciary duty.",
      kind: "recommendation",
    }),
    makeStableFinding({
      title: "Typical advisory size",
      content: "Start with 3–5 advisors.",
      kind: "fact",
    }),
    makeStableFinding({
      title: "Common value areas",
      content: "Introductions, expertise, accountability.",
      kind: "example",
    }),
  ]);
  collection = {
    ...collection,
    userNotes: ["Ask each advisor about time commitment"],
    userHighlights: ["3–5 advisors"],
    savedFindingIds: [collection.findings[1]!.id],
  };
  saveResearchCollectionRecord(collection);
  return collection;
}

describe("ResearchLibraryPanel (RL-3 — honest collection evidence)", () => {
  it("renders a legacy stable-knowledge collection as guidance, never as citations", () => {
    const seeded = seedLegacyCollection();
    // Sanity: the legacy record really does carry synthetic source metadata.
    expect(seeded.sourceReferences).toContain("Spark Estate stable knowledge");

    render();
    clickButtonContaining("Review Saved Research");
    clickButtonContaining(seeded.title);

    const collectionEl = q(
      '[data-testid="research-library-collection"]',
    ) as HTMLElement;
    expect(collectionEl).not.toBeNull();
    const collectionText = collectionEl.textContent ?? "";

    // Important findings render through the shared evidence card as guidance.
    const cards = collectionEl.querySelectorAll(
      '[data-testid="research-finding-card"]',
    );
    expect(cards.length).toBeGreaterThan(0);
    cards.forEach((c) => {
      expect(c.getAttribute("data-evidence-basis")).toBe("built_in_guidance");
      expect(c.getAttribute("data-may-cite")).toBe("false");
    });

    // The synthetic "Sources" presentation is gone — no citations, and the
    // synthetic topic-pack source TITLE never appears. (The honest provenance
    // copy names "Spark Estate's built-in knowledge" as a label, not a source.)
    expect(collectionEl.querySelector('[data-testid="research-library-sources"]')).toBeNull();
    expect(collectionEl.querySelector('[data-testid="research-source-list"]')).toBeNull();
    expect(collectionText).not.toContain("Spark Estate stable knowledge");

    // Honest replacement label is present.
    expect(
      collectionEl.querySelector('[data-testid="research-library-guidance"]'),
    ).not.toBeNull();
    expect(collectionText).toContain("Knowledge & Frameworks");

    // Categories, notes, and highlights are preserved.
    expect(collectionText).toContain("Key Facts");
    expect(collectionText).toContain("Examples");
    expect(collectionText).toContain("Ask each advisor about time commitment");
  });
});
