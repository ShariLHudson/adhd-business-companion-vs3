/**
 * @vitest-environment jsdom
 */
import { beforeEach, describe, expect, it } from "vitest";
import {
  FIRST_WRITING_PAGE_INDEX,
  LAST_WRITING_PAGE_INDEX,
  MAX_JOURNAL_WRITING_PAGES,
  getLastWrittenPageIndex,
  resetJournalPageStorage,
  resolveResumePageIndex,
  saveJournalPlace,
  savePageBody,
} from "./journalPageStorage";

describe("journal resume + page limit", () => {
  beforeEach(() => {
    resetJournalPageStorage();
    window.localStorage.clear();
  });

  it("caps a journal at 200 writing pages", () => {
    expect(MAX_JOURNAL_WRITING_PAGES).toBe(200);
    expect(LAST_WRITING_PAGE_INDEX).toBe(200);
    expect(FIRST_WRITING_PAGE_INDEX).toBe(1);
  });

  it("resumes at the last page that still has writing", () => {
    savePageBody("j1", 1, "<p>first</p>");
    savePageBody("j1", 5, "<p>later thoughts</p>");
    savePageBody("j1", 6, "<p><br></p>");
    saveJournalPlace("j1", { pageIndex: 2 });

    expect(getLastWrittenPageIndex("j1")).toBe(5);
    expect(resolveResumePageIndex("j1")).toBe(5);
  });

  it("prefers a later saved place when it is ahead of written pages", () => {
    savePageBody("j1", 1, "<p>start</p>");
    saveJournalPlace("j1", { pageIndex: 12 });
    expect(resolveResumePageIndex("j1")).toBe(12);
  });

  it("never resumes past the last writing page", () => {
    saveJournalPlace("j1", { pageIndex: 999 });
    expect(resolveResumePageIndex("j1")).toBe(LAST_WRITING_PAGE_INDEX);
  });
});
