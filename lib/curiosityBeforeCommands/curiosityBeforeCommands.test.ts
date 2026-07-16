/**
 * @vitest-environment jsdom
 */
import { beforeEach, describe, expect, it } from "vitest";
import {
  CURIOSITY_BEFORE_COMMANDS_PREFS_KEY,
  buildCuriosityBeforeCommandsPrompt,
  buildCuriosityBeforeCommandsPromptHint,
  curiosityCopyIsSafe,
  getCuriosityBeforeCommandsPreference,
  memberTextRequestsDirect,
  saveCuriosityBeforeCommandsPreference,
  shouldUseCuriosityBeforeCommands,
} from "@/lib/curiosityBeforeCommands";

beforeEach(() => {
  localStorage.clear();
});

describe("Curiosity Before Commands preference", () => {
  it("defaults to situational and persists mode changes", () => {
    expect(getCuriosityBeforeCommandsPreference().mode).toBe("situational");
    const saved = saveCuriosityBeforeCommandsPreference({
      mode: "curiosity-usually",
    });
    expect(saved.ok).toBe(true);
    expect(getCuriosityBeforeCommandsPreference().mode).toBe(
      "curiosity-usually",
    );
    expect(localStorage.getItem(CURIOSITY_BEFORE_COMMANDS_PREFS_KEY)).toBeTruthy();
  });

  it("rejects stale version writes", () => {
    const first = saveCuriosityBeforeCommandsPreference({ mode: "mix" });
    expect(first.ok).toBe(true);
    if (!first.ok) return;
    const rejected = saveCuriosityBeforeCommandsPreference({
      mode: "direct",
      version: first.preference.version - 1,
    });
    expect(rejected.ok).toBe(false);
    expect(getCuriosityBeforeCommandsPreference().mode).toBe("mix");
  });
});

describe("Curiosity Before Commands phrasing", () => {
  it("uses curiosity wording for optional prompts when preferred", () => {
    saveCuriosityBeforeCommandsPreference({ mode: "curiosity-usually" });
    const line = buildCuriosityBeforeCommandsPrompt({
      actionLabel: "the kitchen",
      knownBenefit: "a little more calm at home",
      variationSeed: 1,
    });
    expect(line.endsWith("?")).toBe(true);
    expect(curiosityCopyIsSafe(line)).toBe(true);
    expect(line.toLowerCase()).toMatch(/kitchen|calm/);
  });

  it("keeps urgent and forced-direct notices direct", () => {
    saveCuriosityBeforeCommandsPreference({ mode: "curiosity-usually" });
    const urgent = buildCuriosityBeforeCommandsPrompt({
      actionLabel: "leave for the appointment",
      forceDirect: true,
      knownBenefit: "on time",
    });
    expect(urgent.endsWith("?")).toBe(false);
    expect(urgent.toLowerCase()).toMatch(/when you’re ready|when you're ready/);
  });

  it("does not invent benefits or claim dopamine", () => {
    const line = buildCuriosityBeforeCommandsPrompt({
      actionLabel: "reply to Susan",
      variationSeed: 3,
    });
    expect(curiosityCopyIsSafe(line)).toBe(true);
    expect(line.toLowerCase()).not.toMatch(/dopamine|guaranteed/);
    expect(line.toLowerCase()).not.toMatch(
      /you need to|you should|it'?s time to/,
    );
  });

  it("uses known benefits rather than inventing different ones", () => {
    const line = buildCuriosityBeforeCommandsPrompt({
      actionLabel: "reply to Susan",
      knownBenefit: "some weight off your mind",
      variationSeed: 0,
    });
    expect(line.toLowerCase()).toContain("weight off your mind");
  });

  it("lets direct preference and direct requests override curiosity", () => {
    expect(
      shouldUseCuriosityBeforeCommands({
        mode: "direct",
      }),
    ).toBe(false);
    expect(memberTextRequestsDirect("Just be direct right now.")).toBe(true);
    const line = buildCuriosityBeforeCommandsPrompt(
      { actionLabel: "the project", variationSeed: 2 },
      {
        mode: "curiosity-usually",
        memberMessage: "Be direct with me today.",
      },
    );
    expect(line.endsWith("?")).toBe(false);
  });

  it("varies wording across seeds", () => {
    saveCuriosityBeforeCommandsPreference({ mode: "curiosity-usually" });
    const a = buildCuriosityBeforeCommandsPrompt({
      actionLabel: "your project",
      knownBenefit: "more settled",
      variationSeed: 0,
    });
    const b = buildCuriosityBeforeCommandsPrompt({
      actionLabel: "your project",
      knownBenefit: "more settled",
      variationSeed: 1,
    });
    expect(a).not.toBe(b);
  });

  it("prompt hint forbids dopamine guarantees without using them as claims", () => {
    const hint = buildCuriosityBeforeCommandsPromptHint("curiosity-usually");
    expect(hint).toBeTruthy();
    expect(hint!.toLowerCase()).toContain("curiosity before commands");
    expect(hint!.toLowerCase()).toContain("do not claim dopamine");
    expect(hint!.toLowerCase()).not.toMatch(
      /creates a guaranteed dopamine|guaranteed dopamine response/,
    );
  });
});
