import { describe, expect, it } from "vitest";
import {
  buildShariSceneImagePrompt,
  SHARI_LOCKED_VISUAL_IDENTITY,
  SHARI_VISUAL_NEGATIVE_PROMPT,
} from "./visualIdentity";

describe("Shari visual identity", () => {
  it("locks core facial and presence traits", () => {
    expect(SHARI_LOCKED_VISUAL_IDENTITY).toContain("face");
    expect(SHARI_LOCKED_VISUAL_IDENTITY).toContain("warm mentor presence");
    expect(SHARI_LOCKED_VISUAL_IDENTITY).toContain("triangular necklace when visible");
  });

  it("builds scene prompts with locked identity and negative guardrail", () => {
    const prompt = buildShariSceneImagePrompt({
      scene:
        "She is sitting in a cozy morning room with coffee, soft sunrise light, a journal nearby, calm encouraging expression.",
    });

    expect(prompt).toContain("silver-gray");
    expect(prompt).toContain("warm mentor presence");
    expect(prompt).toContain("cozy morning room");
    expect(prompt).toContain(`Negative prompt: ${SHARI_VISUAL_NEGATIVE_PROMPT}`);
  });
});
