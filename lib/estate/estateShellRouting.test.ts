import { describe, expect, it } from "vitest";
import {
  profileEstateRoomUsesDedicatedPanel,
  resolveSparkEstateShellPlaceId,
} from "./estateShellRouting";
import { DEDICATED_ESTATE_ROOM_PANEL_SECTIONS } from "./directEstateVisit";

describe("estateShellRouting", () => {
  it("marks growth profile, journal, and evidence vault as dedicated panels", () => {
    expect(profileEstateRoomUsesDedicatedPanel("growth-profile")).toBe(true);
    expect(profileEstateRoomUsesDedicatedPanel("journal")).toBe(true);
    expect(profileEstateRoomUsesDedicatedPanel("evidence-vault")).toBe(true);
    expect(profileEstateRoomUsesDedicatedPanel("my-estate")).toBe(true);
    expect(profileEstateRoomUsesDedicatedPanel("portfolio")).toBe(false);
  });

  it("does not mount SparkEstateShell for growth-profile overlay", () => {
    expect(
      resolveSparkEstateShellPlaceId({
        profileEstateRoomOverlayId: "growth-profile",
        showDirectEstateOverlay: false,
        estateChatRoomId: null,
        estateConservatoryEngaged: false,
        clearMyMindWorkspaceActive: false,
        activeSection: "home",
      }),
    ).toBeNull();
  });

  it("does not mount SparkEstateShell for my-estate overlay", () => {
    expect(
      resolveSparkEstateShellPlaceId({
        profileEstateRoomOverlayId: "my-estate",
        showDirectEstateOverlay: false,
        estateChatRoomId: null,
        estateConservatoryEngaged: false,
        clearMyMindWorkspaceActive: false,
        activeSection: "home",
      }),
    ).toBeNull();
  });

  it("does not mount SparkEstateShell on dedicated sections", () => {
    for (const activeSection of DEDICATED_ESTATE_ROOM_PANEL_SECTIONS) {
      expect(
        resolveSparkEstateShellPlaceId({
          profileEstateRoomOverlayId: "journal",
          showDirectEstateOverlay: true,
          estateChatRoomId: "journal",
          estateConservatoryEngaged: false,
          clearMyMindWorkspaceActive: false,
          activeSection,
        }),
      ).toBeNull();
    }
  });

  it("still mounts SparkEstateShell for direct non-dedicated estate visits", () => {
    expect(
      resolveSparkEstateShellPlaceId({
        profileEstateRoomOverlayId: null,
        showDirectEstateOverlay: true,
        estateChatRoomId: "coffee-house",
        estateConservatoryEngaged: false,
        clearMyMindWorkspaceActive: false,
        activeSection: "focus-audio",
      }),
    ).toBe("coffee-house");
  });

  it("does not mount SparkEstateShell for clear my mind workspace", () => {
    expect(
      resolveSparkEstateShellPlaceId({
        profileEstateRoomOverlayId: "my-estate",
        showDirectEstateOverlay: true,
        estateChatRoomId: "coffee-house",
        estateConservatoryEngaged: false,
        clearMyMindWorkspaceActive: true,
        activeSection: "brain-dump",
      }),
    ).toBeNull();
  });
});
