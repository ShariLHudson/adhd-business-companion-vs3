import { describe, expect, it } from "vitest";
import { resolveEstatePlaceIdFromUserText } from "./estateRoomAliasRegistry";
import { evaluateEstatePlaceTurn } from "./estatePlaceNavigation";
import { matchVaguePlaceCluster } from "./estatePlaceClusters";
import { normalizeSpokenPlaceText } from "./estateSpokenPlaceNormalize";

describe("estateSpokenPlaceNormalize", () => {
  it("normalizes gazebo and journal typos", () => {
    expect(normalizeSpokenPlaceText("the gazeebo")).toBe("gazebo");
    expect(normalizeSpokenPlaceText("journel")).toBe("journal");
  });
});

describe("natural language place coverage", () => {
  it("routes bare gazebo to journal without saying journal gazebo", () => {
    expect(resolveEstatePlaceIdFromUserText("gazebo")).toBe("journal");
    expect(resolveEstatePlaceIdFromUserText("the gazeebo")).toBe("journal");
  });

  it("navigates take me to the gazebo", () => {
    const turn = evaluateEstatePlaceTurn({ userText: "take me to the gazebo" });
    expect(turn.type).toBe("navigate");
    if (turn.type === "navigate") {
      expect(turn.command.roomId ?? turn.command.entryId).toBe("journal");
    }
  });

  it("offers water cluster for by the water", () => {
    const cluster = matchVaguePlaceCluster("I'd like to sit by the water");
    expect(cluster?.placeIds).toContain("seat-at-pond");
    expect(cluster?.placeIds).toContain("reflection-pond");
    expect(cluster?.placeIds.length).toBe(3);
  });

  it("offers reading cluster for somewhere to read", () => {
    const cluster = matchVaguePlaceCluster("somewhere to read");
    expect(cluster?.placeIds).toContain("library");
    expect(cluster?.placeIds).toContain("reading-nook");
  });

  it("offers pond choices for bare pond", () => {
    const turn = evaluateEstatePlaceTurn({ userText: "the pond" });
    expect(turn.type).toBe("offer");
    if (turn.type === "offer") {
      expect(turn.placeIds).toContain("seat-at-pond");
      expect(turn.placeIds).toContain("reflection-pond");
    }
  });

  it("routes stream bench to reflection pond", () => {
    expect(resolveEstatePlaceIdFromUserText("stream bench")).toBe(
      "reflection-pond",
    );
  });

  it("routes quiet glass room to conservatory", () => {
    expect(resolveEstatePlaceIdFromUserText("quiet glass room")).toBe(
      "conservatory",
    );
  });
});
