import { describe, expect, it } from "vitest";
import {
  PROFILE_DESTINATION_DEFAULT,
  PROFILE_MENU_LABELS,
  canonicalizeProfileDestinationOverlay,
  isProfileDestinationOverlay,
  profileDestinationBreadcrumb,
  profileDestinationForMenuAction,
  profileDestinationTitle,
  resolveProfileDestination,
  resolveProfileDestinationNavigation,
} from "./profileDestination";

describe("profileDestination", () => {
  it("defaults resolve helper to my-business-estate only when omitted", () => {
    expect(resolveProfileDestination()).toBe("my-business-estate");
    expect(resolveProfileDestination(null)).toBe("my-business-estate");
    expect(PROFILE_DESTINATION_DEFAULT).toBe("my-business-estate");
  });

  it("maps each SH menu action to exactly one destination", () => {
    expect(profileDestinationForMenuAction("my-business-estate")).toBe(
      "my-business-estate",
    );
    expect(profileDestinationForMenuAction("people-i-help")).toBe(
      "people-i-help",
    );
    expect(profileDestinationForMenuAction("my-profile")).toBe(
      "profile-personal",
    );
    expect(profileDestinationForMenuAction("estate-profile")).toBe(
      "profile-personal",
    );
    expect(profileDestinationForMenuAction("settings")).toBeNull();
  });

  it("never resolves My Profile navigation to Business Estate", () => {
    expect(resolveProfileDestinationNavigation("profile-personal")).toEqual({
      kind: "profile-personal-overlay",
      destinationId: "profile-personal",
    });
    expect(resolveProfileDestinationNavigation("my-business-estate")).toEqual({
      kind: "my-business-estate-overlay",
      destinationId: "my-business-estate",
    });
    expect(resolveProfileDestinationNavigation("people-i-help")).toEqual({
      kind: "people-i-help-overlay",
      destinationId: "people-i-help",
    });
  });

  it("canonicalizes legacy profile overlay to my-business-estate", () => {
    expect(canonicalizeProfileDestinationOverlay("profile")).toBe(
      "my-business-estate",
    );
    expect(canonicalizeProfileDestinationOverlay("profile-personal")).toBe(
      "profile-personal",
    );
    expect(isProfileDestinationOverlay("my-business-estate")).toBe(true);
    expect(isProfileDestinationOverlay("profile-personal")).toBe(true);
  });

  it("builds My Spark Estate breadcrumbs", () => {
    expect(PROFILE_MENU_LABELS.mySparkEstate).toBe("My Spark Estate");
    expect(profileDestinationBreadcrumb("profile-personal")).toBe(
      "My Spark Estate › My Profile",
    );
    expect(profileDestinationBreadcrumb("people-i-help")).toBe(
      "My Spark Estate › People I Help",
    );
    expect(profileDestinationBreadcrumb("my-business-estate")).toBe(
      "My Spark Estate › My Business Estate",
    );
    expect(profileDestinationTitle("profile")).toBe("My Business Estate");
  });
});
