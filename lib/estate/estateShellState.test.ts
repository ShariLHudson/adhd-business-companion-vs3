import { describe, expect, it } from "vitest";

import { resolveEstateShellState } from "./estateShellState";

describe("resolveEstateShellState — Phase D.1", () => {
  it("living place forbids invitation grid and title plaque", () => {
    const state = resolveEstateShellState("greenhouse");
    expect(state).not.toBeNull();
    expect(state!.category).toBe("living-place");
    expect(state!.showInvitationGrid).toBe(false);
    expect(state!.showTitlePlaque).toBe(false);
    expect(state!.livingPlaceMode).toBe(true);
    expect(state!.conversationOnly).toBe(true);
  });

  it("reading nook is living place — not library", () => {
    const nook = resolveEstateShellState("reading-nook");
    const library = resolveEstateShellState("library");
    expect(nook?.placeId).toBe("reading-nook");
    expect(library?.placeId).toBe("library");
    expect(nook?.livingPlaceMode).toBe(true);
    expect(library?.livingPlaceMode).toBe(false);
  });

  it("celebration-room is canonical destination (P0)", () => {
    const state = resolveEstateShellState("celebration-room");
    expect(state?.placeId).toBe("celebration-room");
    expect(state?.officialName).toContain("Celebration Room");
  });

  it("legacy celebration-garden id normalizes to gardens room", () => {
    const state = resolveEstateShellState("celebration-garden");
    expect(state?.placeId).toBe("gardens");
  });

  it("profile estate mode is always conversation-only", () => {
    const state = resolveEstateShellState("growth-profile", {
      placeId: "growth-profile",
      profileEstateMode: true,
    });
    expect(state?.category).toBe("profile-estate");
    expect(state?.conversationOnly).toBe(true);
    expect(state?.showInvitationGrid).toBe(false);
  });

  it("destination may show invitation grid when canon allows", () => {
    const state = resolveEstateShellState("momentum-institute");
    expect(state?.category).toBe("destination");
    expect(state?.showInvitationGrid).toBe(true);
    expect(state?.conversationOnly).toBe(false);
  });

  it("preserves conversation law on all resolved places", () => {
    for (const id of ["coffee-house", "library", "celebration-room"]) {
      const state = resolveEstateShellState(id);
      expect(state?.preserveConversation).toBe(true);
    }
  });
});
