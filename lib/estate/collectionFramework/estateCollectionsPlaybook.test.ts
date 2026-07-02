import { describe, expect, it } from "vitest";
import {
  ESTATE_COLLECTIONS_CROSS_ROOM_EXAMPLES,
  ESTATE_COLLECTIONS_DECISION_TREE,
  ESTATE_COLLECTIONS_PLAYBOOK_ROOMS,
  formatMultiRoomCollectionOffer,
  isComplementaryRoomPair,
  scorePlaybookRooms,
  singleRoomOfferLine,
} from "./estateCollectionsPlaybook";
import { evaluateCollectionSaveOffer } from "./collectionOfferIntelligence";
import { ESTATE_COLLECTION_ROOM_IDS } from "./types";

describe("Estate Collections Playbook", () => {
  it("defines all six collection rooms", () => {
    for (const id of ESTATE_COLLECTION_ROOM_IDS) {
      const room = ESTATE_COLLECTIONS_PLAYBOOK_ROOMS[id];
      expect(room.purpose.length).toBeGreaterThan(10);
      expect(room.belongsHere.length).toBeGreaterThan(5);
    }
  });

  it("maps decision tree to six distinct rooms", () => {
    const ids = new Set(ESTATE_COLLECTIONS_DECISION_TREE.map((r) => r.roomId));
    expect(ids.size).toBe(6);
  });

  it("scores journal for reflections", () => {
    const ranked = scorePlaybookRooms(
      "I've been feeling overwhelmed and needed to write about this tough day.",
    );
    expect(ranked[0]?.id).toBe("journal");
  });

  it("scores greenhouse for developing growth", () => {
    const ranked = scorePlaybookRooms(
      "I'm becoming more patient with my team — still becoming, not finished yet.",
    );
    expect(ranked[0]?.id).toBe("greenhouse");
  });

  it("scores evidence vault for solved problems", () => {
    const ranked = scorePlaybookRooms(
      "I solved a difficult client issue today and prevented a major mistake on billing.",
    );
    expect(ranked[0]?.id).toBe("evidence-vault");
  });

  it("recognizes complementary achievement + garden pair", () => {
    expect(
      isComplementaryRoomPair("achievement-library", "celebration-garden"),
    ).toBe(true);
  });

  it("formats multi-room offer in Spark voice", () => {
    const line = formatMultiRoomCollectionOffer("achievement-library", [
      "celebration-garden",
    ]);
    expect(line).toMatch(/more than one place in the Estate/i);
    expect(line).toMatch(/Achievement Library/i);
    expect(line).toMatch(/Celebration Garden/i);
    expect(line).toMatch(/both/i);
  });

  it("cross-room example: published book can surface multiple rooms", () => {
    const example = ESTATE_COLLECTIONS_CROSS_ROOM_EXAMPLES.find((e) =>
      e.moment.includes("Published first book"),
    );
    expect(example?.rooms).toContain("achievement-library");
    expect(example?.rooms).toContain("celebration-hall");
  });

  it("single room offers are permission questions", () => {
    const line = singleRoomOfferLine("journal");
    expect(line).toMatch(/\?$/);
    expect(line).toMatch(/Journal/i);
  });

  it("offers multi-room when playbook pairs both score", () => {
    const offer = evaluateCollectionSaveOffer({
      userText:
        "I finally built my new website and launched it today — it actually went well and I'm proud.",
      currentTurn: 4,
    });
    expect(offer?.roomId).toBe("achievement-library");
    if (offer?.alternateRoomIds?.length) {
      expect(offer.alternateRoomIds).toContain("celebration-garden");
      expect(offer.offerLine).toMatch(/both/i);
    }
  });
});
