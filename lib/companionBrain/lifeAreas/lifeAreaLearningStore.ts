/**
 * Life Area learning layer — corrections teach the companion over time.
 */

import type { LifeAreaCorrection } from "./types";

const STORAGE_KEY = "companion-life-area-learning-v1";

let memoryCorrections: LifeAreaCorrection[] | null = null;

function hasStorage(): boolean {
  return (
    typeof globalThis.window !== "undefined" &&
    typeof globalThis.localStorage !== "undefined"
  );
}

function readStore(): LifeAreaCorrection[] {
  if (hasStorage()) {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw) as unknown;
      if (!Array.isArray(parsed)) return [];
      return parsed.filter(
        (c): c is LifeAreaCorrection =>
          Boolean(c) &&
          typeof c === "object" &&
          typeof (c as LifeAreaCorrection).phrase === "string" &&
          typeof (c as LifeAreaCorrection).lifeAreaId === "string",
      );
    } catch {
      return [];
    }
  }
  return memoryCorrections ?? [];
}

function writeStore(corrections: LifeAreaCorrection[]): void {
  if (hasStorage()) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(corrections));
      return;
    } catch {
      /* storage unavailable */
    }
  }
  memoryCorrections = corrections;
}

export function normalizeLifeAreaPhrase(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function readLifeAreaCorrections(): LifeAreaCorrection[] {
  return readStore();
}

/**
 * Record a user correction — phrase → chosen Life Area.
 * Confidence rises with repeated confirmations.
 */
export function recordLifeAreaCorrection(
  taskText: string,
  lifeAreaId: string,
): LifeAreaCorrection {
  const phrase = normalizeLifeAreaPhrase(taskText);
  const now = new Date().toISOString();
  const existing = readLifeAreaCorrections();
  const hit = existing.find((c) => c.phrase === phrase && c.lifeAreaId === lifeAreaId);

  const next: LifeAreaCorrection = hit
    ? {
        ...hit,
        timesConfirmed: hit.timesConfirmed + 1,
        confidence: Math.min(0.98, hit.confidence + 0.08),
        lastConfirmedAt: now,
      }
    : {
        phrase,
        lifeAreaId,
        confidence: 0.82,
        timesConfirmed: 1,
        lastConfirmedAt: now,
      };

  const without = existing.filter(
    (c) => !(c.phrase === phrase && c.lifeAreaId === lifeAreaId),
  );
  writeStore([next, ...without].slice(0, 500));
  return next;
}

export function resetLifeAreaLearningForTests(): void {
  memoryCorrections = [];
  if (!hasStorage()) return;
  localStorage.removeItem(STORAGE_KEY);
}
