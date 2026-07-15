/**
 * Parking Lot must not hang on a dynamic-import loading spinner forever.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("Parking Lot loading states", () => {
  it("loads ParkingLotRoomPanel via static import (no permanent dynamic spinner)", () => {
    const source = readFileSync(
      resolve(process.cwd(), "app/companion/CompanionPageClient.tsx"),
      "utf8",
    );
    expect(source).toContain(
      'import { ParkingLotRoomPanel } from "@/components/companion/ParkingLotRoomPanel"',
    );
    expect(source).not.toMatch(
      /const ParkingLotRoomPanel = dynamic\([\s\S]*Loading Parking Lot/,
    );
  });

  it("shows a real empty state copy in the panel", () => {
    const panel = readFileSync(
      resolve(process.cwd(), "components/companion/ParkingLotRoomPanel.tsx"),
      "utf8",
    );
    expect(panel).toContain("Your Parking Lot is empty");
    expect(panel).toContain('data-testid="parking-lot-empty"');
    expect(panel).toContain("Return to Welcome Home");
  });
});
