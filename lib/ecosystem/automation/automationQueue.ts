// Founder Ecosystem — Phase 14 Automation Queue.
// Immutable lifecycle store: suggested → pending-approval → approved → running
// → completed / failed (or dismissed). Pure reducer-style API. The founder is
// always in control of what moves forward.

import type {
  AutomationAction,
  AutomationOutcome,
  AutomationStatus,
} from "./automationTypes";

export type AutomationQueue = {
  items: AutomationAction[];
};

export function initQueue(items: AutomationAction[] = []): AutomationQueue {
  return { items: dedupe(items) };
}

function dedupe(items: AutomationAction[]): AutomationAction[] {
  const seen = new Set<string>();
  const out: AutomationAction[] = [];
  for (const a of items) {
    if (seen.has(a.id)) continue;
    seen.add(a.id);
    out.push(a);
  }
  return out;
}

export function enqueue(q: AutomationQueue, action: AutomationAction): AutomationQueue {
  if (q.items.some((a) => a.id === action.id)) return q;
  return { items: [...q.items, action] };
}

export function enqueueMany(q: AutomationQueue, actions: AutomationAction[]): AutomationQueue {
  return actions.reduce(enqueue, q);
}

function setStatus(
  q: AutomationQueue,
  id: string,
  status: AutomationStatus,
  patch: Partial<AutomationAction> = {},
): AutomationQueue {
  return {
    items: q.items.map((a) => (a.id === id ? { ...a, status, ...patch } : a)),
  };
}

export const approveItem = (q: AutomationQueue, id: string) =>
  setStatus(q, id, "approved");

export const requestApproval = (q: AutomationQueue, id: string) =>
  setStatus(q, id, "pending-approval");

export const dismissItem = (q: AutomationQueue, id: string) =>
  setStatus(q, id, "dismissed");

export const startRunning = (q: AutomationQueue, id: string) =>
  setStatus(q, id, "running");

export const completeItem = (
  q: AutomationQueue,
  id: string,
  outcome: AutomationOutcome,
) => setStatus(q, id, "completed", { outcome, completedAt: new Date().toISOString() });

export const failItem = (q: AutomationQueue, id: string, outcome: AutomationOutcome) =>
  setStatus(q, id, "failed", { outcome, completedAt: new Date().toISOString() });

// ---- Selectors ----------------------------------------------------------
const byStatus = (q: AutomationQueue, status: AutomationStatus) =>
  q.items.filter((a) => a.status === status);

export const suggested = (q: AutomationQueue) => byStatus(q, "suggested");
export const pendingApproval = (q: AutomationQueue) => byStatus(q, "pending-approval");
export const approved = (q: AutomationQueue) => byStatus(q, "approved");
export const running = (q: AutomationQueue) => byStatus(q, "running");
export const completed = (q: AutomationQueue) => byStatus(q, "completed");
export const failed = (q: AutomationQueue) => byStatus(q, "failed");

/** Everything still awaiting a founder decision or run. */
export const active = (q: AutomationQueue) =>
  q.items.filter((a) =>
    ["suggested", "pending-approval", "approved", "running"].includes(a.status),
  );

export const queueCounts = (q: AutomationQueue) => ({
  suggested: suggested(q).length,
  pendingApproval: pendingApproval(q).length,
  approved: approved(q).length,
  running: running(q).length,
  completed: completed(q).length,
  failed: failed(q).length,
});
