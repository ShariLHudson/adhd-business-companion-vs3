/**
 * @vitest-environment jsdom
 */
import { beforeEach, describe, expect, it } from "vitest";
import { routeBrainDumpEntry } from "@/lib/brainDumpRouting";
import {
  getProjectItems,
  saveProject,
  saveProjectItem,
  type BrainDumpEntry,
} from "@/lib/companionStore";
import { getReminders } from "@/lib/reminderStore";
import {
  createReminderFromContent,
  defaultReminderScheduledAt,
  sourceRefFromParkingLot,
} from "@/lib/rhythms";
import {
  addParkingLotItem,
  bringParkingLotItemToToday,
  deleteDeferredPlanItem,
  parkingLotSourceLabel,
  readPlanningParkingLotItems,
  readTodayPlanItems,
  updateDeferredPlanItem,
} from "./planDayItems";

describe("Parking Lot store actions", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("adds a text-only parked item that survives re-read", () => {
    const created = addParkingLotItem({
      title: "Revisit pricing later",
      source: "manual",
    });
    expect(created?.title).toBe("Revisit pricing later");
    const listed = readPlanningParkingLotItems();
    expect(listed).toHaveLength(1);
    expect(listed[0]!.title).toBe("Revisit pricing later");
    expect(parkingLotSourceLabel(listed[0]!.source)).toBe("Park It");
    expect(localStorage.getItem("companion-plan-my-day-deferred-v1")).toBeTruthy();
  });

  it("edits and deletes parked items", () => {
    const created = addParkingLotItem({ title: "Edit me" })!;
    updateDeferredPlanItem(created.id, { title: "Edited title" });
    expect(readPlanningParkingLotItems()[0]!.title).toBe("Edited title");
    deleteDeferredPlanItem(created.id);
    expect(readPlanningParkingLotItems()).toHaveLength(0);
  });

  it("Leave Parked makes no changes", () => {
    addParkingLotItem({ title: "Stay parked" });
    const before = JSON.stringify(readPlanningParkingLotItems());
    expect(JSON.stringify(readPlanningParkingLotItems())).toBe(before);
  });

  it("Move to Today uses Plan My Day today storage", () => {
    const created = addParkingLotItem({ title: "Bring to today" })!;
    bringParkingLotItemToToday(created.id);
    expect(readPlanningParkingLotItems()).toHaveLength(0);
    expect(
      readTodayPlanItems().some((i) => i.title === "Bring to today"),
    ).toBe(true);
  });

  it("Make Reminder uses the existing reminder store and keeps the parked item", () => {
    const created = addParkingLotItem({ title: "Remind me later" })!;
    createReminderFromContent({
      title: created.title,
      message: created.title,
      scheduledAt: defaultReminderScheduledAt(),
      source: "parking_lot",
      sourceRef: sourceRefFromParkingLot(created.id, created.title),
    });
    expect(getReminders().some((r) => r.title === "Remind me later")).toBe(
      true,
    );
    expect(readPlanningParkingLotItems()).toHaveLength(1);
  });

  it("Move to Project uses project storage and does not open Create", () => {
    const projects = saveProject({
      name: "Test Project",
      goal: "",
      horizon: "soon",
    });
    const projectId = projects[0]!.id;
    const created = addParkingLotItem({ title: "Project task from lot" })!;
    saveProjectItem({
      projectId,
      kind: "task",
      title: created.title,
    });
    deleteDeferredPlanItem(created.id);
    expect(readPlanningParkingLotItems()).toHaveLength(0);
    expect(
      getProjectItems(projectId).some((i) => i.title === "Project task from lot"),
    ).toBe(true);
  });

  it("Clear My Mind parking-lot route writes to Parking Lot store", () => {
    const entry: BrainDumpEntry = {
      id: "bd-1",
      text: "Someday idea from dump",
      createdAt: new Date().toISOString(),
      done: false,
    };
    routeBrainDumpEntry(entry, "parking-lot");
    expect(
      readPlanningParkingLotItems().some(
        (i) =>
          i.title === "Someday idea from dump" && i.source === "clear-my-mind",
      ),
    ).toBe(true);
  });
});
