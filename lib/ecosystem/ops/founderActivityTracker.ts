// Founder Ecosystem — Phase 6 Founder Activity Tracker.
//
// Persists the status of advisor-suggested actions (pending / done / skipped)
// per project, advisor, and founder. Survives sessions via localStorage so the
// dashboard and conversation stay in sync. Pluggable sink for a DB later.

import type { ID, ISODateString } from "../models";
import type { AdvisorId } from "../board/advisorTypes";
import type { ExecutionStep, StepStatus } from "./advisorExecutionEngine";

export type ActionRecord = {
  id: ID; // == step id (stable, so plans reconcile)
  action: string;
  advisor: AdvisorId;
  projectId?: ID;
  status: StepStatus;
  createdAt: ISODateString;
  updatedAt: ISODateString;
};

export interface ActionSink {
  all(): ActionRecord[];
  write(records: ActionRecord[]): void;
}

export class MemoryActionSink implements ActionSink {
  private records: ActionRecord[] = [];
  all() {
    return this.records.slice();
  }
  write(records: ActionRecord[]) {
    this.records = records.slice();
  }
}

export class LocalStorageActionSink implements ActionSink {
  constructor(private key = "founder-actions-v1") {}
  all(): ActionRecord[] {
    if (typeof window === "undefined") return [];
    try {
      const raw = window.localStorage.getItem(this.key);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? (parsed as ActionRecord[]) : [];
    } catch {
      return [];
    }
  }
  write(records: ActionRecord[]) {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(this.key, JSON.stringify(records));
    } catch {
      /* storage unavailable */
    }
  }
}

const now = () => new Date().toISOString();

export class FounderActivityTracker {
  constructor(private sink: ActionSink = new MemoryActionSink()) {}

  all(): ActionRecord[] {
    return this.sink.all();
  }

  /** Reconcile an execution plan: add new steps as pending, KEEP prior status. */
  syncPlan(steps: ExecutionStep[]): ActionRecord[] {
    const existing = new Map(this.sink.all().map((r) => [r.id, r]));
    const merged: ActionRecord[] = steps.map((s) => {
      const prior = existing.get(s.id);
      if (prior) return { ...prior, action: s.action, advisor: s.advisor };
      return {
        id: s.id,
        action: s.action,
        advisor: s.advisor,
        projectId: s.context.projectId,
        status: "pending" as StepStatus,
        createdAt: now(),
        updatedAt: now(),
      };
    });
    // Preserve any records not in the current plan (history).
    for (const r of existing.values()) {
      if (!steps.some((s) => s.id === r.id)) merged.push(r);
    }
    this.sink.write(merged);
    return merged;
  }

  setStatus(id: ID, status: StepStatus): ActionRecord[] {
    const next = this.sink
      .all()
      .map((r) => (r.id === id ? { ...r, status, updatedAt: now() } : r));
    this.sink.write(next);
    return next;
  }
  markDone(id: ID) {
    return this.setStatus(id, "done");
  }
  markSkipped(id: ID) {
    return this.setStatus(id, "skipped");
  }

  byStatus(status: StepStatus): ActionRecord[] {
    return this.sink.all().filter((r) => r.status === status);
  }
  forProject(projectId: ID): ActionRecord[] {
    return this.sink.all().filter((r) => r.projectId === projectId);
  }
  forAdvisor(advisor: AdvisorId): ActionRecord[] {
    return this.sink.all().filter((r) => r.advisor === advisor);
  }

  /** Quick progress read for the dashboard. */
  stats() {
    const all = this.sink.all();
    const done = all.filter((r) => r.status === "done").length;
    return {
      total: all.length,
      done,
      pending: all.filter((r) => r.status === "pending").length,
      skipped: all.filter((r) => r.status === "skipped").length,
      completionRate: all.length ? done / all.length : 0,
    };
  }
}

// Default singleton — localStorage in the browser, memory on the server.
export const founderActivityTracker = new FounderActivityTracker(
  typeof window === "undefined"
    ? new MemoryActionSink()
    : new LocalStorageActionSink(),
);
