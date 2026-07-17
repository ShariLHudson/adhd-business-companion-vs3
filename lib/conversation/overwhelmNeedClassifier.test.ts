import { describe, expect, it } from "vitest";
import {
  classifyOverwhelmNeed,
  shouldBlockScenicOverwhelmMenu,
  isCognitiveOverloadNeed,
  isTaskBreakdownNeed,
  isEmotionalCalmingNeed,
} from "./overwhelmNeedClassifier";
import { detectCanonicalSuggestionProfile } from "@/lib/estate/canonicalPlaceSuggestions";
import { detectOverwhelmTodayRoute } from "@/lib/overwhelmTodayRouting";

const COGNITIVE =
  "I think I just have too much on my brain to remember it all.";
const TASK =
  "I have a huge project due tomorrow and don't know the first step.";
const CALM = "I feel panicky and need to calm down.";

describe("overwhelmNeedClassifier", () => {
  it("routes working-memory overload to cognitive_overload", () => {
    expect(classifyOverwhelmNeed(COGNITIVE)).toBe("cognitive_overload");
    expect(isCognitiveOverloadNeed(COGNITIVE)).toBe(true);
    expect(shouldBlockScenicOverwhelmMenu(COGNITIVE)).toBe(true);
  });

  it("routes first-step project language to task_breakdown", () => {
    expect(classifyOverwhelmNeed(TASK)).toBe("task_breakdown");
    expect(isTaskBreakdownNeed(TASK)).toBe(true);
    expect(shouldBlockScenicOverwhelmMenu(TASK)).toBe(true);
  });

  it("routes panicky body language to emotional_calming", () => {
    expect(classifyOverwhelmNeed(CALM)).toBe("emotional_calming");
    expect(isEmotionalCalmingNeed(CALM)).toBe(true);
  });

  it("does not treat cognitive overload as a scenic overwhelmed profile", () => {
    // After wiring: detectCanonicalSuggestionProfile should not return overwhelmed
    // for cognitive unload when shouldBlockScenicOverwhelmMenu is true.
    expect(shouldBlockScenicOverwhelmMenu(COGNITIVE)).toBe(true);
    const profile = detectCanonicalSuggestionProfile(COGNITIVE);
    expect(profile).not.toBe("overwhelmed");
  });

  it("brain-dump route prefers Clear My Mind for cognitive overload phrasing", () => {
    expect(detectOverwhelmTodayRoute(COGNITIVE)).toBe("brain_dump_primary");
  });

  it("blocks scenic menus for laundry / start paralysis phrasing", () => {
    const laundry =
      "i have to fold and put away some laundry but its still in the dryer from this morning";
    const stuck = "i know what to do, i just can't get myself to do stuff";
    expect(classifyOverwhelmNeed(laundry)).toBe("task_breakdown");
    expect(shouldBlockScenicOverwhelmMenu(laundry)).toBe(true);
    expect(shouldBlockScenicOverwhelmMenu(stuck)).toBe(true);
    expect(shouldBlockScenicOverwhelmMenu("i need to fold my laundry")).toBe(
      true,
    );
  });
});
