import { describe, expect, it } from "vitest";
import { detectBusinessEstateNavIntent } from "./businessEstateNavIntent";

describe("detectBusinessEstateNavIntent", () => {
  it("matches explicit Business Estate / Builder navigation phrases", () => {
    for (const phrase of [
      "open business builder",
      "go to business builder",
      "take me to my business estate",
      "open my business estate",
      "help me work on my business",
      "let's work on my business",
      "manage my business",
    ]) {
      expect(detectBusinessEstateNavIntent(phrase)).toBe(true);
    }
  });

  it("does not hijack Client Avatar / People I Help language", () => {
    for (const phrase of [
      "open client avatar",
      "go to people i help",
      "help me figure out my ideal client",
      "open my icp",
    ]) {
      expect(detectBusinessEstateNavIntent(phrase)).toBe(false);
    }
  });

  it("ignores unrelated chatter", () => {
    for (const phrase of [
      "",
      "how are you today",
      "I feel overwhelmed",
      "what should I focus on first",
    ]) {
      expect(detectBusinessEstateNavIntent(phrase)).toBe(false);
    }
  });
});
