import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  evaluateAndRecordUserHealth,
  evaluateUserHealth,
  userHealthHintForChat,
  userHealthWelcomeLine,
} from "./userHealthEngine";
import { buildFounderUserHealthReport } from "./founderUserHealthReporting";
import { saveUserHealthStore } from "./userHealthStore";

describe("user health intelligence", () => {
  beforeEach(() => {
    const mem = new Map<string, string>();
    vi.stubGlobal("localStorage", {
      getItem: (k: string) => mem.get(k) ?? null,
      setItem: (k: string, v: string) => mem.set(k, v),
      removeItem: (k: string) => mem.delete(k),
      clear: () => mem.clear(),
    });
    vi.stubGlobal("window", { dispatchEvent: vi.fn() });
    saveUserHealthStore({ history: [], founderSamples: [] });
  });

  it("flags overloaded from cognitive load and overwhelm language", () => {
    const snapshot = evaluateUserHealth({
      cognitiveLoadLevel: "overloaded",
      overwhelmLanguageCount: 4,
      emotionalState: "overwhelmed",
    });
    expect(snapshot.status).toBe("overloaded");
    expect(snapshot.supportNeeds).toContain("sorting_help");
    expect(snapshot.supportNeeds).toContain("recovery_support");
  });

  it("flags disengaging after long absence — no guilt copy", () => {
    const snapshot = evaluateUserHealth({
      daysSinceLastActivity: 14,
      conversationStarts: 5,
    });
    expect(snapshot.status).toBe("disengaging");
    const welcome = userHealthWelcomeLine(snapshot);
    expect(welcome).toMatch(/Welcome back/i);
    expect(welcome).not.toMatch(/missed you|where have you been/i);
  });

  it("flags recovering with momentum returning", () => {
    const snapshot = evaluateUserHealth({
      activationState: "recovering",
      winLanguageCount: 2,
      stuckLanguageCount: 1,
    });
    expect(snapshot.status).toBe("recovering");
    expect(userHealthWelcomeLine(snapshot)).toMatch(/light today/i);
  });

  it("marks supported when wins without overload", () => {
    const snapshot = evaluateUserHealth({
      winLanguageCount: 2,
      cognitiveLoadLevel: "moderate",
      activationState: "moving",
    });
    expect(snapshot.status).toBe("supported");
  });

  it("chat hint avoids manipulation language", () => {
    const snapshot = evaluateUserHealth({
      daysSinceLastActivity: 10,
      conversationStarts: 3,
    });
    const hint = userHealthHintForChat(snapshot);
    expect(hint).toMatch(/Ethics: no manipulation/i);
    expect(hint).toMatch(/Do NOT shame/i);
  });

  it("founder report tracks distribution and support needs", () => {
    evaluateAndRecordUserHealth({
      cognitiveLoadLevel: "overloaded",
      overwhelmLanguageCount: 3,
    });
    evaluateAndRecordUserHealth({
      daysSinceLastActivity: 12,
      conversationStarts: 4,
    });
    const report = buildFounderUserHealthReport();
    expect(report.sampleSize).toBe(2);
    expect(report.distribution.length).toBeGreaterThan(0);
    expect(report.recommendedFounderAction.length).toBeGreaterThan(10);
  });

  it("needs_support for emotional distress", () => {
    const snapshot = evaluateUserHealth({
      emotionalState: "emotional",
      activationState: "frozen",
    });
    expect(snapshot.status).toBe("needs_support");
    expect(snapshot.recommendedSupport).toMatch(/well-being/i);
  });
});
