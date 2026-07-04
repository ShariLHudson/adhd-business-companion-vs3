import { describe, expect, it } from "vitest";
import { resolveCanonicalPlaceIdFromAlias } from "./canonicalEstateRegistry";
import { evaluateEstatePlaceTurn } from "./estatePlaceNavigation";
import { MEMBER_ESTATE_PLACE_NAMES } from "./estateMemberPlaceNames";
import {
  resolveEstatePlaceIdFromUserText,
  resolveEstateRoomAliasExact,
} from "./estateRoomAliasRegistry";

describe("member-facing Estate place names", () => {
  it.each(MEMBER_ESTATE_PLACE_NAMES)(
    "$memberName → $placeId",
    ({ memberName, placeId }) => {
      const phrase = memberName.toLowerCase();
      expect(resolveEstateRoomAliasExact(phrase)).toBe(placeId);
      expect(resolveCanonicalPlaceIdFromAlias(phrase)).toBe(placeId);
      expect(resolveEstatePlaceIdFromUserText(`Take me to the ${phrase}.`)).toBe(
        placeId,
      );
    },
  );

  it.each(MEMBER_ESTATE_PLACE_NAMES)(
    "navigates to $memberName from show-me phrase",
    ({ memberName, placeId }) => {
      const turn = evaluateEstatePlaceTurn({
        userText: `Show me the ${memberName}.`,
      });
      expect(turn.type).toBe("navigate");
      if (turn.type === "navigate") {
        expect(turn.command.roomId ?? turn.command.entryId).toBe(placeId);
      }
    },
  );
});
