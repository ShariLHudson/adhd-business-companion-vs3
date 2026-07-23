/**
 * Lightweight ADHD reading supports for the Executive Brief:
 * last-read section + optional mark-as-read (local only).
 */

import type { FireBriefSectionId } from "@/lib/founder/types/fireBriefDetail";
import { FIRE_BRIEF_SECTION_ORDER } from "@/lib/founder/types/fireBriefDetail";

const LAST_SECTION_PREFIX = "spark-estate:founder-fire-last-section:" as const;
const READ_MARKS_PREFIX = "spark-estate:founder-fire-read-marks:" as const;

function isSectionId(value: unknown): value is FireBriefSectionId {
  return (
    typeof value === "string" &&
    (FIRE_BRIEF_SECTION_ORDER as readonly string[]).includes(value)
  );
}

export function lastSectionStorageKey(portfolioId: string): string {
  return `${LAST_SECTION_PREFIX}${portfolioId}`;
}

export function readMarksStorageKey(portfolioId: string): string {
  return `${READ_MARKS_PREFIX}${portfolioId}`;
}

export function readLastBriefSection(
  portfolioId: string,
): FireBriefSectionId | null {
  try {
    if (typeof window === "undefined" || !window.localStorage) return null;
    const raw = window.localStorage.getItem(lastSectionStorageKey(portfolioId));
    return isSectionId(raw) ? raw : null;
  } catch {
    return null;
  }
}

export function writeLastBriefSection(
  portfolioId: string,
  sectionId: FireBriefSectionId,
): void {
  try {
    if (typeof window === "undefined" || !window.localStorage) return;
    window.localStorage.setItem(lastSectionStorageKey(portfolioId), sectionId);
  } catch {
    /* ignore */
  }
}

export function readBriefSectionMarks(portfolioId: string): Set<FireBriefSectionId> {
  try {
    if (typeof window === "undefined" || !window.localStorage) {
      return new Set();
    }
    const raw = window.localStorage.getItem(readMarksStorageKey(portfolioId));
    if (!raw) return new Set();
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return new Set();
    return new Set(parsed.filter(isSectionId));
  } catch {
    return new Set();
  }
}

export function markBriefSectionRead(
  portfolioId: string,
  sectionId: FireBriefSectionId,
): void {
  try {
    if (typeof window === "undefined" || !window.localStorage) return;
    const next = readBriefSectionMarks(portfolioId);
    next.add(sectionId);
    window.localStorage.setItem(
      readMarksStorageKey(portfolioId),
      JSON.stringify([...next]),
    );
  } catch {
    /* ignore */
  }
}

/** Honest word-count based estimate; null when content is too thin to claim. */
export function estimateSectionReadingMinutes(sectionText: string): number | null {
  const words = sectionText.trim().split(/\s+/).filter(Boolean).length;
  if (words < 40) return null;
  return Math.max(1, Math.round(words / 180));
}

export function clearFireBriefReadingProgressForTests(): void {
  try {
    if (typeof window === "undefined" || !window.localStorage) return;
    const keys: string[] = [];
    for (let i = 0; i < window.localStorage.length; i += 1) {
      const key = window.localStorage.key(i);
      if (
        key?.startsWith(LAST_SECTION_PREFIX) ||
        key?.startsWith(READ_MARKS_PREFIX)
      ) {
        keys.push(key);
      }
    }
    for (const key of keys) window.localStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}
