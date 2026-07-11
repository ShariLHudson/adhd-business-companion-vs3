import { describe, expect, it } from "vitest";
import { ESTATE_COLLECTION_ROOM_IDS } from "./types";
import {
  getEstateCollectionRoom,
  getEstateCollectionRoomByPlaceId,
  getEstateCollectionRoomBySection,
  listEstateCollectionRoomIds,
} from "./registry";

describe("Spark Estate Collection Framework registry", () => {
  it("lists all six collection rooms", () => {
    expect(listEstateCollectionRoomIds()).toHaveLength(6);
    expect(ESTATE_COLLECTION_ROOM_IDS).toEqual([
      "journal",
      "greenhouse",
      "evidence-vault",
      "achievement-library",
      "celebration-garden",
      "celebration-hall",
    ]);
  });

  it("resolves each room with adapter and required copy fields", () => {
    for (const roomId of ESTATE_COLLECTION_ROOM_IDS) {
      const room = getEstateCollectionRoom(roomId);
      expect(room.id).toBe(roomId);
      expect(room.roomName.length).toBeGreaterThan(0);
      expect(room.openingSparkPrompt.length).toBeGreaterThan(0);
      expect(room.suggestedPrompts.length).toBeGreaterThan(0);
      if (roomId !== "evidence-vault") {
        expect(room.followUpQuestions.length).toBeGreaterThan(0);
      }
      expect(room.backgroundImage.length).toBeGreaterThan(0);
      expect(room.capture.fields.length).toBeGreaterThan(0);
      expect(room.capture.saveLabel.length).toBeGreaterThan(0);
      expect(room.browse.pageSize).toBeGreaterThan(0);
      expect(room.sparkSuggestionLines.length).toBeGreaterThan(0);
      expect(room.display.style.length).toBeGreaterThan(0);
      expect(room.adapter.listItems).toBeTypeOf("function");
      expect(room.adapter.saveItem).toBeTypeOf("function");
    }
  });

  it("gives each room a distinct display style", () => {
    const styles = ESTATE_COLLECTION_ROOM_IDS.map(
      (id) => getEstateCollectionRoom(id).display.style,
    );
    expect(new Set(styles).size).toBe(styles.length);
  });

  it("maps place ids uniquely", () => {
    const placeIds = ESTATE_COLLECTION_ROOM_IDS.map(
      (id) => getEstateCollectionRoom(id).placeId,
    );
    expect(new Set(placeIds).size).toBe(placeIds.length);
  });

  it("resolves by place id and section", () => {
    expect(getEstateCollectionRoomByPlaceId("journal")?.id).toBe("journal");
    expect(getEstateCollectionRoomByPlaceId("greenhouse")?.id).toBe("greenhouse");
    expect(getEstateCollectionRoomBySection("growth-journal")?.id).toBe(
      "journal",
    );
    expect(getEstateCollectionRoomBySection("growth-greenhouse")?.id).toBe(
      "greenhouse",
    );
    expect(getEstateCollectionRoomBySection("evidence-bank")?.id).toBe(
      "evidence-vault",
    );
    expect(getEstateCollectionRoomBySection("wins-this-week")?.id).toBe(
      "celebration-garden",
    );
    expect(getEstateCollectionRoomBySection("growth-library")?.id).toBe(
      "achievement-library",
    );
    expect(getEstateCollectionRoomBySection("growth-reports")?.id).toBe(
      "celebration-hall",
    );
  });
});
