/**
 * Unified Signal Bus — canonical signal schema (Sprint 1).
 * Separate from legacy IntelligenceSignal; shadow store only.
 */

import type { IntelligenceSignalValence } from "./types";

export const SIGNAL_BUS_SCHEMA_VERSION = 1 as const;

export const SIGNAL_BUS_UPDATED = "companion-signal-bus-updated";

export type SignalDomain =
  | "conversation"
  | "emotional"
  | "energy"
  | "workspace"
  | "project"
  | "creation"
  | "business"
  | "trust"
  | "action";

export type SignalAction =
  | "observed"
  | "accepted"
  | "dismissed"
  | "ignored"
  | "completed"
  | "failed"
  | "opened"
  | "closed";

export type CompanionSignal = {
  id: string;
  at: string;
  date: string;
  userId: string;
  domain: SignalDomain;
  category: string;
  action: SignalAction;
  source: string;
  valence?: IntelligenceSignalValence;
  weight?: number;
  meta?: Record<string, string | number | boolean>;
  emitter: string;
  schemaVersion: typeof SIGNAL_BUS_SCHEMA_VERSION;
};

export type CompanionSignalInput = {
  domain: SignalDomain;
  category: string;
  action?: SignalAction;
  source: string;
  valence?: IntelligenceSignalValence;
  weight?: number;
  meta?: Record<string, string | number | boolean>;
  emitter: string;
  at?: string;
  userId?: string;
};

export type EmitErrorCode =
  | "bus_disabled"
  | "validation_failed"
  | "unknown_category"
  | "pii_rejected"
  | "storage_failed";

export type EmitResult =
  | { ok: true; signal: CompanionSignal; deduped: boolean }
  | { ok: false; error: EmitErrorCode; detail?: string };

export type ShadowBusMetrics = {
  totalEmits: number;
  dedupedEmits: number;
  registryMisses: number;
  validationFailures: number;
  parityChecks: number;
  parityPasses: number;
  parityPassRate: number;
  duplicateRate: number;
  lastDiscrepancies: SignalParityDiscrepancy[];
};

export type SignalParityDiscrepancy = {
  at: string;
  legacyKeys: string[];
  shadowKeys: string[];
  missingInShadow: string[];
  extraInShadow: string[];
};
