import { describe, expect, it } from "vitest";

import { toDiscoveryNoteData, primaryButtonLabelForCategory } from "./discoveryNotePresentation";
import type { DiscoveryEngineSelection } from "./types";

const baseSelection: DiscoveryEngineSelection = {
  discoveryId: "DISC-001",
  category: "estate-discovery",
  title: "Greenhouse™",
  subtitle: null,
  destinationRoute: "/companion?section=growth-greenhouse",
  destinationSection: "growth-greenhouse",
  image: null,
  discoveryText: "Quiet growth.",
  whyItMatters: "Patience matters.",
  foodForThought: null,
  primaryButton: null,
  saveAllowed: true,
  relatedRoom: "greenhouse",
  priority: "Essential",
};

describe("discoveryNotePresentation", () => {
  it("maps engine selection to note data", () => {
    const note = toDiscoveryNoteData(baseSelection);
    expect(note.title).toBe("Greenhouse™");
    expect(note.showPrimaryButton).toBe(true);
    expect(note.primaryButtonLabel).toBe("Take Me There");
  });

  it("honors primary button override", () => {
    const note = toDiscoveryNoteData({
      ...baseSelection,
      primaryButton: "Visit the Greenhouse",
    });
    expect(note.primaryButtonLabel).toBe("Visit the Greenhouse");
  });

  it("hides primary button without destination", () => {
    const note = toDiscoveryNoteData({
      ...baseSelection,
      destinationSection: null,
      destinationRoute: null,
    });
    expect(note.showPrimaryButton).toBe(false);
  });

  it("uses category labels", () => {
    expect(primaryButtonLabelForCategory("feature-discovery", null)).toBe(
      "Show Me How",
    );
  });
});
