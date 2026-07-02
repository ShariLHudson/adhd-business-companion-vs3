import { describe, expect, it } from "vitest";
import {
  getEstateGuideSpreadForCollectionRoom,
  listCollectionRoomGuideSpreadIds,
  listEstateGuideSpreadIds,
} from "@/data/estateGuideSpreads";
import { ESTATE_COLLECTION_ROOM_IDS } from "@/lib/estate/collectionFramework/types";
import { resolveCollectionRoomScene } from "@/lib/estate/collectionFramework/roomScene";
import { getEstateCollectionRoom } from "@/lib/estate/collectionFramework/registry";

describe("collection room scenes", () => {
  it("resolves a photograph for every collection room", () => {
    for (const roomId of ESTATE_COLLECTION_ROOM_IDS) {
      const room = getEstateCollectionRoom(roomId);
      const scene = resolveCollectionRoomScene(room);
      expect(scene.imageUrl.length).toBeGreaterThan(0);
      expect(scene.placeId.length).toBeGreaterThan(0);
      expect(scene.alt).toBe(room.roomName);
    }
  });
});

describe("estate guide spreads for collection rooms", () => {
  it("has a guide spread with image for each collection room", () => {
    expect(listCollectionRoomGuideSpreadIds()).toHaveLength(6);
    for (const roomId of ESTATE_COLLECTION_ROOM_IDS) {
      const spread = getEstateGuideSpreadForCollectionRoom(roomId);
      expect(spread).toBeDefined();
      expect(spread!.image.length).toBeGreaterThan(0);
    }
    expect(listEstateGuideSpreadIds()).toHaveLength(6);
  });
});
