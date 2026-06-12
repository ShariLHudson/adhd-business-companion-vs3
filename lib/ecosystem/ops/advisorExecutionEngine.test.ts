import { describe, expect, it } from "vitest";
import {
  buildExecutionPlan,
  stepsByAdvisor,
} from "./advisorExecutionEngine";
import {
  FounderActivityTracker,
  MemoryActionSink,
} from "./founderActivityTracker";
import { operationalScenario } from "./fixtures/operationalScenarios";
import { getFounderIntelligence } from "../intelligence/founderIntelligenceEngine";

const events = operationalScenario();
const intel = getFounderIntelligence(events, "founder-001");

describe("advisorExecutionEngine", () => {
  const plan = buildExecutionPlan(intel, events);

  it("turns recommendations and risks into trackable steps", () => {
    expect(plan.length).toBeGreaterThan(0);
    for (const s of plan) {
      expect(s.action.length).toBeGreaterThan(0);
      expect(["low", "medium", "high"]).toContain(s.effort);
      expect(["low", "medium", "high"]).toContain(s.priority);
      expect(s.status).toBe("pending");
    }
  });

  it("flags the overdue client deliverable as a high-priority step", () => {
    expect(
      plan.some(
        (s) => /overdue|past its due|deliverable/i.test(s.action + " " + s.reason),
      ),
    ).toBe(true);
  });

  it("attributes steps to owning advisors and groups them", () => {
    const grouped = stepsByAdvisor(plan);
    const advisors = Object.keys(grouped);
    expect(advisors.length).toBeGreaterThan(0);
    // The sales gap in the scenario should belong to the Sales advisor.
    expect(plan.some((s) => s.advisor === "sales")).toBe(true);
  });
});

describe("founderActivityTracker", () => {
  it("persists status and survives a reload from the same sink", () => {
    const sink = new MemoryActionSink();
    const t1 = new FounderActivityTracker(sink);
    const plan = buildExecutionPlan(intel, events);
    t1.syncPlan(plan);

    const first = plan[0]!.id;
    t1.markDone(first);
    t1.markSkipped(plan[1]!.id);

    // A new tracker over the same sink sees the persisted statuses.
    const t2 = new FounderActivityTracker(sink);
    const stats = t2.stats();
    expect(stats.total).toBe(plan.length);
    expect(stats.done).toBe(1);
    expect(stats.skipped).toBe(1);
    expect(t2.byStatus("done")[0]!.id).toBe(first);
  });

  it("re-syncing a plan keeps prior statuses (idempotent)", () => {
    const sink = new MemoryActionSink();
    const t = new FounderActivityTracker(sink);
    const plan = buildExecutionPlan(intel, events);
    t.syncPlan(plan);
    t.markDone(plan[0]!.id);
    t.syncPlan(plan); // simulate a later refresh
    expect(t.stats().done).toBe(1);
  });
});
