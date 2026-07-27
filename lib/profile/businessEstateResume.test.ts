/**
 * @vitest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  getBusinessEstateResumeSectionId,
  nextIncompleteBusinessEstateSection,
  saveBusinessEstateSection,
} from "./businessEstateProfile";

describe("Business Estate resume (Phase C, derived from sectionUpdatedAt)", () => {
  beforeEach(() => window.localStorage.clear());
  afterEach(() => {
    window.localStorage.clear();
    vi.useRealTimers();
  });

  it("returns null when nothing has been saved yet", () => {
    expect(getBusinessEstateResumeSectionId()).toBeNull();
  });

  it("resumes the section whose progress was saved most recently", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T00:00:00Z"));
    saveBusinessEstateSection("identity", { businessName: "Rivera Studio" });
    vi.setSystemTime(new Date("2026-01-02T00:00:00Z"));
    saveBusinessEstateSection("brand", { tagline: "Calm, clear, kind" });
    vi.setSystemTime(new Date("2026-01-03T00:00:00Z"));
    saveBusinessEstateSection("offers", { mainOffer: "Coaching" });

    expect(getBusinessEstateResumeSectionId()).toBe("offers");
  });

  it("nextIncomplete walks canonical order and skips saved rooms", () => {
    expect(nextIncompleteBusinessEstateSection()).toBe("identity");
    saveBusinessEstateSection("identity", { businessName: "Rivera Studio" });
    expect(nextIncompleteBusinessEstateSection()).toBe("offers");
  });
});
