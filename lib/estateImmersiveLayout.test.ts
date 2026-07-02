import { describe, expect, it } from "vitest";
import { shouldShowEstateRoomHomeLink } from "./estateImmersiveLayout";

const base = {
  activeSection: "home" as const,
  workspacePanel: null,
  welcomeHomePrimary: false,
  momentumBuilderPrimary: false,
  momentumInstitutePrimary: false,
  stablesPrimary: false,
  profileEstateChromeActive: false,
  overlay: null,
  focusSanctuaryFullBleed: false,
};

describe("shouldShowEstateRoomHomeLink", () => {
  it("shows home on profile estate rooms while on home section", () => {
    expect(
      shouldShowEstateRoomHomeLink({
        ...base,
        profileEstateChromeActive: true,
      }),
    ).toBe(true);
  });

  it("shows home on settings overlay", () => {
    expect(
      shouldShowEstateRoomHomeLink({
        ...base,
        overlay: "settings",
      }),
    ).toBe(true);
  });

  it("hides home during welcome home primary", () => {
    expect(
      shouldShowEstateRoomHomeLink({
        ...base,
        welcomeHomePrimary: true,
        profileEstateChromeActive: true,
      }),
    ).toBe(false);
  });
});
