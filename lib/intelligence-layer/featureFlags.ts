/**
 * Sprint 1 — Unified Signal Bus feature flags.
 * All defaults OFF: zero production behavior change.
 */

const LS_UNIFIED_BUS = "companion-flag-unified-signal-bus";
const LS_VALIDATION_STRICT = "companion-flag-signal-bus-validation-strict";
const LS_DEDUP = "companion-flag-signal-bus-dedup";
const LS_DIAGNOSTICS = "companion-flag-signal-bus-diagnostics";
const LS_DEV_WARNINGS = "companion-flag-signal-bus-dev-warnings";

function readLocalStorageFlag(key: string): boolean | null {
  if (typeof window === "undefined") return null;
  const v = localStorage.getItem(key);
  if (v === "1" || v === "true") return true;
  if (v === "0" || v === "false") return false;
  return null;
}

function envTrue(name: string): boolean {
  return process.env[name] === "true" || process.env[name] === "1";
}

/** Master gate — shadow bus emit + mirror hooks. Default: false. */
export function isUnifiedSignalBusEnabled(): boolean {
  const override = readLocalStorageFlag(LS_UNIFIED_BUS);
  if (override !== null) return override;
  return envTrue("NEXT_PUBLIC_UNIFIED_SIGNAL_BUS");
}

/** Unknown domain:category → reject emit. Default: false (warn-only). */
export function isSignalBusValidationStrict(): boolean {
  const override = readLocalStorageFlag(LS_VALIDATION_STRICT);
  if (override !== null) return override;
  return envTrue("NEXT_PUBLIC_SIGNAL_BUS_VALIDATION_STRICT");
}

/** 60s dedupe window on bus. Default: true when bus enabled. */
export function isSignalBusDedupEnabled(): boolean {
  const override = readLocalStorageFlag(LS_DEDUP);
  if (override !== null) return override;
  if (!isUnifiedSignalBusEnabled()) return false;
  return process.env.NEXT_PUBLIC_SIGNAL_BUS_DEDUP !== "false";
}

/** Parity metrics + in-memory discrepancy buffer. */
export function isSignalBusDiagnosticsEnabled(): boolean {
  const override = readLocalStorageFlag(LS_DIAGNOSTICS);
  if (override !== null) return override;
  return envTrue("NEXT_PUBLIC_SIGNAL_BUS_DIAGNOSTICS");
}

/** console.warn on registry miss, validation reject, dedupe skip. */
export function isSignalBusDevWarningsEnabled(): boolean {
  const override = readLocalStorageFlag(LS_DEV_WARNINGS);
  if (override !== null) return override;
  return process.env.NODE_ENV === "development";
}

export const SIGNAL_BUS_FLAG_KEYS = {
  unifiedBus: LS_UNIFIED_BUS,
  validationStrict: LS_VALIDATION_STRICT,
  dedup: LS_DEDUP,
  diagnostics: LS_DIAGNOSTICS,
  devWarnings: LS_DEV_WARNINGS,
} as const;
