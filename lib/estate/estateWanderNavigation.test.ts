import { describe, expect, it } from "vitest";
import {
  evaluateEstatePlaceTurn,
  savePendingEstatePlaceMenu,
} from "./estatePlaceNavigation";
import {
  formatEstateWanderMenu,
  formatVagueWanderClusterMenu,
} from "./estateWanderNavigation";

describe("estateWanderNavigation", () => {
  it("Visit Another Room offers three real room names in one step", () => {
    const wander = formatEstateWanderMenu("round-table");
    expect(wander.placeIds).toHaveLength(3);
    expect(wander.line).toMatch(/Where would you like to go/i);
    expect(wander.line).not.toMatch(/Gather & warm up|Read & discover/i);
  });

  it("numbered pick navigates directly to the chosen room", () => {
    const wander = formatEstateWanderMenu("round-table");
    savePendingEstatePlaceMenu({ placeIds: wander.placeIds });
    const turn = evaluateEstatePlaceTurn({
      userText: "1",
      currentPlaceId: "round-table",
      lastAssistantText: wander.line,
    });
    expect(turn.type).toBe("navigate");
    if (turn.type === "navigate") {
      expect(turn.command.roomId ?? turn.command.entryId).toBe(
        wander.placeIds[0],
      );
    }
  });

  it("typing a room name while the menu is open navigates directly", () => {
    const wander = formatEstateWanderMenu("round-table");
    savePendingEstatePlaceMenu({ placeIds: wander.placeIds });
    const turn = evaluateEstatePlaceTurn({
      userText: "library",
      currentPlaceId: "round-table",
      lastAssistantText: wander.line,
    });
    expect(turn.type).toBe("navigate");
    if (turn.type === "navigate") {
      expect(turn.command.roomId ?? turn.command.entryId).toBe("library");
    }
  });

  it("vague gather intent offers concrete eating and drinking places", () => {
    const cluster = formatVagueWanderClusterMenu("I'm hungry", "round-table");
    expect(cluster).not.toBeNull();
    expect(cluster!.placeIds.length).toBeGreaterThanOrEqual(2);
    expect(cluster!.line).toMatch(
      /Coffee House|Tea Room|Dining Room|Kitchen/i,
    );
  });

  it("observatory navigation offers scene views before arriving", () => {
    const turn = evaluateEstatePlaceTurn({
      userText: "take me to the observatory",
    });
    expect(turn.type).toBe("offer");
    if (turn.type === "offer") {
      expect(turn.line).toMatch(/Daytime Outside|Inside|Night Outside/i);
      expect(turn.placeIds.length).toBe(3);
    }
  });

  it("swimming pool routes to pool terrace view when named explicitly", () => {
    const turn = evaluateEstatePlaceTurn({
      userText: "take me to the swimming pool",
    });
    expect(turn.type).toBe("navigate");
    if (turn.type === "navigate") {
      expect(turn.command.roomId ?? turn.command.entryId).toBe(
        "summer-terrace",
      );
      expect(turn.command.backgroundImageOverride).toMatch(/swimming-pool/i);
    }
  });
});
