/**
 * @vitest-environment jsdom
 */
import { beforeEach, describe, expect, it } from "vitest";
import {
  clearFireBriefReadingProgressForTests,
  estimateSectionReadingMinutes,
  markBriefSectionRead,
  readBriefSectionMarks,
  readLastBriefSection,
  writeLastBriefSection,
} from "./fireBriefReadingProgress";

describe("fireBriefReadingProgress", () => {
  beforeEach(() => {
    window.localStorage.clear();
    clearFireBriefReadingProgressForTests();
  });

  it("persists last-read section for a portfolio id", () => {
    writeLastBriefSection("fire-2026-07-23", "marketing");
    expect(readLastBriefSection("fire-2026-07-23")).toBe("marketing");
    expect(readLastBriefSection("fire-other")).toBeNull();
  });

  it("tracks mark-as-read without gamification", () => {
    markBriefSectionRead("fire-2026-07-23", "executive_summary");
    markBriefSectionRead("fire-2026-07-23", "founder_alerts");
    const marks = readBriefSectionMarks("fire-2026-07-23");
    expect(marks.has("executive_summary")).toBe(true);
    expect(marks.has("founder_alerts")).toBe(true);
    expect(marks.has("marketing")).toBe(false);
  });

  it("estimates reading minutes only when content is substantial", () => {
    expect(estimateSectionReadingMinutes("too short")).toBeNull();
    const words = Array.from({ length: 200 }, () => "word").join(" ");
    expect(estimateSectionReadingMinutes(words)).toBeGreaterThanOrEqual(1);
  });
});
