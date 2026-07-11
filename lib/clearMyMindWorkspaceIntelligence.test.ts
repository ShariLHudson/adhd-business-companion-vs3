import { describe, expect, it } from "vitest";
import { analyzeClearMyMindWorkspace } from "./clearMyMindWorkspaceIntelligence";
import type { BrainDumpEntry } from "./companionStore";

function entry(partial: Partial<BrainDumpEntry> & { id: string; text: string }): BrainDumpEntry {
  return {
    createdAt: new Date().toISOString(),
    ...partial,
  } as BrainDumpEntry;
}

describe("analyzeClearMyMindWorkspace", () => {
  it("recommends organize and prioritize workflows with insight", () => {
    const entries = [
      entry({ id: "1", text: "Call the doctor ASAP today" }),
      entry({ id: "2", text: "Maybe launch a new offer someday" }),
      entry({ id: "3", text: "Finish the client proposal this week" }),
    ];
    const analysis = analyzeClearMyMindWorkspace(entries);
    expect(analysis.thoughtCount).toBe(3);
    expect(analysis.recommended.some((o) => o.id === "organize")).toBe(true);
    expect(analysis.recommended.some((o) => o.id === "prioritize")).toBe(true);
    expect(analysis.recommended.some((o) => o.id === "visualize")).toBe(true);
    expect(analysis.recommended.some((o) => o.id === "create")).toBe(true);
    expect(analysis.recommended.some((o) => o.id === "save")).toBe(true);
    expect(analysis.priorityOrder.length).toBe(3);
    expect(analysis.insight.length).toBeGreaterThan(10);
  });

  it("surfaces pressure as primary when do-now language appears", () => {
    const entries = [
      entry({ id: "1", text: "Urgent: send invoice right now" }),
      entry({ id: "2", text: "Buy groceries" }),
    ];
    const analysis = analyzeClearMyMindWorkspace(entries);
    const primary = analysis.recommended.find((o) => o.primary);
    expect(primary?.id).toBe("prioritize");
  });
});
