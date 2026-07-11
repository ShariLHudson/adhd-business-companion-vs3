import { beforeEach, describe, expect, it, vi } from "vitest";
import { addBrainDump, getBrainDumps } from "./companionStore";
import { applyThoughtAction, THOUGHT_ACTION_LABEL } from "./thoughtActions";
import { loadTodayPlanItems } from "./planMyDay/planDayItems";

describe("thoughtActions", () => {
  beforeEach(() => {
    const mem = new Map<string, string>();
    vi.stubGlobal("window", {
      dispatchEvent: vi.fn(),
    });
    vi.stubGlobal("localStorage", {
      getItem: (k: string) => mem.get(k) ?? null,
      setItem: (k: string, v: string) => mem.set(k, v),
      removeItem: (k: string) => mem.delete(k),
      clear: () => mem.clear(),
    });
    vi.stubGlobal("crypto", {
      randomUUID: () => `test-${Math.random().toString(36).slice(2)}`,
    });
  });

  it("exposes Clear My Mind Action Mode labels", () => {
    expect(THOUGHT_ACTION_LABEL["do-now"]).toBe("Do Now");
    expect(THOUGHT_ACTION_LABEL.today).toBe("Today");
    expect(THOUGHT_ACTION_LABEL["this-week"]).toBe("This Week");
    expect(THOUGHT_ACTION_LABEL["mark-done"]).toBe("Mark Done");
    expect(THOUGHT_ACTION_LABEL.schedule).toBe("Schedule");
    expect(THOUGHT_ACTION_LABEL["add-to-calendar"]).toBe("Add to Calendar");
    expect(THOUGHT_ACTION_LABEL["move-to-project"]).toBe("Move to Project");
    expect(THOUGHT_ACTION_LABEL.research).toBe("Research");
    expect(THOUGHT_ACTION_LABEL.waiting).toBe("Waiting");
    expect(THOUGHT_ACTION_LABEL.someday).toBe("Someday");
    expect(THOUGHT_ACTION_LABEL["parking-lot"]).toBe("Parking Lot");
    expect(THOUGHT_ACTION_LABEL.reference).toBe("Reference");
    expect(THOUGHT_ACTION_LABEL.journal).toBe("Journal");
    expect(THOUGHT_ACTION_LABEL["plan-my-day"]).toBe("Move to Plan My Day");
    expect(THOUGHT_ACTION_LABEL["keep-here"]).toBe("Keep Here");
    expect(THOUGHT_ACTION_LABEL.delete).toBe("Delete");
  });

  it("mark done completes the thought without using Keep in Library route", () => {
    addBrainDump("Call doctor");
    const entry = getBrainDumps()[0]!;
    const result = applyThoughtAction(entry, "mark-done");
    const updated = getBrainDumps().find((e) => e.id === entry.id)!;
    expect(result.ok).toBe(true);
    expect(result.removedFromLandscape).toBe(true);
    expect(updated.done).toBe(true);
    expect(updated.routedAction).not.toBe("library");
  });

  it("keep here uses library route and does not mark done", () => {
    addBrainDump("Finish newsletter");
    const entry = getBrainDumps()[0]!;
    const result = applyThoughtAction(entry, "keep-here");
    const updated = getBrainDumps().find((e) => e.id === entry.id)!;
    expect(result.ok).toBe(true);
    expect(updated.done).not.toBe(true);
    expect(updated.routedAction).toBe("library");
    expect(updated.sorted).toBe(true);
  });

  it("schedule routes as reminder", () => {
    addBrainDump("Call doctor appointment");
    const entry = getBrainDumps()[0]!;
    applyThoughtAction(entry, "schedule");
    const updated = getBrainDumps().find((e) => e.id === entry.id)!;
    expect(updated.routedAction).toBe("reminder");
  });

  it("add to calendar routes as time block", () => {
    addBrainDump("Doctor follow-up");
    const entry = getBrainDumps()[0]!;
    applyThoughtAction(entry, "add-to-calendar");
    const updated = getBrainDumps().find((e) => e.id === entry.id)!;
    expect(updated.routedAction).toBe("time-block");
  });

  it("move to plan my day adds a plan item and routes the thought", () => {
    addBrainDump("Write newsletter intro");
    const entry = getBrainDumps()[0]!;
    const result = applyThoughtAction(entry, "plan-my-day");
    const updated = getBrainDumps().find((e) => e.id === entry.id)!;
    expect(result.ok).toBe(true);
    expect(updated.routedAction).toBe("plan-my-day");
    expect(loadTodayPlanItems().some((i) => i.title === "Write newsletter intro")).toBe(
      true,
    );
  });

  it("delete removes the thought", () => {
    addBrainDump("Old idea");
    const entry = getBrainDumps()[0]!;
    const result = applyThoughtAction(entry, "delete");
    expect(result.ok).toBe(true);
    expect(result.removedFromLandscape).toBe(true);
    expect(getBrainDumps().find((e) => e.id === entry.id)).toBeUndefined();
  });
});
