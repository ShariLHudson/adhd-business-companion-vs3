/**
 * Rhythms dedicated room + My Day shared entrance contract.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { ESTATE_CORE_FULL_BLEED_PANEL_SECTIONS } from "@/lib/estate/estateFullBleedPanelSections";
import { sidebarNavForSection } from "@/lib/companionUi";
import { REMINDERS_RHYTHMS_ENTRANCE_ACTION_ID } from "@/lib/remindersVsRhythms";

const RHYTHMS_COPY =
  "A Rhythm helps you return regularly with a flexible window — not a rigid schedule. Skip, pause, or resume anytime; you’re never “behind.”";

function read(pathFromRoot: string): string {
  return readFileSync(resolve(process.cwd(), pathFromRoot), "utf8");
}

describe("Rhythms dedicated destination", () => {
  const client = read("app/companion/CompanionPageClient.tsx");
  const menu = read(
    "components/companion/estate/EstateRoomExperienceMenu.tsx",
  );
  const panel = read("components/companion/RhythmsRoomPanel.tsx");
  const chrome = read(
    "components/companion/ReminderRhythmRoomChrome.tsx",
  );

  it("My Day uses shared Reminders / Rhythms window — not a separate Rhythms row", () => {
    expect(menu).toContain("onOpenRemindersRhythms");
    expect(menu).toContain('"reminders-rhythms"');
    expect(client).toContain(
      `onOpenRemindersRhythms={() => ${REMINDERS_RHYTHMS_ENTRANCE_ACTION_ID}(null)}`,
    );
    expect(client).not.toMatch(
      /onOpenRhythms=\{\(\) => openPlanMyDayCore\(\{ area: "rhythms" \}\)\}/,
    );
  });

  it("openRhythmsCore opens shared window with Rhythms selected", () => {
    const fn = client.match(
      /function openRhythmsCore\(\) \{[\s\S]*?\n  \}/,
    )?.[0];
    expect(fn).toBeTruthy();
    expect(fn).toContain('openRemindersRhythmsCore("rhythms")');
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

  it("exposes How Do I, Previous, arrival, Add, and Today/Active/Paused lists", () => {
    expect(panel).toContain("rhythms-how-do-i");
    expect(panel).toContain("app-back-button");
    expect(panel).toContain("rhythms-title");
    expect(panel).toContain('kind="rhythms"');
    expect(panel).toContain("PersistentDifferenceCue");
    expect(chrome).toContain("${kind}-difference-cue");
    expect(chrome).toContain("DIFFERENCE_CUE_RHYTHMS");
    expect(panel).toContain("rhythms-add-section");
    expect(panel).toContain("rhythms-today");
    expect(panel).toContain("rhythms-active");
    expect(panel).toContain("rhythms-paused");
    expect(panel).toContain("RHYTHM_FREQUENCY_OPTIONS");
    expect(panel).toContain("partitionRhythmsForLists");
    expect(panel).toContain("RHYTHMS_HOW_DO_I_COPY");
    expect(read("lib/rhythms/rhythmForm.ts")).toContain(RHYTHMS_COPY);
    expect(read("lib/rhythms/types.ts")).toContain('"daily"');
    expect(read("lib/rhythms/types.ts")).toContain('"custom"');
    expect(read("lib/rhythms/rhythmForm.ts")).toContain("RHYTHM_CADENCE_OPTIONS");

    const howDoI = panel.indexOf('data-testid="rhythms-how-do-i"');
    const previous = panel.indexOf('data-testid="app-back-button"');
    const title = panel.indexOf('data-testid="rhythms-title"');
    const add = panel.indexOf('data-testid="rhythms-add-section"');
    const today = panel.indexOf('testId="rhythms-today"');
    expect(howDoI).toBeGreaterThan(-1);
    expect(howDoI).toBeLessThan(previous);
    expect(previous).toBeLessThan(title);
    expect(title).toBeLessThan(add);
    expect(add).toBeLessThan(today);
  });
});

/* Calendar My Workday destination tests live in lib/calendar/calendarDestination.test.ts */
