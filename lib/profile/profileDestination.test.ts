import { describe, expect, it } from "vitest";
import {
  PROFILE_DESTINATION_DEFAULT,
  PROFILE_MENU_LABELS,
  isProfileDestinationOverlay,
  profileDestinationBreadcrumbParent,
  profileDestinationTitle,
  resolveProfileDestination,
  resolveProfileDestinationNavigation,
} from "./profileDestination";

describe("profileDestination", () => {
  it("defaults to my-business-estate", () => {
    expect(resolveProfileDestination()).toBe("my-business-estate");
    expect(resolveProfileDestination(null)).toBe("my-business-estate");
    expect(PROFILE_DESTINATION_DEFAULT).toBe("my-business-estate");
  });

  it("uses approved My Spark Estate labels without trademark symbols", () => {
    expect(PROFILE_MENU_LABELS.myBusinessEstate).toBe("My Business Estate");
    expect(PROFILE_MENU_LABELS.peopleIHelp).toBe("People I Help");
    expect(PROFILE_MENU_LABELS.myProfile).toBe("My Profile");
    expect(PROFILE_MENU_LABELS.mySparkEstate).toBe("My Spark Estate");
    expect(PROFILE_MENU_LABELS.myBusinessEstate).not.toContain("™");
  });

  it("resolves distinct overlay navigation for each sibling", () => {
    expect(resolveProfileDestinationNavigation()).toEqual({
      kind: "profile-overlay",
      destinationId: "my-business-estate",
    });
    expect(resolveProfileDestinationNavigation("people-i-help")).toEqual({
      kind: "people-i-help-overlay",
      destinationId: "people-i-help",
    });
    expect(resolveProfileDestinationNavigation("profile-personal")).toEqual({
      kind: "profile-personal-overlay",
      destinationId: "profile-personal",
    });
    expect(resolveProfileDestinationNavigation("my-business-estate")).toEqual({
      kind: "profile-overlay",
      destinationId: "my-business-estate",
    });
  });

  it("identifies dedicated profile destination overlays including My Profile", () => {
    expect(isProfileDestinationOverlay("profile")).toBe(true);
    expect(isProfileDestinationOverlay("people-i-help")).toBe(true);
    expect(isProfileDestinationOverlay("profile-personal")).toBe(true);
    expect(isProfileDestinationOverlay("growth-profile")).toBe(true);
    expect(isProfileDestinationOverlay("settings")).toBe(false);
  });

  it("builds My Spark Estate breadcrumbs", () => {
    expect(profileDestinationBreadcrumbParent()).toBe("My Spark Estate");
    expect(profileDestinationTitle("profile-personal")).toBe("My Profile");
    expect(profileDestinationTitle("people-i-help")).toBe("People I Help");
    expect(profileDestinationTitle("profile")).toBe("My Business Estate");
  });
});
