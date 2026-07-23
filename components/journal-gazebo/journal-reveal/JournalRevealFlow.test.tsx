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
  name: "My Journey",
  embossedTitle: "My Journey",
  leatherColor: "forest",
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

describe("JournalRevealFlow physical gift", () => {
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

  function state() {
    return container
      .querySelector("[data-testid='journal-reveal-flow']")
      ?.getAttribute("data-reveal-state");
  }

  function tick(ms: number) {
    act(() => {
      vi.advanceTimersByTime(ms);
    });
  }

  function unwrapToAdmire() {
    clickTestId("journal-reveal-gift-button");
    expect(state()).toBe("ribbon-pull");
    clickTestId("journal-reveal-ribbon-drag");
    expect(state()).toBe("bow");
    // bow 1600 → ribbon 1500 → unwrap 2400 → reveal 2200
    tick(1600);
    expect(state()).toBe("ribbon");
    tick(1500);
    expect(state()).toBe("unwrap");
    tick(2400);
    expect(state()).toBe("reveal");
    tick(2200);
    expect(state()).toBe("admire");
  }

  it("shows a physical wrapped gift on the desk — not panel dots", () => {
    act(() => {
      root.render(
        <JournalRevealFlow
          journal={sampleJournal}
          isFirstCreation
          onComplete={() => {}}
        />,
      );
    });
    expect(state()).toBe("wrapped");
    expect(container.textContent).toContain("Your journal is ready");
    expect(container.textContent).toContain("Open your gift");
    expect(
      container.querySelector("[data-testid='journal-physical-gift']"),
    ).toBeTruthy();
    expect(
      container.querySelector("[data-testid='journal-reveal-dots']"),
    ).toBeFalsy();
    expect(
      container.querySelector(".jg-cinematic-gift__package-photo"),
    ).toBeTruthy();
    expect(
      container.querySelector(".jg-cinematic-gift--layered"),
    ).toBeTruthy();
    expect(container.querySelector(".jg-cinematic-gift__wrap")).toBeTruthy();
  });

  it("skip returns skipped meta", () => {
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
    expect(onComplete).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "journal-reveal-test",
        leatherColor: "forest",
        name: "My Journey",
      }),
      { skipped: true, opened: false },
    );
  });

  it("reveals the selected cover color and title", () => {
    act(() => {
      root.render(
        <JournalRevealFlow
          journal={sampleJournal}
          isFirstCreation={false}
          onComplete={() => {}}
        />,
      );
    });
    unwrapToAdmire();
    const gift = container.querySelector("[data-testid='journal-physical-gift']");
    expect(gift?.getAttribute("data-leather")).toBe("forest");
    expect(gift?.getAttribute("data-gift-moment")).toBe("admire");
    expect(container.textContent).toContain("My Journey");
    expect(
      container.querySelector(".jg-cinematic-gift__journal-cover--clickable"),
    ).toBeTruthy();
  });

  it("opens the journal and completes with opened:true", () => {
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
    unwrapToAdmire();
    clickTestId("journal-reveal-open-journal");
    expect(state()).toBe("opening");
    tick(1600);
    expect(onComplete).toHaveBeenCalledWith(sampleJournal, {
      skipped: false,
      opened: true,
    });
  });
});

describe("Journal reveal Experience wiring", () => {
  it("mounts physical gift layer and hands off to writing", () => {
    const source = readFileSync(
      join(process.cwd(), "components/journal-gazebo/JournalGazeboExperience.tsx"),
      "utf8",
    );
    expect(source).toContain("JournalRevealFlow");
    expect(source).toContain("enterWritingAfterGiftReveal");
    expect(source).toContain("journal-estate--physical-gift");
    expect(source).toContain("handleJournalRevealComplete");
  });

  it("Dear Friend stays on the open book; Begin writing is only in page nav", () => {
    const openBook = readFileSync(
      join(process.cwd(), "components/journal-gazebo/JournalGazeboOpenBook.tsx"),
      "utf8",
    );
    expect(openBook).toContain("FirstOpenWelcomePage");
    expect(openBook).not.toContain("jg-begin-writing");
    expect(openBook).toContain('nextLabel={pageIndex === 0 ? "Begin writing" : "Next"}');
    expect(openBook).toContain('setTurning("forward")');
    expect(openBook).toContain('setTurning("back")');
  });
});
