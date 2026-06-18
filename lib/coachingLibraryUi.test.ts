import { describe, expect, it } from "vitest";
import {
  coachingLibraryCategoryCount,
  shouldUseCoachingLibraryDropdowns,
} from "./coachingLibraryUi";

describe("coachingLibraryUi", () => {
  it("uses dropdown mode when more than 8 business categories exist", () => {
    expect(coachingLibraryCategoryCount()).toBeGreaterThan(8);
    expect(shouldUseCoachingLibraryDropdowns()).toBe(true);
  });
});
