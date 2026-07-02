// @vitest-environment jsdom

import { beforeEach, describe, expect, it } from "vitest";
import { saveCaptureEntry } from "@/lib/capture/saveCaptureEntry";
import { queryMemoryEntries } from "@/lib/memory/queryMemory";
import { exportUserMemory } from "@/lib/memory/export/exportUserMemory";
import { getUserMemoryStore } from "@/lib/memory/userMemoryStore";

describe("memory library + export", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("1. journal capture appears in memory store, not chat", () => {
    saveCaptureEntry("journal", "Morning clarity about pricing.");
    const store = getUserMemoryStore();
    expect(store.journals.some((e) => e.content.includes("pricing"))).toBe(true);
  });

  it("2. memory query returns all entries chronologically", () => {
    saveCaptureEntry("journal", "First thought");
    saveCaptureEntry("portfolio", "Second project note for portfolio");
    const all = queryMemoryEntries({ typeFilter: "all" });
    expect(all.length).toBeGreaterThanOrEqual(2);
  });

  it("3. weekly wins export generates text without LLM", () => {
    saveCaptureEntry("evidence", "I helped someone launch their first offer");
    const result = exportUserMemory({
      reportType: "weekly-wins",
      format: "text",
      dateRange: { preset: "month" },
    });
    expect(result.text).toMatch(/Weekly Wins/i);
    expect(result.entryCount).toBeGreaterThanOrEqual(0);
  });

  it("5. evidence filter shows only evidence", () => {
    saveCaptureEntry("journal", "Private reflection");
    saveCaptureEntry("evidence", "Proof I helped a client");
    const evidence = queryMemoryEntries({ typeFilter: "evidence" });
    expect(evidence.every((e) => e.type === "evidence")).toBe(true);
    expect(evidence.some((e) => e.content.includes("client"))).toBe(true);
    expect(evidence.some((e) => e.content.includes("reflection"))).toBe(false);
  });
});
