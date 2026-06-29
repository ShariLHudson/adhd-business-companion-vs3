import { describe, expect, it } from "vitest";
import { GALLERY_AMBIENCE_SRC } from "./galleryAudio";
import { GALLERY_WALK_CYCLE_MS } from "./galleryRoom";
import {
  galleryPlateTranslatePx,
  galleryWalkFrame,
  galleryWalkProgress,
  GALLERY_RIG_SCALE,
} from "./walk";
import { resolveGalleryEnvironment } from "./environmentExperience";
import { GALLERY_DESTINATION_ACTIONS } from "./destinations";
import {
  resolveGalleryWallMemories,
} from "./galleryWallMemories";
import {
  resolveGrowthHubSection,
  sidebarNavForGrowthDestination,
} from "./growthRouteBridge";

describe("Gallery ambience", () => {
  it("serves Hall of Reflections from the gallery audio folder", () => {
    expect(GALLERY_AMBIENCE_SRC).toBe(
      "/audio/gallery/hall-of-reflections.mp3",
    );
  });
});

describe("The Gallery walk", () => {
  it("uses human pacing — crop scale on the camera rig", () => {
    expect(GALLERY_RIG_SCALE).toBe(1.65);
    const mid = galleryWalkFrame(GALLERY_WALK_CYCLE_MS / 2, false);
    expect(mid.walkProgress).toBeCloseTo(0.5, 2);
  });

  it("walks forward along the hallway without reversing", () => {
    expect(galleryWalkProgress(0)).toBe(0);
    expect(galleryWalkProgress(GALLERY_WALK_CYCLE_MS / 2)).toBeGreaterThan(0.4);
    expect(galleryWalkProgress(GALLERY_WALK_CYCLE_MS)).toBe(1);
    expect(galleryWalkProgress(GALLERY_WALK_CYCLE_MS * 2)).toBe(1);
  });

  it("travels the hallway plate forward in pixels instead of flat panning", () => {
    const plateWidth = 2400;
    const viewportWidth = 1000;
    const startX = galleryPlateTranslatePx(0, plateWidth, viewportWidth);
    const endX = galleryPlateTranslatePx(0.75, plateWidth, viewportWidth);
    expect(startX).toBeCloseTo(0);
    expect(endX).toBeLessThan(-1000);
    expect(galleryWalkFrame(GALLERY_WALK_CYCLE_MS * 0.75, false).walkProgress).toBeGreaterThan(
      0.7,
    );
  });
});

describe("Environmental Experience Intelligence", () => {
  it("resolves believable season and time of day", () => {
    const env = resolveGalleryEnvironment(new Date("2026-06-15T14:00:00"));
    expect(env.season).toBe("summer");
    expect(env.timeOfDay).toBe("afternoon");
    expect(env.weather).toBeTruthy();
  });
});

describe("Gallery wall memories", () => {
  it("lays memories along the hallway plate for the stroll", () => {
    const memories = resolveGalleryWallMemories();
    expect(memories.length).toBeGreaterThanOrEqual(4);
    expect(memories[0]?.walkPosition).toBeLessThan(
      memories[memories.length - 1]?.walkPosition ?? 1,
    );
    expect(memories.some((m) => m.plaque === "Still Being Written")).toBe(true);
  });
});

describe("Gallery destinations", () => {
  it("routes bottom nav to real growth rooms", () => {
    expect(GALLERY_DESTINATION_ACTIONS["continue-walking"].kind).toBe(
      "resume-walk",
    );
    expect(GALLERY_DESTINATION_ACTIONS.journal).toEqual({
      kind: "open-section",
      section: "growth-journal",
      nav: "journal",
    });
    expect(GALLERY_DESTINATION_ACTIONS.portfolio).toEqual({
      kind: "open-section",
      section: "growth-portfolio",
      nav: "portfolio",
    });
    expect(GALLERY_DESTINATION_ACTIONS["evidence-bank"]).toEqual({
      kind: "open-section",
      section: "evidence-bank",
      nav: "evidence-bank",
    });
    expect(GALLERY_DESTINATION_ACTIONS.highlights).toEqual({
      kind: "open-section",
      section: "confidence-vault",
      nav: "confidence-vault",
    });
  });
});

describe("Growth hub routing bridge", () => {
  it("keeps the growth hub section distinct from Asset Library", () => {
    expect(resolveGrowthHubSection("growth")).toBe("growth");
    expect(resolveGrowthHubSection("the-gallery")).toBe("the-gallery");
    expect(resolveGrowthHubSection("evidence-bank")).toBe("evidence-bank");
  });

  it("maps grow destinations to property nav ids", () => {
    expect(sidebarNavForGrowthDestination("evidence-bank")).toBe(
      "evidence-bank",
    );
    expect(sidebarNavForGrowthDestination("confidence-vault")).toBe(
      "confidence-vault",
    );
    expect(sidebarNavForGrowthDestination("the-gallery")).toBe("growth");
  });
});

describe("Gallery room plaques", () => {
  it("orders brass plaques along the floor rail", async () => {
    const { GALLERY_BOTTOM_PLAQUES } = await import("./galleryPlaques");
    expect(GALLERY_BOTTOM_PLAQUES.map((p) => p.id)).toEqual([
      "continue-walking",
      "evidence-bank",
      "highlights",
      "journal",
      "portfolio",
    ]);
  });
});
