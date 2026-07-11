import { describe, expect, it } from "vitest";
import {
  ESTATE_IMAGE_BRAND_PROMPT,
  ESTATE_IMAGE_PLAUSIBILITY_RULES,
  buildEstateRoomImagePrompt,
} from "./estateImageStandards";

describe("Estate Image Bible", () => {
  it("includes Spark flame logo rule on all drinking vessels", () => {
    expect(ESTATE_IMAGE_BRAND_PROMPT).toContain("official Spark flame logo");
    expect(ESTATE_IMAGE_BRAND_PROMPT).toContain("Never leave mugs blank");
  });

  it("forbids two-handled mugs", () => {
    expect(ESTATE_IMAGE_PLAUSIBILITY_RULES.some((r) => /two handles/i.test(r))).toBe(
      true,
    );
    expect(ESTATE_IMAGE_BRAND_PROMPT).toContain("One handle per mug");
  });

  it("builds room prompts with brand block appended", () => {
    const prompt = buildEstateRoomImagePrompt("Stables interior, warm afternoon.");
    expect(prompt.startsWith("Stables interior")).toBe(true);
    expect(prompt).toContain("SPARK ESTATE IMAGE STANDARDS");
  });
});
