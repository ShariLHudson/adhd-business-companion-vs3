import { describe, expect, it } from "vitest";
import { assembleContext } from "./assembleContext";
import { generateCompanionJudgment } from "./generateCompanionJudgment";
import {
  formatMorningPresencePlain,
  generateMorningPresence,
} from "./generateMorningPresence";
import type { CompanionMemorySnapshot } from "./types";

function memory(
  overrides: Partial<CompanionMemorySnapshot> = {},
): CompanionMemorySnapshot {
  return {
    dayKey: "2026-06-25",
    capacity: {
      energy: "medium",
      motivation: "steady",
      fresh: true,
    },
    brainState: {
      version: 1,
      lastReflectedDayKey: "",
      updatedAt: new Date().toISOString(),
      timingJudgment: { weights: {}, evidenceCount: 0, lastAdjustedAt: "" },
      priorityJudgment: { weights: {}, evidenceCount: 0, lastAdjustedAt: "" },
      permissionJudgment: { weights: {}, evidenceCount: 0, lastAdjustedAt: "" },
      momentumJudgment: { weights: {}, evidenceCount: 0, lastAdjustedAt: "" },
      confidenceJudgment: { weights: {}, evidenceCount: 0, lastAdjustedAt: "" },
      relationshipJudgment: { weights: {}, evidenceCount: 0, lastAdjustedAt: "" },
      calibration: {
        predictionAccuracyEwma: 0.5,
        momentumSuccessEwma: 0.5,
        permissionAccuracyEwma: 0.5,
      },
    },
    candidates: [],
    exclusions: [],
    suppressTopics: [],
    ...overrides,
  };
}

describe("generateMorningPresence", () => {
  it("notices high energy before any plan language", () => {
    const ctx = assembleContext(
      memory({
        capacity: { energy: "high", motivation: "excited", fresh: true },
      }),
    );
    const presence = generateMorningPresence(ctx);
    expect(presence.lines[0]).toMatch(/real energy/i);
    expect(presence.lines.join(" ")).not.toMatch(/worth your attention/i);
  });

  it("speaks gently on recovery days", () => {
    const ctx = assembleContext(
      memory({
        capacity: { energy: "medium", motivation: "low", fresh: true },
        yesterdaySummary: "Yesterday was quieter than planned",
      }),
    );
    Object.assign(ctx, { dayMode: "recovery" as const });
    const presence = generateMorningPresence(ctx);
    expect(presence.lines.join(" ")).toMatch(/glad you came back|gentle/i);
  });

  it("witnesses difficult carry before default recovery", () => {
    const ctx = assembleContext(
      memory({ yesterdaySummary: "A difficult day yesterday" }),
    );
    const presence = generateMorningPresence(ctx);
    expect(presence.lines.join(" ")).toMatch(/carrying a lot/i);
  });

  it("celebrates before planning", () => {
    const ctx = assembleContext(memory({ milestoneEvidence: ["Launch went live"] }));
    Object.assign(ctx, { dayMode: "celebration" as const });
    const presence = generateMorningPresence(ctx);
    expect(presence.lead).toMatch(/before anything else/i);
    expect(presence.lines.join(" ")).toMatch(/happy for you/i);
  });

  it("honors family-first days", () => {
    const ctx = assembleContext(memory());
    Object.assign(ctx, { dayMode: "family" as const });
    const presence = generateMorningPresence(ctx);
    expect(presence.lines.join(" ")).toMatch(/more than work/i);
  });

  it("notices vacation countdown from calendar", () => {
    const ctx = assembleContext(
      memory({ calendarHighlights: ["Beach trip in 3 days"] }),
    );
    const presence = generateMorningPresence(ctx);
    expect(presence.lines.join(" ")).toMatch(/closer to your trip/i);
  });

  it("ships on every judgment cycle", () => {
    const judgment = generateCompanionJudgment(
      assembleContext(
        memory({
          capacity: { energy: "high", motivation: "focused", fresh: true },
        }),
      ),
    );
    expect(judgment.morningPresence.lines.length).toBeGreaterThan(0);
    expect(formatMorningPresencePlain(judgment.morningPresence)).toBeTruthy();
  });
});
