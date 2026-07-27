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

// ---------------------------------------------------------------------------
// Reverse direction — write new shared research results back into the EXISTING
// Research Library record shapes (no new store, no shape change).
// ---------------------------------------------------------------------------

type SharedMessageLike = {
  id: string;
  role: "user" | "assistant";
  content: string;
  hidden?: boolean;
  findings?: SharedResearchFinding[];
};

const RESEARCH_LIBRARY_KINDS: ReadonlySet<ResearchFindingRecord["kind"]> = new Set([
  "fact",
  "theme",
  "example",
  "option",
  "recommendation",
  "risk",
  "caution",
  "question",
  "implication",
]);

export function mapSharedKindToResearchKind(
  kind: ResearchFindingKind,
): ResearchFindingRecord["kind"] {
  if (kind === "inference") return "implication";
  return RESEARCH_LIBRARY_KINDS.has(kind as ResearchFindingRecord["kind"])
    ? (kind as ResearchFindingRecord["kind"])
    : "theme";
}

/**
 * Map a shared finding back to a Research Library record. Shared findings are
 * built_in_guidance (never sourced), so the record's source fields are left
 * EMPTY — the collection then aggregates no synthetic "Sources". The record
 * round-trips back to built_in_guidance via researchRecordToSharedFinding.
 */
export function sharedFindingToResearchRecord(
  finding: SharedResearchFinding,
): ResearchFindingRecord {
  return {
    id: finding.id,
    title: finding.title,
    content: finding.content,
    kind: mapSharedKindToResearchKind(finding.kind),
    sourceTitle: "",
    sourceType: "stable_knowledge",
    publisher: null,
    retrievalDate: "",
    publicationDate: null,
    confidence: "medium",
    freshness: "stable",
    verificationStatus: "partially_verified",
    important: finding.important,
  };
}

/** Rebuild the stored conversation transcript from shared messages (drops the
 * hidden auto-research seed). */
export function sharedMessagesToConversationTurns(
  messages: readonly SharedMessageLike[],
  createdAt: string,
): ResearchConversationTurn[] {
  return messages
    .filter((m) => !m.hidden)
    .map((m) => {
      const turn: ResearchConversationTurn = {
        id: m.id,
        role: m.role,
        content: m.content,
        createdAt,
      };
      if (m.findings?.length) turn.findingIdsAdded = m.findings.map((f) => f.id);
      return turn;
    });
}

/** Collect the findings produced across a thread as stored record shapes. */
export function collectResearchRecordsFromSharedMessages(
  messages: readonly SharedMessageLike[],
): ResearchFindingRecord[] {
  return messages.flatMap((m) =>
    (m.findings ?? []).map(sharedFindingToResearchRecord),
  );
}
