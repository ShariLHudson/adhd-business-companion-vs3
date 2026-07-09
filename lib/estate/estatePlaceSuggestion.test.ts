import { describe, expect, it } from "vitest";
import { isPlaceSuggestionRequest, resolveEstatePlace } from "./resolveEstatePlace";
import { evaluateEstatePlaceTurn } from "./estatePlaceNavigation";
import { isVagueOfferConfusion } from "@/lib/conversation/vagueOfferRepair";
import { repairInventedEstatePlaceList } from "./estatePlaceIdentityLock";

describe("estate place suggestions", () => {
  const stressedQuietAsk =
    "I'm a little stressed and I'm wondering if you could suggest a few quiet places on the property for me to go";

  it("detects place suggestion requests without navigation", () => {
    expect(isPlaceSuggestionRequest(stressedQuietAsk)).toBe(true);
    expect(resolveEstatePlace(stressedQuietAsk).kind).toBe("suggestion");
  });

  it("returns canonical numbered menu locally — not API", () => {
    const turn = evaluateEstatePlaceTurn({ userText: stressedQuietAsk });
    expect(turn.type).toBe("offer");
    if (turn.type === "offer") {
      expect(turn.line).toMatch(/A few (?:quieter )?places on the Estate|A few ideas:/i);
      expect(turn.line).toMatch(/1\./);
      expect(turn.line).toMatch(/ — /);
      expect(turn.line).not.toMatch(/oak tree|hammock|meditation corner/i);
      expect(turn.placeIds.length).toBeGreaterThanOrEqual(2);
    }
  });

  it("does not treat place-suggestion clarification as vague-offer confusion", () => {
    expect(
      isVagueOfferConfusion(
        "I wanted you to give me some suggestions not take me someplace right away",
        "What kind of calm would help most right now?",
      ),
    ).toBe(false);
  });

  it("repairs LLM-invented place lists", () => {
    const invented = `Here are a few suggestions:
1. Near the pond: peaceful water sounds.
2. The garden: flowers and quiet.
3. Under the old oak tree: shade and calm.`;
    const repaired = repairInventedEstatePlaceList(
      invented,
      "quiet places on the property to de-stress",
    );
    expect(repaired).toMatch(/A few ideas:|A few quieter places/i);
    expect(repaired).toMatch(/^\s*1\./m);
    expect(repaired).not.toMatch(/oak tree|Near the pond/i);
  });
});
