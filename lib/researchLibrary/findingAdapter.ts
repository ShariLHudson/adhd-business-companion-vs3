/**
 * Compatibility adapter: existing Research Library records → the shared evidence
 * model. Existing findings are authored stable knowledge, so they become
 * `built_in_guidance` with NO sources and NO source-derived quality labels —
 * `makeFinding` enforces this, so no citation metadata can survive (a smuggled
 * sourceType/URL cannot make `findingMayShowCitation` true).
 *
 * Every function here is PURE: it never mutates its input and never touches
 * storage. Existing stored records are read, not rewritten.
 */

import {
  makeFinding,
  type ResearchFindingKind,
  type SharedResearchFinding,
} from "@/lib/research/types";
import type {
  ResearchConversationTurn,
  ResearchFindingRecord,
} from "@/lib/researchLibrary/types";

/** Shape structurally compatible with the panel's ContextualResearchMessage. */
export type AdaptedResearchMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  findings?: SharedResearchFinding[];
};

const SHARED_FINDING_KINDS: ReadonlySet<ResearchFindingKind> = new Set([
  "fact",
  "inference",
  "theme",
  "example",
  "option",
  "recommendation",
  "risk",
  "caution",
  "question",
  "implication",
]);

export function mapResearchFindingKind(
  kind: ResearchFindingRecord["kind"],
): ResearchFindingKind {
  return SHARED_FINDING_KINDS.has(kind as ResearchFindingKind)
    ? (kind as ResearchFindingKind)
    : "theme";
}

/**
 * Map a stored Research Library finding to a shared finding. Always
 * `built_in_guidance` (never a citation). Source-derived fields
 * (sourceTitle/sourceType/publisher/dates/confidence/freshness/verification) are
 * intentionally dropped — makeFinding strips them for non-citation bases.
 */
export function researchRecordToSharedFinding(
  record: ResearchFindingRecord,
): SharedResearchFinding {
  return makeFinding({
    id: record.id,
    title: record.title,
    content: record.content,
    kind: mapResearchFindingKind(record.kind),
    evidenceBasis: "built_in_guidance",
    important: record.important,
  });
}

export function researchRecordsToSharedFindings(
  records: readonly ResearchFindingRecord[],
): SharedResearchFinding[] {
  return records.map(researchRecordToSharedFinding);
}

/**
 * Map a stored conversation turn to a shared research message, attaching (as
 * shared findings) any findings that turn produced.
 */
export function researchTurnToSharedMessage(
  turn: ResearchConversationTurn,
  findingsById?: Map<string, ResearchFindingRecord>,
): AdaptedResearchMessage {
  const findings =
    turn.role === "assistant" && turn.findingIdsAdded?.length && findingsById
      ? turn.findingIdsAdded
          .map((id) => findingsById.get(id))
          .filter((r): r is ResearchFindingRecord => Boolean(r))
          .map(researchRecordToSharedFinding)
      : undefined;
  const message: AdaptedResearchMessage = {
    id: turn.id,
    role: turn.role,
    content: turn.content,
  };
  if (findings && findings.length) message.findings = findings;
  return message;
}

export function researchTurnsToSharedMessages(
  turns: readonly ResearchConversationTurn[],
  findings: readonly ResearchFindingRecord[],
): AdaptedResearchMessage[] {
  const byId = new Map(findings.map((f) => [f.id, f] as const));
  return turns.map((turn) => researchTurnToSharedMessage(turn, byId));
}
