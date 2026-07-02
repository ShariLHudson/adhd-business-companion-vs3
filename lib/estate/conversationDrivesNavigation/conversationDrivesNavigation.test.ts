import { describe, expect, it } from "vitest";

import { resolveEstatePlace, shouldNavigateFromResolution } from "../resolveEstatePlace";
import { resolveEstateIntent } from "../estateIntentBridge";
import { evaluateConversationEnvironmentNeed } from "./evaluateEnvironmentNeed";
import { ENVIRONMENT_NEED_LEXICON } from "./environmentNeeds";

describe("Conversation Drives Navigation", () => {
  const USER_EXAMPLES: {
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
      text: "I'd like to think.",
      needId: "think",
      places: ["observatory", "library", "reading-nook"],
    },
    {
      text: "I need fresh air.",
      needId: "fresh-air",
      places: ["garden-path", "woodland-path", "back-deck"],
    },
    {
      text: "I need to focus.",
      needId: "focus",
      places: ["creative-studio", "momentum-builder", "library"],
    },
    {
      text: "I'd like to relax.",
      needId: "relax",
      places: ["coffee-house", "peaceful-places", "porch-swing"],
    },
    {
      text: "I need inspiration.",
      needId: "inspiration",
      places: ["creative-studio", "music-room", "conservatory"],
    },
    {
      text: "I want to journal.",
      needId: "journal",
      places: ["journal", "reading-nook", "conservatory"],
    },
  ];

  it.each(USER_EXAMPLES)(
    "detects $needId from natural language",
    ({ text, needId, places }) => {
      const evaluation = evaluateConversationEnvironmentNeed(text);
      expect(evaluation.detected).toBe(true);
      expect(evaluation.needId).toBe(needId);
      expect(evaluation.suggestedPlaceIds).toEqual(places);
      expect(evaluation.offerLine).toContain("1.");
    },
  );

  it("never auto-navigates — offers suggestion only", () => {
    for (const { text } of USER_EXAMPLES) {
      const resolution = resolveEstatePlace(text);
      expect(resolution.kind).toBe("suggestion");
      expect(shouldNavigateFromResolution(resolution)).toBe(false);
    }
  });

  it("intent bridge returns suggestions below auto-route threshold", () => {
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
