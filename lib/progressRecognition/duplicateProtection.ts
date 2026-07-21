/**
 * 101 — Prevent duplicate recognition for the same source event.
 */

import type { AccomplishmentRecord, WinRecord } from "./contracts";

export type RecognitionFingerprint = {
  sourceType: string;
  sourceId: string;
  kind: "win" | "accomplishment";
  title: string;
  dayKey: string;
};

export function fingerprintRecognition(input: {
  sourceType: string;
  sourceId: string;
  kind: "win" | "accomplishment";
  title: string;
  occurredAt: string;
}): RecognitionFingerprint {
  return {
    sourceType: input.sourceType,
    sourceId: input.sourceId,
    kind: input.kind,
    title: input.title.trim().toLowerCase(),
    dayKey: input.occurredAt.slice(0, 10),
  };
}

function normalizeTitle(title: string): string {
  return title.trim().toLowerCase().replace(/\s+/g, " ");
}

function titlesSimilar(a: string, b: string): boolean {
  const na = normalizeTitle(a);
  const nb = normalizeTitle(b);
  if (!na || !nb) return false;
  if (na === nb) return true;
  return na.includes(nb) || nb.includes(na);
}

export function findDuplicateWin(
  candidate: RecognitionFingerprint,
  existing: readonly WinRecord[],
): WinRecord | null {
  return (
    existing.find(
      (w) =>
        !w.removedAt &&
        w.sourceType === candidate.sourceType &&
        w.sourceId === candidate.sourceId &&
        w.occurredAt.slice(0, 10) === candidate.dayKey &&
        titlesSimilar(w.title, candidate.title),
    ) ?? null
  );
}

export function findDuplicateAccomplishment(
  candidate: RecognitionFingerprint,
  existing: readonly AccomplishmentRecord[],
): AccomplishmentRecord | null {
  return (
    existing.find(
      (a) =>
        !a.removedAt &&
        a.sourceType === candidate.sourceType &&
        a.sourceId === candidate.sourceId &&
        a.occurredAt.slice(0, 10) === candidate.dayKey &&
        titlesSimilar(a.title, candidate.title),
    ) ?? null
  );
}

export function wouldDuplicateRecognition(
  candidate: RecognitionFingerprint,
  wins: readonly WinRecord[],
  accomplishments: readonly AccomplishmentRecord[],
): boolean {
  if (candidate.kind === "win") {
    return Boolean(findDuplicateWin(candidate, wins));
  }
  return Boolean(findDuplicateAccomplishment(candidate, accomplishments));
}
