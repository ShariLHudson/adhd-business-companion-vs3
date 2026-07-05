import { describe, expect, it } from "vitest";
import { goToPlace } from "../goToPlace";
import { evaluateEstatePlaceTurn } from "../estatePlaceNavigation";
import { matchEstateRoomAction } from "./roomActionMatchers";
import { estateRoomsEquivalent } from "./roomIds";

describe("library vs personal-library navigation", () => {
  it("does not treat estate and personal library as the same room", () => {
    expect(estateRoomsEquivalent("library", "personal-library")).toBe(false);
  });

  it("navigates from estate library to personal library", () => {
    const turn = evaluateEstatePlaceTurn({
      userText: "go to the personal library",
      currentPlaceId: "library",
    });
    expect(turn.type).toBe("navigate");
    if (turn.type !== "navigate") return;
    expect(turn.command.roomId ?? turn.command.entryId).toBe("personal-library");
  });

  it("does not block personal library with already here", () => {
    const action = matchEstateRoomAction(
      "take me to the personal library",
      "library",
    );
    expect(action).toBeNull();
  });

  it("goToPlace resolves personal library with its own background", () => {
    const outcome = goToPlace({ placeId: "personal-library" });
    expect(outcome.ok).toBe(true);
    if (!outcome.ok) return;
    expect(outcome.placeId).toBe("personal-library");
    expect(outcome.backgroundImage).toMatch(/room-library-personal-background/);
  });
});
