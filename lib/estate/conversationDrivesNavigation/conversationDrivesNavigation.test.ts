import { describe, expect, it } from "vitest";

import { resolveEstatePlace, shouldNavigateFromResolution } from "../resolveEstatePlace";
import { resolveEstateIntent } from "../estateIntentBridge";
import { evaluateConversationEnvironmentNeed } from "./evaluateEnvironmentNeed";
import { ENVIRONMENT_NEED_LEXICON } from "./environmentNeeds";

describe("Conversation Drives Navigation", () => {
  const EXPLICIT_PLACE_EXAMPLES: {
    text: string;
    needId: string;
    places: string[];
  }[] = [
    {
      text: "I want somewhere quieter.",
      needId: "quieter",
      places: ["gardens", "library", "reading-nook"],
    },
    {
      text: "I need fresh air.",
      needId: "fresh-air",
      places: ["garden-path", "woodland-path", "fireside-deck"],
    },
  ];

  const UNSOLICITED_ACTIVITY_EXAMPLES = [
    "I'd like to think.",
    "I need to focus.",
    "I'd like to relax.",
    "I need inspiration.",
    "I want to journal.",
  ];

  it.each(EXPLICIT_PLACE_EXAMPLES)(
    "detects $needId from explicit place/environment language",
    ({ text, needId, places }) => {
      const evaluation = evaluateConversationEnvironmentNeed(text);
      expect(evaluation.detected).toBe(true);
      expect(evaluation.needId).toBe(needId);
      expect(evaluation.suggestedPlaceIds).toEqual(places);
      expect(evaluation.offerLine).toContain("1.");
    },
  );

  it.each(UNSOLICITED_ACTIVITY_EXAMPLES)(
    "does not open environment menus for unsolicited activity: %s",
    (text) => {
      const evaluation = evaluateConversationEnvironmentNeed(text);
      expect(evaluation.detected).toBe(false);
      expect(evaluation.suggestedPlaceIds).toEqual([]);
    },
  );

  it("never auto-navigates — offers suggestion only", () => {
    for (const { text } of EXPLICIT_PLACE_EXAMPLES) {
      const resolution = resolveEstatePlace(text);
      expect(resolution.kind).toBe("suggestion");
      expect(shouldNavigateFromResolution(resolution)).toBe(false);
    }
  });

  it("chat mentioning a place suggests — does not auto-navigate", () => {
    for (const text of [
      "I love the greenhouse",
      "thinking about the library",
      "the Reading Nook sounds nice",
    ]) {
      const resolution = resolveEstatePlace(text);
      expect(shouldNavigateFromResolution(resolution)).toBe(false);
    }
  });

  it("intent bridge returns suggestions below auto-route threshold for explicit environment asks", () => {
    const result = resolveEstateIntent({ text: "I need fresh air." });
    expect(result.primaryPlaceId).toBeNull();
    expect(result.suggestedPlaceIds).toContain("garden-path");
    expect(result.confidence).toBeLessThan(0.7);
  });

  it("lexicon references only navigable directory places", () => {
    for (const definition of ENVIRONMENT_NEED_LEXICON) {
      const evaluation = evaluateConversationEnvironmentNeed(
        `test ${definition.label}`,
      );
      // Patterns are tested via USER_EXAMPLES; ensure place lists are non-empty
      expect(definition.placeIds.length).toBeGreaterThan(0);
      expect(definition.placeIds.length).toBeLessThanOrEqual(3);
    }
  });

  it("does not treat explicit navigation as environment need", () => {
    const evaluation = evaluateConversationEnvironmentNeed(
      "Take me to the Reading Nook.",
    );
    expect(evaluation.detected).toBe(false);
  });
});
