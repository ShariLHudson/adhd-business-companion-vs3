/**
 * Accept / dismiss / save-for-later for Blueprint Health suggestions (100).
 * Dismissed findings stay quiet unless evidenceFingerprint changes.
 */

import type {
  BlueprintHealthFinding,
  BlueprintSuggestionDisposition,
  BlueprintSuggestionDispositionStatus,
} from "./intelligenceTypes";

const dispositions: BlueprintSuggestionDisposition[] = [];

export function resetBlueprintSuggestionDispositionsForTests(): void {
  dispositions.length = 0;
}

export function listBlueprintSuggestionDispositions(
  blueprintId: string,
): BlueprintSuggestionDisposition[] {
  return dispositions.filter((d) => d.blueprintId === blueprintId);
}

export function setBlueprintSuggestionDisposition(input: {
  blueprintId: string;
  finding: Pick<BlueprintHealthFinding, "id" | "evidenceFingerprint">;
  status: BlueprintSuggestionDispositionStatus;
}): BlueprintSuggestionDisposition {
  const at = new Date().toISOString();
  const existing = dispositions.findIndex(
    (d) =>
      d.blueprintId === input.blueprintId && d.findingId === input.finding.id,
  );
  const next: BlueprintSuggestionDisposition = {
    findingId: input.finding.id,
    blueprintId: input.blueprintId,
    status: input.status,
    at,
    evidenceFingerprint: input.finding.evidenceFingerprint,
  };
  if (existing >= 0) dispositions[existing] = next;
  else dispositions.push(next);
  return next;
}

/** Filter findings so dismissed/saved stay quiet unless evidence changed. */
export function filterVisibleHealthFindings(
  blueprintId: string,
  findings: readonly BlueprintHealthFinding[],
): BlueprintHealthFinding[] {
  return findings.filter((f) => {
    const d = dispositions.find(
      (x) => x.blueprintId === blueprintId && x.findingId === f.id,
    );
    if (!d) return true;
    if (d.evidenceFingerprint !== f.evidenceFingerprint) return true;
    if (d.status === "dismissed") return false;
    if (d.status === "accepted") return false;
    // saved_for_later remains visible in a quieter list — still "visible"
    return true;
  });
}

export function isFindingSavedForLater(
  blueprintId: string,
  findingId: string,
): boolean {
  return dispositions.some(
    (d) =>
      d.blueprintId === blueprintId &&
      d.findingId === findingId &&
      d.status === "saved_for_later",
  );
}
