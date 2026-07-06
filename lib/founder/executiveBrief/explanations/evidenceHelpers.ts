import type { ExecutiveEvidence, ExecutiveEvidenceKind } from "../types";

export type EvidenceInput = {
  id: string;
  kind: ExecutiveEvidenceKind;
  title: string;
  plainSummary: string;
  refId?: string;
};

export function buildEvidence(input: EvidenceInput): ExecutiveEvidence {
  return { ...input };
}

export function evidenceForMission(missionId: string, title: string): ExecutiveEvidence {
  return {
    id: `ev-mission-${missionId}`,
    kind: "mission-history",
    title,
    plainSummary: `Connected to mission ${missionId}.`,
    refId: missionId,
  };
}

export function evidenceForResearch(refId: string, title: string, summary: string): ExecutiveEvidence {
  return {
    id: `ev-research-${refId}`,
    kind: "research",
    title,
    plainSummary: summary,
    refId,
  };
}

export function listExpandableEvidence(items: ExecutiveEvidence[]): ExecutiveEvidence[] {
  return items.filter((e) => e.plainSummary.length > 0);
}
