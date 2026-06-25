import { beforeEach, describe, expect, it, vi } from "vitest";
import { addBrainDump, getBrainDumps } from "@/lib/companionStore";
import {
  clearThoughtSeparationUndo,
  getPendingThoughtSeparationUndo,
  separateThoughtWithUndo,
  shariAfterSeparateAcknowledgment,
  undoThoughtSeparation,
} from "./thoughtSeparate";

describe("thoughtSeparate", () => {
  beforeEach(() => {
    const mem = new Map<string, string>();
    vi.stubGlobal("window", {});
    vi.stubGlobal("localStorage", {
      getItem: (k: string) => mem.get(k) ?? null,
      setItem: (k: string, v: string) => mem.set(k, v),
      removeItem: (k: string) => mem.delete(k),
      clear: () => mem.clear(),
    });
    vi.stubGlobal("sessionStorage", {
      getItem: (k: string) => mem.get(`s:${k}`) ?? null,
      setItem: (k: string, v: string) => mem.set(`s:${k}`, v),
      removeItem: (k: string) => mem.delete(`s:${k}`),
      clear: () => mem.clear(),
    });
    vi.stubGlobal("crypto", {
      randomUUID: () => `test-${Math.random().toString(36).slice(2)}`,
    });
    clearThoughtSeparationUndo();
  });

  it("picks a stable acknowledgment line from seed", () => {
    const a = shariAfterSeparateAcknowledgment("seed-1");
    const b = shariAfterSeparateAcknowledgment("seed-1");
    expect(a).toBe(b);
    expect(a.length).toBeGreaterThan(10);
  });

  it("separates and stores undo metadata", () => {
    addBrainDump("Call doctor, finish newsletter, text Izna");
    const id = getBrainDumps()[0]!.id;
    const segments = ["Call doctor", "finish newsletter", "text Izna"];

    const undo = separateThoughtWithUndo(id, segments);
    expect(undo).not.toBeNull();
    expect(getBrainDumps().length).toBe(3);
    expect(getPendingThoughtSeparationUndo()?.primaryId).toBe(id);
    expect(getPendingThoughtSeparationUndo()?.createdIds).toHaveLength(2);
  });

  it("restores combined thought on undo", () => {
    const combined = "Call doctor, finish newsletter, text Izna";
    addBrainDump(combined);
    const id = getBrainDumps()[0]!.id;
    separateThoughtWithUndo(id, [
      "Call doctor",
      "finish newsletter",
      "text Izna",
    ]);

    expect(undoThoughtSeparation()).toBe(true);
    expect(getBrainDumps()).toHaveLength(1);
    expect(getBrainDumps()[0]!.text).toBe(combined);
    expect(getPendingThoughtSeparationUndo()).toBeNull();
  });
});
