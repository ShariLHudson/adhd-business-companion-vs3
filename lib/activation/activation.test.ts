import { describe, expect, it, beforeEach, vi } from "vitest";
import { evaluateActivation, shouldSurfaceActivationOffer } from "./activationEngine";
import { rankLikelyBlockers } from "./activationPatterns";
import { detectActivationSignals } from "./activationSignals";

describe("activation intelligence", () => {
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

  it("detects overwhelm blocker from language", () => {
    const hits = detectActivationSignals({
      text: "I'm overwhelmed and don't know where to start",
    });
    const blockers = rankLikelyBlockers(hits);
    expect(blockers[0]?.type).toBe("overwhelm");
    expect(blockers[0]?.reason).toBeTruthy();
  });

  it("detects task friction for explicit stuck language", () => {
    const hits = detectActivationSignals({
      text: "I'm stuck and can't start this task",
    });
    const blockers = rankLikelyBlockers(hits);
    expect(blockers.some((b) => b.type === "task_friction")).toBe(true);
  });

  it("does not surface activation offer during emotional distress", () => {
    const snap = evaluateActivation({
      text: "I am overwhelmed",
      emotionalState: "emotional",
      cognitiveLoadLevel: "overloaded",
    });
    expect(snap.companionOffer).toMatch(/carrying a lot/i);
    expect(shouldSurfaceActivationOffer(snap)).toBe(false);
    expect(shouldSurfaceActivationOffer(snap, "I am overwhelmed")).toBe(false);
    expect(
      shouldSurfaceActivationOffer(snap, "I am overwhelmed", [
        { role: "user", content: "I am overwhelmed" },
      ]),
    ).toBe(false);
  });

  it("produces ActivationSnapshot with small companion offer", () => {
    const snap = evaluateActivation({
      text: "I'm stuck — the task feels too big",
      emotionalState: "stuck",
      cognitiveLoadLevel: "moderate",
    });
    expect(snap.state).toMatch(/stuck|frozen|hesitant/);
    expect(snap.likelyBlockers.length).toBeGreaterThan(0);
    expect(snap.suggestedNextStep.length).toBeGreaterThan(5);
    expect(shouldSurfaceActivationOffer(snap, "I'm stuck — the task feels too big")).toBe(
      true,
    );
    expect(snap.companionOffer).toMatch(/tiny|5-minute|shrink|small|friction|step/i);
    expect(snap.companionOffer).not.toMatch(/try harder|lazy|failing/i);
  });

  it("prefers load-reduction when cognitive load is overloaded", () => {
    const snap = evaluateActivation({
      text: "I'm stuck",
      cognitiveLoadLevel: "overloaded",
    });
    expect(snap.companionOffer).toMatch(/park|wait|carrying|matters today/i);
  });

  it("returns moving state without offer for neutral input", () => {
    const snap = evaluateActivation({
      text: "I finished the email draft",
      emotionalState: "focused",
      cognitiveLoadLevel: "light",
    });
    expect(snap.state).toBe("moving");
    expect(snap.companionOffer).toBe("");
  });

  it("avoids productivity push when energy is low", () => {
    const snap = evaluateActivation({
      text: "I'm stuck on this boring task",
      emotionalState: "stuck",
      cognitiveLoadLevel: "moderate",
      dayEnergyLow: true,
    });
    expect(snap.companionOffer).toMatch(/energy|recovery|smallest|light plan/i);
    expect(snap.companionOffer).not.toMatch(/try harder|grind/i);
    expect(snap.companionOffer).not.toMatch(/\bpush yourself\b|\bkeep pushing\b/i);
  });

  it("detects repeated task avoidance from signal counts", () => {
    const now = new Date();
    const hits = detectActivationSignals({
      text: "I'm stuck",
      now,
      signalCounts: [
        {
          kind: "struggle",
          category: "follow_through",
          count: 3,
          lastSeen: now.toISOString(),
        },
      ],
    });
    expect(hits.some((h) => h.signal === "repeated task avoidance")).toBe(true);
  });
});
