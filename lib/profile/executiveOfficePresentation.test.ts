import { describe, expect, it } from "vitest";
import {
  BUSINESS_AREA_PRESENTATION,
  businessAreaActionForStatus,
  buildShariNote,
  getExecutiveBusinessStatus,
} from "@/lib/profile/executiveOfficePresentation";

describe("executiveOfficePresentation", () => {
  it("maps six Business Areas with existing cover artwork", () => {
    expect(BUSINESS_AREA_PRESENTATION).toHaveLength(6);
    expect(BUSINESS_AREA_PRESENTATION.map((a) => a.sectionId)).toEqual([
      "identity",
      "offers",
      "brand",
      "direction",
      "work-style",
      "tools",
    ]);
    for (const area of BUSINESS_AREA_PRESENTATION) {
      expect(area.coverImageUrl.startsWith("/backgrounds/")).toBe(true);
      expect(area.placeBlurb.split(" ").length).toBeLessThan(16);
    }
  });

  it("chooses Estate-themed actions by section status", () => {
    expect(businessAreaActionForStatus("not-started")).toBe("Enter");
    expect(businessAreaActionForStatus("started")).toBe("Open");
    expect(businessAreaActionForStatus("ready-to-review")).toBe("Review");
    expect(businessAreaActionForStatus("updated")).toBe("Update");
  });

  it("builds a short Shari note and executive status from live helpers", () => {
    const note = buildShariNote();
    expect(note.length).toBeGreaterThan(20);
    expect(note.length).toBeLessThan(180);
    expect(typeof getExecutiveBusinessStatus()).toBe("string");
  });
});
