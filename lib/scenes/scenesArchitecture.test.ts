import { describe, expect, it } from "vitest";
import {
  isForbiddenScenePurposeLabel,
  SCENES_SELECTION_PROMPT,
  SCENE_FORBIDDEN_PURPOSE_LABELS,
  ESTATE_SCENE_EXAMPLES,
  PEACEFUL_PLACE_SCENE_EXAMPLES,
} from "./scenesArchitecture";

describe("Scenes Architecture (#162)", () => {
  it("invites place choice without requiring purpose", () => {
    expect(SCENES_SELECTION_PROMPT).toMatch(/spend some time/i);
    expect(SCENES_SELECTION_PROMPT.toLowerCase()).not.toMatch(
      /focus|meditat|productiv|sleep|adhd/,
    );
  });

  it("forbids permanent purpose labels on Scenes", () => {
    for (const label of SCENE_FORBIDDEN_PURPOSE_LABELS) {
      expect(isForbiddenScenePurposeLabel(label)).toBe(true);
    }
    expect(isForbiddenScenePurposeLabel("Greenhouse")).toBe(false);
  });

  it("lists Estate and Peaceful Place scene families", () => {
    expect(ESTATE_SCENE_EXAMPLES.length).toBeGreaterThanOrEqual(10);
    expect(PEACEFUL_PLACE_SCENE_EXAMPLES.length).toBeGreaterThanOrEqual(5);
    expect(ESTATE_SCENE_EXAMPLES.some((s) => s.id === "welcome-home")).toBe(
      true,
    );
  });
});
