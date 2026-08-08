/**
 * Commitment Gate Diagnostics — Slice 1A (observe-only).
 *
 * An in-memory-only, non-persistent record of `resolveCommitmentGate`'s
 * decisions, for diagnostics and testing. This is deliberately NOT
 * storage in the sense every design document in this series has used
 * that word (WORK_IDENTITY_MODEL.md, WORK_IDENTITY_IMPLEMENTATION_PLAN.md
 * §6's test plan, the Slice 1A request itself): nothing here is written
 * to `localStorage`, nothing survives a page reload, and nothing is read
 * by any routing, creation, or storage system. It is a capped, in-memory
 * array plus a dev-console line — the same category of thing as
 * `console.info`, not a durable record.
 *
 * A self-contained implementation, not a shared import from
 * `lib/universalCreation/createFastPath.ts`'s own `logCreateFastPath` —
 * conceptually the same pattern, kept independent so this module adds no
 * new dependency beyond what Slice 0 already, deliberately, reuses
 * (docs/estate/WORK_IDENTITY_SLICE_0_REVIEW.md §3's dependency-direction
 * rule: workIdentity does not import downward into createFastPath or any
 * orchestration layer).
 */

import type { CommitmentGateResult } from "./types";

export interface CommitmentGateLogEntry {
  readonly turn?: number;
  readonly userText: string;
  readonly result: CommitmentGateResult;
}

declare global {
  interface Window {
    __sparkCommitmentGateLog?: CommitmentGateLogEntry[];
  }
}

const MAX_LOG_ENTRIES = 40;

/** Records a decision for diagnostics/testing only. Never throws, never persists. */
export function logCommitmentGateDecision(entry: CommitmentGateLogEntry): void {
  if (typeof window !== "undefined") {
    const log = window.__sparkCommitmentGateLog ?? [];
    log.push(entry);
    window.__sparkCommitmentGateLog = log.slice(-MAX_LOG_ENTRIES);
  }
  if (typeof process !== "undefined" && process.env.NODE_ENV !== "production") {
    // eslint-disable-next-line no-console
    console.info("[COMMITMENT_GATE_OBSERVE]", entry);
  }
}

/** Reads the current in-memory log. Empty outside a browser context. */
export function readCommitmentGateLog(): CommitmentGateLogEntry[] {
  if (typeof window === "undefined") return [];
  return window.__sparkCommitmentGateLog ?? [];
}

/** Testing convenience — resets the in-memory log between test cases. */
export function clearCommitmentGateLog(): void {
  if (typeof window !== "undefined") {
    window.__sparkCommitmentGateLog = [];
  }
}
