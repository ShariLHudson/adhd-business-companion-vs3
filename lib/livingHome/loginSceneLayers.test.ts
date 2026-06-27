import { describe, expect, it } from "vitest";
import {
  LOGIN_SCENE_LAYER_CLASSES,
  LOGIN_SCENE_MOTION_LAYERS,
  LOGIN_SCENE_PORCH_SIGN,
  motionMaskAvoidsPorchPost,
} from "./loginSceneLayers";

describe("loginSceneLayers", () => {
  it("defines five masked motion regions without porch-sign animation", () => {
    expect(LOGIN_SCENE_MOTION_LAYERS).toHaveLength(5);
    expect(LOGIN_SCENE_MOTION_LAYERS.map((l) => l.id)).toEqual([
      "swing",
      "hanging-plant",
      "tree-canopy",
      "flower-pot-left",
      "flower-pot-mid",
    ]);
    expect(LOGIN_SCENE_PORCH_SIGN.animated).toBe(false);
    expect(LOGIN_SCENE_PORCH_SIGN.requiresTransparentAsset).toBe(true);
  });

  it("uses clip-path masks for every motion layer", () => {
    for (const layer of LOGIN_SCENE_MOTION_LAYERS) {
      expect(layer.clipPath).toMatch(/^polygon\(/);
      expect(layer.transformOrigin).toMatch(/%/);
      expect(layer.className).toMatch(/^companion-login-scene__motion-/);
    }
  });

  it("keeps motion masks outside the porch post and sign exclusion zone", () => {
    for (const layer of LOGIN_SCENE_MOTION_LAYERS) {
      expect(motionMaskAvoidsPorchPost(layer.clipPath)).toBe(true);
    }
  });

  it("exposes lighting and processing glow layer class names", () => {
    expect(LOGIN_SCENE_LAYER_CLASSES.lighting).toBe(
      "companion-login-scene__lighting",
    );
    expect(LOGIN_SCENE_LAYER_CLASSES.processingGlow).toBe(
      "companion-login-scene__processing-glow",
    );
    expect(LOGIN_SCENE_LAYER_CLASSES.motion).toBe(
      "companion-login-scene--motion",
    );
  });
});
