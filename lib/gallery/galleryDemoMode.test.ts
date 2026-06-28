import { describe, expect, it } from "vitest";
import { curateGalleryExhibition } from "./galleryCuratorIntelligence";
import {
  defaultGalleryDemoSceneId,
  GALLERY_DEMO_SCENE_ORDER,
  isGalleryDemoMode,
  readGalleryDemoQuery,
  GALLERY_DEMO_QUERY_PARAM,
  resolveGalleryDemoScene,
} from "./galleryDemoMode";
import { resolveGalleryWallMemories } from "./galleryWallMemories";
import { GALLERY_REFLECTION_EXAMPLE } from "./galleryReflectionIntelligence";

describe("Gallery Demo Mode", () => {
  it("is off unless the galleryDemo query flag is set", () => {
    expect(isGalleryDemoMode("")).toBe(false);
    expect(isGalleryDemoMode("?section=the-gallery")).toBe(false);
    expect(isGalleryDemoMode(`?nav=growth&${GALLERY_DEMO_QUERY_PARAM}=1`)).toBe(
      true,
    );
    expect(readGalleryDemoQuery(`?${GALLERY_DEMO_QUERY_PARAM}=true`)).toBe(true);
  });

  it("defaults to the beginning scene", () => {
    expect(defaultGalleryDemoSceneId()).toBe("beginning");
  });

  it("scripts all seven journey scenes", () => {
    expect(GALLERY_DEMO_SCENE_ORDER).toHaveLength(7);
    expect(resolveGalleryDemoScene("beginning").exhibits).toHaveLength(4);
    expect(resolveGalleryDemoScene("three-months").exhibits.length).toBeGreaterThan(
      4,
    );
    expect(resolveGalleryDemoScene("portfolio").companionWhisper).toContain(
      "created quite a bit",
    );
  });

  it("curates visible exhibits per demo scene", () => {
    const beginning = curateGalleryExhibition({
      demoMode: true,
      demoSceneId: "beginning",
    });
    const fiveYears = curateGalleryExhibition({
      demoMode: true,
      demoSceneId: "five-years",
    });
    expect(beginning).toHaveLength(4);
    expect(fiveYears.length).toBeGreaterThanOrEqual(10);
  });

  it("uses seed wall memories when demo mode is off", () => {
    const live = curateGalleryExhibition({
      demoMode: false,
      demoSceneId: "beginning",
    });
    expect(live).toEqual(resolveGalleryWallMemories());
  });

  it("preserves reflection wisdom without copying journal text", () => {
    expect(GALLERY_REFLECTION_EXAMPLE.journal).toContain("terrified");
    expect(GALLERY_REFLECTION_EXAMPLE.wall.heading).toBe("Courage");
    expect(GALLERY_REFLECTION_EXAMPLE.wall.wallQuote).not.toContain(
      "terrified",
    );
  });

  it("includes resilience on a difficult week", () => {
    const exhibits = resolveGalleryDemoScene("difficult-week").exhibits;
    expect(
      exhibits.some((e) => e.title === "Resilience" && e.accent === "quiet-rotate"),
    ).toBe(true);
  });

  it("marks anniversary exhibits with flowers", () => {
    const exhibits = resolveGalleryDemoScene("anniversary").exhibits;
    expect(exhibits.some((e) => e.accent === "flowers")).toBe(true);
  });
});
