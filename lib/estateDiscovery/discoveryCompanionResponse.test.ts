import { describe, expect, it } from "vitest";
import { resolveDiscoveryCompanionResponse } from "./discoveryCompanionResponse";
import { primaryButtonLabelForCategory, toDiscoveryNoteData } from "./discoveryNotePresentation";
import type { DiscoveryEngineSelection } from "./types";

describe("discoveryCompanionResponse", () => {
  it("returns curated companion line when present", () => {
    expect(
      resolveDiscoveryCompanionResponse({
        companionResponse: "I'm glad you're here.",
        title: "Welcome",
        discoveryText: "Welcome text",
        whyItMatters: null,
      }),
    ).toBe("I'm glad you're here.");
  });
});

describe("discoveryNotePresentation", () => {
  it("shows primary button when companion response exists without destination", () => {
    const selection: DiscoveryEngineSelection = {
      discoveryId: "DISC-002",
      category: "welcome",
      title: "Meet Your Discovery Key",
      subtitle: null,
      destinationRoute: null,
      destinationSection: null,
      image: null,
      discoveryText: "Key text",
      whyItMatters: null,
      foodForThought: null,
      primaryButton: "Tell Me More",
      companionResponse: "The key is a gentle invitation.",
      saveAllowed: true,
      relatedRoom: null,
      priority: "Essential",
    };

    const note = toDiscoveryNoteData(selection);
    expect(note.showPrimaryButton).toBe(true);
    expect(note.primaryButtonLabel).toBe("Tell Me More");
    expect(primaryButtonLabelForCategory("welcome", null)).toBe("Continue");
  });
});
