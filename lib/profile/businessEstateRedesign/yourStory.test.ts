/**
 * @vitest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  YOUR_STORY_QUESTIONS,
  isYourStoryComplete,
  readYourStoryField,
  saveYourStoryAnswer,
  yourStoryProgress,
} from "./yourStory";
import { getBusinessEstateSections } from "@/lib/profile/businessEstateProfile";

describe("Your Story (Phase C — guided over existing identity fields)", () => {
  beforeEach(() => window.localStorage.clear());
  afterEach(() => window.localStorage.clear());

  it("walks exactly the existing identity story fields (no new storage)", () => {
    expect(YOUR_STORY_QUESTIONS.map((q) => q.fieldKey)).toEqual([
      "businessStory",
      "whatInspiredYou",
      "whatHelpsYouContinue",
    ]);
  });

  it("starts empty and reports incomplete", () => {
    const p = yourStoryProgress();
    expect(p.answered).toBe(0);
    expect(p.complete).toBe(false);
    expect(isYourStoryComplete()).toBe(false);
  });

  it("saves answers onto the estate identity section and tracks progress", () => {
    saveYourStoryAnswer("businessStory", "It began as a side project.");
    expect(readYourStoryField("businessStory")).toBe(
      "It began as a side project.",
    );
    expect(getBusinessEstateSections().identity.businessStory).toBe(
      "It began as a side project.",
    );
    expect(yourStoryProgress().answered).toBe(1);

    saveYourStoryAnswer("whatInspiredYou", "A gap I kept hitting.");
    saveYourStoryAnswer("whatHelpsYouContinue", "The people I help.");
    expect(isYourStoryComplete()).toBe(true);
  });

  it("ignores empty answers", () => {
    saveYourStoryAnswer("businessStory", "   ");
    expect(yourStoryProgress().answered).toBe(0);
  });
});
