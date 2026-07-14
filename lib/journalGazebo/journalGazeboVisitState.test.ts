/**
 * @vitest-environment jsdom
 */
import { beforeEach, describe, expect, it } from "vitest";
import {
  createJournalConfig,
  hasJournalCreated,
  hasJournalGazeboVisited,
  isFirstJournalGazeboVisit,
  markJournalGazeboVisited,
  resetJournalGazeboConfigs,
  resetJournalGazeboSessionState,
} from "@/lib/journalGazebo/store";

describe("Journal Gazebo visit persistence", () => {
  beforeEach(() => {
    resetJournalGazeboSessionState();
    resetJournalGazeboConfigs();
    window.localStorage.clear();
    window.sessionStorage.clear();
  });

  it("treats a fresh session as first visit", () => {
    expect(isFirstJournalGazeboVisit()).toBe(true);
    expect(hasJournalGazeboVisited()).toBe(false);
    expect(hasJournalCreated()).toBe(false);
  });

  it("persists visited across reload-style re-reads", () => {
    markJournalGazeboVisited();
    expect(isFirstJournalGazeboVisit()).toBe(false);
    expect(hasJournalGazeboVisited()).toBe(true);

    const raw = window.localStorage.getItem("companion-journal-gazebo-session-v1");
    expect(raw).toBeTruthy();
    expect(raw).toContain('"journalGazeboVisited":true');
    expect(raw).toContain('"hasSeenWelcomeNote":true');
  });

  it("marks journalCreated when a journal is created", () => {
    createJournalConfig({ name: "Business Journal" });
    expect(hasJournalCreated()).toBe(true);
    const raw = window.localStorage.getItem("companion-journal-gazebo-session-v1");
    expect(raw).toContain('"journalCreated":true');
  });

  it("treats existing journals as returning even without visited flag", () => {
    resetJournalGazeboConfigs();
    resetJournalGazeboSessionState();
    window.localStorage.setItem(
      "companion-journal-gazebo-configs-v1",
      JSON.stringify([
        {
          id: "j1",
          name: "Ideas Journal",
          embossedTitle: "Ideas Journal",
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
        },
      ]),
    );
    expect(isFirstJournalGazeboVisit()).toBe(false);
  });
});
