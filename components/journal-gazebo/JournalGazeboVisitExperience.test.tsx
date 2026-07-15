/**
 * @vitest-environment jsdom
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { JournalGazeboConfig } from "@/lib/journalGazebo/types";
import { JournalGazeboJournalPicker } from "./JournalGazeboJournalPicker";
import { JournalGazeboSanctuaryDesk } from "./JournalGazeboSanctuaryDesk";
import { JournalGazeboTableActions } from "./JournalGazeboTableActions";
import { JournalGazeboWelcomeDesk } from "./JournalGazeboWelcomeDesk";

const sample = (name: string, id: string): JournalGazeboConfig => ({
  id,
  name,
  embossedTitle: name,
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
});

describe("Journal Gazebo letter desk actions", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    (
      globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }
    ).IS_REACT_ACT_ENVIRONMENT = true;
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
  });

  it("letter desk shows Create and Write without notecard overlay", async () => {
    await act(async () => {
      root.render(
        <JournalGazeboWelcomeDesk
          journals={[sample("Becoming", "b1")]}
          onCreateJournal={() => {}}
          onOpenJournal={() => {}}
        />,
      );
    });
    expect(container.querySelector("[data-testid='jg-first-visit-desk']")).toBeTruthy();
    expect(document.querySelector("[data-testid='jg-create-new-journal']")).toBeTruthy();
    expect(document.querySelector("[data-testid='jg-write-journal']")).toBeTruthy();
    expect(document.querySelector("[data-testid='jg-welcome-letter']")).toBeNull();
    expect(document.querySelector("[data-testid='jg-return-desk-note']")).toBeNull();
    expect(document.querySelector(".jg-welcome-note")).toBeNull();
    expect(document.body.textContent).toContain("Create New Journal");
    expect(document.body.textContent).toContain("Write");
  });

  it("returning desk also shows Create and Write", async () => {
    await act(async () => {
      root.render(
        <JournalGazeboSanctuaryDesk
          journals={[sample("Business Journal", "b1")]}
          featuredJournal={sample("Business Journal", "b1")}
          sceneComposed
          onCreateJournal={() => {}}
          onOpenJournal={() => {}}
        />,
      );
    });
    expect(container.querySelector("[data-testid='jg-returning-desk']")).toBeTruthy();
    expect(document.querySelector("[data-testid='jg-create-new-journal']")).toBeTruthy();
    expect(document.querySelector("[data-testid='jg-write-journal']")).toBeTruthy();
    expect(document.querySelector("[data-testid='jg-return-desk-note']")).toBeNull();
  });

  it("Write with one journal opens it", () => {
    let opened: string | null = null;
    const journal = sample("Reflection Journal", "r1");
    act(() => {
      root.render(
        <JournalGazeboTableActions
          mode="returning"
          journals={[journal]}
          onCreateJournal={() => {}}
          onOpenJournal={(j) => {
            opened = j.id;
          }}
        />,
      );
    });
    act(() => {
      container
        .querySelector<HTMLButtonElement>("[data-testid='jg-write-journal']")
        ?.click();
    });
    expect(opened).toBe("r1");
  });

  it("Write with multiple journals shows selection", () => {
    act(() => {
      root.render(
        <JournalGazeboTableActions
          mode="returning"
          journals={[
            sample("Business Journal", "b1"),
            sample("Ideas Journal", "i1"),
            sample("Reflection Journal", "r1"),
          ]}
          onCreateJournal={() => {}}
          onOpenJournal={() => {}}
        />,
      );
    });
    act(() => {
      container
        .querySelector<HTMLButtonElement>("[data-testid='jg-write-journal']")
        ?.click();
    });
    const menu = container.querySelector("[data-testid='jg-journal-select-menu']");
    expect(menu).toBeTruthy();
    expect(menu?.textContent).toContain("Business Journal");
  });

  it("journal picker uses Choose a journal title", () => {
    act(() => {
      root.render(
        <JournalGazeboJournalPicker
          journals={[
            sample("Business Journal", "b1"),
            sample("Ideas Journal", "i1"),
          ]}
          onSelect={() => {}}
          onClose={() => {}}
        />,
      );
    });
    expect(container.textContent).toContain("Choose a journal:");
  });
});

describe("Journal Gazebo Experience visit wiring", () => {
  it("keeps letter desk framing and Create/Write wiring", () => {
    const source = readFileSync(
      join(process.cwd(), "components/journal-gazebo/JournalGazeboExperience.tsx"),
      "utf8",
    );
    expect(source).toContain("markJournalGazeboVisited");
    expect(source).toContain("JournalRevealFlow");
    expect(source).toContain("handleWelcomeCreateJournal");
    expect(source).toContain("showLetterDeskActions");
    expect(source).toContain("didRouteLetterDeskHomeRef");
    expect(source).not.toContain("JournalGazeboWelcomeNoteCard");
    expect(source).not.toContain("JournalGazeboReturnNoteCard");
    expect(source).toContain("journal-gazebo--welcome-letter");
    expect(source).toContain('phaseBackgroundScenes?.framing !== "welcome-letter"');
  });

  it("welcome desk mounts Create and Write without HTML letter", () => {
    const welcome = readFileSync(
      join(process.cwd(), "components/journal-gazebo/JournalGazeboWelcomeDesk.tsx"),
      "utf8",
    );
    expect(welcome).toContain('mode="returning"');
    expect(welcome).toContain("jg-first-visit-desk");
    expect(welcome).not.toContain("JournalGazeboWelcomeLetter");
    expect(welcome).not.toContain("JournalGazeboReturnNoteCard");
  });
});
