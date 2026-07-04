import { describe, expect, it } from "vitest";
import {
  evaluateImpliedNeed,
  formatImpliedNeedReply,
  resolveImpliedNeedContinuation,
} from "./impliedNeed";
import type { ImpliedNeedSession } from "./impliedNeedSession";

describe("impliedNeed", () => {
  it("detects coffee need — does not auto-route", () => {
    const evaluation = evaluateImpliedNeed("I need a cup of coffee.");
    expect(evaluation?.intentCategory).toBe("IMPLIED_NEED");
    expect(evaluation?.matchKey).toBe("coffee-need");
    expect(evaluation?.primaryPlaceId).toBe("coffee-house");
    expect(evaluation?.suggestedPaths).toEqual(
      expect.arrayContaining(["real_world_break", "estate_place", "stay_here"]),
    );
    expect(evaluation?.choices).toHaveLength(3);
    expect(evaluation?.choices[0]?.label).toMatch(/go get coffee/i);
    expect(evaluation?.choices[1]?.label).toMatch(/Coffee House/i);
    expect(evaluation?.choices[2]?.label).toMatch(/sit with me/i);
  });

  it("formats host-style reply with numbered choices", () => {
    const evaluation = evaluateImpliedNeed("I need a cup of coffee.");
    expect(evaluation).not.toBeNull();
    const reply = formatImpliedNeedReply(evaluation!);
    expect(reply).toMatch(/good idea/i);
    expect(reply).toMatch(/Coffee House/i);
    expect(reply).toMatch(/1\. I'll go get coffee/);
    expect(reply).toMatch(/2\. Take me to the Coffee House/);
    expect(reply).toMatch(/3\. Just sit with me a minute/);
  });

  it("does not steal relationship conversation", () => {
    expect(evaluateImpliedNeed("I hope you're having a good day.")).toBeNull();
  });

  it("does not steal direct navigation", () => {
    expect(evaluateImpliedNeed("Take me to the Coffee House.")).toBeNull();
  });

  const IMPLIED_PHRASES = [
    "I could use some coffee.",
    "I need fresh air.",
    "I need a minute.",
    "I need to sit somewhere quiet.",
    "I need something calming.",
    "I need a break.",
    "I need to clear my head.",
  ] as const;

  it.each(IMPLIED_PHRASES)("detects implied need — %s", (text) => {
    expect(evaluateImpliedNeed(text)?.intentCategory).toBe("IMPLIED_NEED");
  });

  it("resolves estate place continuation", () => {
    const evaluation = evaluateImpliedNeed("I need a cup of coffee.")!;
    const session: ImpliedNeedSession = {
      matchKey: evaluation.matchKey,
      primaryPlaceId: evaluation.primaryPlaceId,
      choices: evaluation.choices,
      offeredAtTurn: 1,
    };
    const result = resolveImpliedNeedContinuation("2", session);
    expect(result?.kind).toBe("estate_place");
    if (result?.kind === "estate_place") {
      expect(result.placeId).toBe("coffee-house");
    }
  });

  it("resolves stay-here continuation", () => {
    const evaluation = evaluateImpliedNeed("I need a cup of coffee.")!;
    const session: ImpliedNeedSession = {
      matchKey: evaluation.matchKey,
      primaryPlaceId: evaluation.primaryPlaceId,
      choices: evaluation.choices,
      offeredAtTurn: 1,
    };
    const result = resolveImpliedNeedContinuation("Just sit with me a minute", session);
    expect(result?.kind).toBe("stay_here");
  });
});
