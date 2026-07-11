import { describe, expect, it } from "vitest";
import {
  PROFILE_DESTINATION_DEFAULT,
  PROFILE_MENU_LABELS,
  resolveProfileDestination,
  resolveProfileDestinationNavigation,
} from "./profileDestination";

describe("profileDestination", () => {
  it("defaults to my-business-estate", () => {
    expect(resolveProfileDestination()).toBe("my-business-estate");
    expect(resolveProfileDestination(null)).toBe("my-business-estate");
    expect(PROFILE_DESTINATION_DEFAULT).toBe("my-business-estate");
  });

  it("uses approved Profile labels without trademark symbols", () => {
    expect(PROFILE_MENU_LABELS.myBusinessEstate).toBe("My Business Estate");
    expect(PROFILE_MENU_LABELS.peopleIHelp).toBe("People I Help");
    expect(PROFILE_MENU_LABELS.myBusinessEstate).not.toContain("™");
    expect(PROFILE_MENU_LABELS.peopleIHelp).not.toContain("™");
  });

  it("resolves profile overlay navigation", () => {
    expect(resolveProfileDestinationNavigation()).toEqual({
      kind: "profile-overlay",
    });
    expect(resolveProfileDestinationNavigation("people-i-help")).toEqual({
      kind: "people-i-help-overlay",
    });
  });
});
