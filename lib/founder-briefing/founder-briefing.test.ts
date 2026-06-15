import { beforeEach, describe, expect, it, vi } from "vitest";
import { buildFounderMorningBriefing } from "./briefingEngine";
import { statusLabel } from "./briefingPriorities";

describe("founder morning briefing 2.0", () => {
  beforeEach(() => {
    const mem = new Map<string, string>();
    vi.stubGlobal("localStorage", {
      getItem: (k: string) => mem.get(k) ?? null,
      setItem: (k: string, v: string) => mem.set(k, v),
      removeItem: (k: string) => mem.delete(k),
      clear: () => mem.clear(),
    });
    vi.stubGlobal("window", { dispatchEvent: vi.fn() });
  });

  it("creates a complete briefing snapshot", () => {
    const briefing = buildFounderMorningBriefing(new Date("2026-06-12T08:00:00"));
    expect(briefing.date).toBe("2026-06-12");
    expect(briefing.overallStatus).toBeDefined();
    expect(briefing.greeting).toMatch(/Shari/i);
    expect(briefing.summaryLines.length).toBeGreaterThan(0);
    expect(briefing.recommendations.length).toBeLessThanOrEqual(3);
    expect(briefing.topPriorities.length).toBeLessThanOrEqual(3);
  });

  it("status labels are plain language", () => {
    expect(statusLabel("healthy")).toMatch(/healthy/i);
    expect(statusLabel("urgent")).toMatch(/attention/i);
  });

  it("briefing is skimmable — no empty required sections break", () => {
    const briefing = buildFounderMorningBriefing();
    expect(Array.isArray(briefing.opportunities)).toBe(true);
    expect(Array.isArray(briefing.risks)).toBe(true);
    expect(Array.isArray(briefing.wins)).toBe(true);
  });
});
