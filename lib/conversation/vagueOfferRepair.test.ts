import { describe, expect, it } from "vitest";
import {
  isVagueOfferConfusion,
  looksLikeNumberedEstateRoomMenu,
  repairNumberedEstateRoomMenu,
  vagueOfferConfusionReply,
} from "./vagueOfferRepair";

describe("vagueOfferRepair", () => {
  it("detects confusion after a vague offer", () => {
    expect(
      isVagueOfferConfusion(
        "which of what would help most right now",
        "Happy to — which of those would help most right now?",
      ),
    ).toBe(true);
  });

  it("repairs numbered estate room menus", () => {
    const menu = `Here are a few options:
1. Explore the Music Room for relaxation.
2. Visit the Apple Orchard for reflection.
3. Check out the Conservatory.`;
    expect(looksLikeNumberedEstateRoomMenu(menu)).toBe(true);
    expect(repairNumberedEstateRoomMenu(menu)).toBe(vagueOfferConfusionReply());
  });
});
