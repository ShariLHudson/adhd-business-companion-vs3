import { describe, expect, it } from "vitest";
import { runWisdomLoop } from "./wisdomLoop";
import { recommendGentleChallenge } from "./gentleChallenge";
import { buildCompanionSystemPrompt } from "@/lib/companionPrompt";

const CRISIS_PROMPTS = [
  {
    message:
      "I think I should stop working on this app and just go back to making crafts.",
    expectGentleChallenge: true,
    expectCognitiveLoad: false,
  },
  {
    message:
      "I think I should stop working on developing my ADHD app and just go back to making crafts.",
    expectGentleChallenge: true,
    expectCognitiveLoad: false,
  },
  {
    message:
      "I have fifteen things I could work on today and every one of them feels important.",
    expectGentleChallenge: false,
    expectCognitiveLoad: true,
  },
] as const;

describe("coaching crisis prompts — wisdom loop must not throw", () => {
  for (const { message, expectGentleChallenge, expectCognitiveLoad } of CRISIS_PROMPTS) {
    it(`handles: ${message.slice(0, 48)}…`, () => {
      expect(() =>
        runWisdomLoop({ memberMessage: message, messageHistory: [] }),
      ).not.toThrow();
      const result = runWisdomLoop({ memberMessage: message, messageHistory: [] });
      expect(result.promptHint.length).toBeGreaterThan(0);
      expect(result.promptHint.length).toBeLessThan(8000);
      expect(Boolean(result.gentleChallenge)).toBe(expectGentleChallenge);
      expect(result.thinkingPause.cognitiveOverload).toBe(expectCognitiveLoad);
      if (expectGentleChallenge) {
        expect(result.promptHint).toMatch(/Gentle challenge/i);
      }
      if (expectCognitiveLoad) {
        expect(result.promptHint).toMatch(/Cognitive load reduction/i);
        expect(result.memberNeed.primary).toBe("encouragement");
      }
    });
  }

  it("gentle challenge matches quit-app language", () => {
    const challenge = recommendGentleChallenge(
      "I think I should stop working on this app and just go back to making crafts.",
    );
    expect(challenge).not.toBeNull();
  });

  it("system + wisdom hint stays within reasonable size", () => {
    const system = buildCompanionSystemPrompt("today", "text", {});
    for (const { message } of CRISIS_PROMPTS) {
      const wisdom = runWisdomLoop({ memberMessage: message, messageHistory: [] });
      const total = system.length + wisdom.promptHint.length;
      expect(total).toBeLessThan(120_000);
    }
  });
});
