import { describe, expect, it } from "vitest";
import {
  centerZoneAllowsMotion,
  clampImageDominance,
  createSceneState,
  hasRenderableSignatureObject,
  layoutScene,
  resolveScene,
  resolveSceneCopy,
} from "./index";

describe("Scene Render Contract™", () => {
  it("resolves copy from single source — not hardcoded in components", () => {
    const copy = resolveSceneCopy("clear-my-mind");
    expect(copy.title).toBe("Clear My Mind");
    expect(copy.subtitle).toContain("head");
  });

  it("caps image dominance", () => {
    expect(clampImageDominance(0.9)).toBeLessThanOrEqual(0.62);
    expect(clampImageDominance(0.1)).toBeGreaterThanOrEqual(0.25);
  });

  it("forbids motion in center zone", () => {
    expect(centerZoneAllowsMotion()).toBe(false);
  });

  it("layout engine is sole authority for center zone and panel classes", () => {
    const resolved = resolveScene(
      createSceneState({ workspaceId: "clear-my-mind" }),
    );
    const layout = layoutScene(resolved);
    expect(layout.centerZone.className).toBe("companion-scene-center");
    expect(layout.panel.className).toBe("companion-scene-panel");
    expect(layout.cssVars["--scene-image-scale"]).toBe("1");
    expect(Number(layout.cssVars["--scene-image-dominance"])).toBeLessThanOrEqual(0.62);
  });

  it("homestead workspaces use edge-only motion", () => {
    const resolved = resolveScene(
      createSceneState({ workspaceId: "clear-my-mind" }),
    );
    expect(resolved.motion.placement).toBe("edge-only");
    expect(resolved.motion.enabled).toBe(true);
  });

  it("photo scenes disable living border motion", () => {
    const resolved = resolveScene(
      createSceneState({ workspaceId: "breathe", seed: "breathe" }),
    );
    expect(resolved.motion.enabled).toBe(false);
    expect(resolved.background.imageUrl).toBeTruthy();
  });

  it("focus category copy comes from resolver", () => {
    const copy = resolveSceneCopy("focus-category", undefined, "stuck");
    expect(copy.title).toBe("I'm Stuck");
    expect(copy.subtitle).toContain("Paralysis");
  });

  it("plan-my-day resolves Planning Table™ homestead scene", () => {
    const resolved = resolveScene(
      createSceneState({ workspaceId: "plan-my-day" }),
    );
    const layout = layoutScene(resolved);
    expect(resolved.motion.placement).toBe("edge-only");
    expect(resolved.background.mode).toBe("homestead-room");
    expect(layout.dataAttributes["data-planning-table-room"]).toBe("1");
    expect(layout.rootClassName).toContain("companion-scene-root--planning-table");
    const copy = resolveSceneCopy("plan-my-day");
    expect(copy.title).toBe("Plan My Day™");
    expect(copy.subtitle).toContain("figure today out");
  });

  it("focus-hub resolves Focus Landscape™ meadow-lake center", () => {
    const resolved = resolveScene(
      createSceneState({ workspaceId: "focus-hub" }),
    );
    const layout = layoutScene(resolved);
    expect(resolved.motion.placement).toBe("edge-only");
    expect(resolved.background.mode).toBe("homestead-room");
    expect(layout.dataAttributes["data-focus-landscape"]).toBe("1");
    expect(layout.dataAttributes["data-focus-landscape-space"]).toBe("meadow-lake");
    expect(layout.rootClassName).toContain("companion-scene-root--focus-landscape");
    const copy = resolveSceneCopy("focus-hub");
    expect(copy.title).toBe("Focus My Brain™");
  });

  it("focus-category stuck resolves Garden Path™", () => {
    const resolved = resolveScene(
      createSceneState({
        workspaceId: "focus-category",
        focusCategoryId: "stuck",
      }),
    );
    const layout = layoutScene(resolved);
    expect(layout.dataAttributes["data-focus-landscape-space"]).toBe("garden-path");
    expect(layout.dataAttributes["data-homestead-place"]).toBe("garden-path");
  });

  it("homestead scene with signature object exposes both ids", () => {
    const resolved = resolveScene(
      createSceneState({ workspaceId: "clear-my-mind" }),
    );
    expect(resolved.signatureId).toBeTruthy();
    expect(resolved.objectId).toBeTruthy();
    expect(hasRenderableSignatureObject(resolved)).toBe(true);
  });

  it("photo scene without signature object omits object ids safely", () => {
    const resolved = resolveScene(
      createSceneState({ workspaceId: "breathe", seed: "breathe" }),
    );
    expect(resolved.signatureId).toBeUndefined();
    expect(resolved.objectId).toBeUndefined();
    expect(hasRenderableSignatureObject(resolved)).toBe(false);
  });

  it("partial signature ids do not qualify for render", () => {
    expect(
      hasRenderableSignatureObject({
        signatureId: "sig-reflection-journal",
        objectId: undefined,
      }),
    ).toBe(false);
    expect(
      hasRenderableSignatureObject({
        signatureId: undefined,
        objectId: "clear-my-mind",
      }),
    ).toBe(false);
  });
});
