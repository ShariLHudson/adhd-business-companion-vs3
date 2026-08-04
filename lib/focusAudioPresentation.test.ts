import { describe, expect, it } from "vitest";
import { focusAudioPanelTitle } from "./focusAudioPresentation";

describe("focusAudioPresentation", () => {
  it("labels calm-brain as Calm Audio", () => {
    expect(focusAudioPanelTitle("calm-brain")).toBe("Calm Audio");
  });

  it("labels deep-work as Focus Audio", () => {
    expect(focusAudioPanelTitle("deep-work")).toBe("Focus Audio");
  });
});
