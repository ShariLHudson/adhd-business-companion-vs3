/**
 * @vitest-environment jsdom
 */
import { beforeEach, describe, expect, it } from "vitest";
import {
  CLEAR_MY_MIND_DRAFT_KEY,
  clearClearMyMindDraft,
  draftStatusLabel,
  loadClearMyMindDraft,
  saveClearMyMindDraft,
} from "@/lib/clearMyMind/captureDraft";
import { CLEAR_MY_MIND_WELCOME_LINES } from "@/lib/clearMyMindCopy";

describe("Clear My Mind capture draft autosave", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("exposes the final user-facing promise", () => {
    expect(CLEAR_MY_MIND_WELCOME_LINES[0]).toContain(
      "Tell me everything that’s on your mind",
    );
    expect(CLEAR_MY_MIND_WELCOME_LINES[0]).toContain(
      "I’ll safely capture your thoughts",
    );
    expect(CLEAR_MY_MIND_WELCOME_LINES[0]).toContain(
      "preserving your words",
    );
  });

  it("saves and restores unfinished input", () => {
    const saved = saveClearMyMindDraft({
      text: "finish quarterly report, call dentist",
      version: 1,
    });
    expect(saved.ok).toBe(true);
    const loaded = loadClearMyMindDraft();
    expect(loaded?.text).toBe("finish quarterly report, call dentist");
    expect(loaded?.version).toBe(1);
  });

  it("blocks stale writes from overwriting newer drafts", () => {
    saveClearMyMindDraft({ text: "newer text", version: 5 });
    const stale = saveClearMyMindDraft({ text: "stale text", version: 2 });
    expect(stale.ok).toBe(false);
    expect(stale.blockedByNewer).toBe(true);
    expect(loadClearMyMindDraft()?.text).toBe("newer text");
  });

  it("clears empty drafts and reports quiet status labels", () => {
    saveClearMyMindDraft({ text: "temp", version: 1 });
    saveClearMyMindDraft({ text: "   ", version: 2 });
    expect(localStorage.getItem(CLEAR_MY_MIND_DRAFT_KEY)).toBeNull();
    clearClearMyMindDraft();
    expect(draftStatusLabel("saving")).toBe("Saving…");
    expect(draftStatusLabel("saved")).toBe("Saved");
    expect(draftStatusLabel("error")).toMatch(/couldn’t save/i);
  });
});
