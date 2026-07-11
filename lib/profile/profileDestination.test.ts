import { describe, expect, it } from "vitest";
import {
  PROFILE_DESTINATION_CARDS,
  PROFILE_DESTINATION_DEFAULT,
  resolveProfileDestination,
  resolveProfileDestinationNavigation,
} from "./profileDestination";

describe("profileDestination", () => {
  it("defaults to my-business-estate", () => {
    expect(resolveProfileDestination()).toBe("my-business-estate");
    expect(resolveProfileDestination(null)).toBe("my-business-estate");
    expect(PROFILE_DESTINATION_DEFAULT).toBe("my-business-estate");
  });

  it("lists only approved Profile destinations", () => {
    expect(PROFILE_DESTINATION_CARDS.map((card) => card.destination)).toEqual([
      "my-business-estate",
      "people-i-help",
    ]);
    expect(
      PROFILE_DESTINATION_CARDS.some((card) =>
        /evidence|journal|portfolio|settings/i.test(card.label),
      ),
    ).toBe(false);
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
