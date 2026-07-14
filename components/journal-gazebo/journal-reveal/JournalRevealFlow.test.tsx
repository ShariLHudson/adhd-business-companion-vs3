/**
 * @vitest-environment jsdom
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { JournalGazeboConfig } from "@/lib/journalGazebo/types";
import { JournalRevealFlow } from "./JournalRevealFlow";

vi.mock("framer-motion", async () => {
  const actual = await vi.importActual<typeof import("framer-motion")>(
    "framer-motion",
  );
  return {
    ...actual,
    useReducedMotion: () => false,
  };
});

const sampleJournal: JournalGazeboConfig = {
  id: "journal-reveal-test",
  name: "Morning Pages",
  embossedTitle: "Morning Pages",
  leatherColor: "cognac",
  showSparkFlame: true,
  coverImageKind: "none",
  paperStyle: "cream",
  fontId: "caveat",
  inkColor: "charcoal",
  penStyle: "fountain",
  nibSize: "medium",
  writingMode: "silent",
  createdAt: "2026-07-14T00:00:00.000Z",
  updatedAt: "2026-07-14T00:00:00.000Z",
};

describe("JournalRevealFlow", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    (
      globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }
    ).IS_REACT_ACT_ENVIRONMENT = true;
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
    vi.useFakeTimers();
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    container.remove();
    vi.useRealTimers();
  });

  function clickTestId(id: string) {
    const el = container.querySelector<HTMLElement>(`[data-testid='${id}']`);
    expect(el, id).toBeTruthy();
    act(() => {
      el!.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
  }

  it("starts full wrapping for first creation", () => {
    act(() => {
      root.render(
        <JournalRevealFlow
          journal={sampleJournal}
          isFirstCreation
          onComplete={() => {}}
        />,
      );
    });
    const flow = container.querySelector("[data-testid='journal-reveal-flow']");
    expect(flow?.getAttribute("data-reveal-state")).toBe("creating");
    expect(
      container.querySelector("[data-testid='journal-reveal-wrapping']"),
    ).toBeTruthy();
    expect(
      container.querySelector("[data-testid='journal-reveal-skip']"),
    ).toBeTruthy();
  });

  it("shortens returning creations to the wrapped gift", () => {
    act(() => {
      root.render(
        <JournalRevealFlow
          journal={sampleJournal}
          isFirstCreation={false}
          onComplete={() => {}}
        />,
      );
    });
    expect(
      container
        .querySelector("[data-testid='journal-reveal-flow']")
        ?.getAttribute("data-reveal-state"),
    ).toBe("wrapped");
    expect(container.textContent).toContain("Your journal is ready");
    expect(container.textContent).toContain("Open your gift");
  });

  it("skip transitions with journal data and skipped meta", () => {
    const onComplete = vi.fn();
    act(() => {
      root.render(
        <JournalRevealFlow
          journal={sampleJournal}
          isFirstCreation={false}
          onComplete={onComplete}
        />,
      );
    });
    clickTestId("journal-reveal-skip");
    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(onComplete.mock.calls[0]?.[0]).toMatchObject({
      id: "journal-reveal-test",
      name: "Morning Pages",
      leatherColor: "cognac",
    });
    expect(onComplete.mock.calls[0]?.[1]).toEqual({
      skipped: true,
      opened: false,
    });
  });

  it("shows selected cover title on journal reveal", () => {
    act(() => {
      root.render(
        <JournalRevealFlow
          journal={sampleJournal}
          isFirstCreation={false}
          onComplete={() => {}}
        />,
      );
    });

    clickTestId("journal-reveal-gift-button");

    const state = container
      .querySelector("[data-testid='journal-reveal-flow']")
      ?.getAttribute("data-reveal-state");

    if (state === "unwrapping") {
      clickTestId("journal-reveal-unwrap-ribbon");
      clickTestId("journal-reveal-unwrap-paper");
      clickTestId("journal-reveal-unwrap-lid");
    }

    expect(
      container
        .querySelector("[data-testid='journal-reveal-flow']")
        ?.getAttribute("data-reveal-state"),
    ).toBe("revealed");
    expect(container.textContent).toContain("Your journal is here.");
    expect(container.textContent).toContain("Morning Pages");
  });

  it("opens into completion with opened:true after journal click", () => {
    const onComplete = vi.fn();
    act(() => {
      root.render(
        <JournalRevealFlow
          journal={sampleJournal}
          isFirstCreation={false}
          onComplete={onComplete}
        />,
      );
    });

    clickTestId("journal-reveal-gift-button");
    if (
      container
        .querySelector("[data-testid='journal-reveal-flow']")
        ?.getAttribute("data-reveal-state") === "unwrapping"
    ) {
      clickTestId("journal-reveal-unwrap-ribbon");
      clickTestId("journal-reveal-unwrap-paper");
      clickTestId("journal-reveal-unwrap-lid");
    }

    clickTestId("journal-reveal-open-journal");
    expect(
      container.querySelector("[data-testid='journal-reveal-opening']"),
    ).toBeTruthy();

    act(() => {
      vi.runAllTimers();
    });

    expect(onComplete).toHaveBeenCalledWith(sampleJournal, {
      skipped: false,
      opened: true,
    });
  });
});

describe("Journal reveal Experience wiring", () => {
  it("mounts JournalRevealFlow after design complete and opens Gazebo path", () => {
    const source = readFileSync(
      join(process.cwd(), "components/journal-gazebo/JournalGazeboExperience.tsx"),
      "utf8",
    );
    expect(source).toContain('from "./journal-reveal"');
    expect(source).toContain("JournalRevealFlow");
    expect(source).toContain("handleJournalRevealComplete");
    expect(source).toContain("openSelectedJournal(journal)");
    expect(source).toContain('setPhase("gazebo-rest")');
    expect(source).not.toContain("JournalGazeboWrappedGift config={config}");
    expect(source).toContain("giftRevealIsFirstCreation");
    expect(source).toContain("isFirstCreation={giftRevealIsFirstCreation}");
  });

  it("does not import a separate generic journal editor for the reveal handoff", () => {
    const source = readFileSync(
      join(process.cwd(), "components/journal-gazebo/JournalGazeboExperience.tsx"),
      "utf8",
    );
    expect(source).not.toMatch(/content-generator|GrowthJournalEditor|generic.?editor/i);
    expect(source).toContain("JournalGazeboOpenBook");
    expect(source).toContain("JournalGazeboWritingPage");
  });
});
