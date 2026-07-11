import { describe, expect, it } from "vitest";
import {
  SOUNDSCAPE_FAVORITE_EXPERIENCE_EXAMPLES,
  SOUNDSCAPE_OPTIONAL_TOOLS,
  SOUNDSCAPE_SILENCE_IS_VALID,
  SOUNDSCAPES_SELECTION_PROMPT,
  soundscapeMayPairWithAnyScene,
} from "./soundscapesArchitecture";

describe("Soundscapes Architecture (#163)", () => {
  it("asks what to hear without assuming", () => {
    expect(SOUNDSCAPES_SELECTION_PROMPT).toBe("What would you like to hear?");
  });

  it("treats soundscapes as freely pairable with any scene", () => {
    expect(soundscapeMayPairWithAnyScene()).toBe(true);
    expect(SOUNDSCAPE_SILENCE_IS_VALID).toBe(true);
  });

  it("lists optional tools and favorite experience recipes", () => {
    expect(SOUNDSCAPE_OPTIONAL_TOOLS).toContain("timer");
    expect(SOUNDSCAPE_OPTIONAL_TOOLS).toContain("journal-afterwards");
    expect(SOUNDSCAPE_FAVORITE_EXPERIENCE_EXAMPLES[0]?.soundscape).toBe(
      "Coffee House",
    );
  });
});
