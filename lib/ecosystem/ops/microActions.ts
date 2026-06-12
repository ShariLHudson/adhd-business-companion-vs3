// Founder Ecosystem — Phase 6b Micro-Action tracking.
//
// A founder picks a flagged task; the board breaks it into 2–4 micro-steps and
// tracks N/M progress as each step is confirmed in chat. This is what lets
// Shari say "step 1 complete, 1/3 done" and the dashboard show 33%. Pure logic
// + a persistent store; no UI.

import type { ID, ISODateString } from "../models";
import type { AdvisorId } from "../board/advisorTypes";
import type { ExecutionStep } from "./advisorExecutionEngine";

export type MicroStep = { id: ID; label: string; status: "todo" | "done" };

export type MicroActionPlan = {
  id: ID;
  title: string;
  projectId?: ID;
  projectTitle?: string;
  advisor: AdvisorId;
  status: "active" | "complete";
  steps: MicroStep[];
  createdAt: ISODateString;
  updatedAt: ISODateString;
};

// Default 3-step breakdown, tailored by what the task looks like.
function microStepsFor(action: string): string[] {
  if (/\bemail|sequence|newsletter|copy|content|post|caption\b/i.test(action))
    return ["Draft a rough version", "Review and tighten it", "Schedule / send it"];
  if (/\b(deck|pitch|proposal|presentation|slides)\b/i.test(action))
    return ["Outline the structure", "Fill in each section", "Review and polish"];
  if (/\b(outreach|prospect|lead|follow.?up|sales|message)\b/i.test(action))
    return ["List who to reach", "Write the message", "Send it"];
  if (/\b(system|sop|process|document|checklist)\b/i.test(action))
    return ["Note the steps as you go", "Tidy into a checklist", "Save it where you'll find it"];
  return ["Make a rough first version", "Review and refine", "Finish it"];
}

const now = () => new Date().toISOString();
const id = (p: string) => `${p}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

// Break a chosen execution step into a tracked micro-action plan.
export function breakdownStep(step: ExecutionStep): MicroActionPlan {
  const planId = id("plan");
  return {
    id: planId,
    title: step.action,
    projectId: step.context.projectId,
    projectTitle: step.context.projectTitle,
    advisor: step.advisor,
    status: "active",
    steps: microStepsFor(step.action).map((label, i) => ({
      id: `${planId}-s${i}`,
      label,
      status: "todo",
    })),
    createdAt: now(),
    updatedAt: now(),
  };
}

export function planProgress(plan: MicroActionPlan): {
  done: number;
  total: number;
  fraction: number;
  complete: boolean;
} {
  const done = plan.steps.filter((s) => s.status === "done").length;
  const total = plan.steps.length;
  return { done, total, fraction: total ? done / total : 0, complete: done === total };
}

function recompute(plan: MicroActionPlan): MicroActionPlan {
  const complete = plan.steps.every((s) => s.status === "done");
  return { ...plan, status: complete ? "complete" : "active", updatedAt: now() };
}

export function completeStep(plan: MicroActionPlan, stepId: ID): MicroActionPlan {
  return recompute({
    ...plan,
    steps: plan.steps.map((s) =>
      s.id === stepId ? { ...s, status: "done" } : s,
    ),
  });
}

// Confirm the next outstanding step (e.g. founder says "I drafted the email").
export function completeNextStep(plan: MicroActionPlan): MicroActionPlan {
  const next = plan.steps.find((s) => s.status === "todo");
  return next ? completeStep(plan, next.id) : plan;
}

export function nextStepLabel(plan: MicroActionPlan): string | null {
  return plan.steps.find((s) => s.status === "todo")?.label ?? null;
}

// ---- Persistence --------------------------------------------------------
export interface MicroPlanSink {
  all(): MicroActionPlan[];
  write(plans: MicroActionPlan[]): void;
}
export class MemoryMicroPlanSink implements MicroPlanSink {
  private plans: MicroActionPlan[] = [];
  all() {
    return this.plans.slice();
  }
  write(plans: MicroActionPlan[]) {
    this.plans = plans.slice();
  }
}
export class LocalStorageMicroPlanSink implements MicroPlanSink {
  constructor(private key = "founder-microplans-v1") {}
  all(): MicroActionPlan[] {
    if (typeof window === "undefined") return [];
    try {
      const raw = window.localStorage.getItem(this.key);
      const p = raw ? JSON.parse(raw) : [];
      return Array.isArray(p) ? (p as MicroActionPlan[]) : [];
    } catch {
      return [];
    }
  }
  write(plans: MicroActionPlan[]) {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(this.key, JSON.stringify(plans));
    } catch {
      /* ignore */
    }
  }
}

export class MicroActionStore {
  constructor(private sink: MicroPlanSink = new MemoryMicroPlanSink()) {}
  all() {
    return this.sink.all();
  }
  save(plan: MicroActionPlan) {
    const others = this.sink.all().filter((p) => p.id !== plan.id);
    this.sink.write([...others, plan]);
    return plan;
  }
  get(planId: ID) {
    return this.sink.all().find((p) => p.id === planId) ?? null;
  }
  /** The current active plan (most recently updated). */
  active(): MicroActionPlan | null {
    return (
      this.sink
        .all()
        .filter((p) => p.status === "active")
        .sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1))[0] ?? null
    );
  }
  completeNext(planId: ID): MicroActionPlan | null {
    const plan = this.get(planId);
    if (!plan) return null;
    return this.save(completeNextStep(plan));
  }
}

export const microActionStore = new MicroActionStore(
  typeof window === "undefined"
    ? new MemoryMicroPlanSink()
    : new LocalStorageMicroPlanSink(),
);

// ---- Daily summary ------------------------------------------------------
// "What's my overall progress today?" — completed / in-progress / blocked.
export type DailySummary = {
  highPriorityTotal: number;
  highPriorityCompleted: number;
  inProgress: number;
  blocked: number;
  onTrack: boolean;
};

export function dailySummary(
  highPrioritySteps: ExecutionStep[],
  doneStepIds: Set<ID>,
  blockedCount: number,
  activePlans: number,
): DailySummary {
  const completed = highPrioritySteps.filter((s) => doneStepIds.has(s.id)).length;
  return {
    highPriorityTotal: highPrioritySteps.length,
    highPriorityCompleted: completed,
    inProgress: activePlans,
    blocked: blockedCount,
    onTrack: highPrioritySteps.length === 0 || completed > 0,
  };
}
