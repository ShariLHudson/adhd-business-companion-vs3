import { describe, expect, it } from "vitest";

import { validateCanonicalRegistryIntegrity } from "./canonicalEstateRegistry";
import { goToPlace } from "./goToPlace";
import { isPresenceModeRequest } from "./justBeHere";
import {
  resolveEstateRoutingDecision,
  routingDecisionToPlaceResolution,
  resolveNavigationTarget,
} from "./estateRoutingRegistry";
import {
  resolveEstatePlace,
  shouldNavigateFromResolution,
} from "./resolveEstatePlace";

describe("estateRoutingRegistry — canonical routing map", () => {
  it("passes registry integrity with subspaces and objects", () => {
    expect(validateCanonicalRegistryIntegrity()).toEqual([]);
  });

  const navigate = (text: string, context?: { currentPlaceId?: string }) => {
    const decision = resolveEstateRoutingDecision(text, context);
    expect(decision.kind).toBe("navigate");
    expect(decision.placeId).toBeTruthy();

    const resolution = routingDecisionToPlaceResolution(decision);
    expect(shouldNavigateFromResolution(resolution)).toBe(true);

    const outcome = goToPlace({
      placeId: resolution.placeId!,
      userIntent: text,
    });
    expect(outcome.ok).toBe(true);
    return { decision, resolution, outcome: outcome as Extract<typeof outcome, { ok: true }> };
  };

  it("take me to the Possibility House", () => {
    const { decision, outcome } = navigate("take me to the Possibility House");
    expect(decision.placeId).toBe("house-possibility-outside");
    expect(outcome.placeId).toBe("house-possibility-outside");
  });

  it("show me the Discovery Chest — object opens in Possibility House", () => {
    const { decision, outcome } = navigate("show me the Discovery Chest");
    expect(decision.subspaceId).toBe("house-possibility-discovery-chest");
    expect(decision.placeId).toBe("house-possibility-outside");
    expect(outcome.directVisit.roomId).toBe("house-possibility-outside");
    expect(outcome.directVisit.subspaceId).toBe(
      "house-possibility-discovery-chest",
    );
  });

  it("open the Cabinet of Chapters — Treehouse object", () => {
    const { decision, outcome } = navigate("open the Cabinet of Chapters");
    expect(decision.subspaceId).toBe("house-possibility-cabinet-of-chapters");
    expect(decision.placeId).toBe("house-possibility-outside");
    expect(outcome.directVisit.subspaceId).toBe(
      "house-possibility-cabinet-of-chapters",
    );
  });

  it("take me to the Legacy Room — Treehouse", () => {
    const { decision } = navigate("take me to the Legacy Room");
    expect(decision.placeId).toBe("house-possibility-outside");
    expect(decision.subspaceId).toBe("house-possibility-legacy-room");
  });

  it("visit the treehouse observatory", () => {
    const { decision } = navigate("visit the treehouse observatory");
    expect(decision.subspaceId).toBe("house-possibility-observatory");
    expect(decision.placeId).toBe("house-possibility-outside");
  });

  it("tell me about Possibility House — guide, not navigation", () => {
    const decision = resolveEstateRoutingDecision(
      "tell me about Possibility House",
    );
    expect(decision.kind).toBe("none");
    expect(
      shouldNavigateFromResolution(
        resolveEstatePlace("tell me about Possibility House"),
      ),
    ).toBe(false);
  });

  it("observatory — ambiguous Treehouse vs main Estate vs telescope deck", () => {
    const decision = resolveEstateRoutingDecision("observatory");
    expect(decision.kind).toBe("suggest");
    expect(decision.suggestedPlaceIds).toContain("house-possibility-observatory");
    expect(decision.suggestedPlaceIds).toContain("observatory");
    expect(decision.suggestedPlaceIds).toContain("house-possibility-telescope-deck");
  });

  it("take me to the telescope — ambiguous choices", () => {
    const decision = resolveEstateRoutingDecision("take me to the telescope");
    expect(decision.kind).toBe("suggest");
    expect(decision.suggestedPlaceIds).toEqual([
      "observatory-telescope-window",
      "house-possibility-telescope-deck",
    ]);
  });

  it("garden — offers choices, never routes to home", () => {
    const decision = resolveEstateRoutingDecision("garden");
    expect(decision.kind).toBe("suggest");
    expect(decision.suggestedPlaceIds?.length).toBeGreaterThanOrEqual(2);
    expect(decision.placeId).not.toBe("welcome-home");
    expect(decision.placeId).not.toBe("home");
  });

  it("reading nook — ambiguous nooks", () => {
    const decision = resolveEstateRoutingDecision("reading nook");
    expect(decision.kind).toBe("suggest");
    expect(decision.suggestedPlaceIds).toContain("reading-nook");
    expect(decision.suggestedPlaceIds).toContain("stairway-reading-nook");
  });

  it("I just want to sit here — presence mode", () => {
    const decision = resolveEstateRoutingDecision("I just want to sit here");
    expect(decision.kind).toBe("presence");
    expect(isPresenceModeRequest("I just want to sit here")).toBe(true);
  });

  it("hide chat — presence mode", () => {
    const decision = resolveEstateRoutingDecision("hide chat");
    expect(decision.kind).toBe("presence");
    expect(isPresenceModeRequest("hide chat")).toBe(true);
  });

  it("show me the greenhouse — clear destination", () => {
    const { decision } = navigate("show me the greenhouse");
    expect(decision.placeId).toBe("greenhouse");
  });

  it("take me to the Reflection Tree", () => {
    const { decision } = navigate("take me to the Reflection Tree");
    expect(decision.placeId).toBe("reflection-tree-main");
  });

  it("in-room subspace when already in Legacy Room", () => {
    const decision = resolveEstateRoutingDecision("reflection corner", {
      currentPlaceId: "legacy-room-main",
    });
    expect(decision.kind).toBe("navigate");
    expect(decision.subspaceId).toBe("legacy-room-reflection-corner");
    expect(decision.placeId).toBe("legacy-room-main");
  });

  it("resolveNavigationTarget maps objects to parent room", () => {
    const target = resolveNavigationTarget("legacy-room-cabinet-of-chapters");
    expect(target?.navigatePlaceId).toBe("legacy-room-main");
    expect(target?.subspaceId).toBe("legacy-room-cabinet-of-chapters");
  });

  it("resolveEstatePlace delegates to routing registry for navigation", () => {
    const resolution = resolveEstatePlace("take me to the Possibility House");
    expect(shouldNavigateFromResolution(resolution)).toBe(true);
    expect(resolution.placeId).toBe("house-possibility-outside");
  });
});
