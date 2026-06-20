import { describe, expect, it } from "vitest";
import {
  activeColorModeProofLabel,
  isCategoryColorCodingEnabled,
} from "@/lib/visualColorCoding";

describe("visualColorCoding", () => {
  it("disables category coding in minimal mode", () => {
    expect(isCategoryColorCodingEnabled("off")).toBe(false);
    expect(isCategoryColorCodingEnabled("meaning")).toBe(true);
    expect(isCategoryColorCodingEnabled("decorative")).toBe(true);
  });

  it("formats proof label for settings", () => {
    expect(activeColorModeProofLabel("off")).toBe("Color mode active: Minimal");
  });
});
