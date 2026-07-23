/**
 * @vitest-environment jsdom
 */
import { beforeEach, describe, expect, it } from "vitest";
import {
  getPageBody,
  resetJournalPageStorage,
  savePageBody,
} from "./journalPageStorage";

describe("journal page body wipe guard", () => {
  beforeEach(() => {
    resetJournalPageStorage();
    window.localStorage.clear();
  });

  it("keeps existing writing when an empty save races in", () => {
    savePageBody("j1", 1, "<p>my real thoughts</p>");
    savePageBody("j1", 1, "");
    savePageBody("j1", 1, "<p><br></p>");
    expect(getPageBody("j1", 1)).toContain("my real thoughts");
  });

  it("allows a real empty wipe only when explicitly opted in", () => {
    savePageBody("j1", 1, "<p>keep me</p>");
    savePageBody("j1", 1, "", { allowEmptyWipe: true });
    expect(getPageBody("j1", 1)).toBe("");
  });

  it("still accepts new writing over empty pages", () => {
    savePageBody("j1", 2, "<p><br></p>");
    savePageBody("j1", 2, "<p>fresh page</p>");
    expect(getPageBody("j1", 2)).toContain("fresh page");
  });

  it("still accepts edits that replace writing with other writing", () => {
    savePageBody("j1", 3, "<p>first draft</p>");
    savePageBody("j1", 3, "<p>revised draft</p>");
    expect(getPageBody("j1", 3)).toContain("revised draft");
  });
});
