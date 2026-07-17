/**
 * @vitest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  clearProfilePersonalDraft,
  loadProfilePersonalDraft,
  saveProfilePersonalDraft,
} from "@/lib/profile/profilePersonalDraft";

describe("profilePersonalDraft", () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  afterEach(() => {
    clearProfilePersonalDraft();
  });

  it("persists unsaved draft values across temporary leave", () => {
    saveProfilePersonalDraft({
      name: "Shari Hudson",
      preferredName: "Shari",
      email: "shari@example.com",
      introduction: "Still drafting this",
    });

    const draft = loadProfilePersonalDraft();
    expect(draft).toMatchObject({
      name: "Shari Hudson",
      preferredName: "Shari",
      email: "shari@example.com",
      introduction: "Still drafting this",
    });
    expect(draft?.updatedAt).toBeTruthy();
  });

  it("clears draft after save", () => {
    saveProfilePersonalDraft({
      name: "A",
      preferredName: "A",
      email: "a@example.com",
      introduction: "x",
    });
    clearProfilePersonalDraft();
    expect(loadProfilePersonalDraft()).toBeNull();
  });
});
