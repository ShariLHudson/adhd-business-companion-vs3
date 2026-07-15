/**
 * Legacy Momentum Appointment → current Plan My Day Calendar detail.
 *
 * @vitest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  ensureCalendarPlanItem,
  openCalendarItemIntent,
  resolveCalendarItemRef,
  syncPlanItemToTimeBlock,
} from "@/lib/calendar/openCalendarItem";
import {
  getTimeBlocks,
  saveTimeBlock,
  todayStr,
  type TimeBlock,
} from "@/lib/companionStore";
import {
  readTodayPlanItems,
  saveTodayPlanItems,
  updatePlanItem,
} from "@/lib/planMyDay";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const TIME_BLOCKS_KEY = "companion-time-blocks-v1";
const PLAN_KEY = "companion-plan-my-day-items-v1";

function seedLegacyAppointment(
  overrides: Partial<TimeBlock> & { id: string; title: string },
): TimeBlock {
  const block: TimeBlock = {
    id: overrides.id,
    title: overrides.title,
    date: overrides.date ?? todayStr(),
    startTime: overrides.startTime ?? "10:00",
    durationMin: overrides.durationMin ?? 45,
    energy: overrides.energy ?? "medium",
    note: overrides.note ?? "Bring notes",
    projectId: overrides.projectId,
    status: overrides.status ?? "pending",
    createdAt: overrides.createdAt ?? new Date().toISOString(),
    goal: overrides.goal,
    whenPreset: overrides.whenPreset,
    durationFlexible: overrides.durationFlexible,
    tag: overrides.tag,
    timerEnabled: overrides.timerEnabled,
  };
  const existing = getTimeBlocks().filter((b) => b.id !== block.id);
  localStorage.setItem(TIME_BLOCKS_KEY, JSON.stringify([...existing, block]));
  // Touch via save so normalize/status paths stay warm for edit tests.
  saveTimeBlock({ id: block.id, title: block.title });
  return getTimeBlocks().find((b) => b.id === block.id) ?? block;
}

describe("openCalendarItem — legacy Momentum Appointment compatibility", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it("resolves bare time-block ids and tb- prefixed ids", () => {
    seedLegacyAppointment({ id: "appt-1", title: "Client call" });
    expect(resolveCalendarItemRef("appt-1")).toEqual({
      planItemId: "tb-appt-1",
      timeBlockId: "appt-1",
      isLegacyMomentumAppointment: true,
    });
    expect(resolveCalendarItemRef("tb-appt-1")?.planItemId).toBe("tb-appt-1");
  });

  it("maps a legacy appointment into the current plan item model without deleting the original", () => {
    seedLegacyAppointment({
      id: "legacy-9",
      title: "Write proposal",
      note: "Keep it short",
      startTime: "14:30",
      durationMin: 60,
    });

    const item = ensureCalendarPlanItem("legacy-9");
    expect(item).toBeTruthy();
    expect(item!.id).toBe("tb-legacy-9");
    expect(item!.title).toBe("Write proposal");
    expect(item!.notes).toBe("Keep it short");
    expect(item!.startTime).toBe("14:30");
    expect(item!.durationMinutes).toBe(60);
    expect(item!.source).toBe("time-block");
    expect(item!.sourceTimeBlockId).toBe("legacy-9");

    const original = getTimeBlocks().find((b) => b.id === "legacy-9");
    expect(original?.title).toBe("Write proposal");
    expect(original?.note).toBe("Keep it short");
  });

  it("openCalendarItemIntent targets Plan My Day Calendar area", () => {
    seedLegacyAppointment({ id: "intent-1", title: "Focus block" });
    const intent = openCalendarItemIntent("intent-1", "planning-calendar");
    expect(intent.area).toBe("calendar");
    expect(intent.planItemId).toBe("tb-intent-1");
    expect(intent.item?.title).toBe("Focus block");
    expect(intent.source).toBe("planning-calendar");
  });

  it("editing a legacy-backed plan item updates the same time-block (no duplicate)", () => {
    seedLegacyAppointment({ id: "edit-1", title: "Old title", note: "A" });
    const item = ensureCalendarPlanItem("edit-1")!;
    const items = readTodayPlanItems();
    updatePlanItem(items, item.id, { title: "New title", notes: "B" });

    const blocks = getTimeBlocks().filter((b) => b.title === "New title");
    expect(blocks).toHaveLength(1);
    expect(blocks[0]!.id).toBe("edit-1");
    expect(blocks[0]!.note).toBe("B");
    expect(getTimeBlocks().filter((b) => b.id === "edit-1")).toHaveLength(1);
  });

  it("syncPlanItemToTimeBlock preserves id on save", () => {
    seedLegacyAppointment({ id: "sync-1", title: "Sync me" });
    const item = ensureCalendarPlanItem("sync-1")!;
    const synced = syncPlanItemToTimeBlock({
      ...item,
      title: "Synced title",
      notes: "Updated",
    });
    expect(synced?.id).toBe("sync-1");
    expect(synced?.title).toBe("Synced title");
  });

  it("does not create a second plan item when ensured twice", () => {
    seedLegacyAppointment({ id: "once-1", title: "Once" });
    ensureCalendarPlanItem("once-1");
    ensureCalendarPlanItem("tb-once-1");
    const matches = readTodayPlanItems().filter(
      (i) => i.sourceTimeBlockId === "once-1" || i.id === "tb-once-1",
    );
    expect(matches).toHaveLength(1);
  });

  it("undated Ready When You Are blocks still resolve", () => {
    seedLegacyAppointment({
      id: "ready-1",
      title: "When ready",
      date: "",
      status: "pending",
    });
    const item = ensureCalendarPlanItem("ready-1");
    expect(item?.id).toBe("tb-ready-1");
    expect(item?.title).toBe("When ready");
  });
});

describe("live platform never mounts legacy Momentum Appointments for calendar clicks", () => {
  function read(rel: string): string {
    return readFileSync(resolve(process.cwd(), rel), "utf8");
  }

  it("Plan My Day calendar appointment clicks open local detail — not time-block", () => {
    const planPanel = read("components/companion/PlanMyDayPanel.tsx");
    expect(planPanel).toContain("handleOpenCalendarEventId");
    expect(planPanel).toContain("plan-day-calendar-item-detail");
    expect(planPanel).toContain("ensureCalendarPlanItem");
    // Must not call host with sliced id into legacy workspace only
    expect(planPanel).not.toMatch(
      /onOpenAppointment\?\.\(ev\.id\.slice\("tb-"\.length\)\)/,
    );
  });

  it("CompanionPageClient routes appointments through openCalendarItemCore", () => {
    const client = read("app/companion/CompanionPageClient.tsx");
    expect(client).toContain("function openCalendarItemCore");
    expect(client).toContain('openCalendarItemCore(appointmentId, "planning-calendar")');
    expect(client).toContain('openCalendarItemCore(appointmentId, "calendar-room")');
    expect(client).toContain("LegacyMomentumAppointmentRedirect");
    expect(client).not.toContain("<TimeBlockPanel");
    expect(client).not.toMatch(
      /onOpenAppointment=\{\(\) =>\s*openWorkspaceBesideChatCore\(\s*"time-block"/,
    );
  });

  it("openWorkspaceBesideChatCore redirects time-block to calendar item open", () => {
    const client = read("app/companion/CompanionPageClient.tsx");
    expect(client).toMatch(
      /if \(section === "time-block"\) \{\s*\n\s*openCalendarItemCore/,
    );
  });
});

describe("plan store helpers used by open path", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("saveTodayPlanItems round-trips seeded legacy mapping", () => {
    seedLegacyAppointment({ id: "rt-1", title: "Round trip" });
    const item = ensureCalendarPlanItem("rt-1")!;
    saveTodayPlanItems([item]);
    expect(localStorage.getItem(PLAN_KEY)).toContain("tb-rt-1");
    expect(readTodayPlanItems()[0]?.title).toBe("Round trip");
  });
});
