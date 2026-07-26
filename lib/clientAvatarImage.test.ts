import { describe, expect, it } from "vitest";
import {
  AVATAR_MAX_SOURCE_BYTES,
  AVATAR_OUTPUT_DIMENSION,
  computeAvatarCrop,
  validateAvatarImageFile,
} from "./clientAvatarImage";

describe("validateAvatarImageFile", () => {
  it("accepts JPEG, PNG, and WebP", () => {
    for (const type of ["image/jpeg", "image/png", "image/webp"]) {
      expect(validateAvatarImageFile({ type, size: 1024 }).ok).toBe(true);
    }
  });

  it("rejects unsupported formats with a clear message", () => {
    for (const type of ["image/gif", "image/svg+xml", "application/pdf", ""]) {
      const r = validateAvatarImageFile({ type, size: 1024 });
      expect(r.ok).toBe(false);
      if (!r.ok) expect(r.error).toMatch(/JPEG, PNG, or WebP/);
    }
  });

  it("rejects oversized source files with a clear message", () => {
    const r = validateAvatarImageFile({
      type: "image/png",
      size: AVATAR_MAX_SOURCE_BYTES + 1,
    });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toMatch(/too large/i);
  });
});

describe("computeAvatarCrop (center-crop cover, no distortion)", () => {
  it("crops the largest centered square from a landscape source", () => {
    const c = computeAvatarCrop(1000, 600);
    expect(c.side).toBe(600); // shorter edge
    expect(c.sx).toBe(200); // centered horizontally
    expect(c.sy).toBe(0);
    expect(c.target).toBe(AVATAR_OUTPUT_DIMENSION); // bounded to 512
  });

  it("crops centered from a portrait source", () => {
    const c = computeAvatarCrop(400, 900);
    expect(c.side).toBe(400);
    expect(c.sx).toBe(0);
    expect(c.sy).toBe(250);
  });

  it("never upscales a small square image (target = source side)", () => {
    const c = computeAvatarCrop(300, 300);
    expect(c.side).toBe(300);
    expect(c.target).toBe(300); // stays ≤ 512, no upscaling
  });

  it("always targets a bounded square (≤ 512) for persistence", () => {
    expect(computeAvatarCrop(4032, 3024).target).toBe(512);
  });
});
