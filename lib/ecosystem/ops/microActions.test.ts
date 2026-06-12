import { describe, expect, it } from "vitest";
import {
  breakdownStep,
  completeNextStep,
  dailySummary,
  MemoryMicroPlanSink,
  MicroActionStore,
  nextStepLabel,
  planProgress,
} from "./microActions";
import type { ExecutionStep } from "./advisorExecutionEngine";

const emailStep: ExecutionStep = {
  id: "step-email",
  advisor: "marketing",
  action: "Finalize the marketing funnel email sequence",
  reason: "Flagged high priority",
  context: { projectId: "proj-funnel", projectTitle: "Marketing Funnel" },
  effort: "medium",
  priority: "high",
  status: "pending",
  sourceEventIds: [],
};

describe("micro-action breakdown + progress", () => {
  it("breaks a task into tailored micro-steps starting at 0/total", () => {
    const plan = breakdownStep(emailStep);
    expect(plan.steps).toHaveLength(3);
    expect(plan.steps[0]!.label).toMatch(/draft/i);
    const p0 = planProgress(plan);
    expect(p0).toMatchObject({ done: 0, total: 3, complete: false });
    expect(nextStepLabel(plan)).toMatch(/draft/i);
  });

  it("advances progress as steps are confirmed (1/3 → 33% → complete)", () => {
    let plan = breakdownStep(emailStep);
    plan = completeNextStep(plan); // "I drafted the email"
    const p1 = planProgress(plan);
    expect(p1.done).toBe(1);
    expect(Math.round(p1.fraction * 100)).toBe(33);
    expect(plan.status).toBe("active");

    plan = completeNextStep(plan);
    plan = completeNextStep(plan);
    const p3 = planProgress(plan);
    expect(p3.complete).toBe(true);
    expect(plan.status).toBe("complete");
  });
});

describe("micro-action store persistence", () => {
  it("persists active plan + progress across store instances", () => {
    const sink = new MemoryMicroPlanSink();
    const s1 = new MicroActionStore(sink);
    const plan = breakdownStep(emailStep);
    s1.save(plan);
    s1.completeNext(plan.id);

    const s2 = new MicroActionStore(sink);
    const active = s2.active();
    expect(active?.id).toBe(plan.id);
    expect(planProgress(active!).done).toBe(1);
  });
});

describe("daily summary", () => {
  it("reports completed / in-progress / blocked across the day", () => {
    const steps: ExecutionStep[] = [
      { ...emailStep, id: "a" },
      { ...emailStep, id: "b" },
      { ...emailStep, id: "c" },
    ];
    const summary = dailySummary(steps, new Set(["a"]), 1, 1);
    expect(summary).toMatchObject({
      highPriorityTotal: 3,
      highPriorityCompleted: 1,
      inProgress: 1,
      blocked: 1,
      onTrack: true,
    });
  });
});
