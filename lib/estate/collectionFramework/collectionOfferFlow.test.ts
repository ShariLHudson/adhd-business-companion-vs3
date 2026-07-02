import { describe, expect, it } from "vitest";
import {
  evaluateCollectionSaveOffer,
  buildCollectionPrefill,
  isCollectionOfferMessage,
} from "./collectionOfferIntelligence";
import {
  createCollectionPendingOffer,
  resolveCollectionOfferReply,
} from "./collectionOfferFlow";
import { loadCollectionPendingOffer, clearCollectionPendingOffer } from "./collectionPendingOffer";

describe("collectionOfferIntelligence", () => {
  it("offers celebration garden for wins", () => {
    const offer = evaluateCollectionSaveOffer({
      userText:
        "I finally shipped the landing page today and it actually went well.",
      currentTurn: 3,
    });
    expect(offer?.roomId).toBe("celebration-garden");
    expect(offer?.offerLine).toMatch(/Celebration Garden/i);
  });

  it("offers evidence vault for solved problems", () => {
    const offer = evaluateCollectionSaveOffer({
      userText:
        "I handled a difficult client call today and figured out how to solve the billing issue without losing them.",
      currentTurn: 4,
    });
    expect(offer?.roomId).toBe("evidence-vault");
    expect(offer?.offerLine).toMatch(/Evidence Vault/i);
  });

  it("builds journal prefill on primary field", () => {
    const prefill = buildCollectionPrefill(
      "journal",
      "I've been reflecting on how grateful I am for my team.",
    );
    expect(prefill.body).toContain("grateful");
    expect(prefill.category).toBe("gratitude");
  });

  it("detects collection offer messages", () => {
    expect(
      isCollectionOfferMessage(
        "That feels like a meaningful reflection. Would you like to save it in your Journal?",
      ),
    ).toBe(true);
  });
});

describe("collectionOfferFlow", () => {
  it("opens suggested room on yes", () => {
    const pending = createCollectionPendingOffer({
      roomId: "journal",
      sourceUserText: "Something meaningful happened today.",
      offerLine: "Would you like to save it in your Journal?",
      prefill: buildCollectionPrefill("journal", "Something meaningful happened today."),
      offeredAtTurn: 2,
    });
    const reply = resolveCollectionOfferReply("yes", pending);
    expect(reply.handled).toBe(true);
    if (reply.handled) {
      expect(reply.kind).toBe("open");
      expect(reply.openRoomId).toBe("journal");
    }
  });

  it("shows room menu when member asks for another room", () => {
    const pending = createCollectionPendingOffer({
      roomId: "celebration-garden",
      sourceUserText: "Small win today.",
      offerLine: "Celebration Garden?",
      prefill: buildCollectionPrefill("celebration-garden", "Small win today."),
      offeredAtTurn: 2,
    });
    const reply = resolveCollectionOfferReply("a different room please", pending);
    expect(reply.handled).toBe(true);
    if (reply.handled) {
      expect(reply.kind).toBe("menu");
      expect(reply.ack).toMatch(/Where would you like this to rest/i);
    }
  });

  it("opens primary on both when playbook suggested two rooms", () => {
    const pending = createCollectionPendingOffer({
      roomId: "achievement-library",
      alternateRoomIds: ["celebration-garden"],
      sourceUserText: "Built and launched my website today.",
      offerLine: "Would you like to do both?",
      prefill: buildCollectionPrefill(
        "achievement-library",
        "Built and launched my website today.",
      ),
      offeredAtTurn: 2,
    });
    const reply = resolveCollectionOfferReply("yes both", pending);
    expect(reply.handled).toBe(true);
    if (reply.handled) {
      expect(reply.kind).toBe("open");
      expect(reply.openRoomId).toBe("achievement-library");
      expect(reply.ack).toMatch(/Celebration Garden/i);
    }
  });

  it("declines cleanly", () => {
    clearCollectionPendingOffer();
    const pending = createCollectionPendingOffer({
      roomId: "evidence-vault",
      sourceUserText: "Solved it.",
      offerLine: "Vault?",
      prefill: buildCollectionPrefill("evidence-vault", "Solved it."),
      offeredAtTurn: 2,
    });
    const reply = resolveCollectionOfferReply("no", pending);
    expect(reply.handled).toBe(true);
    if (reply.handled) {
      expect(reply.kind).toBe("decline");
    }
    expect(loadCollectionPendingOffer()).toBeNull();
  });
});
