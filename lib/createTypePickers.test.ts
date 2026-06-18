import { describe, expect, it } from "vitest";
import {
  isInternalGenerationDepth,
  isUnresolvedCreateType,
  userFacingCreateTypeLabel,
  userFacingSubtypeLabel,
} from "./createTypePickers";

describe("createTypePickers", () => {
  it("hides unresolved and internal labels", () => {
    expect(isUnresolvedCreateType("content")).toBe(true);
    expect(isUnresolvedCreateType("")).toBe(true);
    expect(userFacingCreateTypeLabel("content")).toBeNull();
    expect(userFacingCreateTypeLabel("Social Post")).toBe("Social Media Post");
    expect(isInternalGenerationDepth("Standard")).toBe(true);
    expect(userFacingSubtypeLabel("Standard", null)).toBeNull();
  });
});
