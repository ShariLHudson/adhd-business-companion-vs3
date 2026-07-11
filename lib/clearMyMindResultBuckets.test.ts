import { describe, expect, it } from "vitest";
import { groupEntriesIntoResultBuckets } from "./clearMyMindResultBuckets";
import type { BrainDumpEntry } from "./companionStore";

function entry(text: string, category?: string): BrainDumpEntry {
  return {
    id: `e-${text.slice(0, 8)}`,
    text,
    createdAt: new Date().toISOString(),
    category,
  };
}

describe("clearMyMindResultBuckets", () => {
  it("groups business worries and ideas into protocol clusters", () => {
    const buckets = groupEntriesIntoResultBuckets([
      entry("I'm worried about payroll for the business"),
      entry("Maybe we could launch a workshop"),
    ]);
    const labels = buckets.map((b) => b.label);
    expect(labels).toContain("Business");
    expect(labels).toContain("Ideas");
  });

  it("omits empty buckets", () => {
    const buckets = groupEntriesIntoResultBuckets([entry("Call Izna tomorrow")]);
    expect(buckets).toHaveLength(1);
    expect(buckets[0]!.label).toBe("People");
  });

  it("supports health, shopping, and someday clusters", () => {
    const buckets = groupEntriesIntoResultBuckets([
      entry("Call the doctor about sleep"),
      entry("Buy groceries tomorrow"),
      entry("Someday write a book"),
    ]);
    const labels = buckets.map((b) => b.label);
    expect(labels).toContain("Health");
    expect(labels).toContain("Shopping");
    expect(labels).toContain("Someday");
  });
});
