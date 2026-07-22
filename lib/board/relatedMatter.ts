/**
 * Shared topic / matter identifiers so Board, Chamber, research, and journal
 * records can be linked later without rewriting history stores.
 */

export type RelatedMatterSourceType =
  | "board"
  | "chamber"
  | "research"
  | "journal"
  | "project"
  | "decision";

export type RelatedMatterReference = {
  matterId?: string;
  topic?: string;
  sourceType: RelatedMatterSourceType;
  sourceId: string;
  label?: string;
};

/** Build a stable matter id from a topic phrase when none exists yet. */
export function matterIdFromTopic(topic: string | null | undefined): string | undefined {
  const t = topic?.trim().toLowerCase();
  if (!t) return undefined;
  const slug = t
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
  return slug ? `matter-${slug}` : undefined;
}

export function relatedWorkFromBoardDecision(params: {
  decisionTitle: string;
  discussionId: string;
  projectId?: string | null;
  projectName?: string | null;
  strategyId?: string | null;
  evidenceId?: string | null;
}): RelatedMatterReference[] {
  const topic = params.decisionTitle.trim();
  const matterId = matterIdFromTopic(topic);
  const refs: RelatedMatterReference[] = [
    {
      matterId,
      topic: topic || undefined,
      sourceType: "board",
      sourceId: params.discussionId,
      label: "This Board discussion",
    },
  ];
  if (params.projectId) {
    refs.push({
      matterId,
      topic: topic || undefined,
      sourceType: "project",
      sourceId: params.projectId,
      label: params.projectName?.trim() || "Related project",
    });
  }
  if (params.strategyId) {
    refs.push({
      matterId,
      topic: topic || undefined,
      sourceType: "research",
      sourceId: params.strategyId,
      label: "Related strategy",
    });
  }
  if (params.evidenceId) {
    refs.push({
      matterId,
      topic: topic || undefined,
      sourceType: "journal",
      sourceId: params.evidenceId,
      label: "Related evidence",
    });
  }
  return refs;
}
