/**
 * Signal bus deduplication — 60s window per emitter+domain+category+source.
 */

import type { CompanionSignal } from "./signalBusTypes";

const DEDUP_WINDOW_MS = 60_000;

export function dedupeKeyForSignal(signal: {
  emitter: string;
  domain: string;
  category: string;
  source: string;
  at: string;
}): string {
  const bucket = Math.floor(new Date(signal.at).getTime() / DEDUP_WINDOW_MS);
  return `${signal.emitter}|${signal.domain}|${signal.category}|${signal.source}|${bucket}`;
}

export function dedupeKeyForInput(
  input: {
    emitter: string;
    domain: string;
    category: string;
    source: string;
  },
  at: string,
): string {
  return dedupeKeyForSignal({ ...input, at });
}

export function isDuplicateInIndex(
  key: string,
  index: Map<string, string>,
): boolean {
  return index.has(key);
}

export function pruneDedupeIndex(
  index: Map<string, string>,
  nowMs: number,
  windowMs: number = DEDUP_WINDOW_MS * 2,
): void {
  const cutoff = nowMs - windowMs;
  for (const [key, at] of index) {
    if (new Date(at).getTime() < cutoff) {
      index.delete(key);
    }
  }
}

export function signalKeysFromList(
  signals: Array<{ domain: string; category: string }>,
): string[] {
  return signals.map((s) => `${s.domain}:${s.category}`);
}

export { DEDUP_WINDOW_MS };
