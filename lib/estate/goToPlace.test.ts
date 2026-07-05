import { describe, expect, it } from "vitest";

import { goToPlace } from "./goToPlace";
import {
  resolveEstatePlace,
  shouldNavigateFromResolution,
} from "./resolveEstatePlace";

describe("goToPlace", () => {
  it("validates canonical place and preserves conversation law", () => {
    const outcome = goToPlace({ placeId: "greenhouse", userIntent: "Take me to the Greenhouse." });
    expect(outcome.ok).toBe(true);
    if (!outcome.ok) return;
    expect(outcome.placeId).toBe("greenhouse");
    expect(outcome.preserveConversation).toBe(true);
    expect(outcome.resetConversation).toBe(false);
    expect(outcome.autoOpenActivity).toBe(false);
    expect(outcome.directVisit.roomId).toBe("greenhouse");
  });

  it("living places forbid title plaque and invitation grid", () => {
    const outcome = goToPlace({ placeId: "coffee-house" });
    expect(outcome.ok).toBe(true);
    if (!outcome.ok) return;
    expect(outcome.category).toBe("living-place");
    expect(outcome.showTitlePlaque).toBe(false);
    expect(outcome.showInvitationGrid).toBe(false);
  });

  it("rejects unknown place ids", () => {
    const outcome = goToPlace({ placeId: "not-a-real-place" });
    expect(outcome.ok).toBe(false);
    if (outcome.ok) return;
    expect(outcome.code).toBe("unknown_place");
  });
});

describe("resolveEstatePlace — Phase C success tests", () => {
  const navigate = (text: string) => {
    const resolution = resolveEstatePlace(text);
    expect(shouldNavigateFromResolution(resolution)).toBe(true);
    expect(resolution.placeId).toBeTruthy();
    const outcome = goToPlace({
      placeId: resolution.placeId!,
      userIntent: text,
      explicitActivityRequested: resolution.explicitActivityRequested,
    });
    expect(outcome.ok).toBe(true);
    return { resolution, outcome: outcome as Extract<typeof outcome, { ok: true }> };
  };

  it("Take me to the Greenhouse.", () => {
    const { resolution } = navigate("Take me to the Greenhouse.");
    expect(resolution.placeId).toBe("greenhouse");
  });

  it("Go to the Reading Nook.", () => {
    const { resolution } = navigate("Go to the Reading Nook.");
    expect(resolution.placeId).toBe("reading-nook");
  });

  it("Take me to the Momentum Institute.", () => {
    const { resolution } = navigate("Take me to the Momentum Institute.");
    expect(resolution.placeId).toBe("momentum-institute");
  });

  it("Open the Celebration Room.", () => {
    const { resolution } = navigate("Open the Celebration Room.");
    expect(resolution.placeId).toBe("celebration-room");
  });

  it("Show me my Accomplishments Book.", () => {
    const { resolution } = navigate("Show me my Accomplishments Book.");
    expect(resolution.placeId).toBe("accomplishments-shelf");
  });

  it("Take me to the Coffee House.", () => {
    const { resolution } = navigate("Take me to the Coffee House.");
    expect(resolution.placeId).toBe("coffee-house");
  });

  it("Take me to the butterfly conservatory → living place on home", () => {
    const { resolution, outcome } = navigate(
      "Take me to the butterfly conservatory.",
    );
    expect(resolution.placeId).toBe("conservatory");
    expect(outcome.section).toBe("home");
    expect(outcome.autoOpenActivity).toBe(false);
    expect(outcome.category).toBe("living-place");
  });

  it("Let's go to the Apple Orchard.", () => {
    const { resolution } = navigate("Let's go to the Apple Orchard.");
    expect(resolution.placeId).toBe("apple-orchard");
  });

  it("let's sit under the stairs → reading nook", () => {
    const { resolution } = navigate("let's sit under the stairs");
    expect(resolution.placeId).toBe("reading-nook");
  });

  it("go to the institute → momentum institute", () => {
    const { resolution } = navigate("go to the institute");
    expect(resolution.placeId).toBe("momentum-institute");
  });

  it("I want to sit somewhere quiet → suggestion only", () => {
    const resolution = resolveEstatePlace("I want to sit somewhere quiet.");
    expect(resolution.kind).toBe("suggestion");
    expect(resolution.suggestedPlaceIds).toContain("reading-nook");
    expect(resolution.suggestedPlaceIds).toContain("gardens");
    expect(resolution.suggestedPlaceIds).toContain("library");
    expect(shouldNavigateFromResolution(resolution)).toBe(false);
  });

  it("I need to celebrate something → canonical celebration suggestions", () => {
    const resolution = resolveEstatePlace("I need to celebrate something.");
    expect(resolution.kind).toBe("suggestion");
    expect(resolution.suggestedPlaceIds?.length).toBeGreaterThan(0);
    expect(resolution.suggestedPlaceIds?.length).toBeLessThanOrEqual(3);
    expect(shouldNavigateFromResolution(resolution)).toBe(false);
  });

  it("I want to learn something → canonical learn suggestions", () => {
    const resolution = resolveEstatePlace("I want to learn something.");
    expect(resolution.kind).toBe("suggestion");
    expect(resolution.suggestedPlaceIds?.length).toBeGreaterThan(0);
    expect(resolution.suggestedPlaceIds?.length).toBeLessThanOrEqual(3);
    expect(shouldNavigateFromResolution(resolution)).toBe(false);
  });

  it("I need to clear my mind → explicit activity navigation", () => {
    const resolution = resolveEstatePlace("I need to clear my mind");
    expect(resolution.kind).toBe("explicit-activity");
    expect(resolution.placeId).toBe("clear-my-mind");
    expect(resolution.explicitActivityRequested).toBe(true);
  });

  it("my wins → Celebration Garden / wins collection", () => {
    const { resolution } = navigate("show me my wins");
    expect(resolution.placeId).toBe("gardens");
  });

  it("proof of growth → evidence vault (P0)", () => {
    const { resolution } = navigate("take me to proof of growth");
    expect(resolution.placeId).toBe("evidence-vault");
  });

  it("legacy celebration-garden id resolves via goToPlace", () => {
    const outcome = goToPlace({ placeId: "celebration-garden" });
    expect(outcome.ok).toBe(true);
    if (!outcome.ok) return;
    expect(outcome.placeId).toBe("gardens");
  });
});
