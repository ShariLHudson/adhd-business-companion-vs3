import { describe, expect, it } from "vitest";
import {
  isProfileEstateMenuAction,
  isProfileEstateRoomId,
  profileEstateRoomBackgroundImage,
  profileEstateRoomForMenuAction,
  profileEstateSectionForRoom,
  type EstateMenuShellActionId,
} from "./profileEstateRooms";
import {
  GROWTH_ROOM_BG,
  ESTATE_PROFILE_ROOM_BG,
  EVIDENCE_VAULT_ROOM_BG,
  PORTFOLIO_ROOM_BG,
} from "./growthRoom";

describe("profileEstateRooms", () => {
  it("maps immersive estate menu actions — not My Spark Estate overlays", () => {
    expect(profileEstateRoomForMenuAction("growth-profile")).toBe(
      "growth-profile",
    );
    expect(profileEstateRoomForMenuAction("evidence-vault")).toBe(
      "evidence-vault",
    );
    expect(profileEstateRoomForMenuAction("portfolio")).toBe("portfolio");
    expect(isProfileEstateMenuAction("my-profile")).toBe(false);
    expect(isProfileEstateMenuAction("estate-profile")).toBe(false);
    expect(isProfileEstateMenuAction("my-business-estate")).toBe(false);
    expect(isProfileEstateMenuAction("journal")).toBe(false);
    expect(isProfileEstateMenuAction("settings")).toBe(false);
  });

  it("excludes My Spark Estate overlay actions from shell ids", () => {
    type AssertPeopleIHelpExcluded =
      "people-i-help" extends EstateMenuShellActionId ? never : true;
    type AssertMyProfileExcluded =
      "my-profile" extends EstateMenuShellActionId ? never : true;
    type AssertBusinessExcluded =
      "my-business-estate" extends EstateMenuShellActionId ? never : true;
    const ok: AssertPeopleIHelpExcluded &
      AssertMyProfileExcluded &
      AssertBusinessExcluded = true;
    expect(ok).toBe(true);
  });

  it("maps profile rooms to growth sections", () => {
    expect(profileEstateSectionForRoom("portfolio")).toBe("growth-portfolio");
    expect(profileEstateSectionForRoom("evidence-vault")).toBe("evidence-bank");
    expect(profileEstateSectionForRoom("journal")).toBe("growth-journal");
  });

  it("recognizes profile estate room ids", () => {
    expect(isProfileEstateRoomId("growth-profile")).toBe(true);
    expect(isProfileEstateRoomId("stables")).toBe(false);
  });

  it("uses greenhouse-background for growth profile", () => {
    expect(profileEstateRoomBackgroundImage("growth-profile")).toBe(GROWTH_ROOM_BG);
    expect(profileEstateRoomBackgroundImage("growth-profile")).toBe(
      "/backgrounds/greenhouse-background.png",
    );
  });

  it("uses spark-estate-photo-background for estate profile room plate", () => {
    expect(profileEstateRoomBackgroundImage("my-estate")).toBe(ESTATE_PROFILE_ROOM_BG);
    expect(profileEstateRoomBackgroundImage("my-estate")).toBe(
      "/backgrounds/spark-estate-photo-background.png",
    );
  });

  it("uses dedicated room plates for evidence vault and portfolio", () => {
    expect(profileEstateRoomBackgroundImage("evidence-vault")).toBe(
      EVIDENCE_VAULT_ROOM_BG,
    );
    expect(profileEstateRoomBackgroundImage("evidence-vault")).toBe(
      "/backgrounds/evidence-vault-room-static.png",
    );
    expect(profileEstateRoomBackgroundImage("portfolio")).toBe(PORTFOLIO_ROOM_BG);
    expect(profileEstateRoomBackgroundImage("portfolio")).toBe(
      "/backgrounds/accomplisments-room-background.png",
    );
  });
});
