import { describe, expect, it } from "vitest";
import {
  detectBusinessEstateNavIntent,
  detectBusinessProfileNavIntent,
} from "./businessEstateNavIntent";

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

describe("detectBusinessProfileNavIntent (Phase A routing fix)", () => {
  it("recognizes completing/continuing/updating the business profile", () => {
    for (const phrase of [
      "I need to complete my business profile.",
      "Help me work on my business profile.",
      "Continue my business profile.",
      "I want to finish setting up my business.",
      "Take me back to my business information.",
      "I need to update what my business does.",
      "Let's finish my company profile.",
      "tell Spark Estate about my business",
      "complete my business estate",
      "update my business description",
    ]) {
      // These previously fell through to generic advice; now they route.
      expect(detectBusinessProfileNavIntent(phrase), phrase).toBe(true);
      expect(detectBusinessEstateNavIntent(phrase), phrase).toBe(true);
    }
  });

  it("does not treat general estate navigation as profile-specific", () => {
    for (const phrase of ["open business builder", "go to my business estate"]) {
      expect(detectBusinessProfileNavIntent(phrase), phrase).toBe(false);
    }
  });

  it("does not misroute advice, unrelated, or Client Avatar requests", () => {
    for (const phrase of [
      "how do I get more clients",
      "what's my revenue this month",
      "help me write a LinkedIn post",
      "open client avatar",
      "continue my client avatar",
    ]) {
      expect(detectBusinessProfileNavIntent(phrase), phrase).toBe(false);
    }
  });
});
