import { describe, expect, it } from "vitest";
import { shariPromptForVisualContext } from "./visualThinkingCoachContext";

describe("visualThinkingCoachContext P0.51", () => {
  it("uses map-specific prompt for brand canvas", () => {
    const prompt = shariPromptForVisualContext({
      homeTypeId: "brand-canvas",
      mode: "business-canvas",
      mapTitle: "My Brand",
    });
    expect(prompt).toMatch(/Brand Canvas/i);
    expect(prompt).toMatch(/audience/i);
    expect(prompt).toMatch(/My Brand/);
  });

  it("uses hub prompt when from hub", () => {
    const prompt = shariPromptForVisualContext({ fromHub: true });
    expect(prompt).toMatch(/not sure which visual thinking tool/i);
  });

  it("uses decision tree prompt for decision tree maps", () => {
    const prompt = shariPromptForVisualContext({
      homeTypeId: "decision-tree",
      mode: "decision-tree",
    });
    expect(prompt).toMatch(/options, risks, tradeoffs/i);
  });
});
