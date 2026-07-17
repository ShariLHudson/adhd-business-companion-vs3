import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  CLEAR_MY_MIND_START_CTA,
  CLEAR_MY_MIND_WORKSPACE_SUBTITLE,
  CLEAR_MY_MIND_WELCOME_LINES,
} from "@/lib/clearMyMindCopy";
import { FOCUS_CLARITY_TOOLS } from "@/lib/focusToolDefinitions";
import { PARKING_LOT_HOW_DO_I_COPY } from "@/components/companion/ParkingLotRoomPanel";

describe("Clear My Mind vs Park It clarity (158)", () => {
  it("uses distinct purpose copy for Clear My Mind and Park It", () => {
    expect(CLEAR_MY_MIND_WORKSPACE_SUBTITLE).toMatch(/everything competing/i);
    expect(CLEAR_MY_MIND_START_CTA).toBe("Start Emptying My Mind");
    expect(CLEAR_MY_MIND_WELCOME_LINES[0]).toMatch(/Feeling overwhelmed/i);
    expect(FOCUS_CLARITY_TOOLS["brain-parking-lot"].title).toBe("Park It");
    expect(FOCUS_CLARITY_TOOLS["clear-my-mind"].question).not.toEqual(
      FOCUS_CLARITY_TOOLS["brain-parking-lot"].question,
    );
    expect(PARKING_LOT_HOW_DO_I_COPY).toMatch(/Park It saves one thing/i);
    expect(PARKING_LOT_HOW_DO_I_COPY).toMatch(/Clear My Mind when many/i);
  });

  it("routes Park It activity to Parking Lot — not Clear My Mind", () => {
    const source = readFileSync(
      resolve(process.cwd(), "lib/companionActivities.ts"),
      "utf8",
    );
    expect(source).toContain('id: "brain-parking-lot"');
    expect(source).toContain('title: "Park It"');
    expect(source).toContain('linkedSection: "parking-lot"');
    expect(source).toContain('linkedLabel: "Park This Item"');
    expect(source).not.toContain(
      'linkedLabel: "Open Clear My Mind to park it"',
    );
  });

  it("Parking Lot CTA is Park This Item", () => {
    const panel = readFileSync(
      resolve(process.cwd(), "components/companion/ParkingLotRoomPanel.tsx"),
      "utf8",
    );
    expect(panel).toContain("Park This Item");
    expect(panel).toContain("Move to Today's Plan");
    expect(panel).toContain("Create Reminder");
    expect(panel).toContain("Add to Project");
  });
});
