import { describe, expect, it } from "vitest";
import {
  shouldPreserveEstateRoomSectionDuringChat,
  shouldShowEstateRoomHomeLink,
} from "./estateImmersiveLayout";

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

describe("shouldPreserveEstateRoomSectionDuringChat", () => {
  it("preserves standalone estate room sections during chat", () => {
    expect(shouldPreserveEstateRoomSectionDuringChat("chamber-of-momentum")).toBe(
      true,
    );
    expect(shouldPreserveEstateRoomSectionDuringChat("evidence-bank")).toBe(true);
  });

  it("does not preserve the home chat shell", () => {
    expect(shouldPreserveEstateRoomSectionDuringChat("home")).toBe(false);
    expect(shouldPreserveEstateRoomSectionDuringChat(null)).toBe(false);
  });
});
