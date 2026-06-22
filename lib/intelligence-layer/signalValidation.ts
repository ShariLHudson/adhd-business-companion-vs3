/**
 * Companion Signal Bus — input validation (no PII / no raw message text).
 */

import type { CompanionSignalInput } from "./signalBusTypes";
import { lookupRegistryEntry } from "./signalRegistry";
import { isSignalBusValidationStrict } from "./featureFlags";

const CATEGORY_RE = /^[a-z][a-z0-9_]{0,63}$/;
const FORBIDDEN_META_KEYS =
  /^(text|message|content|transcript|email|phone|password|body)$/i;
const MAX_SOURCE_LEN = 256;
const MAX_EMITTER_LEN = 64;
const MAX_META_KEYS = 20;
const MAX_META_STRING = 256;

export type ValidationResult =
  | { ok: true; value: CompanionSignalInput; registryMiss: boolean }
  | { ok: false; code: "validation_failed" | "unknown_category" | "pii_rejected"; detail: string };

function metaHasPii(
  meta?: Record<string, string | number | boolean>,
): string | null {
  if (!meta) return null;
  const keys = Object.keys(meta);
  if (keys.length > MAX_META_KEYS) {
    return `meta exceeds ${MAX_META_KEYS} keys`;
  }
  for (const key of keys) {
    if (FORBIDDEN_META_KEYS.test(key)) {
      return `forbidden meta key: ${key}`;
    }
    const val = meta[key];
    if (typeof val === "string") {
      if (val.length > MAX_META_STRING) {
        return `meta value too long for key: ${key}`;
      }
      if (FORBIDDEN_META_KEYS.test(val)) {
        return `forbidden meta value pattern: ${key}`;
      }
    }
  }
  return null;
}

export function validateCompanionSignalInput(
  input: CompanionSignalInput,
): ValidationResult {
  if (!input.domain || typeof input.domain !== "string") {
    return { ok: false, code: "validation_failed", detail: "domain required" };
  }
  if (!input.category || !CATEGORY_RE.test(input.category)) {
    return {
      ok: false,
      code: "validation_failed",
      detail: "invalid category format",
    };
  }
  if (!input.source?.trim()) {
    return { ok: false, code: "validation_failed", detail: "source required" };
  }
  if (input.source.length > MAX_SOURCE_LEN) {
    return { ok: false, code: "validation_failed", detail: "source too long" };
  }
  if (!input.emitter?.trim()) {
    return { ok: false, code: "validation_failed", detail: "emitter required" };
  }
  if (input.emitter.length > MAX_EMITTER_LEN) {
    return { ok: false, code: "validation_failed", detail: "emitter too long" };
  }

  const pii = metaHasPii(input.meta);
  if (pii) {
    return { ok: false, code: "pii_rejected", detail: pii };
  }

  const entry = lookupRegistryEntry(input.domain, input.category);
  const registryMiss = !entry;
  if (registryMiss && isSignalBusValidationStrict()) {
    return {
      ok: false,
      code: "unknown_category",
      detail: `unregistered: ${input.domain}:${input.category}`,
    };
  }

  return { ok: true, value: input, registryMiss };
}
