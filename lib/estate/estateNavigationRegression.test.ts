import { describe, expect, it } from "vitest";
import { resolveEstatePlace, shouldNavigateFromResolution } from "./resolveEstatePlace";
import { evaluateEstatePlaceTurn } from "./estatePlaceNavigation";
import { detectDirectCommand } from "@/lib/estateIntelligence/estateCommandRouter";
import { extractRoomPhraseFromNavigation } from "./estateRoomAliasRegistry";

const EXPLICIT_NAV_CASES: { text: string; placeId: string }[] = [
  { text: "take me to the butterfly conservatory", placeId: "conservatory" },
  { text: "take me to the music room", placeId: "music-room" },
  { text: "take me to the apple orchard", placeId: "apple-orchard" },
];

describe("estate navigation regression", () => {
  for (const { text, placeId } of EXPLICIT_NAV_CASES) {
    it(`resolves "${text}" → ${placeId}`, () => {
      const phrase = extractRoomPhraseFromNavigation(text);
      expect(phrase).toBeTruthy();

      const resolution = resolveEstatePlace(text);
      expect(shouldNavigateFromResolution(resolution)).toBe(true);
      expect(resolution.placeId).toBe(placeId);

      const turn = evaluateEstatePlaceTurn({ userText: text });
      expect(turn.type).toBe("navigate");
      if (turn.type === "navigate") {
        expect(turn.command.roomId ?? turn.command.entryId).toBe(placeId);
        if (placeId === "conservatory") {
          expect(turn.command.section).toBe("home");
        }
      }

      const direct = detectDirectCommand(text);
      expect(direct?.roomId ?? direct?.entryId).toBe(placeId);
    });
  }

  it("explicit pool navigation routes to Summer Terrace™ — not game-room", () => {
    const turn = evaluateEstatePlaceTurn({
      userText: "take me to the swimming pool",
    });
    expect(turn.type).toBe("navigate");
    if (turn.type === "navigate") {
      expect(turn.command.roomId ?? turn.command.entryId).toBe("summer-terrace");
      expect(turn.command.roomId ?? turn.command.entryId).not.toBe("game-room");
    }
  });
});
