import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  CLEAR_MY_MIND_START_CTA,
  CLEAR_MY_MIND_SUPPORT_LINE,
  CLEAR_MY_MIND_WORKSPACE_SUBTITLE,
  CLEAR_MY_MIND_WELCOME_LINES,
} from "@/lib/clearMyMindCopy";
import {
  PARK_IT_EXPLANATION,
  PARK_IT_PRIMARY_CTA,
  PARK_IT_SUPPORT_LINE,
  PARK_IT_TITLE,
} from "@/lib/parkItCopy";
import {
  PARKING_LOT_EXPLANATION,
  PARKING_LOT_HOW_DO_I_COPY,
  PARKING_LOT_PRIMARY_CTA,
  PARKING_LOT_SUPPORT_LINE,
} from "@/lib/parkingLotCopy";
import { FOCUS_CLARITY_TOOLS } from "@/lib/focusToolDefinitions";

describe("Clear My Mind vs Park It vs Parking Lot clarity (168)", () => {
  it("uses distinct purpose copy for Clear My Mind, Park It, and Parking Lot", () => {
    expect(CLEAR_MY_MIND_WORKSPACE_SUBTITLE).toMatch(/more than one thing/i);
    expect(CLEAR_MY_MIND_SUPPORT_LINE).toMatch(/more than one thing/i);
    expect(CLEAR_MY_MIND_START_CTA).toBe("Empty My Mind");
    expect(CLEAR_MY_MIND_WELCOME_LINES[0]).toMatch(/swirling around/i);

    expect(PARK_IT_TITLE).toBe("Park It");
    expect(PARK_IT_EXPLANATION).toMatch(/one thing/i);
    expect(PARK_IT_SUPPORT_LINE).toMatch(/one task/i);
    expect(PARK_IT_PRIMARY_CTA).toBe("Park This");

    expect(PARKING_LOT_EXPLANATION).toMatch(/safe place/i);
    expect(PARKING_LOT_SUPPORT_LINE).toMatch(/review and organize/i);
    expect(PARKING_LOT_PRIMARY_CTA).toBe("View My Parking Lot");
    expect(PARKING_LOT_HOW_DO_I_COPY).toMatch(/Park It captures one item/i);
    expect(PARKING_LOT_HOW_DO_I_COPY).toMatch(/Clear My Mind/i);

    expect(FOCUS_CLARITY_TOOLS["brain-parking-lot"].title).toBe("Park It");
    expect(FOCUS_CLARITY_TOOLS["clear-my-mind"].question).not.toEqual(
      FOCUS_CLARITY_TOOLS["brain-parking-lot"].question,
    );
  });

  it("routes Park It activity to Parking Lot — not Clear My Mind", () => {
    const source = readFileSync(
      resolve(process.cwd(), "lib/companionActivities.ts"),
      "utf8",
    );
    expect(source).toContain('id: "brain-parking-lot"');
    expect(source).toContain('title: "Park It"');
    expect(source).toContain('linkedSection: "parking-lot"');
    expect(source).toContain('linkedLabel: "Park This"');
    expect(source).not.toContain(
      'linkedLabel: "Open Clear My Mind to park it"',
    );
  });

  it("Parking Lot panel keeps Park This CTA and review actions", () => {
    const panel = readFileSync(
      resolve(process.cwd(), "components/companion/ParkingLotRoomPanel.tsx"),
      "utf8",
    );
    expect(panel).toContain("PARK_IT_PRIMARY_CTA");
    expect(PARK_IT_PRIMARY_CTA).toBe("Park This");
    expect(panel).toContain("Move to Today");
    expect(panel).toContain("Create Reminder");
    expect(panel).toContain("Add to Project");
    expect(panel).toContain("parking-lot-search");
    expect(panel).toContain("parking-lot-filter-status");
  });
});
