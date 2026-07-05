import { describe, expect, it } from "vitest";
import { auditEstatePlaceNavigation } from "./estatePlaceNavigationAudit";

describe("estatePlaceNavigationAudit", () => {
  it("covers every canonical directory entry", () => {
    const rows = auditEstatePlaceNavigation();
    expect(rows).toHaveLength(80);
    expect(rows.every((row) => row.goToPlaceCanOpen)).toBe(true);
    expect(rows.find((row) => row.placeId === "swimming-pool")).toBeUndefined();
  });
});
