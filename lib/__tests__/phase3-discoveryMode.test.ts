import { describe, expect, test } from "vitest";
import { isDiscoveryModeQuestion } from "../messageClassification";

describe('isDiscoveryModeQuestion returns TRUE', () => {
  test.each([
    ["I don't know. what do you think"],
    ["i don't know, what do you think"],
    ["yes help me with a tagline"],
    ["what should I put here"],
    ["give me examples"],
    ["help me write this"],
    ["help me think this through"],
    ["help me come up with something"],
    ["can you help me decide"],
    ["tell me more"],
    ["suggest options"],
    ["brainstorm this with me"],
    ["what does research say"],
    ["help me brainstorm"],
    ["what would you suggest"],
  ])("is discovery: %s", (phrase) => {
    expect(isDiscoveryModeQuestion(phrase)).toBe(true);
  });
});

describe('isDiscoveryModeQuestion returns FALSE', () => {
  test.each([
    ["My ideal client is a burned-out entrepreneur"],
    ["I help solopreneurs build systems"],
    ["yes"],
    ["looks good"],
    ["add those"],
    ["these are good"],
    ["use those"],
    ["all of them"],
  ])("not discovery: %s", (phrase) => {
    expect(isDiscoveryModeQuestion(phrase)).toBe(false);
  });
});