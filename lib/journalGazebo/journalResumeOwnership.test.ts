/**
 * @vitest-environment jsdom
 */
import { beforeEach, describe, expect, it } from "vitest";
import {
  FIRST_WRITING_PAGE_INDEX,
  getPageBody,
  journalHasResumableWriting,
  resetJournalPageStorage,
  resolveResumePageIndex,
  saveJournalPlace,
  savePageBody,
} from "./journalPageStorage";

describe("journal resume ownership", () => {
  beforeEach(() => {
    resetJournalPageStorage();
    window.localStorage.clear();
    window.sessionStorage.clear();
  });

  it("detects resumable writing even when ceremony flag was lost", () => {
    savePageBody("j1", 1, "<p>words I already wrote</p>");
    saveJournalPlace("j1", { pageIndex: 1 });
    expect(journalHasResumableWriting("j1")).toBe(true);
    expect(resolveResumePageIndex("j1")).toBe(1);
    expect(getPageBody("j1", 1)).toContain("words I already wrote");
  });

  it("resumes a later bookmarked page with writing", () => {
    savePageBody("j1", 1, "<p>page one</p>");
    savePageBody("j1", 4, "<p>page four</p>");
    saveJournalPlace("j1", { pageIndex: 4 });
    expect(resolveResumePageIndex("j1")).toBe(4);
    expect(journalHasResumableWriting("j1")).toBe(true);
  });

  it("keeps writing in memory when localStorage throws quota errors", () => {
    const originalSet = Storage.prototype.setItem;
    Storage.prototype.setItem = function setItemBlocked(
      this: Storage,
      key: string,
      value: string,
    ) {
      if (this === window.localStorage) {
        throw new DOMException("QuotaExceededError");
      }
      return originalSet.call(this, key, value);
    };
    try {
      savePageBody("j2", FIRST_WRITING_PAGE_INDEX, "<p>still here</p>");
      saveJournalPlace("j2", { pageIndex: FIRST_WRITING_PAGE_INDEX });
      expect(getPageBody("j2", FIRST_WRITING_PAGE_INDEX)).toContain("still here");
      expect(resolveResumePageIndex("j2")).toBe(FIRST_WRITING_PAGE_INDEX);
    } finally {
      Storage.prototype.setItem = originalSet;
    }
  });
});
