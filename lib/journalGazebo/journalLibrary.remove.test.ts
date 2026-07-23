/**
 * @vitest-environment jsdom
 */
import { beforeEach, describe, expect, it } from "vitest";
import {
  getLibraryJournals,
  removeJournalFromLibrary,
} from "./journalLibrary";
import {
  getPageBody,
  resetJournalPageStorage,
  savePageBody,
} from "./journalPageStorage";
import {
  createJournalConfig,
  getJournalConfigById,
  resetJournalGazeboConfigs,
  resetJournalGazeboSessionState,
} from "./store";

describe("removeJournalFromLibrary", () => {
  beforeEach(() => {
    resetJournalPageStorage();
    resetJournalGazeboConfigs();
    resetJournalGazeboSessionState();
    window.localStorage.clear();
  });

  it("removes the journal config and its saved pages", () => {
    const keep = createJournalConfig({ name: "Keep Me" });
    const drop = createJournalConfig({ name: "Old Draft" });
    savePageBody(drop.id, 1, "<p>temporary words</p>");
    savePageBody(keep.id, 1, "<p>keep these</p>");

    expect(removeJournalFromLibrary(drop.id)).toBe(true);
    expect(getJournalConfigById(drop.id)).toBeNull();
    expect(getPageBody(drop.id, 1)).toBe("");
    expect(getJournalConfigById(keep.id)?.id).toBe(keep.id);
    expect(getPageBody(keep.id, 1)).toContain("keep these");
    expect(getLibraryJournals().map((j) => j.id)).toEqual([keep.id]);
  });
});
