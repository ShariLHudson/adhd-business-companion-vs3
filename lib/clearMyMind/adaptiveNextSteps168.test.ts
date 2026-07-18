import { describe, expect, it } from "vitest";
import type { BrainDumpEntry } from "@/lib/companionStore";
import {
  buildAdaptiveNextSteps,
  nextReviewBatch,
  unroutedClearMyMindEntries,
} from "./adaptiveNextSteps";

function entry(text: string, id = text): BrainDumpEntry {
  return {
    id,
    text,
    originalText: text,
    createdAt: new Date().toISOString(),
  };
}

describe("Clear My Mind large-list next steps (168)", () => {
  it("offers Review 5 / Organize / Park Everything for large captures", () => {
    const entries = Array.from({ length: 12 }, (_, i) =>
      entry(`thought ${i}`, `t-${i}`),
    );
    const model = buildAdaptiveNextSteps(entries);
    expect(model.kind).toBe("large-list");
    expect(model.body).toMatch(/You captured 12/);
    const ids = model.primary.map((p) => p.id);
    expect(ids).toContain("review-batch");
    expect(ids).toContain("park-everything");
    expect(ids).toContain("continue-tomorrow");
  });

  it("batches Review 5 and advances with Next 5", () => {
    const entries = Array.from({ length: 12 }, (_, i) =>
      entry(`thought ${i}`, `t-${i}`),
    );
    const first = nextReviewBatch(entries, 0, 5);
    expect(first.batch).toHaveLength(5);
    expect(first.remaining).toBe(7);
    const second = nextReviewBatch(entries, first.nextOffset, 5);
    expect(second.batch).toHaveLength(5);
    expect(second.remaining).toBe(2);
  });

  it("excludes already parked thoughts from review batches", () => {
    const entries = [
      entry("a", "a"),
      { ...entry("b", "b"), routedAction: "parking-lot" as const },
      entry("c", "c"),
    ];
    expect(unroutedClearMyMindEntries(entries).map((e) => e.id)).toEqual([
      "a",
      "c",
    ]);
  });
});
