/**
 * Rediscovery — revisit preserved recognition records.
 * Final stage of the recognition lifecycle pipeline.
 */

import { listRecognitionRecords, updateRecognitionRecord } from "./store";
import type { RecognitionRecord } from "./types";

export type RediscoveryCandidate = {
  record: RecognitionRecord;
  reason: string;
};

/**
 * Suggest records worth revisiting (simple v1).
 * Prefers preserved / celebrated / chronicled that haven't been revisited recently.
 */
export function listRediscoveryCandidates(limit = 5): RediscoveryCandidate[] {
  const now = Date.now();
  const weekMs = 7 * 24 * 60 * 60 * 1000;

  const eligible = listRecognitionRecords().filter((r) => {
    if (r.lifecycleStatus === "archived") return false;
    if (
      r.lifecycleStatus === "preserved" ||
      r.lifecycleStatus === "recognized" ||
      r.lifecycleStatus === "celebrated_quiet" ||
      r.lifecycleStatus === "celebrated_festive" ||
      r.lifecycleStatus === "chronicled" ||
      r.lifecycleStatus === "hall_candidate" ||
      r.lifecycleStatus === "hall_exhibit"
    ) {
      return true;
    }
    return false;
  });

  const scored = eligible.map((record) => {
    const last = record.lastRevisitedAt
      ? new Date(record.lastRevisitedAt).getTime()
      : 0;
    const stale = !last || now - last > weekMs;
    let reason = "Worth revisiting";
    if (record.lifecycleStatus === "hall_exhibit") {
      reason = "Part of your Hall story";
    } else if (record.lifecycleStatus.startsWith("celebrated")) {
      reason = "A celebration worth remembering";
    } else if (record.lifecycleStatus === "preserved") {
      reason = "A discovery in your Evidence Vault";
    } else if (record.lifecycleStatus === "chronicled") {
      reason = "A story in Legacy Studio";
    }
    return {
      record,
      reason,
      score: (stale ? 2 : 0) + (record.hallCandidateStatus === "marked" ? 1 : 0),
    };
  });

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ record, reason }) => ({ record, reason }));
}

export function markRecordRevisited(recordId: string): RecognitionRecord | null {
  return updateRecognitionRecord(recordId, {
    lastRevisitedAt: new Date().toISOString(),
  });
}

export function formatRediscoveryPrompt(
  candidates: RediscoveryCandidate[],
): string {
  if (candidates.length === 0) {
    return "Your Evidence Vault is quiet for now. When you preserve discoveries, we can revisit them together.";
  }
  const lines = candidates.slice(0, 3).map((c, i) => {
    return `${i + 1}. ${c.record.title} — ${c.reason}`;
  });
  return [
    "Here are a few moments you might want to revisit:",
    ...lines,
    "Which one would you like to look at — or shall we keep talking?",
  ].join("\n");
}
