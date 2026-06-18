import { describe, expect, it } from "vitest";
import {
  isHowDoIGuideBesideSource,
  isHowDoIStandaloneTarget,
  shouldWalkThroughFromHowDoI,
} from "./howDoIToolWalkthrough";

describe("howDoIToolWalkthrough", () => {
  it("detects How Do I as a guide source that must not stay on the left", () => {
    expect(isHowDoIGuideBesideSource("how-do-i")).toBe(true);
    expect(isHowDoIGuideBesideSource("playbook")).toBe(false);
  });

  it("routes How Do I opens through walkthrough", () => {
    expect(shouldWalkThroughFromHowDoI("how-do-i")).toBe(true);
    expect(shouldWalkThroughFromHowDoI("templates-library")).toBe(false);
    expect(shouldWalkThroughFromHowDoI(null)).toBe(false);
  });

  it("treats Focus as a standalone beside-chat target", () => {
    expect(isHowDoIStandaloneTarget("focus")).toBe(true);
    expect(isHowDoIStandaloneTarget("playbook")).toBe(false);
  });
});
