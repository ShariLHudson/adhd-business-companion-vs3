/**
 * Focus → Parking Lot destination contract.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { ESTATE_CORE_FULL_BLEED_PANEL_SECTIONS } from "@/lib/estate/estateFullBleedPanelSections";
import { sidebarNavForSection } from "@/lib/companionUi";
import { PARKING_LOT_HOW_DO_I_COPY } from "@/lib/parkingLotCopy";
import { PARK_IT_PRIMARY_CTA } from "@/lib/parkItCopy";

function read(pathFromRoot: string): string {
  return readFileSync(resolve(process.cwd(), pathFromRoot), "utf8");
}

describe("Parking Lot dedicated destination", () => {
  const client = read("app/companion/CompanionPageClient.tsx");
  const menu = read(
    "components/companion/estate/EstateRoomExperienceMenu.tsx",
  );
  const panel = read("components/companion/ParkingLotRoomPanel.tsx");

  it("wires Focus Parking Lot to openParkingLotCore — not Plan My Day", () => {
    expect(menu).toContain('"parking-lot": onOpenParkingLot');
    expect(client).toMatch(
      /onOpenParkingLot=\{\(\) => openParkingLotCore\(\)\}/,
    );
    expect(client).not.toMatch(
      /onOpenParkingLot=\{\(\) => openPlanMyDayCore\(\{ area: "parking-lot" \}\)\}/,
    );
  });

  it("openParkingLotCore opens parking-lot — not Plan My Day, CMM, Reminders, Settings, or Create", () => {
    const fn = client.match(
      /function openParkingLotCore(?:\([^)]*\))?\s*\{[\s\S]*?\n  \}/,
    )?.[0];
    expect(fn).toBeTruthy();
    expect(fn).toContain('openStandaloneFocusSectionCore("parking-lot")');
    expect(fn).not.toContain("openPlanMyDayCore");
    expect(fn).not.toContain("openClearMyMindCore");
    expect(fn).not.toContain("openRemindersCore");
    expect(fn).not.toContain("openCreateWorkspace");
    expect(fn).not.toContain("openHowDoISettings");
  });

  it("renders ParkingLotRoomPanel for parking-lot section", () => {
    expect(client).toMatch(
      /activeSection === "parking-lot"[\s\S]*?<ParkingLotRoomPanel/,
    );
    expect(ESTATE_CORE_FULL_BLEED_PANEL_SECTIONS).toContain("parking-lot");
    expect(sidebarNavForSection("parking-lot")).toBe("plan-my-day");
  });

  it("back interceptor must not call onBack/goBack (avoids stack overflow)", () => {
    expect(panel).toMatch(/registerBack\(\(\) => false\)/);
    expect(panel).not.toMatch(
      /registerBack\(\(\) => \{\s*onBack\(\);\s*return true;/,
    );
  });

  it("exposes How Do I, Previous, Add, and Parked Items in order", () => {
    expect(panel).toContain("parking-lot-how-do-i");
    expect(panel).toContain("app-back-button");
    expect(panel).toContain("parking-lot-title");
    expect(panel).toContain("parking-lot-add-section");
    expect(panel).toContain("parking-lot-items-section");
    expect(panel).toContain("PARKING_LOT_HOW_DO_I_COPY");
    expect(panel).toContain(PARKING_LOT_HOW_DO_I_COPY.slice(0, 40));
    expect(panel).toContain("Leave Parked");
    expect(panel).toContain("Move to Today");
    expect(panel).toContain("Create Reminder");
    expect(panel).toContain("Add to Project");
    expect(panel).toContain("PARK_IT_PRIMARY_CTA");
    expect(PARK_IT_PRIMARY_CTA).toBe("Park This");
    expect(panel).toContain("parking-lot-loading");
    expect(panel).toContain("parking-lot-error");
    expect(panel).toContain("parking-lot-retry");
    expect(panel).not.toContain("openCreateWorkspace");

    const howDoI = panel.indexOf('data-testid="parking-lot-how-do-i"');
    const previous = panel.indexOf('data-testid="app-back-button"');
    const title = panel.indexOf('data-testid="parking-lot-title"');
    const add = panel.indexOf('data-testid="parking-lot-add-section"');
    const items = panel.indexOf('data-testid="parking-lot-items-section"');
    expect(howDoI).toBeGreaterThan(-1);
    expect(howDoI).toBeLessThan(previous);
    expect(previous).toBeLessThan(title);
    expect(title).toBeLessThan(add);
    expect(add).toBeLessThan(items);
  });
});
