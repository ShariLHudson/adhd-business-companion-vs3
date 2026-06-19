import { describe, expect, it, beforeEach, vi } from "vitest";
import { MIN_LOOP_OBSERVATIONS } from "./loopDetection";
import {
  evaluateAndRecordLoopIntelligence,
  evaluateLoopIntelligence,
  observeLoopSignalsFromInput,
  shouldSurfaceLoopOffer,
} from "./loopEngine";
import { observationsFromText } from "./loopSignals";
import { getLoopStore, saveLoopStore } from "./loopStore";
import { buildFounderLoopReport } from "./founderLoopReporting";

describe("loop intelligence", () => {
  beforeEach(() => {
    const mem = new Map<string, string>();
    vi.stubGlobal("localStorage", {
      getItem: (k: string) => mem.get(k) ?? null,
      setItem: (k: string, v: string) => mem.set(k, v),
      removeItem: (k: string) => mem.delete(k),
      clear: () => mem.clear(),
    });
    vi.stubGlobal("window", { dispatchEvent: vi.fn() });
    saveLoopStore({
      observations: [],
      snapshots: [],
      offerDismissedOn: null,
      dismissedLoopTypes: {},
    });
  });

  it("does not detect a loop from one message alone", () => {
    const now = new Date("2026-06-12T12:00:00.000Z");
    evaluateAndRecordLoopIntelligence({
      text: "I keep researching and need more research before I decide",
      now,
    });
    const snap = evaluateLoopIntelligence({ now });
    expect(snap).toBeNull();
    expect(MIN_LOOP_OBSERVATIONS).toBeGreaterThan(1);
  });

  it("detects repeated loop after multiple observations", () => {
    const day1 = new Date("2026-06-10T12:00:00.000Z");
    const day2 = new Date("2026-06-11T12:00:00.000Z");

    evaluateAndRecordLoopIntelligence({
      text: "I need more research before I can act",
      now: day1,
    });
    const snap = evaluateAndRecordLoopIntelligence({
      text: "Still researching — not ready to decide yet",
      now: day2,
    });

    expect(snap).not.toBeNull();
    expect(snap?.loopType).toBe("research_loop");
    expect(snap?.relatedSignals.length).toBeGreaterThan(0);
    expect(snap?.possiblePurpose).toMatch(/uncertainty/i);
    expect(shouldSurfaceLoopOffer(snap)).toBe(false);
  });

  it("uses non-labeling companion language", () => {
    const obs = [
      ...observationsFromText("what if they hate me", new Date("2026-06-10")),
      ...observationsFromText("they're mad at me again", new Date("2026-06-11")),
    ];
    saveLoopStore({ observations: obs });

    const snap = evaluateLoopIntelligence({
      now: new Date("2026-06-12"),
    });

    expect(snap?.companionResponse).toBeTruthy();
    expect(snap?.companionResponse).not.toMatch(/\brsd loop\b/i);
    expect(snap?.companionResponse).not.toMatch(/you have a/i);
    expect(snap?.companionResponse).toMatch(/notice|mental space|protect|guessing/i);
  });

  it("shortens response when cognitive load is heavy", () => {
    const obs = [
      ...observationsFromText("overwhelmed too much", new Date("2026-06-10")),
      ...observationsFromText("so much mental clutter", new Date("2026-06-11")),
    ];
    saveLoopStore({ observations: obs });

    const snap = evaluateLoopIntelligence({
      now: new Date("2026-06-12"),
      cognitiveLoadLevel: "overloaded",
    });

    expect(snap?.companionResponse.length).toBeLessThan(120);
    expect(snap?.companionResponse).toMatch(/sort|carry|wait|park/i);
  });

  it("offers tiny step when activation is frozen", () => {
    const obs = [
      ...observationsFromText("keep redoing not good enough", new Date("2026-06-10")),
      ...observationsFromText("still editing one more pass", new Date("2026-06-11")),
    ];
    saveLoopStore({ observations: obs });

    const snap = evaluateLoopIntelligence({
      now: new Date("2026-06-12"),
      activationState: "frozen",
    });

    expect(snap?.companionResponse).toMatch(/tiny step|good-enough|finish line/i);
  });

  it("founder report includes recommended action and content ideas", () => {
    evaluateAndRecordLoopIntelligence({
      text: "what if they reject me",
      now: new Date("2026-06-10"),
    });
    evaluateAndRecordLoopIntelligence({
      text: "afraid they're disappointed in me",
      now: new Date("2026-06-11"),
    });

    const report = buildFounderLoopReport(new Date("2026-06-12"));
    expect(report.recommendedFounderAction.length).toBeGreaterThan(10);
    expect(getLoopStore().snapshots.length).toBeGreaterThan(0);
  });

  it("records intelligence signals for repeated categorized struggles", () => {
    const now = new Date("2026-06-12T12:00:00.000Z");
    observeLoopSignalsFromInput({
      now,
      signalCounts: [
        {
          kind: "struggle",
          category: "decision_making",
          count: 3,
          lastSeen: now.toISOString(),
        },
      ],
    });
    const obs = getLoopStore().observations;
    expect(
      obs.some((o) => o.signalId === "repeated_decision_struggle"),
    ).toBe(true);
  });
});
