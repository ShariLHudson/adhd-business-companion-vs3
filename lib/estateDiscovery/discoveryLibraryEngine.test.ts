import { describe, expect, it } from "vitest";

import { validateDiscoveryRecord, isDiscoveryRecordEligible } from "./discoveryLibraryEngine";
import { getDiscoveryLibraryItem } from "./discoveryLibraryLoader";

describe("discoveryLibraryEngine", () => {
  it("accepts live greenhouse discovery", () => {
    const item = getDiscoveryLibraryItem("DISC-011");
    expect(item).not.toBeNull();
    const result = validateDiscoveryRecord(item!);
    expect(result.valid).toBe(true);
    if (result.valid) {
      expect(result.resolvedRoute).toBe("/companion?section=growth-greenhouse");
    }
  });

  it("rejects draft discoveries", () => {
    const item = getDiscoveryLibraryItem("DISC-014");
    expect(item?.status).toBe("Draft");
    expect(isDiscoveryRecordEligible(item!)).toBe(false);
  });

  it("rejects missing discovery text", () => {
    const item = getDiscoveryLibraryItem("DISC-001")!;
    const broken = { ...item, discoveryText: "   " };
    expect(validateDiscoveryRecord(broken).valid).toBe(false);
  });
});
