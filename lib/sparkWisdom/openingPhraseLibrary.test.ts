import { describe, expect, it } from "vitest";
import {
  openingPhraseCount,
  OPENING_PHRASE_LIBRARY,
  pickOpeningPhrase,
  pickOpeningPhraseEntry,
} from "./openingPhraseLibrary";

describe("openingPhraseLibrary", () => {
  it("has 20–30 natural starters", () => {
    expect(openingPhraseCount()).toBeGreaterThanOrEqual(20);
    expect(openingPhraseCount()).toBeLessThanOrEqual(30);
  });

  it("picks deterministically from seed", () => {
    const a = pickOpeningPhrase("session-abc");
    const b = pickOpeningPhrase("session-abc");
    const c = pickOpeningPhrase("session-xyz");
    expect(a).toBe(b);
    expect(typeof c).toBe("string");
    expect(OPENING_PHRASE_LIBRARY.some((p) => p.text === a)).toBe(true);
  });

  it("can filter by category", () => {
    const entry = pickOpeningPhraseEntry("test", "outcome_oriented");
    expect(entry.category).toBe("outcome_oriented");
  });
});
