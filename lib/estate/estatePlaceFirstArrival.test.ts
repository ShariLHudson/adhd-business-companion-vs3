import { describe, expect, it } from "vitest";
import { goToPlace } from "./goToPlace";
import { shouldSuppressDestinationInvitationGrid } from "./estatePlaceFirstArrival";
import { shouldSuppressEstateInvitationGrid } from "./estateChromePolicy";

describe("estatePlaceFirstArrival", () => {
  it("never allows invitation grids on destination entry", () => {
    expect(shouldSuppressDestinationInvitationGrid()).toBe(true);
    expect(shouldSuppressEstateInvitationGrid("momentum-institute")).toBe(true);
    expect(shouldSuppressEstateInvitationGrid("library")).toBe(true);
  });

  it("goToPlace never opens invitation grids", () => {
    const institute = goToPlace({ placeId: "momentum-institute" });
    const library = goToPlace({ placeId: "library" });
    expect(institute.ok && institute.showInvitationGrid).toBe(false);
    expect(library.ok && library.showInvitationGrid).toBe(false);
  });
});
