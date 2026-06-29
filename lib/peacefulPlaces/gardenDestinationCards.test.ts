import { describe, expect, it } from "vitest";
import {
  gardenDestinationCardFor,
  gardenDestinationCardsForSign,
} from "./gardenDestinationCards";

describe("gardenDestinationCards", () => {
  it("ships invitation copy for every focus card", () => {
    const cards = gardenDestinationCardsForSign("focus");
    expect(cards).toHaveLength(4);
    expect(cards[0]?.title).toBe("First Step Finder");
    expect(cards[0]?.description).toMatch(/next small step/i);
    expect(cards[3]?.title).toBe("Music Room");
    expect(cards.every((card) => card.imageUrl.length > 0)).toBe(true);
  });

  it("includes hover ambience for nature escape", () => {
    const card = gardenDestinationCardFor("nature-escape");
    expect(card?.title).toBe("Nature Escape");
    expect(card?.hoverAmbienceUrl).toContain(".mp3");
  });

  it("ships three recharge invitation cards", () => {
    const cards = gardenDestinationCardsForSign("energize");
    expect(cards).toHaveLength(3);
    expect(cards.map((card) => card.title)).toEqual([
      "Nature Escape",
      "Sunshine Break",
      "Energy Reset",
    ]);
  });

  it("aligns unwind cards with evening destinations", () => {
    const titles = gardenDestinationCardsForSign("unwind").map((c) => c.title);
    expect(titles).toEqual([
      "Bedroom Window",
      "Evening Hearth",
      "Woodland Path",
      "Moonlit Shore",
    ]);
  });
});
