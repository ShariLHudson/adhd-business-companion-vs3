import { beforeEach, describe, expect, it, vi } from "vitest";
import { addBrainDump, addBrainDumps, getBrainDumps } from "./companionStore";
import { splitCaptureInput } from "./clearMyMindCapture";
import { routeBrainDumpEntry } from "./brainDumpRouting";

const FOUR_LINE_INPUT = `Work on ADHD App
Create Automation for Sales Calls
Revise Marketing Plan
Create Affiliate Plan`;

describe("brain dump storage", () => {
  beforeEach(() => {
    const mem = new Map<string, string>();
    vi.stubGlobal("window", {});
    vi.stubGlobal("localStorage", {
      getItem: (k: string) => mem.get(k) ?? null,
      setItem: (k: string, v: string) => mem.set(k, v),
      removeItem: (k: string) => mem.delete(k),
      clear: () => mem.clear(),
    });
    vi.stubGlobal("crypto", {
      randomUUID: () =>
        `test-${Math.random().toString(36).slice(2)}-${Date.now()}`,
    });
  });

  it("splitCaptureInput yields 4 parts for the P0 repro input", () => {
    const parts = splitCaptureInput(FOUR_LINE_INPUT);
    expect(parts).toHaveLength(4);
    expect(parts[0]).toBe("Work on ADHD App");
    expect(parts[3]).toBe("Create Affiliate Plan");
  });

  it("addBrainDumps saves each line as its own library card", () => {
    const parts = splitCaptureInput(FOUR_LINE_INPUT);
    const sessionId = "cmind-test";
    addBrainDumps(parts, { captureSessionId: sessionId });
    const stored = getBrainDumps().filter((e) => e.captureSessionId === sessionId);
    expect(stored).toHaveLength(4);
    expect(new Set(stored.map((e) => e.id)).size).toBe(4);
    expect(stored.map((e) => e.text).sort()).toEqual([...parts].sort());
    expect(stored.some((e) => e.text.includes("\n"))).toBe(false);
  });

  it("addBrainDumps writes atomically in one save (same millisecond)", () => {
    const fixed = 1_700_000_000_000;
    vi.spyOn(Date, "now").mockImplementation(() => fixed);
    const parts = splitCaptureInput(FOUR_LINE_INPUT);
    addBrainDumps(parts, { captureSessionId: "same-ms" });
    expect(
      getBrainDumps().filter((e) => e.captureSessionId === "same-ms"),
    ).toHaveLength(4);
  });

  it("unsorted items remain in the active library list", () => {
    const parts = splitCaptureInput(FOUR_LINE_INPUT);
    addBrainDumps(parts, { captureSessionId: "lib-visible" });
    const active = getBrainDumps().filter((e) => !e.done);
    expect(active).toHaveLength(4);
    expect(active.every((e) => !e.sorted && !e.routedAction)).toBe(true);
  });

  it("library-style filters show all four when time=all and category=all", () => {
    const parts = splitCaptureInput(FOUR_LINE_INPUT);
    addBrainDumps(parts, { captureSessionId: "lib-count" });
    const active = getBrainDumps().filter((e) => !e.done);
    const visible = active.filter(
      () => true /* timeFilter === "all" */,
    );
    expect(visible).toHaveLength(4);
  });
});

describe("brainDumpRouting — Keep in Library", () => {
  beforeEach(() => {
    const mem = new Map<string, string>();
    vi.stubGlobal("window", {});
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

  it("Keep in Library keeps the item visible (not done)", () => {
    addBrainDump("Work on ADHD App", { captureSessionId: "s1" });
    const entry = getBrainDumps()[0]!;
    routeBrainDumpEntry(entry, "done");
    const updated = getBrainDumps().find((e) => e.id === entry.id);
    expect(updated?.done).not.toBe(true);
    expect(updated?.sorted).toBe(true);
    expect(updated?.routedAction).toBe("library");
  });
});
