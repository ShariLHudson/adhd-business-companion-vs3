import { describe, expect, it } from "vitest";

import {
  isEstatePlaceChromeActive,
  resolveEstateChromePolicy,
  shouldSuppressEstateInvitationGrid,
  shouldSuppressEstateTitlePlaque,
} from "./estateChromePolicy";

describe("estateChromePolicy", () => {
  it("living places suppress invitation grids and title plaques", () => {
    expect(shouldSuppressEstateInvitationGrid("greenhouse")).toBe(true);
    expect(shouldSuppressEstateInvitationGrid("coffee-house")).toBe(true);
    expect(shouldSuppressEstateInvitationGrid("reading-nook")).toBe(true);
    expect(shouldSuppressEstateTitlePlaque("conservatory")).toBe(true);
    expect(shouldSuppressEstateTitlePlaque("apple-orchard")).toBe(true);
  });

  it("destinations with object-invitation may show grids", () => {
    expect(shouldSuppressEstateInvitationGrid("library")).toBe(false);
    expect(shouldSuppressEstateInvitationGrid("momentum-institute")).toBe(false);
  });

  it("direct estate overlay hides application chrome", () => {
    const policy = resolveEstateChromePolicy({
      showDirectEstateOverlay: true,
      placeId: "greenhouse",
    });
    expect(policy.hideApplicationChrome).toBe(true);
    expect(policy.hideEstateHomeLink).toBe(false);
    expect(policy.livingPlaceMode).toBe(true);
    expect(policy.hideInvitationGrid).toBe(true);
  });

  it("generic home keeps application chrome", () => {
    const policy = resolveEstateChromePolicy({
      estateImmersiveActive: false,
      showDirectEstateOverlay: false,
    });
    expect(policy.hideApplicationChrome).toBe(false);
  });

  it("detects estate place chrome contexts", () => {
    expect(
      isEstatePlaceChromeActive({ showDirectEstateOverlay: true }),
    ).toBe(true);
    expect(isEstatePlaceChromeActive({ welcomeHomePrimary: true })).toBe(true);
    expect(isEstatePlaceChromeActive({})).toBe(false);
  });
});
