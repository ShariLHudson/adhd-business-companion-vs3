import { beforeEach, describe, expect, it, vi } from "vitest";
import { addBrainDump, getBrainDumps } from "./companionStore";
import { routeBrainDumpEntry } from "./brainDumpRouting";
import {
  deriveThoughtLifecycle,
  isCompletedThought,
  isHeldThought,
  isKeptThought,
  isRoutedThought,
  isSortedIdleThought,
  isVisibleInMentalLandscape,
} from "./thoughtLifecycle";

function entry(
  overrides: Partial<ReturnType<typeof getBrainDumps>[number]> = {},
) {
  return {
    id: "bd-test",
    text: "Test thought",
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

describe("thoughtLifecycle — deriveThoughtLifecycle", () => {
  it("classifies new capture as held", () => {
    expect(deriveThoughtLifecycle(entry())).toBe("held");
    expect(isHeldThought(entry())).toBe(true);
  });

  it("classifies sorted but not routed as sorted-idle", () => {
    const e = entry({ sorted: true });
    expect(deriveThoughtLifecycle(e)).toBe("sorted-idle");
    expect(isSortedIdleThought(e)).toBe(true);
  });

  it("classifies Keep in Library route as kept", () => {
    const mem = new Map<string, string>();
    vi.stubGlobal("window", {});
    vi.stubGlobal("localStorage", {
      getItem: (k: string) => mem.get(k) ?? null,
      setItem: (k: string, v: string) => mem.set(k, v),
      removeItem: (k: string) => mem.delete(k),
      clear: () => mem.clear(),
    });
    vi.stubGlobal("crypto", {
      randomUUID: () => "test-uuid-kept",
    });

    addBrainDump("Work on newsletter", { captureSessionId: "s1" });
    const raw = getBrainDumps()[0]!;
    routeBrainDumpEntry(raw, "done");

    const updated = getBrainDumps().find((e) => e.id === raw.id)!;
    expect(updated.done).not.toBe(true);
    expect(updated.routedAction).toBe("library");
    expect(deriveThoughtLifecycle(updated)).toBe("kept");
    expect(isKeptThought(updated)).toBe(true);
  });

  const routedActions = [
    "project",
    "focus",
    "time-block",
    "tomorrow",
    "reminder",
    "parking-lot",
    "task",
  ] as const;

  it.each(routedActions)("classifies routedAction %s as routed", (routedAction) => {
    const e = entry({ routedAction });
    expect(deriveThoughtLifecycle(e)).toBe("routed");
    expect(isRoutedThought(e)).toBe(true);
  });

  it("classifies done as completed", () => {
    const e = entry({ done: true });
    expect(deriveThoughtLifecycle(e)).toBe("completed");
    expect(isCompletedThought(e)).toBe(true);
  });

  it("prioritizes completed over routed fields", () => {
    const e = entry({ done: true, routedAction: "project", sorted: true });
    expect(deriveThoughtLifecycle(e)).toBe("completed");
  });

  it("prioritizes kept over sorted-idle when library route set", () => {
    const e = entry({ sorted: true, routedAction: "library" });
    expect(deriveThoughtLifecycle(e)).toBe("kept");
  });
});

describe("thoughtLifecycle — visibility", () => {
  it("hides completed thoughts from mental landscape", () => {
    expect(isVisibleInMentalLandscape(entry({ done: true }))).toBe(false);
  });

  const visibleStates = [
    { label: "held", overrides: {} },
    { label: "sorted-idle", overrides: { sorted: true } },
    { label: "kept", overrides: { routedAction: "library" } },
    { label: "routed", overrides: { routedAction: "focus" } },
  ] as const;

  it.each(visibleStates)(
    "keeps $label thoughts visible in mental landscape",
    ({ overrides }) => {
      expect(isVisibleInMentalLandscape(entry(overrides))).toBe(true);
    },
  );
});

describe("thoughtLifecycle — Done vs Keep in Library", () => {
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

  it("route key done is kept, not completed", () => {
    addBrainDump("Park this idea");
    const raw = getBrainDumps()[0]!;
    routeBrainDumpEntry(raw, "done");
    const updated = getBrainDumps()[0]!;
    expect(updated.done).not.toBe(true);
    expect(deriveThoughtLifecycle(updated)).toBe("kept");
  });

  it("markDone-style completion is completed, not kept", () => {
    const e = entry({ done: true, sorted: true, routedAction: "library" });
    expect(deriveThoughtLifecycle(e)).toBe("completed");
    expect(isKeptThought(e)).toBe(false);
  });
});
