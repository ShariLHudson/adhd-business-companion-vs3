/**
 * Welcome Home → My Workday → Rhythms + Calendar destination contracts.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { ESTATE_CORE_FULL_BLEED_PANEL_SECTIONS } from "@/lib/estate/estateFullBleedPanelSections";
import { sidebarNavForSection } from "@/lib/companionUi";

const RHYTHMS_COPY =
  "Create repeatable routines for the things you regularly return to. Choose how often each rhythm should happen.";

function read(pathFromRoot: string): string {
  return readFileSync(resolve(process.cwd(), pathFromRoot), "utf8");
}

describe("Rhythms dedicated destination", () => {
  const client = read("app/companion/CompanionPageClient.tsx");
  const menu = read(
    "components/companion/estate/EstateRoomExperienceMenu.tsx",
  );
  const panel = read("components/companion/RhythmsRoomPanel.tsx");

  it("wires My Workday Rhythms to openRhythmsCore — not Plan My Day", () => {
    expect(menu).toMatch(/data-testid="estate-open-rhythms"/);
    expect(client).toMatch(/onOpenRhythms=\{\(\) => openRhythmsCore\(\)\}/);
    expect(client).not.toMatch(
      /onOpenRhythms=\{\(\) => openPlanMyDayCore\(\{ area: "rhythms" \}\)\}/,
    );
  });

  it("openRhythmsCore opens rhythms section — not Plan My Day, Settings, or Reminders", () => {
    const fn = client.match(
      /function openRhythmsCore\(\) \{[\s\S]*?\n  \}/,
    )?.[0];
    expect(fn).toBeTruthy();
    expect(fn).toContain('openStandaloneFocusSectionCore("rhythms")');
    expect(fn).not.toContain("openPlanMyDayCore");
    expect(fn).not.toContain("openHowDoISettings");
    expect(fn).not.toContain("openRemindersCore");
    expect(fn).not.toContain('"plan-my-day"');
  });

  it("renders RhythmsRoomPanel for rhythms section", () => {
    expect(client).toMatch(
      /activeSection === "rhythms"[\s\S]*?<RhythmsRoomPanel/,
    );
    expect(ESTATE_CORE_FULL_BLEED_PANEL_SECTIONS).toContain("rhythms");
    expect(sidebarNavForSection("rhythms")).toBe("plan-my-day");
  });

  it("exposes How Do I, Previous, Add, and frequency groups in order", () => {
    expect(panel).toContain("rhythms-how-do-i");
    expect(panel).toContain("app-back-button");
    expect(panel).toContain("rhythms-title");
    expect(panel).toContain("rhythms-add-section");
    expect(panel).toContain("rhythms-group-${id}");
    expect(panel).toContain("RHYTHM_FREQUENCY_OPTIONS");
    expect(panel).toContain("groupRhythmsByCadence");
    expect(panel).toContain("RHYTHMS_HOW_DO_I_COPY");
    expect(read("lib/rhythms/rhythmForm.ts")).toContain(RHYTHMS_COPY);
    expect(read("lib/rhythms/types.ts")).toContain('"daily"');
    expect(read("lib/rhythms/types.ts")).toContain('"custom"');
    expect(read("lib/rhythms/rhythmForm.ts")).toContain("RHYTHM_CADENCE_OPTIONS");

    const howDoI = panel.indexOf('data-testid="rhythms-how-do-i"');
    const previous = panel.indexOf('data-testid="app-back-button"');
    const title = panel.indexOf('data-testid="rhythms-title"');
    const add = panel.indexOf('data-testid="rhythms-add-section"');
    const groupsRender = panel.indexOf("{groups.map((group) => (");
    expect(howDoI).toBeGreaterThan(-1);
    expect(howDoI).toBeLessThan(previous);
    expect(previous).toBeLessThan(title);
    expect(title).toBeLessThan(add);
    expect(add).toBeLessThan(groupsRender);
  });
});

/* Calendar My Workday destination tests live in lib/calendar/calendarDestination.test.ts */