import { describe, expect, it } from "vitest";
import {
  evaluateSparkLandscapes,
  memberUsedLandscapeLanguage,
} from "./evaluateLandscapes";
import { landscapeEstatePlaceForLandscape } from "./landscapes";
import { sparkLandscapesHintForChat } from "./sparkLandscapesHintForChat";
import { SPARK_LANDSCAPE_QUESTION } from "./types";

describe("sparkLandscapes", () => {
  it("recognizes fog on brain fog signals", () => {
    const d = evaluateSparkLandscapes({
      userText: "I have brain fog and can't focus on anything",
      overwhelmed: true,
    });
    expect(d.primary).toBe("fog");
    expect(d.confidence).not.toBe("low");
  });

  it("recognizes bridge on stuck language", () => {
    const d = evaluateSparkLandscapes({
      userText: "I just can't seem to get going — I feel stuck",
    });
    expect(d.primary).toBe("bridge");
  });

  it("recognizes backpack on emotional weight", () => {
    const d = evaluateSparkLandscapes({
      userText: "Perfectionism and guilt are weighing on me",
    });
    expect(d.primary).toBe("backpack");
  });

  it("never requires member to choose — hint is internal", () => {
    const hint = sparkLandscapesHintForChat({
      userText: "Too many choices — decision fatigue",
    });
    expect(hint).toContain(SPARK_LANDSCAPE_QUESTION);
    expect(hint).toContain("member did NOT choose");
    expect(hint).toContain("Crossroads");
  });

  it("detects member adopting landscape language", () => {
    expect(memberUsedLandscapeLanguage("I'm in the Fog today")).toBe(true);
  });

  it("maps fog to peaceful estate hint", () => {
    expect(landscapeEstatePlaceForLandscape("fog")).toBe("peaceful-places");
  });
});
