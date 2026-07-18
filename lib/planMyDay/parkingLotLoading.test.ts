/**
 * Parking Lot must not hang on a dynamic-import loading spinner forever.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { PARKING_LOT_EMPTY } from "@/lib/parkingLotCopy";

describe("Parking Lot loading states", () => {
  it("loads ParkingLotRoomPanel with a bounded loading fallback (not permanent)", () => {
    const source = readFileSync(
      resolve(process.cwd(), "app/companion/CompanionPageClient.tsx"),
      "utf8",
    );
    expect(source).toContain("ParkingLotRoomPanel");
    expect(source).toContain("Loading Parking Lot");
    // Failsafe / retry live in the panel — not a forever spinner.
    const panel = readFileSync(
      resolve(process.cwd(), "components/companion/ParkingLotRoomPanel.tsx"),
      "utf8",
    );
    expect(panel).toContain("2500");
    expect(panel).toContain("parking-lot-retry");
  });

  it("shows a real empty state copy in the panel", () => {
    const panel = readFileSync(
      resolve(process.cwd(), "components/companion/ParkingLotRoomPanel.tsx"),
      "utf8",
    );
    expect(PARKING_LOT_EMPTY).toMatch(/Your Parking Lot is empty/);
    expect(PARKING_LOT_EMPTY).toMatch(/Anything you set aside will wait/);
    expect(panel).toContain("PARKING_LOT_EMPTY");
    expect(panel).toContain('data-testid="parking-lot-empty"');
    expect(panel).toContain("Return to Welcome Home");
  });

  it("includes error + retry states so loading cannot stay permanent", () => {
    const panel = readFileSync(
      resolve(process.cwd(), "components/companion/ParkingLotRoomPanel.tsx"),
      "utf8",
    );
    expect(panel).toContain('data-testid="parking-lot-error"');
    expect(panel).toContain("Try Again");
    expect(panel).toContain("I couldn’t load your Parking Lot just now.");
    expect(panel).toContain("readParkingLotSafely");
    expect(panel).toContain("parkInFlightRef");
    expect(panel).toContain("parking-lot-park-confirm");
    expect(panel).toContain("2500");
  });
});
