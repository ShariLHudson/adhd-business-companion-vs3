import { describe, expect, it } from "vitest";
import { ESTATE_ROOM_BG } from "./estateRoomAssets";
import {
  resolveEstateRoomBackgroundForSection,
  resolveEstateRoomBackgroundImage,
} from "./estateRoomBackground";

describe("estateRoomBackground", () => {
  it("resolves stables plate from canonical registry", () => {
    expect(resolveEstateRoomBackgroundImage("stables")).toBe(
      "/backgrounds/spark-estate-stables-background.webp",
    );
  });

  it("resolves conservatory from butterfly-conservatory plate", () => {
    expect(resolveEstateRoomBackgroundImage("conservatory")).toBe(
      "/backgrounds/butterfly-conservatory.webp",
    );
  });

  it("resolves music room plate — not writing room", () => {
    expect(resolveEstateRoomBackgroundImage("music-room")).toBe(
      "/backgrounds/music-room-background.png",
    );
  });

  it("resolves apple orchard plate", () => {
    expect(resolveEstateRoomBackgroundImage("apple-orchard")).toBe(
      "/backgrounds/apple-orchard-background.png",
    );
  });

  it("resolves gazebo journal plate", () => {
    expect(resolveEstateRoomBackgroundImage("journal")).toBe(
      "/backgrounds/gazebo-libjournal-background.png",
    );
  });

  it("resolves sunroom plate from registry", () => {
    expect(resolveEstateRoomBackgroundImage("sunroom")).toBe(
      "/backgrounds/sunroom-background.png",
    );
  });

  it("resolves growth profile to greenhouse plate", () => {
    expect(resolveEstateRoomBackgroundImage("growth-profile")).toBe(
      ESTATE_ROOM_BG.greenhouse,
    );
    expect(resolveEstateRoomBackgroundImage("growth-profile")).toBe(
      "/backgrounds/greenhouse-background.png",
    );
  });

  it("resolves my-estate to spark estate photo plate", () => {
    expect(resolveEstateRoomBackgroundImage("my-estate")).toBe(
      ESTATE_ROOM_BG.sparkEstatePhoto,
    );
    expect(resolveEstateRoomBackgroundImage("my-estate")).toBe(
      "/backgrounds/spark-estate-photo-background.png",
    );
  });

  it("resolves evidence vault and portfolio profile destinations", () => {
    expect(resolveEstateRoomBackgroundImage("evidence-vault")).toBe(
      "/backgrounds/evidence-vault-background.png",
    );
    expect(resolveEstateRoomBackgroundForSection("evidence-bank")).toBe(
      "/backgrounds/evidence-vault-background.png",
    );
    expect(resolveEstateRoomBackgroundImage("portfolio")).toBe(
      "/backgrounds/accomplishments-room-background.png",
    );
    expect(resolveEstateRoomBackgroundForSection("growth-portfolio")).toBe(
      "/backgrounds/accomplishments-room-background.png",
    );
  });
});
