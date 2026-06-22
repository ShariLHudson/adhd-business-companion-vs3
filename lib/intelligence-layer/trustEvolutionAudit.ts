/**
 * Sprint 2C-1 — Persisted trust evolution audit log (observe-only).
 */

import type { IntelligenceSignalValence, TraitScore } from "./types";

const AUDIT_KEY = "companion-trust-evolution-audit-v1";
const MAX_ENTRIES = 500;

export type TrustAuditTraitDelta = {
  path: string;
  before: TraitScore | null;
  after: TraitScore;
};

export type TrustAuditEntry = {
  id: string;
  at: string;
  trustCategory: string;
  busCategory: string;
  source: string;
  emitter?: string;
  valence: IntelligenceSignalValence;
  sessionId?: string;
  productId?: string;
  offerKey?: string;
  interventionBucket?: string | null;
  causationType?: string;
  attributionValid: boolean;
  attributionError?: string;
  evolve: boolean;
  reason: string;
  traitDeltas: TrustAuditTraitDelta[];
};

function readStore(): TrustAuditEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(AUDIT_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Partial<{ entries: TrustAuditEntry[] }>;
    return Array.isArray(parsed.entries) ? parsed.entries : [];
  } catch {
    return [];
  }
}

function writeStore(entries: TrustAuditEntry[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(AUDIT_KEY, JSON.stringify({ entries }));
  } catch {
    /* quota or private mode — must not throw */
  }
}

/** Append-only; oldest first in storage; capped at MAX_ENTRIES. */
export function appendTrustAuditEntry(entry: TrustAuditEntry): void {
  const entries = readStore();
  writeStore([...entries, entry].slice(-MAX_ENTRIES));
}

/** Returns audit entries oldest-first (chronological). */
export function getTrustAuditLog(): TrustAuditEntry[] {
  return [...readStore()];
}

export function clearTrustAuditLog(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(AUDIT_KEY);
  } catch {
    /* noop */
  }
}

export function resetTrustAuditLogForTests(): void {
  clearTrustAuditLog();
}

export const TRUST_AUDIT_STORAGE_KEY = AUDIT_KEY;
export const TRUST_AUDIT_MAX_ENTRIES = MAX_ENTRIES;
