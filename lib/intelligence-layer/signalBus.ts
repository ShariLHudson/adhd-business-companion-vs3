/**
 * Unified Signal Bus — sole public emit API (Sprint 1 shadow mode).
 * Does NOT write to profile or legacy signal store.
 */

import { getEcosystemUserId } from "@/lib/ecosystem/ecosystemUserId";

import {
  isUnifiedSignalBusEnabled,
  isSignalBusDedupEnabled,
  isSignalBusDevWarningsEnabled,
} from "./featureFlags";
import type {
  CompanionSignal,
  CompanionSignalInput,
  EmitResult,
} from "./signalBusTypes";
import { SIGNAL_BUS_UPDATED } from "./signalBusTypes";
import { lookupRegistryEntry } from "./signalRegistry";
import { validateCompanionSignalInput } from "./signalValidation";
import { dedupeKeyForInput } from "./signalDedup";
import {
  appendShadowSignal,
  buildCompanionSignalRecord,
  getShadowDedupeIndex,
} from "./shadowSignalStore";
import {
  recordBusEmit,
  recordValidationFailure,
} from "./shadowDiagnostics";

function dispatchBusUpdated(): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(SIGNAL_BUS_UPDATED));
  }
}

function warnDev(message: string): void {
  if (isSignalBusDevWarningsEnabled()) {
    console.warn(`[SignalBus] ${message}`);
  }
}

/**
 * Central signal collection entry point.
 * Returns bus_disabled when UNIFIED_SIGNAL_BUS is off — never throws.
 */
export function emitCompanionSignal(
  input: CompanionSignalInput,
): EmitResult {
  if (!isUnifiedSignalBusEnabled()) {
    return { ok: false, error: "bus_disabled" };
  }

  const validated = validateCompanionSignalInput(input);
  if (!validated.ok) {
    recordValidationFailure();
    warnDev(`${validated.code}: ${validated.detail}`);
    return {
      ok: false,
      error:
        validated.code === "pii_rejected"
          ? "pii_rejected"
          : validated.code === "unknown_category"
            ? "unknown_category"
            : "validation_failed",
      detail: validated.detail,
    };
  }

  const entry = lookupRegistryEntry(
    validated.value.domain,
    validated.value.category,
  );
  if (validated.registryMiss) {
    warnDev(
      `registry miss: ${validated.value.domain}:${validated.value.category}`,
    );
  }

  const at = validated.value.at ?? new Date().toISOString();
  const action = validated.value.action ?? "observed";
  const weight =
    validated.value.weight ?? entry?.defaultWeight ?? 6;
  const valence =
    validated.value.valence ?? entry?.defaultValence;

  const meta = validated.registryMiss
    ? { ...validated.value.meta, registryMiss: true }
    : validated.value.meta;

  if (isSignalBusDedupEnabled()) {
    const key = dedupeKeyForInput(
      {
        emitter: validated.value.emitter,
        domain: validated.value.domain,
        category: validated.value.category,
        source: validated.value.source,
      },
      at,
    );
    const index = getShadowDedupeIndex();
    if (index.has(key)) {
      const existingAt = index.get(key)!;
      const signal = buildCompanionSignalRecord({
        userId: validated.value.userId ?? getEcosystemUserId(),
        domain: validated.value.domain,
        category: validated.value.category,
        action,
        source: validated.value.source,
        valence,
        weight,
        meta,
        emitter: validated.value.emitter,
        at: existingAt,
      });
      recordBusEmit({ deduped: true, registryMiss: validated.registryMiss });
      return { ok: true, signal, deduped: true };
    }
  }

  const signal: CompanionSignal = buildCompanionSignalRecord({
    userId: validated.value.userId ?? getEcosystemUserId(),
    domain: validated.value.domain,
    category: validated.value.category,
    action,
    source: validated.value.source,
    valence,
    weight,
    meta,
    emitter: validated.value.emitter,
    at,
  });

  const stored = appendShadowSignal(signal);
  if (!stored) {
    warnDev("shadow storage failed");
    return { ok: false, error: "storage_failed" };
  }

  recordBusEmit({ deduped: false, registryMiss: validated.registryMiss });
  dispatchBusUpdated();
  return { ok: true, signal, deduped: false };
}

/** Benchmark helper for Sprint 1 validation evidence. */
export function benchmarkEmitCompanionSignal(
  input: CompanionSignalInput,
  iterations: number = 100,
): { avgMs: number; p95Ms: number; totalMs: number } {
  const times: number[] = [];
  for (let i = 0; i < iterations; i += 1) {
    const start = performance.now();
    emitCompanionSignal({
      ...input,
      source: `${input.source}:${i}`,
    });
    times.push(performance.now() - start);
  }
  times.sort((a, b) => a - b);
  const totalMs = times.reduce((a, b) => a + b, 0);
  const p95Index = Math.min(times.length - 1, Math.floor(times.length * 0.95));
  return {
    avgMs: totalMs / iterations,
    p95Ms: times[p95Index] ?? 0,
    totalMs,
  };
}
